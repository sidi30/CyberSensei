"""
CyberSensei AI Reports — Générateur de rapports de sécurité via Claude.
Utilise le SDK Anthropic pour analyser les résultats de scan et produire
des rapports structurés en markdown selon le niveau SOC/NIS2 demandé.
"""

import json
import logging
import os
import smtplib
import time
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

import anthropic

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger("cybersensei-ai-reports")

# Répertoire contenant les fichiers de prompts système
PROMPTS_DIR = Path(__file__).parent / "prompts"

# Mapping niveau → fichier de prompt
LEVEL_PROMPT_MAP = {
    "soc1": "soc1_scan_analysis.txt",
    "soc2": "soc2_audit_infra.txt",
    "soc3_alert": "soc3_alert.txt",
    "soc3_report": "soc3_alert.txt",
    "nis2": "nis2_eval.txt",
    "monthly": "monthly_report.txt",
}

# Modèle Claude à utiliser
MODEL = "claude-sonnet-4-6"

# Configuration du retry exponentiel
MAX_RETRIES = 3
BASE_DELAY = 2  # secondes


def _load_prompt(level: str) -> str:
    """
    Charge le prompt système correspondant au niveau demandé.

    Args:
        level: niveau du rapport (soc1, soc2, soc3_alert, soc3_report, nis2, monthly)

    Returns:
        contenu du fichier de prompt système

    Raises:
        ValueError: si le niveau est inconnu
        FileNotFoundError: si le fichier de prompt est introuvable
    """
    filename = LEVEL_PROMPT_MAP.get(level)
    if not filename:
        raise ValueError(
            f"Niveau inconnu : '{level}'. "
            f"Niveaux valides : {', '.join(LEVEL_PROMPT_MAP.keys())}"
        )

    prompt_path = PROMPTS_DIR / filename
    if not prompt_path.exists():
        raise FileNotFoundError(f"Fichier de prompt introuvable : {prompt_path}")

    return prompt_path.read_text(encoding="utf-8")


def _build_user_message(scan_results: dict, level: str) -> str:
    """
    Construit le message utilisateur envoyé à Claude, contenant les résultats
    de scan formatés en JSON.

    Args:
        scan_results: dictionnaire des résultats de scan consolidés
        level: niveau du rapport pour les instructions contextuelles

    Returns:
        message utilisateur formaté
    """
    results_json = json.dumps(scan_results, indent=2, ensure_ascii=False)

    # Extraire les métadonnées utiles
    domain = scan_results.get("domain", "N/A")
    score = scan_results.get("score", "N/A")
    company = scan_results.get("company_name", domain)
    timestamp = scan_results.get("timestamp", "N/A")

    message = (
        f"Voici les résultats complets du scan de sécurité à analyser.\n\n"
        f"**Cible** : {domain}\n"
        f"**Entreprise** : {company}\n"
        f"**Score global** : {score}/100\n"
        f"**Date du scan** : {timestamp}\n"
        f"**Niveau de rapport demandé** : {level}\n\n"
        f"```json\n{results_json}\n```\n\n"
        f"Génère le rapport complet en markdown structuré selon tes instructions système."
    )
    return message


