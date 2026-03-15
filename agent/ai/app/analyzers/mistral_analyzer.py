"""
Layer 2 : Analyse sémantique via Mistral 7B.

Détecte les données sensibles exprimées en langage naturel :
- Nombres épelés en toutes lettres
- Données paraphrasées ou résumées
- Informations implicites
- Catégories RGPD Article 9
"""

import json
from typing import List, Tuple, Optional

import httpx
from loguru import logger

from app.analyzers.rgpd_article9 import RgpdArticle9Analyzer, Article9Result
from app.config import LLAMA_URL, ARTICLE9_CONFIDENCE_MIN


# Prompt système pour la détection sémantique générale
SEMANTIC_PROMPT = """Tu es un analyseur de securite des donnees. Ton role est de detecter si le texte contient des informations sensibles, meme si elles sont reformulees, paraphrasees ou exprimees en langage naturel.

Categories a verifier :
1. PERSONAL_DATA : noms, prenoms, adresses, dates de naissance, numeros d'identite ecrits en toutes lettres
2. FINANCIAL_DATA : montants, salaires, chiffres d'affaires, numeros de compte ecrits en toutes lettres
3. MEDICAL_DATA : diagnostics, traitements, pathologies, medicaments associes a une personne
4. CREDENTIALS_SECRETS : mots de passe decrits, acces, tokens, cles decrites en langage naturel
5. CLIENT_INFORMATION : noms de clients, details de contrats, informations commerciales
6. COMPANY_CONFIDENTIAL : strategies, plans, pricing interne, roadmaps
7. INTELLECTUAL_PROPERTY : algorithmes decrits, brevets, designs proprietaires
8. SOURCE_CODE : logique metier ou code decrit en langage naturel

IMPORTANT : Detecte meme quand les donnees sont :
- Ecrites en toutes lettres ("quatre cinq trois deux" au lieu de 4532)
- Paraphrasees ("il gagne bien, environ cinq mille par mois")
- Resumees ("le patient du service cardio avec le probleme de valve")
- Implicites ("envoie-lui les acces du serveur de prod")

Reponds UNIQUEMENT en JSON valide :
{"has_sensitive_data": true/false, "detections": [{"category": "CATEGORIE", "confidence": 0.0-1.0, "description": "ce qui a ete detecte"}], "explanation": "explication courte"}"""


class SemanticDetection:
    """Détection sémantique (Layer 2)."""

    def __init__(self, category: str, confidence: int, method: str, snippet: str = ""):
        self.category = category
        self.confidence = confidence
        self.method = method
        self.snippet = snippet


class MistralAnalyzer:
    """
    Layer 2 : analyse sémantique via Mistral 7B + classification RGPD Art. 9.
    """

    def __init__(self):
        self.article9 = RgpdArticle9Analyzer(ollama_url=LLAMA_URL)
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=60.0)
        return self._client

    async def analyze(
        self, text: str, has_pii_from_layer1: bool = False
    ) -> Tuple[List[SemanticDetection], Article9Result, str]:
        """
        Analyse sémantique complète :
        1. Détection de données sensibles en langage naturel
        2. Classification RGPD Article 9

        Retourne : (détections sémantiques, résultat Art.9, explication)
        """
        detections: List[SemanticDetection] = []
        explanation = ""

        # ── Analyse sémantique générale ──
        semantic_result = await self._run_semantic(text)
        if semantic_result:
            for d in semantic_result.get("detections", []):
                detections.append(SemanticDetection(
                    category=d.get("category", "UNKNOWN"),
                    confidence=int(float(d.get("confidence", 0.5)) * 100),
                    method="mistral_semantic",
                    snippet=d.get("description", ""),
                ))
            explanation = semantic_result.get("explanation", "")

        # ── Analyse RGPD Article 9 ──
        article9_result = await self.article9.analyze(text)

        if article9_result.has_article9_data:
            for cat in article9_result.categories:
                if cat.confidence >= ARTICLE9_CONFIDENCE_MIN:
                    detections.append(SemanticDetection(
                        category=cat.type,
                        confidence=int(cat.confidence * 100),
                        method="mistral_rgpd_art9",
                        snippet=cat.span,
                    ))

        return detections, article9_result, explanation

    async def _run_semantic(self, text: str) -> Optional[dict]:
        """Appelle Mistral pour l'analyse sémantique générale."""
        prompt = f"[INST] {SEMANTIC_PROMPT}\n\nTexte a analyser:\n{text} [/INST]\n\n{{"

        try:
            client = await self._get_client()
            response = await client.post(
                f"{LLAMA_URL}/completion",
                json={
                    "prompt": prompt,
                    "temperature": 0.1,
                    "n_predict": 512,
                    "top_p": 0.9,
                    "stop": ["[INST]", "</s>"],
                    "stream": False,
                },
                timeout=30.0,
            )

            if response.status_code != 200:
                logger.error(f"Mistral semantic error: {response.status_code}")
                return None

            raw = response.json().get("content", "").strip()
            return self._parse_json(raw)

        except Exception as e:
            logger.error(f"Mistral semantic error: {e}")
            return None

    @staticmethod
    def _parse_json(text: str) -> Optional[dict]:
        """Parse JSON depuis la réponse Mistral."""
        text = text.strip()
        if not text.startswith("{"):
            text = "{" + text
        idx = text.rfind("}")
        if idx != -1:
            text = text[:idx + 1]
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            logger.warning(f"Failed to parse Mistral JSON: {text[:150]}")
            return None

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()
        await self.article9.close()
