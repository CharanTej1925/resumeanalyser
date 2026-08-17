from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
import io


DARK_BG = colors.HexColor('#0f0f1a')
ACCENT = colors.HexColor('#6c63ff')
ACCENT2 = colors.HexColor('#00d4aa')
TEXT_LIGHT = colors.HexColor('#e2e8f0')
CARD_BG = colors.HexColor('#1a1a2e')
MUTED = colors.HexColor('#94a3b8')
SUCCESS = colors.HexColor('#10b981')
WARNING = colors.HexColor('#f59e0b')
DANGER = colors.HexColor('#ef4444')


def get_grade_color(grade: str):
    return {
        'A': SUCCESS,
        'B': ACCENT2,
        'C': WARNING,
        'D': WARNING,
        'F': DANGER,
    }.get(grade, MUTED)


def generate_pdf_report(resume_data: dict, resume_score: dict, job_recommendations: list, skill_recommendations: list) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=1.5 * cm,
        leftMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
    )

    styles = getSampleStyleSheet()
    elements = []

    title_style = ParagraphStyle('Title', parent=styles['Title'],
        fontSize=22, textColor=ACCENT, spaceAfter=4, fontName='Helvetica-Bold', alignment=TA_CENTER)
    subtitle_style = ParagraphStyle('Subtitle', parent=styles['Normal'],
        fontSize=11, textColor=MUTED, spaceAfter=16, alignment=TA_CENTER)
    section_style = ParagraphStyle('Section', parent=styles['Heading2'],
        fontSize=14, textColor=ACCENT, spaceBefore=16, spaceAfter=6,
        fontName='Helvetica-Bold', borderPad=4)
    body_style = ParagraphStyle('Body', parent=styles['Normal'],
        fontSize=10, textColor=colors.HexColor('#cbd5e1'), spaceAfter=4, leading=15)
    label_style = ParagraphStyle('Label', parent=styles['Normal'],
        fontSize=9, textColor=MUTED, spaceAfter=2)
    value_style = ParagraphStyle('Value', parent=styles['Normal'],
        fontSize=11, textColor=TEXT_LIGHT, spaceAfter=6, fontName='Helvetica-Bold')

    # Header
    elements.append(Paragraph("Smart Resume Analyzer", title_style))
    elements.append(Paragraph("AI-Powered Career Intelligence Report", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=16))

    # Candidate Info
    elements.append(Paragraph("Candidate Profile", section_style))
    info_data = [
        ["Name", resume_data.get("name", "N/A"), "Email", resume_data.get("email", "N/A")],
        ["Phone", resume_data.get("phone", "N/A"), "Experience", f"{resume_data.get('experience_years', 0)} years"],
        ["Skills Found", str(resume_score.get("skills_count", 0)), "Grade", f"{resume_score.get('grade', 'N/A')} — {resume_score.get('grade_label', '')}"],
    ]
    info_table = Table(info_data, colWidths=[3 * cm, 7.5 * cm, 3 * cm, 7.5 * cm])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
        ('TEXTCOLOR', (0, 0), (0, -1), MUTED),
        ('TEXTCOLOR', (2, 0), (2, -1), MUTED),
        ('TEXTCOLOR', (1, 0), (1, -1), TEXT_LIGHT),
        ('TEXTCOLOR', (3, 0), (3, -1), TEXT_LIGHT),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
        ('FONTNAME', (3, 0), (3, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [CARD_BG, colors.HexColor('#16213e')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#2d3748')),
        ('ROUNDEDCORNERS', [4]),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 12))

    # Resume Score
    elements.append(Paragraph("Resume Score", section_style))
    score = resume_score.get("total_score", 0)
    components = resume_score.get("components", {})
    score_data = [
        ["Metric", "Score", "Weight"],
        ["Overall Score", f"{score}/100", "—"],
        ["Skills Score", f"{components.get('skills_score', 0)}/40", "40%"],
        ["Experience Score", f"{components.get('experience_score', 0)}/25", "25%"],
        ["Job Match Score", f"{components.get('match_score', 0):.1f}/35", "35%"],
    ]
    score_table = Table(score_data, colWidths=[9 * cm, 5 * cm, 7.5 * cm])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#1e1e3a')),
        ('TEXTCOLOR', (0, 1), (-1, 1), ACCENT2),
        ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 1), (-1, 1), 13),
        ('BACKGROUND', (0, 2), (-1, -1), CARD_BG),
        ('TEXTCOLOR', (0, 2), (-1, -1), TEXT_LIGHT),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('PADDING', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#2d3748')),
        ('ROWBACKGROUNDS', (0, 2), (-1, -1), [CARD_BG, colors.HexColor('#16213e')]),
    ]))
    elements.append(score_table)
    elements.append(Spacer(1, 12))

    # Detected Skills
    elements.append(Paragraph("Detected Skills", section_style))
    skills = resume_data.get("skills", [])
    if skills:
        skills_text = "  •  ".join([s.title() for s in skills])
        elements.append(Paragraph(skills_text, body_style))
    else:
        elements.append(Paragraph("No skills detected.", body_style))
    elements.append(Spacer(1, 12))

    # Top Job Recommendations
    elements.append(Paragraph("Top Job Recommendations", section_style))
    top_jobs = job_recommendations[:5]
    job_data_table = [["#", "Job Title", "Company", "Match %", "Skill Overlap"]]
    for i, job in enumerate(top_jobs, 1):
        job_data_table.append([
            str(i),
            job["title"],
            job["company"],
            f"{job['match_score']}%",
            f"{job['skill_overlap']}%",
        ])

    job_table = Table(job_data_table, colWidths=[1 * cm, 6.5 * cm, 5 * cm, 3 * cm, 3.5 * cm])
    job_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [CARD_BG, colors.HexColor('#16213e')]),
        ('TEXTCOLOR', (0, 1), (-1, -1), TEXT_LIGHT),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#2d3748')),
        ('ALIGN', (3, 0), (4, -1), 'CENTER'),
    ]))
    elements.append(job_table)
    elements.append(Spacer(1, 12))

    # Skill Gap for top job
    if top_jobs:
        top_job = top_jobs[0]
        elements.append(Paragraph(f"Skill Gap Analysis — {top_job['title']}", section_style))

        matched = top_job.get("matched_skills", [])
        missing = top_job.get("missing_skills", [])

        gap_data = [["✓ Matched Skills", "✗ Missing Skills"]]
        max_rows = max(len(matched), len(missing))
        for i in range(max_rows):
            m = matched[i].title() if i < len(matched) else ""
            ms = missing[i].title() if i < len(missing) else ""
            gap_data.append([m, ms])

        gap_table = Table(gap_data, colWidths=[11 * cm, 10 * cm])
        gap_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), SUCCESS),
            ('BACKGROUND', (1, 0), (1, 0), DANGER),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('TEXTCOLOR', (0, 1), (0, -1), SUCCESS),
            ('TEXTCOLOR', (1, 1), (1, -1), DANGER),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('PADDING', (0, 0), (-1, -1), 7),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [CARD_BG, colors.HexColor('#16213e')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#2d3748')),
        ]))
        elements.append(gap_table)
        elements.append(Spacer(1, 12))

    # Skill Recommendations
    elements.append(Paragraph("Personalized Skill Recommendations", section_style))
    high_priority = [r for r in skill_recommendations if r["priority"] == "High"]
    medium_priority = [r for r in skill_recommendations if r["priority"] == "Medium"]

    if high_priority:
        elements.append(Paragraph("🔴 High Priority", ParagraphStyle('HP', parent=styles['Normal'],
            fontSize=10, textColor=DANGER, spaceAfter=4, fontName='Helvetica-Bold')))
        for rec in high_priority:
            elements.append(Paragraph(f"• {rec['skill'].title()} — {rec['reason']}", body_style))

    if medium_priority:
        elements.append(Paragraph("🟡 Medium Priority", ParagraphStyle('MP', parent=styles['Normal'],
            fontSize=10, textColor=WARNING, spaceAfter=4, fontName='Helvetica-Bold', spaceBefore=8)))
        for rec in medium_priority:
            elements.append(Paragraph(f"• {rec['skill'].title()} — {rec['reason']}", body_style))

    elements.append(Spacer(1, 16))
    elements.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=8))
    elements.append(Paragraph("Generated by Smart Resume Analyzer • AI-Powered Career Intelligence",
        ParagraphStyle('Footer', parent=styles['Normal'],
            fontSize=8, textColor=MUTED, alignment=TA_CENTER)))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()
