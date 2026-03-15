"""
CyberSensei PDF Builder — Génère un PDF professionnel à partir du markdown.
Utilise ReportLab pour construire un PDF avec en-tête, score coloré,
sections formatées et disclaimer en pied de page.
"""

import logging
import re
from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

logger = logging.getLogger("cybersensei-ai-reports.pdf")

# Dimensions de la page A4
PAGE_WIDTH, PAGE_HEIGHT = A4

# Couleurs CyberSensei
CS_DARK = colors.HexColor("#1a1a2e")
CS_BLUE = colors.HexColor("#0f3460")
CS_ACCENT = colors.HexColor("#16c79a")
CS_RED = colors.HexColor("#e74c3c")
CS_ORANGE = colors.HexColor("#f39c12")
CS_GREEN = colors.HexColor("#27ae60")
CS_GRAY = colors.HexColor("#7f8c8d")
CS_LIGHT_BG = colors.HexColor("#f8f9fa")


def _score_color(score: int) -> colors.HexColor:
    """Retourne la couleur associée au score (rouge/orange/vert)."""
    if score >= 75:
        return CS_GREEN
    elif score >= 50:
        return CS_ORANGE
    else:
        return CS_RED


def _score_label(score: int) -> str:
    """Retourne le libellé associé au score."""
    if score >= 75:
        return "BON"
    elif score >= 50:
        return "MOYEN"
    elif score >= 25:
        return "FAIBLE"
    else:
        return "CRITIQUE"


