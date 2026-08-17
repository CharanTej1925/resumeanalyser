# Updated skill_extractor.py
def extract_skills(text):
    skill_bank = [
        # Languages & Frameworks
        "python", "javascript", "typescript", "java", "c++", "ruby", "go",
        "react", "angular", "vue", "next.js", "node.js", "fastapi", "django", "flask",
        # Data & AI
        "machine learning", "deep learning", "nlp", "computer vision", "tensorflow", 
        "pytorch", "sql", "postgresql", "mongodb", "data analysis", "pandas",
        # DevOps & Tools
        "aws", "docker", "kubernetes", "git", "jenkins", "terraform",
        # Soft Skills
        "communication", "leadership", "agile", "problem solving"
    ]
    # Use lowercase matching for better accuracy
    text_lower = text.lower()
    return [skill for skill in skill_bank if skill in text_lower]