def generate_report(scan_results: dict, level: str) -> str:
    """
    Génère un rapport de sécurité via l'API Claude.

    Charge le prompt système correspondant au niveau, injecte les résultats
    de scan dans le message utilisateur, et appelle Claude avec retry exponentiel.

    Args:
        scan_results: résultats consolidés du scanner (dict JSON)
        level: niveau du rapport — "soc1", "soc2", "soc3_alert",
               "soc3_report", "nis2", "monthly"

    Returns:
        rapport en markdown généré par Claude

    Raises:
        ValueError: si le niveau est inconnu
        anthropic.APIError: si l'API échoue après toutes les tentatives
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise EnvironmentError("Variable d'environnement ANTHROPIC_API_KEY non définie")

    # Charger le prompt système
    system_prompt = _load_prompt(level)
    logger.info("Prompt système chargé pour le niveau '%s'", level)

    # Construire le message utilisateur
    user_message = _build_user_message(scan_results, level)

    # Initialiser le client Anthropic
    client = anthropic.Anthropic(api_key=api_key)

    # Appel API avec retry exponentiel
    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logger.info(
                "Appel API Claude (modèle=%s, tentative %d/%d)",
                MODEL, attempt, MAX_RETRIES,
            )

            response = client.messages.create(
                model=MODEL,
                max_tokens=8192,
                system=system_prompt,
                messages=[{"role": "user", "content": user_message}],
            )

            # Extraire le texte de la réponse
            report_md = ""
            for block in response.content:
                if block.type == "text":
                    report_md += block.text

            logger.info(
                "Rapport généré avec succès (%d caractères, %d tokens utilisés)",
                len(report_md),
                response.usage.input_tokens + response.usage.output_tokens,
            )
            return report_md

        except anthropic.RateLimitError as exc:
            last_error = exc
            delay = BASE_DELAY * (2 ** (attempt - 1))
            logger.warning(
                "Rate-limit atteint (tentative %d/%d), retry dans %ds",
                attempt, MAX_RETRIES, delay,
            )
            time.sleep(delay)

        except anthropic.APIStatusError as exc:
            last_error = exc
            if exc.status_code >= 500:
                delay = BASE_DELAY * (2 ** (attempt - 1))
                logger.warning(
                    "Erreur serveur %d (tentative %d/%d), retry dans %ds",
                    exc.status_code, attempt, MAX_RETRIES, delay,
                )
                time.sleep(delay)
            else:
                # Erreur client (4xx hors rate-limit) — pas de retry
                logger.error("Erreur API client (%d) : %s", exc.status_code, exc.message)
                raise

        except anthropic.APIConnectionError as exc:
            last_error = exc
            delay = BASE_DELAY * (2 ** (attempt - 1))
            logger.warning(
                "Erreur de connexion (tentative %d/%d), retry dans %ds",
                attempt, MAX_RETRIES, delay,
            )
            time.sleep(delay)

    # Toutes les tentatives ont échoué
    logger.error("Échec après %d tentatives", MAX_RETRIES)
    raise last_error


def send_report_by_email(
    pdf_path: str,
    recipient_email: str,
    company_name: str,
) -> None:
    """
    Envoie le rapport PDF par email via SMTP.

    Variables d'environnement requises :
        SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD

    Args:
        pdf_path: chemin vers le fichier PDF à envoyer
        recipient_email: adresse email du destinataire
        company_name: nom de l'entreprise (utilisé dans l'objet du mail)

    Raises:
        EnvironmentError: si les variables SMTP ne sont pas définies
        FileNotFoundError: si le fichier PDF n'existe pas
        smtplib.SMTPException: si l'envoi échoue
    """
    # Valider les variables d'environnement SMTP
    smtp_host = os.environ.get("SMTP_HOST")
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_user = os.environ.get("SMTP_USER")
    smtp_password = os.environ.get("SMTP_PASSWORD")

    if not all([smtp_host, smtp_user, smtp_password]):
        raise EnvironmentError(
            "Variables SMTP_HOST, SMTP_USER et SMTP_PASSWORD requises"
        )

    # Vérifier que le PDF existe
    pdf_file = Path(pdf_path)
    if not pdf_file.exists():
        raise FileNotFoundError(f"Fichier PDF introuvable : {pdf_path}")

    # Construire l'email
    msg = MIMEMultipart()
    msg["From"] = smtp_user
    msg["To"] = recipient_email
    msg["Subject"] = f"CyberSensei — Rapport de sécurité pour {company_name}"

    body = (
        f"Bonjour,\n\n"
        f"Veuillez trouver ci-joint le rapport de sécurité CyberSensei "
        f"pour {company_name}.\n\n"
        f"Ce rapport a été généré automatiquement par la plateforme CyberSensei. "
        f"Pour toute question, contactez votre analyste référent.\n\n"
        f"Cordialement,\n"
        f"L'équipe CyberSensei"
    )
    msg.attach(MIMEText(body, "plain", "utf-8"))

    # Attacher le PDF
    with open(pdf_path, "rb") as f:
        part = MIMEBase("application", "pdf")
        part.set_payload(f.read())
    encoders.encode_base64(part)
    part.add_header(
        "Content-Disposition",
        f'attachment; filename="{pdf_file.name}"',
    )
    msg.attach(part)

    # Envoyer
    logger.info("Envoi du rapport à %s via %s:%d", recipient_email, smtp_host, smtp_port)
    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, recipient_email, msg.as_string())

    logger.info("Rapport envoyé avec succès à %s", recipient_email)


# Point d'entrée CLI
if __name__ == "__main__":
    import argparse

    from pdf_builder import build_pdf

    parser = argparse.ArgumentParser(description="CyberSensei AI Report Generator")
    parser.add_argument("scan_json", help="Fichier JSON des résultats de scan")
    parser.add_argument(
        "--level", "-l",
        choices=list(LEVEL_PROMPT_MAP.keys()),
        default="soc1",
        help="Niveau du rapport (défaut: soc1)",
    )
    parser.add_argument("--company", "-c", default="", help="Nom de l'entreprise")
    parser.add_argument("--output", "-o", default="report.pdf", help="Fichier PDF de sortie")
    parser.add_argument("--email", "-e", help="Envoyer le PDF par email à cette adresse")
    args = parser.parse_args()

    # Charger les résultats de scan
    with open(args.scan_json, "r", encoding="utf-8") as f:
        scan_results = json.load(f)

    if args.company:
        scan_results["company_name"] = args.company

    # Générer le rapport markdown via Claude
    logger.info("Génération du rapport niveau '%s'...", args.level)
    report_md = generate_report(scan_results, args.level)

    # Construire le PDF
    company_name = scan_results.get("company_name", scan_results.get("domain", "N/A"))
    score = scan_results.get("score", 0)

    build_pdf(
        markdown_content=report_md,
        output_path=args.output,
        company_name=company_name,
        score=score,
    )
    logger.info("PDF généré : %s", args.output)

    # Envoyer par email si demandé
    if args.email:
        send_report_by_email(args.output, args.email, company_name)