def _create_styles() -> dict:
    """Crée et retourne les styles de paragraphe pour le PDF."""
    base = getSampleStyleSheet()

    styles = {
        "title": ParagraphStyle(
            "CSTitle",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=22,
            textColor=CS_DARK,
            spaceAfter=6 * mm,
            alignment=TA_CENTER,
        ),
        "subtitle": ParagraphStyle(
            "CSSubtitle",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=12,
            textColor=CS_GRAY,
            spaceAfter=4 * mm,
            alignment=TA_CENTER,
        ),
        "h1": ParagraphStyle(
            "CSH1",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=16,
            textColor=CS_BLUE,
            spaceBefore=8 * mm,
            spaceAfter=4 * mm,
            borderWidth=0,
            borderPadding=0,
        ),
        "h2": ParagraphStyle(
            "CSH2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=13,
            textColor=CS_DARK,
            spaceBefore=6 * mm,
            spaceAfter=3 * mm,
        ),
        "h3": ParagraphStyle(
            "CSH3",
            parent=base["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=11,
            textColor=CS_DARK,
            spaceBefore=4 * mm,
            spaceAfter=2 * mm,
        ),
        "body": ParagraphStyle(
            "CSBody",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10,
            textColor=CS_DARK,
            spaceAfter=2 * mm,
            alignment=TA_JUSTIFY,
            leading=14,
        ),
        "bold": ParagraphStyle(
            "CSBold",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=10,
            textColor=CS_DARK,
            spaceAfter=2 * mm,
            leading=14,
        ),
        "bullet": ParagraphStyle(
            "CSBullet",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10,
            textColor=CS_DARK,
            leftIndent=10 * mm,
            bulletIndent=5 * mm,
            spaceAfter=1.5 * mm,
            leading=13,
        ),
        "code": ParagraphStyle(
            "CSCode",
            parent=base["Code"],
            fontName="Courier",
            fontSize=8,
            textColor=CS_DARK,
            backColor=CS_LIGHT_BG,
            leftIndent=5 * mm,
            rightIndent=5 * mm,
            spaceAfter=3 * mm,
            spaceBefore=2 * mm,
            leading=11,
        ),
        "disclaimer": ParagraphStyle(
            "CSDisclaimer",
            parent=base["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=7,
            textColor=CS_GRAY,
            alignment=TA_CENTER,
            leading=9,
        ),
        "score_big": ParagraphStyle(
            "CSScoreBig",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=48,
            alignment=TA_CENTER,
            spaceAfter=2 * mm,
        ),
        "score_label": ParagraphStyle(
            "CSScoreLabel",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=14,
            alignment=TA_CENTER,
            spaceAfter=6 * mm,
        ),
    }
    return styles


def _header_footer(canvas, doc, company_name: str, score: int):
    """Dessine l'en-tête et le pied de page sur chaque page."""
    canvas.saveState()
    width, height = A4

    # --- En-tête ---
    # Bande de couleur en haut
    canvas.setFillColor(CS_DARK)
    canvas.rect(0, height - 18 * mm, width, 18 * mm, fill=True, stroke=False)

    # Texte logo CyberSensei
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 14)
    canvas.drawString(15 * mm, height - 12 * mm, "CYBER SENSEI")

    # Sous-titre
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(CS_ACCENT)
    canvas.drawString(15 * mm, height - 16 * mm, "Security Intelligence Platform")

    # Score en haut à droite
    sc = _score_color(score)
    canvas.setFillColor(sc)
    canvas.setFont("Helvetica-Bold", 12)
    canvas.drawRightString(width - 15 * mm, height - 12 * mm, f"Score: {score}/100")

    # Ligne séparatrice sous l'en-tête
    canvas.setStrokeColor(CS_ACCENT)
    canvas.setLineWidth(0.5)
    canvas.line(10 * mm, height - 19 * mm, width - 10 * mm, height - 19 * mm)

    # --- Pied de page ---
    canvas.setStrokeColor(CS_GRAY)
    canvas.setLineWidth(0.3)
    canvas.line(10 * mm, 15 * mm, width - 10 * mm, 15 * mm)

    canvas.setFillColor(CS_GRAY)
    canvas.setFont("Helvetica", 7)
    canvas.drawString(
        15 * mm, 10 * mm,
        f"CyberSensei — Rapport confidentiel — {company_name}",
    )
    canvas.drawRightString(
        width - 15 * mm, 10 * mm,
        f"Page {doc.page}",
    )

    # Disclaimer
    canvas.setFont("Helvetica-Oblique", 6)
    canvas.drawCentredString(
        width / 2, 6 * mm,
        "Ce rapport est généré automatiquement. Il ne constitue pas un audit certifié "
        "et ne remplace pas l'avis d'un expert qualifié.",
    )

    canvas.restoreState()


def _markdown_to_flowables(md_content: str, styles: dict) -> list:
    """
    Convertit le contenu markdown en éléments ReportLab (flowables).
    Gère les titres, paragraphes, listes à puces et blocs de code.

    Args:
        md_content: contenu markdown du rapport
        styles: dictionnaire des styles de paragraphe

    Returns:
        liste de flowables ReportLab
    """
    flowables = []
    lines = md_content.split("\n")
    i = 0
    in_code_block = False
    code_buffer = []

    while i < len(lines):
        line = lines[i]

        # Gestion des blocs de code
        if line.strip().startswith("```"):
            if in_code_block:
                # Fin du bloc de code
                code_text = "<br/>".join(
                    l.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                    for l in code_buffer
                )
                if code_text:
                    flowables.append(Paragraph(code_text, styles["code"]))
                code_buffer = []
                in_code_block = False
            else:
                in_code_block = True
            i += 1
            continue

        if in_code_block:
            code_buffer.append(line)
            i += 1
            continue

        stripped = line.strip()

        # Ligne vide
        if not stripped:
            flowables.append(Spacer(1, 2 * mm))
            i += 1
            continue

        # Titres
        if stripped.startswith("# ") and not stripped.startswith("## "):
            text = _md_inline_to_rl(stripped[2:])
            flowables.append(Paragraph(text, styles["h1"]))
            i += 1
            continue

        if stripped.startswith("## ") and not stripped.startswith("### "):
            text = _md_inline_to_rl(stripped[3:])
            flowables.append(Paragraph(text, styles["h2"]))
            i += 1
            continue

        if stripped.startswith("### "):
            text = _md_inline_to_rl(stripped[4:])
            flowables.append(Paragraph(text, styles["h3"]))
            i += 1
            continue

        # Listes à puces
        if stripped.startswith("- ") or stripped.startswith("* "):
            text = _md_inline_to_rl(stripped[2:])
            flowables.append(
                Paragraph(f"\u2022  {text}", styles["bullet"])
            )
            i += 1
            continue

        # Séparateur horizontal
        if stripped in ("---", "***", "___"):
            flowables.append(Spacer(1, 2 * mm))
            i += 1
            continue

        # Paragraphe normal — accumuler les lignes consécutives
        para_lines = [stripped]
        while i + 1 < len(lines):
            next_line = lines[i + 1].strip()
            if (
                not next_line
                or next_line.startswith("#")
                or next_line.startswith("- ")
                or next_line.startswith("* ")
                or next_line.startswith("```")
                or next_line in ("---", "***", "___")
            ):
                break
            para_lines.append(next_line)
            i += 1

        text = _md_inline_to_rl(" ".join(para_lines))
        flowables.append(Paragraph(text, styles["body"]))
        i += 1

    return flowables


def _md_inline_to_rl(text: str) -> str:
    """
    Convertit le formatage markdown inline en balises ReportLab XML.
    Gère le gras, l'italique et le code inline.

    Args:
        text: texte markdown avec formatage inline

    Returns:
        texte avec balises XML ReportLab
    """
    # Échapper les caractères XML
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    # Gras : **texte** ou __texte__
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"__(.+?)__", r"<b>\1</b>", text)

    # Italique : *texte* ou _texte_
    text = re.sub(r"\*(.+?)\*", r"<i>\1</i>", text)
    text = re.sub(r"(?<!\w)_(.+?)_(?!\w)", r"<i>\1</i>", text)

    # Code inline : `texte`
    text = re.sub(r"`(.+?)`", r'<font name="Courier" size="9">\1</font>', text)

    return text


