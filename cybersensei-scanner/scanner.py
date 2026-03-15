"""
CyberSensei Scanner — Orchestrateur principal.
Lance tous les modules de scan en parallèle et consolide les résultats.
"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional

from modules.nmap_scan import run as nmap_run
from modules.nuclei_scan import run as nuclei_run
from modules.testssl_scan import run as testssl_run
from modules.dnstwist_scan import run as dnstwist_run
from modules.hibp_check import run as hibp_run
from modules.abuseipdb import run as abuseipdb_run
from score_engine import compute_score

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger("cybersensei-scanner")


async def _run_module(name: str, func, *args) -> tuple[str, dict]:
    """Exécute un module de scan dans un thread séparé et capture les erreurs."""
    try:
        loop = asyncio.get_running_loop()
        result = await loop.run_in_executor(None, func, *args)
        return name, result
    except Exception as exc:
        logger.error("Module %s a échoué : %s", name, exc)
        return name, {"error": str(exc), "skipped": True}


async def scan(domain: str, emails: Optional[list[str]] = None) -> dict:
    """
    Point d'entrée principal du scanner.
    Lance tous les modules en parallèle, consolide les résultats
    et calcule le score de sécurité.

    Args:
        domain: le domaine cible à scanner (ex: example.com)
        emails: liste optionnelle d'emails à vérifier dans les breaches

    Returns:
        dict avec domain, score, details par module et timestamp
    """
    emails = emails or []
    logger.info("Démarrage du scan pour %s (emails: %d)", domain, len(emails))

    # Lancement parallèle de tous les modules
    tasks = [
        _run_module("nmap", nmap_run, domain),
        _run_module("nuclei", nuclei_run, domain),
        _run_module("testssl", testssl_run, domain),
        _run_module("dnstwist", dnstwist_run, domain),
        _run_module("hibp", hibp_run, emails),
        _run_module("abuseipdb", abuseipdb_run, domain),
    ]

    results = await asyncio.gather(*tasks)
    details = {name: result for name, result in results}

    # Calcul du score global
    score = compute_score(details)

    report = {
        "domain": domain,
        "score": score,
        "details": details,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    logger.info("Scan terminé pour %s — score : %d/100", domain, score)
    return report


# Point d'entrée CLI
if __name__ == "__main__":
    import argparse
    import json

    parser = argparse.ArgumentParser(description="CyberSensei Scanner")
    parser.add_argument("domain", help="Domaine cible à scanner")
    parser.add_argument(
        "--emails",
        nargs="*",
        default=[],
        help="Emails à vérifier dans les breaches HIBP",
    )
    parser.add_argument(
        "--output", "-o", help="Fichier de sortie JSON (défaut : stdout)"
    )
    args = parser.parse_args()

    report = asyncio.run(scan(args.domain, args.emails))
    output = json.dumps(report, indent=2, ensure_ascii=False)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(output)
        logger.info("Rapport sauvegardé dans %s", args.output)
    else:
        print(output)
