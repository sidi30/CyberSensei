"""
Module dnstwist — Détection de domaines typosquattés actifs.
Utilise dnstwist via subprocess et parse la sortie JSON.
"""

import json
import logging
import shutil
import subprocess

logger = logging.getLogger("cybersensei-scanner.dnstwist")


def run(target: str) -> dict:
    """
    Lance dnstwist sur le domaine cible pour détecter les typosquats actifs.

    Un domaine typosquat est considéré "actif" s'il résout vers une adresse IP
    (champ dns_a ou dns_aaaa présent).

    Args:
        target: domaine à vérifier (ex: example.com)

    Returns:
        dict avec la liste des domaines typosquattés actifs détectés
    """
    if not shutil.which("dnstwist"):
        logger.warning("dnstwist n'est pas installé ou introuvable dans le PATH")
        return {"error": "dnstwist non disponible", "skipped": True}

    try:
        cmd = [
            "dnstwist",
            "--registered",  # Ne montrer que les domaines enregistrés
            "--format", "json",
            target,
        ]
        logger.info("Exécution : %s", " ".join(cmd))

        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300,  # 5 minutes max
        )

        if proc.returncode != 0:
            logger.error("dnstwist a échoué (code %d) : %s", proc.returncode, proc.stderr)
            return {"error": f"dnstwist exit code {proc.returncode}", "skipped": True}

        # Parser la sortie JSON
        domains = json.loads(proc.stdout) if proc.stdout.strip() else []

        # Filtrer les domaines actifs (qui résolvent vers une IP)
        active_typosquats = []
        for domain in domains:
            # Ignorer le domaine original (fuzzer = "original")
            if domain.get("fuzzer") == "*original":
                continue

            # Un domaine est actif s'il a une résolution DNS
            has_dns = bool(
                domain.get("dns_a") or domain.get("dns_aaaa") or domain.get("dns_mx")
            )
            if has_dns:
                active_typosquats.append(
                    {
                        "domain": domain.get("domain", ""),
                        "fuzzer": domain.get("fuzzer", ""),
                        "dns_a": domain.get("dns_a", []),
                        "dns_aaaa": domain.get("dns_aaaa", []),
                        "dns_mx": domain.get("dns_mx", []),
                    }
                )

        return {
            "active_typosquats": active_typosquats,
            "total_active": len(active_typosquats),
            "skipped": False,
        }

    except subprocess.TimeoutExpired:
        logger.error("dnstwist a dépassé le timeout de 300s")
        return {"error": "dnstwist timeout (300s)", "skipped": True}
    except json.JSONDecodeError as exc:
        logger.error("Impossible de parser la sortie JSON de dnstwist : %s", exc)
        return {"error": "sortie JSON invalide de dnstwist", "skipped": True}
    except Exception as exc:
        logger.error("Erreur inattendue dans le module dnstwist : %s", exc)
        return {"error": str(exc), "skipped": True}
