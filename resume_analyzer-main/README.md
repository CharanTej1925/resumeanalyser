# ResumeIQ – AI-Powered Resume Analyzer & Job Recommendation System

ResumeIQ is an AI-powered web application that analyzes resumes, evaluates candidate skills, identifies skill gaps, and provides personalized job recommendations and improvement suggestions. It helps users understand their resume strengths and optimize them for better career opportunities.
## Installation

### Clone the Repository

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/resume_analyzer.git

cd resume_analyzer
```

---

## Backend Setup

```bash
cd backend

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend runs on:

```
http://localhost:8000
```

---

## Frontend Setup

```bash
cd frontend/resumeiq-frontend

npm install

npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## API Endpoints

### Health Check

```
GET /health
```

Returns server status.

### Resume Analysis

```
POST /analyze
```

Uploads and analyzes a resume.

Returns:
- Resume Score
- Extracted Skills
- Skill Gap Analysis
- Candidate Details
- Resume Text
- Job Recommendations
- Skill Recommendations

## Key Functionalities

- Resume Parsing
- Skill Extraction
- Resume Scoring
- Skill Gap Detection
- Resume-Job Matching
- Job Recommendation
- AI-based Skill Recommendations
- PDF Report Generation

## Future Enhancements

- LLM-powered resume feedback
- ATS compatibility analysis
- LinkedIn profile integration
- Resume improvement suggestions
- Interview question generation
- Real-time job portal integration

## Contributors

Developed as part of the **OELP**.

Contributions, suggestions, and improvements are welcome.

## License

This project is intended for educational and learning purposes.
