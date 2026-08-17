from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import Optional
import io
import re
import traceback

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from resume_parser import parse_resume, extract_skills, preprocess_text
from scorer import calculate_dynamic_scores
from recommender import (
    recommend_jobs,
    compute_resume_score,
    generate_skill_recommendations,
    compute_tfidf_similarity,
    compute_skill_overlap,
)
from pdf_generator import generate_pdf_report

app = FastAPI(
    title="ResumeIQ API",
    description="AI-powered Resume Analyzer and Job Recommendation System",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "ResumeIQ API", "status": "running", "version": "2.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}


# ─────────────────────────────────────────────────────────────────────────────
# /analyze  — Main resume analysis endpoint (used by Navbar upload)
# Returns: score_data (legacy bars), skills, skill_gap, details,
#          resume_text, job_recommendations, resume_score, skill_recommendations
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/analyze")
async def analyze_resume(resume: UploadFile = File(...)):
    filename = resume.filename or ""
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ""
    if ext not in ('pdf', 'docx', 'doc'):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")

    file_bytes = await resume.read()
    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be under 10MB.")

    try:
        resume_data = parse_resume(file_bytes, filename)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")

    try:
        skills = resume_data["skills"]
        raw_text = resume_data["raw_text"]

        # Legacy score bars (kept for Dashboard component)
        score_data = calculate_dynamic_scores(raw_text, skills)

        # Legacy skill gap (kept for SkillGap component)
        from skill_gap import skill_gap_analysis
        skill_gap = skill_gap_analysis(skills)

        # New: job recommendations + hybrid resume score + skill recommendations
        job_recommendations = recommend_jobs(resume_data)
        resume_score = compute_resume_score(resume_data, job_recommendations)
        skill_recommendations = generate_skill_recommendations(resume_data, job_recommendations)

    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    return {
        # Legacy fields (used by existing frontend components)
        "score_data": score_data,
        "skills": skills,
        "skill_gap": skill_gap,
        "details": resume_data["details"],
        "resume_text": raw_text,
        # New fields (used by upgraded components)
        "candidate": {
            "name": resume_data["name"],
            "email": resume_data["email"],
            "phone": resume_data["phone"],
            "experience_years": resume_data["experience_years"],
            "skills": skills,
        },
        "resume_score": resume_score,
        "job_recommendations": job_recommendations,
        "skill_recommendations": skill_recommendations,
    }


# ─────────────────────────────────────────────────────────────────────────────
# /jd-match  — Job description matching (used by JDMatch component)
# Upgraded: now uses hybrid TF-IDF + skill overlap instead of keyword-only
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/jd-match")
async def jd_match(
    resume_text: str = Form(...),
    job_description: str = Form(...),
    job_title: Optional[str] = Form(None),
):
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty.")
    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")

    try:
        # TF-IDF similarity
        corpus = [preprocess_text(resume_text), preprocess_text(job_description)]
        vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2), sublinear_tf=True)
        tfidf_matrix = vectorizer.fit_transform(corpus)
        tfidf_score = float(cosine_similarity(tfidf_matrix[0], tfidf_matrix[1])[0][0])

        # Skill overlap
        resume_skills = extract_skills(resume_text)
        jd_skills = extract_skills(job_description)
        skill_info = compute_skill_overlap(resume_skills, jd_skills)

        # Hybrid score (50% TF-IDF + 50% skill overlap)
        overlap_ratio = skill_info["overlap_ratio"]
        hybrid = (0.5 * tfidf_score) + (0.5 * overlap_ratio)
        match_score = min(round(hybrid * 100, 1), 97.0)

        # Strength label
        if match_score >= 75:
            strength = "Strong Match"; strength_color = "green"
        elif match_score >= 50:
            strength = "Good Match"; strength_color = "amber"
        elif match_score >= 30:
            strength = "Partial Match"; strength_color = "orange"
        else:
            strength = "Weak Match"; strength_color = "red"

    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Matching failed: {str(e)}")

    return {
        "match": match_score,                         # legacy key (JDMatch component uses this)
        "match_score": match_score,
        "tfidf_score": round(tfidf_score * 100, 1),
        "skill_overlap": round(overlap_ratio * 100, 1),
        "matched_skills": skill_info["matched"],
        "missing_skills": skill_info["missing"],
        "jd_skills_detected": jd_skills,
        "resume_skills": resume_skills,
        "strength": strength,
        "strength_color": strength_color,
        "job_title": job_title or "Custom Job Description",
        "debug": {
            "skill_score": round(overlap_ratio * 100, 2),
            "tfidf": round(tfidf_score * 100, 2),
            "resume_skills": resume_skills,
            "jd_skills": jd_skills,
        },
    }


