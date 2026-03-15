"""
CyberSensei Score Engine — Calcule un score de sécurité entre 0 et 100.
Agrège les résultats de tous les modules de scan selon une grille de pénalités.
"""

import logging

logger = logging.getLogger("cybersensei-scanner.score")

# Score de départ
BASE_SCORE = 100

# --- Pénalités Nmap (ports critiques) ---
# -15 pts par port critique exposé, max -30
PENALTY_CRITICAL_PORT = 15
MAX_PENALTY_CRITICAL_PORTS = 30

# --- Pénalités Nuclei (CVE) ---
# -20 pts par CVE critique (CVSS >= 9.0)
PENALTY_CVE_CRITICAL = 20
# -10 pts par CVE haute (CVSS 7.0-8.9)
PENALTY_CVE_HIGH = 10

# --- Pénalités testssl (TLS faible / cert expiré) ---
# -15 pts si TLS faible ou certificat expiré
PENALTY_WEAK_TLS = 15

# --- Pénalités dnstwist (typosquats) ---
# -10 pts par domaine typosquat actif, max -20
PENALTY_TYPOSQUAT = 10
MAX_PENALTY_TYPOSQUATS = 20

# --- Pénalités HIBP (emails compromis) ---
# -5 pts par email compromis, max -20
PENALTY_BREACHED_EMAIL = 5
MAX_PENALTY_BREACHED_EMAILS = 20

# --- Pénalités AbuseIPDB ---
# -10 pts si l'IP est blacklistée (score > 50%)
PENALTY_BLACKLISTED_IP = 10

# --- Pénalités DNS (SPF/DKIM/DMARC) — évaluées via dnstwist ou testssl ---
PENALTY_SPF_ABSENT = 10
PENALTY_DKIM_ABSENT = 8
PENALTY_DMARC_ABSENT = 7


def _penalize_nmap(details: dict) -> tuple[int, list[str]]:
    """Calcule les pénalités liées aux ports critiques exposés."""
    nmap = details.get("nmap", {})
    if nmap.get("skipped", True):
        return 0, ["nmap: module ignoré"]

    critical_ports = nmap.get("critical_ports", [])
    count = len(critical_ports)
    penalty = min(count * PENALTY_CRITICAL_PORT, MAX_PENALTY_CRITICAL_PORTS)

    reasons = []
    if count > 0:
        ports_list = [str(p["port"]) for p in critical_ports]
        reasons.append(f"nmap: {count} port(s) critique(s) exposé(s) ({', '.join(ports_list)}) → -{penalty} pts")

    return penalty, reasons


def _penalize_nuclei(details: dict) -> tuple[int, list[str]]:
    """Calcule les pénalités liées aux CVE détectées."""
    nuclei = details.get("nuclei", {})
    if nuclei.get("skipped", True):
        return 0, ["nuclei: module ignoré"]

    penalty = 0
    reasons = []

    # CVE critiques (CVSS >= 9.0)
    critical_count = nuclei.get("total_critical", 0)
    if critical_count > 0:
        p = critical_count * PENALTY_CVE_CRITICAL
        penalty += p
        reasons.append(f"nuclei: {critical_count} CVE critique(s) (CVSS ≥ 9.0) → -{p} pts")

    # CVE hautes (CVSS 7.0-8.9)
    high_count = nuclei.get("total_high", 0)
    if high_count > 0:
        p = high_count * PENALTY_CVE_HIGH
        penalty += p
        reasons.append(f"nuclei: {high_count} CVE haute(s) (CVSS 7.0-8.9) → -{p} pts")

    return penalty, reasons


def _penalize_testssl(details: dict) -> tuple[int, list[str]]:
    """Calcule les pénalités liées à la configuration TLS/SSL."""
    testssl = details.get("testssl", {})
    if testssl.get("skipped", True):
        return 0, ["testssl: module ignoré"]

    penalty = 0
    reasons = []

    # TLS faible ou certificat expiré — une seule pénalité de -15
    has_weak = testssl.get("has_weak_tls", False)
    cert_expired = testssl.get("cert_expired", False)

    if has_weak or cert_expired:
        penalty = PENALTY_WEAK_TLS
        issues = []
        if has_weak:
            issues.append("protocole TLS faible")
        if cert_expired:
            issues.append("certificat expiré")
        reasons.append(f"testssl: {' + '.join(issues)} → -{penalty} pts")

    return penalty, reasons


