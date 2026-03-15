"""
Module AbuseIPDB — Vérifie la réputation IP du domaine cible.
Utilise l'API AbuseIPDB v2 avec clé API en variable d'environnement.
"""

import logging
import os
import socket

import requests

logger = logging.getLogger("cybersensei-scanner.abuseipdb")

ABUSEIPDB_API_URL = "https://api.abuseipdb.com/api/v2/check"


def _resolve_domain(domain: str) -> str | None:
    """
    Résout un domaine vers son adresse IPv4.

    Args:
        domain: nom de domaine à résoudre

    Returns:
        adresse IP ou None si la résolution échoue
    """
    try:
        ip = socket.gethostbyname(domain)
        logger.info("Résolution DNS : %s -> %s", domain, ip)
        return ip
    except socket.gaierror as exc:
        logger.error("Impossible de résoudre %s : %s", domain, exc)
        return None


def run(target: str) -> dict:
    """
    Vérifie la réputation de l'IP associée au domaine cible via AbuseIPDB.

    Args:
        target: domaine ou IP à vérifier

    Returns:
        dict avec le score d'abus, le nombre de signalements, etc.
    """
    api_key = os.environ.get("ABUSEIPDB_API_KEY")
    if not api_key:
        logger.warning("Variable d'environnement ABUSEIPDB_API_KEY non définie")
        return {"error": "ABUSEIPDB_API_KEY non configurée", "skipped": True}

    # Résoudre le domaine en IP si nécessaire
    try:
        socket.inet_aton(target)
        ip = target  # C'est déjà une IP
    except socket.error:
        ip = _resolve_domain(target)
        if not ip:
            return {"error": f"impossible de résoudre {target}", "skipped": True}

    try:
        headers = {
            "Key": api_key,
            "Accept": "application/json",
        }
        params = {
            "ipAddress": ip,
            "maxAgeInDays": 90,  # Signalements des 90 derniers jours
            "verbose": "",
        }

        logger.info("Vérification AbuseIPDB pour %s (%s)", target, ip)
        resp = requests.get(
            ABUSEIPDB_API_URL,
            headers=headers,
            params=params,
            timeout=30,
        )

        if resp.status_code == 200:
            data = resp.json().get("data", {})
            abuse_score = data.get("abuseConfidenceScore", 0)

            return {
                "ip": ip,
                "domain": target,
                "abuse_score": abuse_score,
                "is_blacklisted": abuse_score > 50,
                "total_reports": data.get("totalReports", 0),
                "last_reported": data.get("lastReportedAt"),
                "isp": data.get("isp", ""),
                "country": data.get("countryCode", ""),
                "usage_type": data.get("usageType", ""),
                "skipped": False,
            }
        elif resp.status_code == 401:
            logger.error("Clé API AbuseIPDB invalide ou expirée")
            return {"error": "clé API AbuseIPDB invalide", "skipped": True}
        elif resp.status_code == 429:
            logger.warning("Rate-limit AbuseIPDB atteint")
            return {"error": "rate-limit AbuseIPDB atteint", "skipped": True}
        else:
            logger.error("Réponse AbuseIPDB inattendue (%d)", resp.status_code)
            return {"error": f"HTTP {resp.status_code}", "skipped": True}

    except requests.RequestException as exc:
        logger.error("Erreur réseau AbuseIPDB : %s", exc)
        return {"error": str(exc), "skipped": True}
