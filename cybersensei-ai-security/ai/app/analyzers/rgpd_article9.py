"""
Analyseur RGPD Article 9 — Détection des données sensibles via Mistral 7B.

Catégories RGPD Art. 9 :
- HEALTH_DATA : données de santé
- POLITICAL_OPINION : opinions politiques
- UNION_MEMBERSHIP : appartenance syndicale
- RELIGIOUS_BELIEF : convictions religieuses
- SEXUAL_ORIENTATION : orientation sexuelle
- ETHNIC_ORIGIN : origine ethnique
- BIOMETRIC_DATA : données biométriques
- CRIMINAL_DATA : données judiciaires

Le modèle ne flag que les données attribuables à une personne identifiable.
Les mentions génériques ("la santé en France") ne sont PAS flaggées.
"""

import json
import re
from typing import List, Optional

import httpx
from loguru import logger
from pydantic import BaseModel, Field


class Article9Detection(BaseModel):
    """Une détection de donnée sensible Art. 9."""
    type: str
    confidence: float = Field(ge=0.0, le=1.0)
    span: str = ""
    start: int = 0
    end: int = 0


class Article9Result(BaseModel):
    """Résultat de l'analyse Art. 9."""
    categories: List[Article9Detection] = []
    has_article9_data: bool = False
    explanation: str = ""


# Prompt système optimisé pour Mistral 7B Instruct
SYSTEM_PROMPT = """Tu es un analyseur de conformite RGPD specialise dans la detection des donnees sensibles au sens de l'article 9 du RGPD.

Tu dois identifier les categories suivantes UNIQUEMENT quand elles sont attribuables a une personne identifiable ou identifiable par recoupement :

1. HEALTH_DATA : donnees de sante
   Exemples positifs : "Paul est diabetique", "traitement antidepresseur de Marie", "arret maladie", "IRM du genou", noms de medicaments associes a une personne
   Exemples negatifs : "la sante en France", "le diabete est une maladie", "les medicaments generiques"

2. POLITICAL_OPINION : opinions politiques
   Exemples positifs : "adherent LFI", "militant RN", "il vote ecologiste", "elle est encartee au PS"
   Exemples negatifs : "le programme de LFI", "les elections", "la politique francaise"

3. UNION_MEMBERSHIP : appartenance syndicale
   Exemples positifs : "delegue CGT", "membre CFDT", "representant syndical", "greviste de la CGT"
   Exemples negatifs : "la CGT manifeste", "les syndicats francais", "le droit de greve"

4. RELIGIOUS_BELIEF : convictions religieuses
   Exemples positifs : "pratiquant musulman", "va a la messe chaque dimanche", "fait le ramadan", "porte la kippa"
   Exemples negatifs : "le ramadan commence en mars", "la cathedrale Notre-Dame", "les religions en France"

5. SEXUAL_ORIENTATION : orientation sexuelle
   Exemples positifs : toute mention explicite d'orientation attribuee a une personne identifiable
   Exemples negatifs : "la marche des fiertes", "les droits LGBT"

6. ETHNIC_ORIGIN : origine ethnique
   Exemples positifs : toute mention d'origine ethnique attribuee a une personne identifiable
   Exemples negatifs : "la diversite culturelle", "les communautes en France"

7. BIOMETRIC_DATA : donnees biometriques
   Exemples positifs : hash d'empreinte digitale, description faciale a fins d'identification, donnees ADN
   Exemples negatifs : "la reconnaissance faciale", "les empreintes en general"

8. CRIMINAL_DATA : donnees judiciaires
   Exemples positifs : "casier judiciaire de Martin", "garde a vue", "condamnation pour vol", "mis en examen"
   Exemples negatifs : "le code penal", "la justice en France", "les statistiques de criminalite"

REGLES IMPERATIVES :
- Ne flag PAS les mentions generiques ou educatives
- Flag UNIQUEMENT quand une donnee est liee a une personne identifiable (nom, pronom, role specifique)
- En cas de doute, NE PAS flagger (faux negatif preferable a faux positif)
- Gere le francais familier, l'argot, et les expressions indirectes
- Reponds UNIQUEMENT en JSON valide, rien d'autre

FORMAT DE REPONSE (JSON strict) :
{"categories": [{"type": "CATEGORY_CODE", "confidence": 0.0-1.0, "span": "texte exact detecte"}], "explanation": "explication courte"}

Si aucune donnee sensible : {"categories": [], "explanation": "Aucune donnee sensible Art. 9 detectee"}"""


class RgpdArticle9Analyzer:
    """Analyseur de données sensibles RGPD Art. 9 via Mistral 7B."""

    VALID_CATEGORIES = {
        "HEALTH_DATA", "POLITICAL_OPINION", "UNION_MEMBERSHIP",
        "RELIGIOUS_BELIEF", "SEXUAL_ORIENTATION", "ETHNIC_ORIGIN",
        "BIOMETRIC_DATA", "CRIMINAL_DATA",
    }

    def __init__(self, ollama_url: str = "http://127.0.0.1:8001"):
        self.ollama_url = ollama_url
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=30.0)
        return self._client

    async def analyze(self, text: str) -> Article9Result:
        """
        Analyse un texte pour détecter les données sensibles Art. 9 RGPD.
        Utilise Mistral 7B via llama.cpp / Ollama.
        """
        if not text or len(text.strip()) < 10:
            return Article9Result(explanation="Texte trop court pour analyse")

        prompt = f"[INST] {SYSTEM_PROMPT}\n\nTexte a analyser:\n{text} [/INST]\n\n{{"

        try:
            client = await self._get_client()
            response = await client.post(
                f"{self.ollama_url}/completion",
                json={
                    "prompt": prompt,
                    "temperature": 0.1,  # Très basse pour des résultats déterministes
                    "n_predict": 512,
                    "top_p": 0.9,
                    "stop": ["[INST]", "</s>"],
                    "stream": False,
                },
                timeout=30.0,
            )

            if response.status_code != 200:
                logger.error(f"Mistral Art.9 error: {response.status_code}")
                return Article9Result(explanation="Mistral indisponible")

            raw = response.json().get("content", "").strip()
            return self._parse_response(raw)

        except httpx.TimeoutException:
            logger.error("Mistral Art.9 analysis timeout")
            return Article9Result(explanation="Timeout analyse Art.9")
        except Exception as e:
            logger.error(f"Mistral Art.9 error: {e}")
            return Article9Result(explanation=f"Erreur: {e}")

    def _parse_response(self, raw: str) -> Article9Result:
        """Parse la réponse JSON de Mistral."""
        text = raw.strip()
        if not text.startswith("{"):
            text = "{" + text

        idx = text.rfind("}")
        if idx != -1:
            text = text[:idx + 1]

        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            logger.warning(f"Failed to parse Art.9 JSON: {text[:200]}")
            return Article9Result(explanation="Erreur de parsing")

        categories = []
        for cat in data.get("categories", []):
            cat_type = cat.get("type", "").upper()
            if cat_type not in self.VALID_CATEGORIES:
                continue
            confidence = float(cat.get("confidence", 0.5))
            if confidence < 0 or confidence > 1:
                confidence = max(0.0, min(1.0, confidence))
            categories.append(Article9Detection(
                type=cat_type,
                confidence=confidence,
                span=cat.get("span", ""),
                start=cat.get("start", 0),
                end=cat.get("end", 0),
            ))

        has_data = len(categories) > 0
        explanation = data.get("explanation", "")

        return Article9Result(
            categories=categories,
            has_article9_data=has_data,
            explanation=explanation,
        )

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()