# ─────────────────────────────────────────────────────────────────────────────
# /download-pdf  — PDF report generation (used by SkillGap download button)
# Upgraded: structured PDF with sections, colors, job recommendations table
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/download-pdf")
async def download_pdf(request: Request):
    try:
        data = await request.json()
        resume_text = data.get("resume_text", "")
        score_data = data.get("resume_score", None)
        job_recs = data.get("job_recommendations", [])
        skill_recs = data.get("skill_recommendations", [])
        candidate = data.get("candidate", {})

        if not resume_text:
            raise HTTPException(status_code=400, detail="No resume text provided.")

        # If full analysis data was passed, use the rich PDF generator
        if score_data and job_recs:
            resume_data_for_pdf = {
                "name": candidate.get("name", "Candidate"),
                "email": candidate.get("email", ""),
                "phone": candidate.get("phone", ""),
                "skills": candidate.get("skills", []),
                "experience_years": candidate.get("experience_years", 0),
                "raw_text": resume_text,
            }
            pdf_bytes = generate_pdf_report(resume_data_for_pdf, score_data, job_recs, skill_recs)
        else:
            # Fallback: simple text-based PDF
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
            from reportlab.lib.styles import getSampleStyleSheet
            buffer = io.BytesIO()
            styles = getSampleStyleSheet()
            doc = SimpleDocTemplate(buffer)
            content = [Paragraph("Resume Analysis Report", styles["Title"]), Spacer(1, 15)]
            for line in resume_text.split('\n'):
                line = line.strip()
                if not line:
                    continue
                if any(kw in line.lower() for kw in ["email", "phone", "experience", "education", "projects", "skills", "certifications"]):
                    content.append(Paragraph(f"<b>{line}</b>", styles["Normal"]))
                else:
                    content.append(Paragraph(line, styles["Normal"]))
                content.append(Spacer(1, 8))
            doc.build(content)
            buffer.seek(0)
            pdf_bytes = buffer.read()

        candidate_name = candidate.get("name", "resume").replace(" ", "_")
        filename_out = f"{candidate_name}_Analysis_Report.pdf"

        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename_out}"'},
        )

    except HTTPException:
        raise
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


# ─────────────────────────────────────────────────────────────────────────────
# /report  — Full PDF report by re-uploading the file (clean endpoint)
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/report")
async def generate_report(resume: UploadFile = File(...)):
    filename = resume.filename or ""
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ""
    if ext not in ('pdf', 'docx', 'doc'):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")

    file_bytes = await resume.read()

    try:
        resume_data = parse_resume(file_bytes, filename)
        job_recommendations = recommend_jobs(resume_data)
        resume_score = compute_resume_score(resume_data, job_recommendations)
        skill_recommendations = generate_skill_recommendations(resume_data, job_recommendations)
        pdf_bytes = generate_pdf_report(resume_data, resume_score, job_recommendations, skill_recommendations)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

    candidate_name = resume_data.get("name", "resume").replace(" ", "_")
    filename_out = f"{candidate_name}_Analysis_Report.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename_out}"'},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
