"""
Module testssl.sh — Analyse de la configuration TLS/SSL de la cible.
Utilise testssl.sh via subprocess et parse la sortie JSON.
"""

import json
import logging
import shutil
import subprocess
import tempfile

logger = logging.getLogger("cybersensei-scanner.testssl")

# Protocoles considérés comme faibles
WEAK_PROTOCOLS = {"SSLv2", "SSLv3", "TLS1.0", "TLS1.1", "TLSv1", "TLSv1.1"}


def _parse_testssl_json(json_path: str) -> dict:
    """Parse la sortie JSON de testssl.sh et extrait les informations pertinentes."""
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # testssl.sh retourne une liste de findings
    findings = data if isinstance(data, list) else data.get("scanResult", [])

    weak_protocols_found = []
    cert_issues = []
    all_findings = []

    for finding in findings:
        finding_id = finding.get("id", "")
        severity = finding.get("severity", "INFO")
        finding_text = finding.get("finding", "")

        entry = {
            "id": finding_id,
            "severity": severity,
            "finding": finding_text,
        }
        all_findings.append(entry)

        # Détecter les protocoles faibles activés
        if finding_id.startswith("SSLv") or finding_id.startswith("TLS"):
            if severity in ("CRITICAL", "HIGH", "MEDIUM", "WARN"):
                # Vérifier si le protocole faible est "offered"
                if "offered" in finding_text.lower() or "vulnerable" in finding_text.lower():
                    weak_protocols_found.append(entry)

        # Détecter les problèmes de certificat
        if "cert" in finding_id.lower():
            if severity in ("CRITICAL", "HIGH", "WARN"):
                cert_issues.append(entry)

    # Vérifier spécifiquement l'expiration du certificat
    cert_expired = any(
        "expired" in f.get("finding", "").lower() or "not yet valid" in f.get("finding", "").lower()
        for f in findings
    )

    # Détecter l'absence de SPF, DKIM et DMARC dans les findings
    spf_absent = not any(
        "spf" in f.get("id", "").lower() and "not offered" not in f.get("finding", "").lower()
        and f.get("finding", "").strip() != ""
        for f in findings
        if "spf" in f.get("id", "").lower()
    )
    dkim_absent = not any(
        "dkim" in f.get("id", "").lower() and "not offered" not in f.get("finding", "").lower()
        and f.get("finding", "").strip() != ""
        for f in findings
        if "dkim" in f.get("id", "").lower()
    )
    dmarc_absent = not any(
        "dmarc" in f.get("id", "").lower() and "not offered" not in f.get("finding", "").lower()
        and f.get("finding", "").strip() != ""
        for f in findings
        if "dmarc" in f.get("id", "").lower()
    )

    return {
        "weak_protocols": weak_protocols_found,
        "cert_issues": cert_issues,
        "cert_expired": cert_expired,
        "has_weak_tls": len(weak_protocols_found) > 0,
        "spf_absent": spf_absent,
        "dkim_absent": dkim_absent,
        "dmarc_absent": dmarc_absent,
        "total_findings": len(all_findings),
    }


def run(target: str) -> dict:
    """
    Lance testssl.sh sur la cible pour analyser la configuration TLS/SSL.

    Args:
        target: domaine à analyser (ex: example.com)

    Returns:
        dict avec les protocoles faibles, problèmes de certificat, etc.
    """
    # Chercher testssl.sh dans le PATH
    testssl_bin = shutil.which("testssl.sh") or shutil.which("testssl")
    if not testssl_bin:
        logger.warning("testssl.sh n'est pas installé ou introuvable dans le PATH")
        return {"error": "testssl.sh non disponible", "skipped": True}

    try:
        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tmp:
            json_path = tmp.name

        cmd = [
            testssl_bin,
            "--jsonfile", json_path,
            "--quiet",
            "--fast",
            "--warnings", "off",
            target,
        ]
        logger.info("Exécution : %s", " ".join(cmd))

        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300,  # 5 minutes max
        )

        # testssl.sh peut retourner des codes non-zéro même en succès partiel
        if proc.returncode not in (0, 1):
            logger.error("testssl.sh a échoué (code %d) : %s", proc.returncode, proc.stderr)
            return {"error": f"testssl.sh exit code {proc.returncode}", "skipped": True}

        result = _parse_testssl_json(json_path)
        result["skipped"] = False
        return result

    except subprocess.TimeoutExpired:
        logger.error("testssl.sh a dépassé le timeout de 300s")
        return {"error": "testssl.sh timeout (300s)", "skipped": True}
    except Exception as exc:
        logger.error("Erreur inattendue dans le module testssl : %s", exc)
        return {"error": str(exc), "skipped": True}
