# CyberSensei AI Security - Module DLP

> **Protection contre les fuites de donnees vers les outils IA generatives**
> Analyse double couche avec conformite RGPD Article 9

---

## Vue d'ensemble

Le module AI Security fournit une protection DLP (Data Loss Prevention) en temps reel qui detecte et bloque les donnees sensibles avant qu'elles ne soient envoyees vers les outils IA (ChatGPT, Copilot, Gemini, Claude, Mistral).

### Composants

```
cybersensei-ai-security/
├── ai/              # Service Python FastAPI (analyse IA)
├── backend/         # Backend Java Spring Boot (gouvernance DLP)
└── extension/       # Extension Chrome (client navigateur)
```

---

## Architecture

```
Extension Chrome ──► Backend Java (8081) ──► Service Python (8000)
                                                    │
                                         ┌──────────┴──────────┐
                                         │                      │
                                   Couche 1 (rapide)      Couche 2 (semantique)
                                   Presidio + LLM Guard   Mistral 7B local
                                   ~5-20ms                ~500ms (conditionnel)
                                         │                      │
                                         └──────────┬──────────┘
                                                    │
                                         Score de risque (0-100)
                                         LOW (0-30) / MEDIUM (30-70) / HIGH (70-100)
```

---

## Service Python IA (`ai/`)

### Stack
- **FastAPI** + Uvicorn
- **Presidio** (NER) + **LLM Guard** (secrets, code)
- **Mistral 7B** (analyse semantique locale)
- **Spacy** (NLP francais)

### Endpoints

| Methode | Route | Description |
|---------|-------|-------------|
| POST | `/api/analyze` | Analyse un texte et retourne le score de risque |
| GET | `/health` | Etat du service |
| POST | `/api/validate` | Validation via API gouvernementales |

### Couche 1 : Analyse rapide (~5-20ms)
- Presidio NER : detection des PII (noms, emails, telephones...)
- LLM Guard : detection des secrets, cles API, code source
- Reconnaisseurs francais : NIR, IBAN, SIREN, SIRET, plaques, num. fiscal, Carte Vitale

### Couche 2 : Analyse semantique (~500ms, conditionnelle)
- Mistral 7B local : comprend les donnees paraphrasees ou epelees
- RGPD Article 9 : sante, opinions politiques, syndicales, orientation sexuelle, biometrie, casier judiciaire
- Activee si : score couche 1 > seuil OU texte > 500 caracteres

### Lancement

```bash
cd ai
pip install -r requirements.txt
python server.py
# Disponible sur http://localhost:8000
```

### Tests

```bash
cd ai
pytest tests/
```

---

## Backend Java (`backend/`)

### Stack
- **Java 21** + **Spring Boot 3.4.3**
- **PostgreSQL** + **Liquibase** (migrations)
- **Spring Security** + **JWT** (JJWT 0.12.6)
- **MapStruct** (mapping DTO)
- **TestContainers** (tests d'integration)

### API REST

| Controller | Base Path | Description |
|-----------|-----------|-------------|
| `PromptAnalysisController` | `/api/prompts` | Analyse de prompts |
| `AlertController` | `/api/alerts` | Gestion des alertes DLP |
| `RiskScoreController` | `/api/risk-scores` | Scores de risque par entreprise |
| `RgpdController` | `/api/rgpd` | Conformite RGPD, audit logs |
| `UsageStatsController` | `/api/stats` | Statistiques d'usage |
| `ExtensionController` | `/api/extension` | Communication avec l'extension |
| `HealthController` | `/health` | Etat du service |

### Entites

- `PromptEvent` : evenement d'analyse de prompt
- `RiskDetection` : detection de donnee sensible
- `Alert` : alerte DLP
- `CompanyRiskScore` : score de risque par entreprise
- `RgpdAuditLog` : journal d'audit RGPD
- `RetentionPolicy` : politique de retention des donnees

### Lancement

```bash
cd backend
mvn spring-boot:run
# Disponible sur http://localhost:8081
```

### Tests

```bash
cd backend
mvn test
```

---

## Extension Chrome (`extension/`)

### Fonctionnalites
- **Interception de prompts** sur ChatGPT, Copilot, Gemini, Claude, Mistral
- **Analyse en temps reel** via le backend Java
- **Alertes visuelles** par code couleur (vert/jaune/rouge)
- **Blocage configurable** des envois risques
- **Module de formation** integre (quiz, dashboard, glossaire, coach IA)
- **Configuration** : URL API, ID entreprise, ID utilisateur

### Fichiers

| Fichier | Description |
|---------|-------------|
| `manifest.json` | Configuration Manifest V3 |
| `background.js` | Service Worker (communication backend) |
| `content.js` | Content Script (interception des prompts) |
| `popup.html/js` | Interface de configuration |
| `training.html/js/css` | Module de formation |
| `overlay.css` | Style des alertes in-page |

### Installation (developpement)

1. Ouvrir Chrome → `chrome://extensions/`
2. Activer "Mode developpeur"
3. Cliquer "Charger l'extension non empaquetee"
4. Selectionner le dossier `extension/`

### Configuration

Dans le popup de l'extension :
- **URL API** : `http://localhost:8081` (dev) ou URL production
- **ID Entreprise** : identifiant de votre organisation
- **ID Utilisateur** : identifiant de l'utilisateur
- **Activer/Desactiver** la protection

---

## Docker

```bash
# Depuis la racine du projet
docker compose --profile ai-security up -d
```

Services lances :
- `ai-security-backend` (port 8081)
- `ai-security-python` (port 8000)
- `postgres` (port 5432)

---

## Variables d'environnement

| Variable | Description | Defaut |
|----------|-------------|--------|
| `SPRING_DATASOURCE_URL` | URL PostgreSQL | `jdbc:postgresql://localhost:5432/cybersensei_dlp` |
| `JWT_SECRET` | Secret JWT | (obligatoire en prod) |
| `SECURITY_BYPASS` | Bypass securite | `true` (dev) |
| `AI_SERVICE_URL` | URL du service Python | `http://localhost:8000` |
| `SEMANTIC_THRESHOLD` | Seuil pour couche 2 | `0.3` |
| `MISTRAL_MODEL` | Modele Mistral | `mistral` |
