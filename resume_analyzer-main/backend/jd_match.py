from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

def jd_match_score(resume_text, job_description):

    # -------- CLEAN --------
    def clean(text):
        text = text.lower()
        text = re.sub(r'\s+', ' ', text)
        return text

    r_text = clean(resume_text)
    j_text = clean(job_description)

    # -------- TF-IDF --------
    vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1,2))
    tfidf_matrix = vectorizer.fit_transform([r_text, j_text])
    tfidf_score = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]

    # -------- SKILL MATCH --------
    skill_patterns = {
        "python": ["python"],
        "java": ["java"],
        "sql": ["sql", "database"],
        "dsa": ["data structures", "algorithms", "dsa"],
        "backend": ["backend", "api", "services"],
        "scalable": ["scalable", "scalability"],
        "performance": ["performance", "optimization"],
        "aws": ["aws", "cloud"],
        "system": ["system", "architecture"],
    }

    def extract_skills(text):
        found = set()
        for key, variants in skill_patterns.items():
            for v in variants:
                if v in text:
                    found.add(key)
                    break
        return found

    resume_skills = extract_skills(r_text)
    jd_skills = extract_skills(j_text)

    if len(jd_skills) == 0:
        skill_score = 0
    else:
        skill_score = len(resume_skills & jd_skills) / len(jd_skills)

    # -------- PROJECT MATCH --------
    project_keywords = ["ecommerce", "e commerce", "chat", "task", "management"]

    def project_score(text1, text2):
        score = 0
        for word in project_keywords:
            if word in text1 and word in text2:
                score += 1
        return score / len(project_keywords)

    proj_score = project_score(r_text, j_text)

    # -------- FINAL SCORE --------
    final_score = (
        0.4 * tfidf_score +
        0.4 * skill_score +
        0.2 * proj_score
    )

    return round(final_score * 100, 2)