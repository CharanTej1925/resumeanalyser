import re
def calculate_dynamic_scores(text: str, skills: list) -> dict:
    """
    Hybrid resume scoring combining:
    - Section completeness
    - Keyword optimization (skill count)
    - Formatting quality
    - Experience relevance (year-based)
    - Skill depth/diversity
    Matches Month-3 report: weighted score based on match percentage & experience relevance.
    """
    # 1. Completeness: Check for key sections
    sections = ["experience", "education", "projects", "skills", "summary"]
    found_sections = [s for s in sections if s in text.lower()]
    completeness = int((len(found_sections) / len(sections)) * 100)

    # 2. Keyword Optimization: skill density (each skill worth 10pts, max 100)
    keyword_score = min(len(skills) * 10, 100)

    # 3. Formatting Quality: heuristic based on bullet markers
    has_bullets = len(re.findall(r'[•\-\*]', text)) > 5
    formatting = 90 if has_bullets else 60

    # 4. Experience Relevance: year-based patterns
    years = re.findall(r'20\d{2}', text)
    experience_score = 85 if len(years) > 2 else 50

    # 5. Skill Depth: diversity (each skill worth 12pts, max 100)
    skill_depth = min(len(skills) * 12, 100)

    total = int((completeness + keyword_score + formatting + experience_score + skill_depth) / 5)

    reasons = []
    if completeness < 100:
        reasons.append("Some key sections like Experience or Projects are missing.")
    if keyword_score < 70:
        reasons.append("Add more technical keywords to improve ATS matching.")
    if formatting < 80:
        reasons.append("Use bullet points and structured formatting for better readability.")
    if experience_score < 70:
        reasons.append("Include more detailed experience or project timelines.")
    if skill_depth < 70:
        reasons.append("Add more diverse technical skills to strengthen your profile.")

    return {
        "total": total,
        "completeness": completeness,
        "keywords": keyword_score,
        "formatting": formatting,
        "relevance": experience_score,
        "depth": skill_depth,
        "reasons": reasons,
    }
