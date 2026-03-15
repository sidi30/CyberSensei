"""
Module Nmap — Scan des ports ouverts sur la cible.
Utilise nmap via subprocess et parse la sortie XML.
"""

import json
import logging
import shutil
import subprocess
import tempfile
import xml.etree.ElementTree as ET

logger = logging.getLogger("cybersensei-scanner.nmap")

# Ports considérés comme critiques s'ils sont exposés
CRITICAL_PORTS = {22, 23, 445, 3389}


def _parse_nmap_xml(xml_path: str) -> dict:
    """Parse le fichier XML généré par nmap et extrait les ports ouverts."""
    tree = ET.parse(xml_path)
    root = tree.getroot()

    open_ports = []
    for host in root.findall("host"):
        for port_elem in host.findall(".//port"):
            state = port_elem.find("state")
            if state is not None and state.get("state") == "open":
                port_id = int(port_elem.get("portid", 0))
                protocol = port_elem.get("protocol", "tcp")
                service_elem = port_elem.find("service")
                service_name = (
                    service_elem.get("name", "unknown") if service_elem is not None else "unknown"
                )
                open_ports.append(
                    {
                        "port": port_id,
                        "protocol": protocol,
                        "service": service_name,
                        "critical": port_id in CRITICAL_PORTS,
                    }
                )

    return open_ports


def run(target: str) -> dict:
    """
    Lance un scan nmap sur la cible et retourne les ports ouverts.

    Args:
        target: domaine ou IP à scanner

    Returns:
        dict avec la liste des ports ouverts et les ports critiques détectés
    """
    # Vérifier que nmap est installé
    if not shutil.which("nmap"):
        logger.warning("nmap n'est pas installé ou introuvable dans le PATH")
        return {"error": "nmap non disponible", "skipped": True}

    try:
        with tempfile.NamedTemporaryFile(suffix=".xml", delete=False) as tmp:
            xml_path = tmp.name

        # Scan des 1000 ports les plus courants en mode rapide
        cmd = [
            "nmap", "-sV", "--top-ports", "1000",
            "-T4", "-oX", xml_path, "--open", target,
        ]
        logger.info("Exécution : %s", " ".join(cmd))

        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300,  # 5 minutes max
        )

        if proc.returncode != 0:
            logger.error("nmap a échoué (code %d) : %s", proc.returncode, proc.stderr)
            return {"error": f"nmap exit code {proc.returncode}", "skipped": True}

        open_ports = _parse_nmap_xml(xml_path)
        critical_ports = [p for p in open_ports if p["critical"]]

        return {
            "open_ports": open_ports,
            "critical_ports": critical_ports,
            "total_open": len(open_ports),
            "total_critical": len(critical_ports),
            "skipped": False,
        }

    except subprocess.TimeoutExpired:
        logger.error("nmap a dépassé le timeout de 300s")
        return {"error": "nmap timeout (300s)", "skipped": True}
    except Exception as exc:
        logger.error("Erreur inattendue dans le module nmap : %s", exc)
        return {"error": str(exc), "skipped": True}
