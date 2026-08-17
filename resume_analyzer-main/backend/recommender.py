from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from job_data import JOB_DESCRIPTIONS
from resume_parser import preprocess_text


def compute_tfidf_similarity(resume_text: str, job_descriptions: list) -> list:
    """Compute cosine similarity between resume and all job descriptions using TF-IDF."""
    corpus = [preprocess_text(resume_text)] + [
        preprocess_text(jd["description"]) for jd in job_descriptions
    ]
    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        sublinear_tf=True,
    )
    tfidf_matrix = vectorizer.fit_transform(corpus)
    resume_vec = tfidf_matrix[0]
    jd_vecs = tfidf_matrix[1:]
    similarities = cosine_similarity(resume_vec, jd_vecs)[0]
    return similarities.tolist()


def compute_skill_overlap(resume_skills: list, job_required_skills: list) -> dict:
    """Compute matched and missing skills between resume and job description."""
    resume_skills_lower = [s.lower() for s in resume_skills]
    job_skills_lower = [s.lower() for s in job_required_skills]
    matched = [s for s in job_skills_lower if s in resume_skills_lower]
    missing = [s for s in job_skills_lower if s not in resume_skills_lower]
    overlap_ratio = len(matched) / len(job_skills_lower) if job_skills_lower else 0
    return {
        "matched": matched,
        "missing": missing,
        "overlap_ratio": round(overlap_ratio, 3),
    }


def compute_hybrid_score(tfidf_score: float, skill_overlap_ratio: float) -> float:
    """Blend TF-IDF similarity with skill overlap for final match score (50/50)."""
    hybrid = (0.5 * tfidf_score) + (0.5 * skill_overlap_ratio)
    return min(round(hybrid * 100, 1), 97.0)


def recommend_jobs(resume_data: dict) -> list:
    """Generate job recommendations with hybrid scores and skill gap analysis."""
    resume_text = resume_data["raw_text"]
    resume_skills = resume_data["skills"]
    tfidf_scores = compute_tfidf_similarity(resume_text, JOB_DESCRIPTIONS)
    results = []
    for i, jd in enumerate(JOB_DESCRIPTIONS):
        skill_info = compute_skill_overlap(resume_skills, jd["required_skills"])
        match_score = compute_hybrid_score(tfidf_scores[i], skill_info["overlap_ratio"])
        results.append({
            "id": jd["id"],
            "title": jd["title"],
            "company": jd["company"],
            "match_score": match_score,
            "tfidf_score": round(tfidf_scores[i] * 100, 1),
            "skill_overlap": round(skill_info["overlap_ratio"] * 100, 1),
            "matched_skills": skill_info["matched"],
            "missing_skills": skill_info["missing"],
            "required_skills": jd["required_skills"],
            "experience": jd["experience"],
        })
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results


def compute_resume_score(resume_data: dict, job_recommendations: list) -> dict:
    """
    Compute overall resume score using hybrid approach:
    skills (40) + experience (25) + top job match (35).
    Matches Month-4 report: hybrid scoring combining skill matching, project relevance, TF-IDF.
    """
    skills_count = len(resume_data["skills"])
    experience_years = resume_data["experience_years"]
    top_match = job_recommendations[0]["match_score"] if job_recommendations else 0

    skill_score = min(skills_count * 4, 40)
    exp_score = min(experience_years * 5, 25)
    match_score_component = top_match * 0.35

    total = round(skill_score + exp_score + match_score_component, 1)
    total = min(total, 98.0)

    if total >= 80:
        grade = "A"; grade_label = "Excellent"
    elif total >= 65:
        grade = "B"; grade_label = "Good"
    elif total >= 50:
        grade = "C"; grade_label = "Average"
    elif total >= 35:
        grade = "D"; grade_label = "Needs Improvement"
    else:
        grade = "F"; grade_label = "Poor"

    return {
        "total_score": total,
        "grade": grade,
        "grade_label": grade_label,
        "components": {
            "skills_score": round(skill_score, 1),
            "experience_score": round(exp_score, 1),
            "match_score": round(match_score_component, 1),
        },
        "skills_count": skills_count,
        "experience_years": experience_years,
    }


def generate_skill_recommendations(resume_data: dict, job_recommendations: list) -> list:
    """Generate personalized skill recommendations from top 3 job matches."""
    top_jobs = job_recommendations[:3]
    skill_frequency = {}
    for job in top_jobs:
        for skill in job["missing_skills"]:
            skill_frequency[skill] = skill_frequency.get(skill, 0) + 1
    sorted_skills = sorted(skill_frequency.items(), key=lambda x: x[1], reverse=True)
    recommendations = []
    for skill, freq in sorted_skills[:10]:
        recommendations.append({
            "skill": skill,
            "priority": "High" if freq >= 2 else "Medium",
            "appears_in": freq,
            "reason": f"Required in {freq} of your top {len(top_jobs)} job matches",
        })
    return recommendations