def _penalize_dnstwist(details: dict) -> tuple[int, list[str]]:
    """Calcule les pénalités liées aux domaines typosquattés."""
    dnstwist = details.get("dnstwist", {})
    if dnstwist.get("skipped", True):
        return 0, ["dnstwist: module ignoré"]

    count = dnstwist.get("total_active", 0)
    penalty = min(count * PENALTY_TYPOSQUAT, MAX_PENALTY_TYPOSQUATS)

    reasons = []
    if count > 0:
        reasons.append(f"dnstwist: {count} domaine(s) typosquat(s) actif(s) → -{penalty} pts")

    return penalty, reasons


def _penalize_hibp(details: dict) -> tuple[int, list[str]]:
    """Calcule les pénalités liées aux emails compromis."""
    hibp = details.get("hibp", {})
    if hibp.get("skipped", True):
        return 0, ["hibp: module ignoré"]

    count = hibp.get("total_breached", 0)
    penalty = min(count * PENALTY_BREACHED_EMAIL, MAX_PENALTY_BREACHED_EMAILS)

    reasons = []
    if count > 0:
        reasons.append(f"hibp: {count} email(s) compromis → -{penalty} pts")

    return penalty, reasons


def _penalize_abuseipdb(details: dict) -> tuple[int, list[str]]:
    """Calcule les pénalités liées à la réputation IP."""
    abuse = details.get("abuseipdb", {})
    if abuse.get("skipped", True):
        return 0, ["abuseipdb: module ignoré"]

    penalty = 0
    reasons = []

    if abuse.get("is_blacklisted", False):
        penalty = PENALTY_BLACKLISTED_IP
        score = abuse.get("abuse_score", 0)
        reasons.append(f"abuseipdb: IP blacklistée (score {score}%) → -{penalty} pts")

    return penalty, reasons


def _penalize_dns(details: dict) -> tuple[int, list[str]]:
    """Calcule les pénalités liées aux enregistrements DNS manquants (SPF/DKIM/DMARC).

    Les informations DNS sont extraites du module testssl qui analyse les
    enregistrements TXT du domaine, ou signalées directement si un module
    dédié les remonte.
    """
    testssl = details.get("testssl", {})
    if testssl.get("skipped", True):
        return 0, ["dns: module testssl ignoré, vérification SPF/DKIM/DMARC impossible"]

    penalty = 0
    reasons = []

    # Vérifier SPF absent
    if testssl.get("spf_absent", False):
        penalty += PENALTY_SPF_ABSENT
        reasons.append(f"dns: enregistrement SPF absent → -{PENALTY_SPF_ABSENT} pts")

    # Vérifier DKIM absent
    if testssl.get("dkim_absent", False):
        penalty += PENALTY_DKIM_ABSENT
        reasons.append(f"dns: enregistrement DKIM absent → -{PENALTY_DKIM_ABSENT} pts")

    # Vérifier DMARC absent
    if testssl.get("dmarc_absent", False):
        penalty += PENALTY_DMARC_ABSENT
        reasons.append(f"dns: enregistrement DMARC absent → -{PENALTY_DMARC_ABSENT} pts")

    return penalty, reasons


def compute_score(details: dict) -> int:
    """
    Calcule le score de sécurité global à partir des résultats de tous les modules.

    Le score part de 100 et des pénalités sont soustraites selon la grille définie.
    Le score minimum est 0.

    Args:
        details: dictionnaire {nom_module: résultat} issu de l'orchestrateur

    Returns:
        score entier entre 0 et 100
    """
    score = BASE_SCORE
    all_reasons = []

    # Appliquer chaque catégorie de pénalités
    penalizers = [
        _penalize_nmap,
        _penalize_nuclei,
        _penalize_testssl,
        _penalize_dns,
        _penalize_dnstwist,
        _penalize_hibp,
        _penalize_abuseipdb,
    ]

    for penalizer in penalizers:
        penalty, reasons = penalizer(details)
        score -= penalty
        all_reasons.extend(reasons)

    # Plancher à 0
    score = max(score, 0)

    # Log du détail
    logger.info("=== Détail du scoring ===")
    for reason in all_reasons:
        logger.info("  %s", reason)
    logger.info("Score final : %d/100", score)

    return score