def build_pdf(
    markdown_content: str,
    output_path: str,
    company_name: str,
    score: int,
    logo_path: str | None = None,
) -> str:
    """
    Construit un PDF professionnel à partir du rapport markdown.

    Args:
        markdown_content: rapport en markdown généré par Claude
        output_path: chemin du fichier PDF de sortie
        company_name: nom de l'entreprise
        score: score de sécurité (0-100)
        logo_path: chemin optionnel vers le logo (PNG/JPG)

    Returns:
        chemin du fichier PDF généré
    """
    styles = _create_styles()

    # Créer le document avec en-tête/pied de page
    doc = BaseDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=15 * mm,
        rightMargin=15 * mm,
        topMargin=25 * mm,
        bottomMargin=22 * mm,
        title=f"CyberSensei — Rapport de sécurité — {company_name}",
        author="CyberSensei Platform",
    )

    # Frame principal
    frame = Frame(
        doc.leftMargin,
        doc.bottomMargin,
        PAGE_WIDTH - doc.leftMargin - doc.rightMargin,
        PAGE_HEIGHT - doc.topMargin - doc.bottomMargin,
        id="main",
    )

    def on_page(canvas, doc):
        _header_footer(canvas, doc, company_name, score)

    template = PageTemplate(id="main", frames=[frame], onPage=on_page)
    doc.addPageTemplates([template])

    # Construire les éléments du PDF
    elements = []

    # --- Page de titre ---
    elements.append(Spacer(1, 20 * mm))

    # Logo si disponible
    if logo_path and Path(logo_path).exists():
        try:
            logo = Image(logo_path, width=40 * mm, height=40 * mm)
            logo.hAlign = "CENTER"
            elements.append(logo)
            elements.append(Spacer(1, 5 * mm))
        except Exception:
            logger.warning("Impossible de charger le logo : %s", logo_path)

    # Titre principal
    elements.append(Paragraph("RAPPORT DE SÉCURITÉ", styles["title"]))
    elements.append(
        Paragraph(f"Analyse complète pour {company_name}", styles["subtitle"])
    )
    elements.append(Spacer(1, 10 * mm))

    # Bloc de score avec couleur
    color = _score_color(score)
    label = _score_label(score)

    score_style = ParagraphStyle(
        "ScoreDynamic",
        parent=styles["score_big"],
        textColor=color,
    )
    label_style = ParagraphStyle(
        "LabelDynamic",
        parent=styles["score_label"],
        textColor=color,
    )

    elements.append(Paragraph(f"{score}/100", score_style))
    elements.append(Paragraph(label, label_style))
    elements.append(Spacer(1, 5 * mm))

    # Informations du rapport
    now = datetime.now(timezone.utc).strftime("%d/%m/%Y à %H:%M UTC")
    info_data = [
        ["Entreprise", company_name],
        ["Date du rapport", now],
        ["Score de sécurité", f"{score}/100 — {label}"],
    ]
    info_table = Table(info_data, colWidths=[50 * mm, 100 * mm])
    info_table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("TEXTCOLOR", (0, 0), (-1, -1), CS_DARK),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 3 * mm),
                ("LINEBELOW", (0, 0), (-1, -2), 0.3, CS_GRAY),
            ]
        )
    )
    elements.append(info_table)
    elements.append(Spacer(1, 10 * mm))

    # Disclaimer page de titre
    elements.append(
        Paragraph(
            "Ce document est strictement confidentiel. Sa diffusion est réservée "
            "aux destinataires autorisés. Ce rapport est généré par intelligence "
            "artificielle et ne constitue pas un audit de sécurité certifié.",
            styles["disclaimer"],
        )
    )

    elements.append(PageBreak())

    # --- Contenu du rapport ---
    content_flowables = _markdown_to_flowables(markdown_content, styles)
    elements.extend(content_flowables)

    # --- Page de fin : disclaimer complet ---
    elements.append(Spacer(1, 15 * mm))
    elements.append(Paragraph("AVERTISSEMENT LÉGAL", styles["h2"]))
    elements.append(
        Paragraph(
            "Ce rapport a été généré automatiquement par la plateforme CyberSensei "
            "à l'aide de modèles d'intelligence artificielle. Les informations "
            "contenues dans ce document sont fournies à titre indicatif et ne "
            "constituent en aucun cas un audit de sécurité certifié, un conseil "
            "juridique ou une garantie de conformité réglementaire. CyberSensei "
            "décline toute responsabilité quant aux décisions prises sur la base "
            "de ce rapport. Il est recommandé de faire valider les conclusions "
            "par un professionnel qualifié en cybersécurité.",
            styles["body"],
        )
    )

    # Générer le PDF
    doc.build(elements)
    logger.info("PDF généré avec succès : %s", output_path)
    return output_path


# Point d'entrée CLI autonome
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="CyberSensei PDF Builder")
    parser.add_argument("markdown_file", help="Fichier markdown source")
    parser.add_argument("--output", "-o", default="report.pdf", help="PDF de sortie")
    parser.add_argument("--company", "-c", default="Entreprise", help="Nom entreprise")
    parser.add_argument("--score", "-s", type=int, default=75, help="Score (0-100)")
    parser.add_argument("--logo", help="Chemin vers le logo PNG/JPG")
    args = parser.parse_args()

    md = Path(args.markdown_file).read_text(encoding="utf-8")
    build_pdf(md, args.output, args.company, args.score, args.logo)
