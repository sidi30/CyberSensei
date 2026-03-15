"""
Module Nuclei — Détection de vulnérabilités connues (CVE) sur la cible.
Utilise nuclei via subprocess et parse la sortie JSON.
"""

import json
import logging
import shutil
import subprocess
import tempfile

logger = logging.getLogger("cybersensei-scanner.nuclei")


def _parse_nuclei_output(jsonl_path: str) -> list[dict]:
    """Parse la sortie JSONL de nuclei et extrait les vulnérabilités."""
    vulns = []
    with open(jsonl_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                finding = json.loads(line)
                info = finding.get("info", {})
                classification = info.get("classification", {})
                cvss_score = classification.get("cvss-score", 0)
                # Normaliser le score CVSS en float
                if isinstance(cvss_score, str):
                    try:
                        cvss_score = float(cvss_score)
                    except ValueError:
                        cvss_score = 0.0

                vuln = {
                    "template_id": finding.get("template-id", "unknown"),
                    "name": info.get("name", "unknown"),
                    "severity": info.get("severity", "unknown"),
                    "cve_ids": classification.get("cve-id", []),
                    "cvss_score": cvss_score,
                    "matched_url": finding.get("matched-at", ""),
                    "description": info.get("description", ""),
                }
                vulns.append(vuln)
            except json.JSONDecodeError:
                logger.warning("Ligne JSONL invalide ignorée : %s", line[:100])

    return vulns


def run(target: str) -> dict:
    """
    Lance un scan nuclei sur la cible pour détecter les CVE connues.

    Args:
        target: domaine ou URL à scanner

    Returns:
        dict avec la liste des vulnérabilités, classées par sévérité
    """
    if not shutil.which("nuclei"):
        logger.warning("nuclei n'est pas installé ou introuvable dans le PATH")
        return {"error": "nuclei non disponible", "skipped": True}

    try:
        with tempfile.NamedTemporaryFile(suffix=".jsonl", delete=False, mode="w") as tmp:
            output_path = tmp.name

        cmd = [
            "nuclei",
            "-target", target,
            "-severity", "critical,high,medium",
            "-jsonl",
            "-output", output_path,
            "-silent",
        ]
        logger.info("Exécution : %s", " ".join(cmd))

        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=600,  # 10 minutes max
        )

        if proc.returncode != 0 and proc.returncode != 1:
            # nuclei retourne 1 quand il trouve des résultats, c'est normal
            logger.error("nuclei a échoué (code %d) : %s", proc.returncode, proc.stderr)
            return {"error": f"nuclei exit code {proc.returncode}", "skipped": True}

        vulns = _parse_nuclei_output(output_path)

        # Classer par sévérité
        critical = [v for v in vulns if v["cvss_score"] >= 9.0]
        high = [v for v in vulns if 7.0 <= v["cvss_score"] < 9.0]
        medium = [v for v in vulns if v["cvss_score"] < 7.0]

        return {
            "vulnerabilities": vulns,
            "critical": critical,
            "high": high,
            "medium": medium,
            "total": len(vulns),
            "total_critical": len(critical),
            "total_high": len(high),
            "skipped": False,
        }

    except subprocess.TimeoutExpired:
        logger.error("nuclei a dépassé le timeout de 600s")
        return {"error": "nuclei timeout (600s)", "skipped": True}
    except Exception as exc:
        logger.error("Erreur inattendue dans le module nuclei : %s", exc)
        return {"error": str(exc), "skipped": True}
