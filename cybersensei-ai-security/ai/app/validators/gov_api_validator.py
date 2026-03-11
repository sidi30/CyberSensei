"""
Validateurs post-détection via les APIs de l'État français.

Réduit les faux positifs en vérifiant que les entités détectées
correspondent à des données réelles :
  - API Recherche d'Entreprises (SIREN/SIRET) — aucune auth requise
  - Geoplateforme Geocodage (adresses) — aucune auth requise

Ces APIs sont gratuites, sans clé, hébergées en France.
"""

import asyncio
import re
from typing import Optional

import httpx
from loguru import logger


# Timeouts courts pour ne pas ralentir l'analyse
_TIMEOUT = httpx.Timeout(2.0, connect=1.0)

# ── API Recherche d'Entreprises ──────────────────────────────────────
# https://recherche-entreprises.api.gouv.fr
_ENTREPRISE_BASE = "https://recherche-entreprises.api.gouv.fr/search"

# ── Geoplateforme Geocodage (remplace api-adresse.data.gouv.fr) ─────
# https://data.geopf.fr/geocodage/
_GEOCODE_BASE = "https://data.geopf.fr/geocodage/search"


async def validate_siren(siren: str) -> Optional[dict]:
    """
    Vérifie qu'un SIREN correspond à une entreprise réelle.

    Retourne un dict avec les infos de l'entreprise, ou None si invalide.
    """
    siren_clean = re.sub(r"\s", "", siren)
    if not re.match(r"^\d{9}$", siren_clean):
        return None

    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            resp = await client.get(_ENTREPRISE_BASE, params={"q": siren_clean})
            if resp.status_code != 200:
                logger.debug(f"API Entreprise HTTP {resp.status_code} pour SIREN {siren_clean}")
                return None

            data = resp.json()
            results = data.get("results", [])
            if not results:
                return None

            # Vérifier que le SIREN match exactement
            for r in results:
                if r.get("siren") == siren_clean:
                    return {
                        "siren": siren_clean,
                        "nom": r.get("nom_complet", ""),
                        "categorie_juridique": r.get("nature_juridique", ""),
                        "activite_naf": r.get("activite_principale", ""),
                        "tranche_effectifs": r.get("tranche_effectif_salarie", ""),
                        "etat": r.get("etat_administratif", ""),
                        "validated": True,
                    }

            return None
    except httpx.TimeoutException:
        logger.debug(f"Timeout validation SIREN {siren_clean}")
        return None
    except Exception as e:
        logger.debug(f"Erreur validation SIREN: {e}")
        return None


async def validate_siret(siret: str) -> Optional[dict]:
    """
    Vérifie qu'un SIRET correspond à un établissement réel.
    Valide d'abord le SIREN (9 premiers chiffres).
    """
    siret_clean = re.sub(r"\s", "", siret)
    if not re.match(r"^\d{14}$", siret_clean):
        return None

    siren = siret_clean[:9]
    result = await validate_siren(siren)
    if result:
        result["siret"] = siret_clean
        return result
    return None


async def validate_address(address: str) -> Optional[dict]:
    """
    Vérifie qu'une adresse française existe via la Geoplateforme.

    Retourne un dict avec les coordonnées et le score de confiance,
    ou None si l'adresse n'est pas reconnue.
    """
    if not address or len(address) < 5:
        return None

    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            resp = await client.get(_GEOCODE_BASE, params={
                "q": address,
                "limit": 1,
            })
            if resp.status_code != 200:
                logger.debug(f"Geoplateforme HTTP {resp.status_code}")
                return None

            data = resp.json()
            features = data.get("features", [])
            if not features:
                return None

            best = features[0]
            props = best.get("properties", {})
            score = props.get("score", 0)

            # Score > 0.5 = adresse probablement réelle
            if score < 0.5:
                return None

            return {
                "label": props.get("label", ""),
                "city": props.get("city", ""),
                "postcode": props.get("postcode", ""),
                "score": round(score, 2),
                "type": props.get("type", ""),
                "validated": True,
            }
    except httpx.TimeoutException:
        logger.debug("Timeout validation adresse")
        return None
    except Exception as e:
        logger.debug(f"Erreur validation adresse: {e}")
        return None


async def validate_detections(detections: list) -> list:
    """
    Post-traite les détections en validant les entités françaises
    via les APIs de l'État.

    - SIREN/SIRET validés : confidence boosted (+15)
    - SIREN/SIRET non trouvés : confidence réduit (-20)
    - Adresses validées : confidence boosted (+10)

    Retourne les détections avec confiance ajustée.
    """
    tasks = []

    for i, detection in enumerate(detections):
        method = detection.method.lower() if hasattr(detection, "method") else ""

        if "fr_siren" in method and "fr_siret" not in method:
            # Extraire le SIREN du snippet
            siren = _extract_digits(detection.snippet, 9)
            if siren:
                tasks.append((i, "siren", validate_siren(siren)))

        elif "fr_siret" in method:
            siret = _extract_digits(detection.snippet, 14)
            if siret:
                tasks.append((i, "siret", validate_siret(siret)))

        elif "fr_address" in method:
            addr = _extract_address_text(detection.snippet)
            if addr:
                tasks.append((i, "address", validate_address(addr)))

    if not tasks:
        return detections

    # Exécuter toutes les validations en parallèle
    results = await asyncio.gather(
        *[t[2] for t in tasks],
        return_exceptions=True,
    )

    for (idx, val_type, _), result in zip(tasks, results):
        if isinstance(result, Exception):
            logger.debug(f"Validation {val_type} échouée: {result}")
            continue

        det = detections[idx]
        if result and result.get("validated"):
            # Entité confirmée par l'API → augmenter la confiance
            boost = 15 if val_type in ("siren", "siret") else 10
            det.confidence = min(100, det.confidence + boost)
            det.method += f"+gov_validated"
            logger.info(f"Entité {val_type} validée par API État (confidence +{boost})")
        elif result is None and val_type in ("siren", "siret"):
            # SIREN/SIRET non trouvé → possible faux positif
            det.confidence = max(10, det.confidence - 20)
            det.method += "+gov_not_found"
            logger.info(f"Entité {val_type} non trouvée via API État (confidence -20)")

    return detections


def _extract_digits(text: str, length: int) -> Optional[str]:
    """Extrait une séquence de chiffres d'une longueur donnée."""
    digits = re.findall(r"\d+", text.replace(" ", ""))
    combined = "".join(digits)
    if len(combined) >= length:
        return combined[:length]
    return None


def _extract_address_text(snippet: str) -> Optional[str]:
    """Extrait le texte d'adresse d'un snippet redacté."""
    # Retirer le préfixe [FR_ADDRESS]
    cleaned = re.sub(r"\[FR_ADDRESS\]\s*", "", snippet)
    cleaned = cleaned.replace("****", "")
    if len(cleaned) > 5:
        return cleaned
    return None
