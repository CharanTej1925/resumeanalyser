# Expanded Industry Skill Sets
ROLE_SKILLS = {
    "Software Engineer": {"python", "java", "git", "docker", "unit testing", "data structures", "sql"},
    "Data Scientist": {"python", "machine learning", "statistics", "pandas", "tensorflow", "sql", "data analysis"},
    "Frontend Developer": {"javascript", "react", "html", "css", "tailwind", "typescript", "figma"},
    "Backend Developer": {"node.js", "fastapi", "postgresql", "redis", "api design", "docker", "aws"},
    "AI/ML Engineer": {"python", "pytorch", "deep learning", "nlp", "computer vision", "math", "cuda"}
}

def skill_gap_analysis(user_skills, target_role="Software Engineer"):
    # Ensure the role exists, fallback to a general set if not
    required = ROLE_SKILLS.get(target_role, ROLE_SKILLS["Software Engineer"])
    
    user_skills_set = {s.lower() for s in user_skills}
    missing = required - user_skills_set
    
    # Matching Month-3 Insight Generation requirements
    return {
        "missing_skills": list(missing),
        "count": len(missing),
        "match_percentage": round(((len(required) - len(missing)) / len(required)) * 100, 2)
    }