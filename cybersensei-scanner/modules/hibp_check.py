"""
Module Have I Been Pwned — Vérifie si des emails ont été compromis dans des breaches.
Utilise l'API HIBP v3 avec clé API en variable d'environnement.
"""

import logging
import os
import time

import requests

logger = logging.getLogger("cybersensei-scanner.hibp")

HIBP_API_URL = "https://haveibeenpwned.com/api/v3/breachedaccount"
HIBP_HEADERS_BASE = {
    "User-Agent": "CyberSensei-Scanner",
}

# Délai entre chaque requête pour respecter le rate-limit HIBP (1.5s min)
RATE_LIMIT_DELAY = 1.6


def _check_single_email(email: str, api_key: str) -> dict:
    """
    Vérifie un email unique via l'API HIBP v3.

    Args:
        email: adresse email à vérifier
        api_key: clé API HIBP

    Returns:
        dict avec l'email, le statut et la liste des breaches
    """
    headers = {
        **HIBP_HEADERS_BASE,
        "hibp-api-key": api_key,
    }
    params = {"truncateResponse": "false"}

    try:
        resp = requests.get(
            f"{HIBP_API_URL}/{email}",
            headers=headers,
            params=params,
            timeout=30,
        )

        if resp.status_code == 200:
            breaches = resp.json()
            return {
                "email": email,
                "breached": True,
                "breach_count": len(breaches),
                "breaches": [
                    {
                        "name": b.get("Name", ""),
                        "domain": b.get("Domain", ""),
                        "breach_date": b.get("BreachDate", ""),
                        "data_classes": b.get("DataClasses", []),
                    }
                    for b in breaches
                ],
            }
        elif resp.status_code == 404:
            # Aucune breach trouvée — c'est positif
            return {
                "email": email,
                "breached": False,
                "breach_count": 0,
                "breaches": [],
            }
        elif resp.status_code == 401:
            logger.error("Clé API HIBP invalide ou expirée")
            return {"email": email, "error": "clé API invalide", "skipped": True}
        elif resp.status_code == 429:
            logger.warning("Rate-limit HIBP atteint pour %s", email)
            return {"email": email, "error": "rate-limit atteint", "skipped": True}
        else:
            logger.error("Réponse HIBP inattendue (%d) pour %s", resp.status_code, email)
            return {"email": email, "error": f"HTTP {resp.status_code}", "skipped": True}

    except requests.RequestException as exc:
        logger.error("Erreur réseau HIBP pour %s : %s", email, exc)
        return {"email": email, "error": str(exc), "skipped": True}


def run(emails: list[str]) -> dict:
    """
    Vérifie une liste d'emails dans la base Have I Been Pwned.

    Args:
        emails: liste d'adresses email à vérifier

    Returns:
        dict avec les résultats par email et le nombre total de compromissions
    """
    api_key = os.environ.get("HIBP_API_KEY")
    if not api_key:
        logger.warning("Variable d'environnement HIBP_API_KEY non définie")
        return {"error": "HIBP_API_KEY non configurée", "skipped": True}

    if not emails:
        return {
            "results": [],
            "total_breached": 0,
            "skipped": False,
        }

    results = []
    for i, email in enumerate(emails):
        logger.info("Vérification HIBP pour %s (%d/%d)", email, i + 1, len(emails))
        result = _check_single_email(email, api_key)
        results.append(result)

        # Respecter le rate-limit entre les requêtes (sauf la dernière)
        if i < len(emails) - 1:
            time.sleep(RATE_LIMIT_DELAY)

    breached_count = sum(1 for r in results if r.get("breached", False))

    return {
        "results": results,
        "total_breached": breached_count,
        "total_checked": len(emails),
        "skipped": False,
    }
