# CyberSensei

> **Plateforme de Cybersecurite Intelligente pour PME et ETI europeennes**
> Formation IA adaptative, Protection DLP, Scanner de vulnerabilites, Conformite NIS2, Rapports SOC automatises

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Demarrage Rapide

### Prerequis

- **Docker Desktop** 24.0+ : [Telecharger](https://www.docker.com/products/docker-desktop/)
- **16 GB RAM** minimum (pour l'IA)
- **20 GB disque** libre

### Lancement

```bash
# Copier la configuration
cp .env.template .env

# Demo (2 minutes, ~500 MB RAM)
docker compose --profile minimal up -d

# Developpement (5 minutes, ~2 GB RAM)
docker compose --profile node up -d

# Stack complet (10 minutes, ~8 GB RAM)
docker compose --profile full up -d

# Arreter
docker compose down
```

---

## Qu'est-ce que CyberSensei ?

**CyberSensei** est une plateforme de cybersecurite complete qui protege votre organisation sur 5 axes :

### 1. Formation & Sensibilisation
- **Coach IA conversationnel** (Mistral 7B) dans Microsoft Teams
- **160+ exercices** adaptatifs par niveau (Debutant -> Expert)
- **Simulations de phishing** realistes et securisees
- **Gamification** : badges, progression, niveaux

### 2. Protection DLP (Data Loss Prevention)
- **Extension navigateur Chrome** avec analyse double couche
- **Protection temps reel** contre les fuites vers les outils IA (ChatGPT, Copilot, Gemini, Claude, Mistral)
- **Conformite RGPD Article 9** : detection des donnees sensibles
- **Score de risque** par utilisateur et par entreprise

### 3. Scanner de Vulnerabilites
- **Scan automatise** : ports (nmap), CVE (nuclei), TLS (testssl.sh), typosquatting (dnstwist)
- **Verification des breaches** via Have I Been Pwned
- **Reputation IP** via AbuseIPDB
- **Score de securite 0-100** avec grille de penalites detaillee
- **Scans planifies** quotidiens et hebdomadaires avec alertes par email

### 4. Conformite NIS2
- **Questionnaire 25 questions** couvrant les 10 domaines de la directive NIS2
- **Score de conformite par domaine** : Gouvernance, Gestion des risques, Continuite, Chaine d'approvisionnement, Incidents, Cryptographie, Securite RH, Controle d'acces, Securite physique, Audit
- **Plan d'action priorise** (P1/P2/P3) avec references aux articles NIS2
- **Rapport de conformite** genere automatiquement en markdown

### 5. Rapports de Securite IA (SOC)
- **Generation automatique** via Claude (Anthropic) de rapports professionnels
- **5 niveaux de rapport** adaptes a chaque audience :
  - **SOC 1** : Analyse de scan accessible pour responsables IT
  - **SOC 2** : Audit technique approfondi pour adminsys et RSSI
  - **SOC 3** : Analyse avancee avec kill chain MITRE ATT&CK pour SOC managers
  - **NIS2** : Evaluation de conformite article par article
  - **Mensuel** : Rapport direction oriente decision et impact business
- **PDF professionnels** avec score colore, en-tete CyberSensei, disclaimer legal
- **Envoi automatique par email** des rapports generes

---

## Architecture

```
cybersensei/
├── docker-compose.unified.yml     # Configuration Docker unique
├── .env                           # Configuration centralisee
│
├── cybersensei-scanner/              # Microservice Scanner Python (NOUVEAU)
│   ├── scanner.py                    (Orchestrateur asyncio)
│   ├── modules/                      (nmap, nuclei, testssl, dnstwist, hibp, abuseipdb)
│   ├── score_engine.py               (Score 0-100 avec grille de penalites)
│   └── Dockerfile
│
├── cybersensei-ai-reports/           # Microservice Rapports IA (NOUVEAU)
│   ├── report_generator.py           (SDK Anthropic + Claude claude-sonnet-4-6)
│   ├── pdf_builder.py                (ReportLab, PDF professionnels)
│   ├── prompts/                      (Prompts SOC1/SOC2/SOC3/NIS2/Mensuel)
│   └── Dockerfile
│
├── cybersensei-ai-security/          # Module Securite IA & DLP
│   ├── ai/          (Python FastAPI + Presidio + Mistral 7B)
│   ├── backend/     (Spring Boot + Java 21 + PostgreSQL)
│   └── extension/   (Extension Chrome Manifest V3)
│
├── cybersensei-node/                 # Solution On-Premise
│   ├── backend/     (Spring Boot + Java 21)
│   │   └── scheduler/   (Scans planifies + pipeline d'alertes) (NOUVEAU)
│   ├── dashboard/   (React + TypeScript)
│   └── ai/          (Python + Mistral 7B)
│
├── cybersensei-central/              # Plateforme SaaS Multi-tenant
│   ├── backend/     (NestJS + TypeScript)
│   │   ├── compliance/   (Module NIS2 : questionnaire + scoring + plan d'action) (NOUVEAU)
│   │   └── scheduler/    (Scans multi-tenant + alertes + webhooks) (NOUVEAU)
│   └── dashboard/   (React Admin Panel)
│
├── cybersensei-teams-app/            # Microsoft Teams Integration
│   ├── bot/         (Teams Bot Framework)
│   └── tabs/        (React Teams Tabs)
│
├── cybersensei-website/              # Site Marketing (Next.js)
└── infra/terraform-local/            # Infrastructure as Code
```

---

## Nouveaux Microservices (V3)

### cybersensei-scanner

Microservice Python autonome qui orchestre 6 modules de scan en parallele via asyncio.

| Module | Outil | Ce qu'il analyse |
|--------|-------|-----------------|
| `nmap_scan` | nmap | Ports ouverts, services exposes, ports critiques (22, 23, 445, 3389) |
| `nuclei_scan` | nuclei | CVE connues avec scores CVSS |
| `testssl_scan` | testssl.sh | Configuration TLS/SSL, certificats, SPF/DKIM/DMARC |
| `dnstwist_scan` | dnstwist | Domaines typosquattes actifs (risque de phishing) |
| `hibp_check` | API HIBP v3 | Emails compromis dans des fuites de donnees |
| `abuseipdb` | API AbuseIPDB | Reputation IP, signalements de blacklist |

**Grille de scoring (depart 100, plancher 0) :**

| Risque | Penalite | Maximum |
|--------|----------|---------|
| Port critique expose (22,23,445,3389) | -15 pts | -30 |
| CVE critique (CVSS >= 9.0) | -20 pts | illimite |
| CVE haute (CVSS 7.0-8.9) | -10 pts | illimite |
| TLS faible ou certificat expire | -15 pts | -15 |
| SPF absent | -10 pts | -10 |
| DKIM absent | -8 pts | -8 |
| DMARC absent | -7 pts | -7 |
| Typosquat actif | -10 pts | -20 |
| Email compromis (breach) | -5 pts | -20 |
| IP blacklistee (AbuseIPDB > 50%) | -10 pts | -10 |

### cybersensei-ai-reports

Microservice Python qui genere des rapports de securite professionnels via l'API Claude (Anthropic).

| Niveau | Audience | Contenu |
|--------|----------|---------|
| **SOC 1** | Responsables IT, DSI | Analyse accessible, plan d'action prioritaire, vulgarisation |
| **SOC 2** | Adminsys, RSSI, DevOps | Audit technique complet, CVSS, config TLS, matrice de risques |
| **SOC 3** | SOC managers, equipes IR | Kill chain MITRE ATT&CK, correlation des menaces, IoC, scenarios d'attaque |
| **NIS2** | RSSI, DPO, direction | Evaluation conformite article par article, plan de mise en conformite |
| **Mensuel** | Direction, comite | Dashboard executif, impact business, ROI securite |

### Module Compliance NIS2 (NestJS)

Module integre au backend Central qui fournit un questionnaire de conformite NIS2 complet.

- **25 questions** couvrant les 10 domaines de la directive (UE) 2022/2555
- **Scoring par domaine** : Non conforme (< 40) / En cours (40-70) / Conforme (> 70)
- **Plan d'action P1/P2/P3** genere automatiquement, trie par criticite
- **Rapport markdown** avec tableau par domaine, articles NIS2 concernes, disclaimer legal
- **Persistance en base** avec historique des sessions

### Pipeline Scheduler & Alertes

Systeme de scans automatises avec detection de changements et notifications.

**Spring Boot (on-premise) :**
- Scan quotidien a 02h00, hebdomadaire le lundi a 03h00
- Comparaison avec le scan precedent (delta score, nouveaux risques, risques resolus)
- Alertes email : CRITIQUE (delta < -10), IMPORTANT (nouveaux risques), POSITIF (risques resolus)

**NestJS (SaaS multi-tenant) :**
- Meme logique pour chaque tenant actif
- File d'attente avec max 5 scans simultanes
- Alertes email + webhooks optionnels par tenant

---

## Les niveaux SOC expliques simplement

### Qu'est-ce qu'un SOC ?

Un **SOC** (Security Operations Center) est l'equivalent d'une salle de controle pour la cybersecurite. Comme un centre de surveillance d'immeuble a des agents qui regardent les cameras et reagissent aux alertes, un SOC surveille les systemes informatiques et reagit aux menaces.

CyberSensei genere automatiquement des rapports adaptes a chaque niveau de l'equipe securite :

### SOC Niveau 1 — Le gardien de l'entree

**Pour qui ?** Responsables IT, chefs de projet, DSI non-specialistes en securite.

**C'est quoi ?** Un rapport clair et accessible qui repond a la question : *"Est-ce qu'on est en securite ?"*

**Ce qu'il contient :**
- Resume executif en langage simple (pas de jargon)
- Score global avec explication de ce qu'il signifie
- Liste des problemes trouves, classes par urgence
- Plan d'action concret : "faites ceci en priorite"
- Prochaines etapes recommandees

**Analogie :** C'est comme le rapport d'un mecanicien apres le controle technique de votre voiture : "Vos pneus sont uses, vos freins sont bons, il faut changer l'huile."

### SOC Niveau 2 — Le technicien specialise

**Pour qui ?** Administrateurs systemes, DevOps, RSSI techniques.

**C'est quoi ?** Un audit technique detaille avec commandes et configurations exactes.

**Ce qu'il contient :**
- Matrice de risques complete avec probabilites et impacts
- Chaque CVE detaillee : score CVSS, vecteur d'attaque, patch exact a appliquer
- Configuration TLS/SSL analysee avec le score equivalent SSL Labs
- Commandes de remediation directement copiables
- Plan de remediation en 3 phases avec estimation d'effort

**Analogie :** C'est comme le rapport detaille d'un expert automobile qui mesure chaque piece, donne les references exactes des pieces a changer et le temps de main-d'oeuvre.

### SOC Niveau 3 — Le detective

**Pour qui ?** Analystes SOC seniors, equipes de reponse aux incidents, RSSI strategiques.

**C'est quoi ?** Une analyse avancee qui repond a la question : *"Qu'est-ce qu'un attaquant pourrait faire avec ces failles ?"*

**Ce qu'il contient :**
- Scenarios d'attaque realistes bases sur les failles trouvees
- Mapping MITRE ATT&CK (le referentiel mondial des techniques d'attaque)
- Correlation entre les differentes failles pour identifier des chaines d'attaque
- Indicateurs de compromission (IoC) a surveiller
- Recommandations de detection (regles SIEM, alertes a configurer)
- Evaluation de la maturite securite par rapport aux standards (NIST, ISO 27001)

**Analogie :** C'est comme un expert en securite qui, apres avoir audite votre immeuble, vous dit : "Un cambrioleur pourrait entrer par cette fenetre, passer par ce couloir, et acceder au coffre en 3 minutes. Voici comment l'en empecher."

### Rapport NIS2 — Le conseiller conformite

**Pour qui ?** DPO, RSSI, direction generale, audits reglementaires.

**C'est quoi ?** Une evaluation de conformite a la directive europeenne NIS2 basee sur les resultats techniques du scan.

**Ce qu'il contient :**
- Evaluation article par article (Article 20, 21, 23 de la directive)
- Ecarts identifies avec niveau de severite
- Plan de mise en conformite en 4 phases (immediat -> 12 mois)
- Estimation budgetaire indicative
- Liste des documents requis (PSSI, PCA, PRA...)

### Rapport Mensuel — Le tableau de bord direction

**Pour qui ?** Direction generale, DAF, comite de direction.

**C'est quoi ?** Un resume strategique qui traduit la securite en impact business.

**Ce qu'il contient :**
- Dashboard executif avec indicateurs cles
- Traduction des risques en impact financier potentiel
- Comparaison avec les standards du secteur
- Recommandations d'investissement avec ROI
- Tendances d'evolution mois par mois

---

## Technologies expliquees

### Backend & API

| Technologie | Role dans CyberSensei | Explication simple |
|-------------|----------------------|-------------------|
| **Java 21 + Spring Boot** | API on-premise (Node), API DLP | Framework robuste pour creer des serveurs web. Comme le moteur d'une voiture : fiable, puissant, eprouve. |
| **NestJS + TypeScript** | API SaaS (Central) | Framework Node.js structure pour creer des API. Comme Spring Boot mais en JavaScript, ideal pour le SaaS multi-tenant. |
| **Python + FastAPI** | Scanner, Rapports IA, Analyse DLP | Langage ideal pour l'IA et les scripts d'analyse. FastAPI est son framework web ultra-rapide. |
| **PostgreSQL** | Base de donnees principale | Base de donnees relationnelle (tableaux structures). Stocke les utilisateurs, scores, resultats de scan, sessions. |
| **MongoDB** | Stockage fichiers binaires | Base de donnees NoSQL (documents flexibles). Stocke les packages de mise a jour ZIP. |

### Intelligence Artificielle

| Technologie | Role | Explication simple |
|-------------|------|-------------------|
| **Claude (Anthropic)** | Generation des rapports SOC | IA cloud qui analyse les resultats de scan et redige des rapports professionnels detailles. |
| **Mistral 7B** | Coach IA, analyse semantique DLP | IA locale (pas de cloud) qui comprend le francais. Analyse le sens des phrases pour detecter les donnees sensibles. |
| **Presidio** | Detection de donnees sensibles | Bibliotheque Microsoft qui detecte les numeros de carte, emails, numeros de securite sociale, etc. dans un texte. |
| **LLM Guard** | Couche de securite rapide DLP | Filtre rapide (5-20ms) qui detecte les patterns de donnees sensibles avant l'analyse IA. |

### Outils de Scan

| Outil | Role | Explication simple |
|-------|------|-------------------|
| **nmap** | Scan de ports | Verifie quelles "portes" sont ouvertes sur votre serveur. Comme verifier quelles fenetres sont ouvertes dans un immeuble. |
| **nuclei** | Detection de CVE | Cherche les failles connues (CVE) dans vos services. Comme verifier si vos serrures ont des defauts connus. |
| **testssl.sh** | Audit TLS/SSL | Analyse la qualite du chiffrement de vos connexions. Comme verifier la solidite du coffre-fort. |
| **dnstwist** | Detection de typosquatting | Trouve les domaines qui ressemblent au votre (phishing). Ex: `cybersensel.fr` au lieu de `cybersensei.fr`. |
| **Have I Been Pwned** | Verification des breaches | Verifie si vos emails d'entreprise apparaissent dans des fuites de donnees connues. |
| **AbuseIPDB** | Reputation IP | Verifie si l'adresse IP de votre serveur est signalee comme malveillante par la communaute. |

### Infrastructure

| Technologie | Role | Explication simple |
|-------------|------|-------------------|
| **Docker** | Containerisation | Emballe chaque service dans une "boite" isolee. Permet de lancer toute la plateforme en une commande. |
| **Prometheus** | Collecte de metriques | Collecte les statistiques de performance (temps de reponse, erreurs) de chaque service. |
| **Grafana** | Tableaux de bord monitoring | Affiche les metriques Prometheus en graphiques interactifs pour surveiller la sante de la plateforme. |
| **Terraform** | Infrastructure as Code | Definit l'infrastructure en fichiers de configuration. Permet de recreer l'environnement identiquement. |

---

## Services & Ports

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| **Node Dashboard** | 3005 | http://localhost:3005 | Interface utilisateur |
| **Node API** | 8080 | http://localhost:8080 | API Spring Boot |
| **Central Dashboard** | 5173 | http://localhost:5173 | Admin SaaS |
| **Central API** | 3006 | http://localhost:3006 | API NestJS |
| **Scanner Python** | 8000 | http://localhost:8000 | Microservice scanner *(nouveau)* |
| **M365 Dashboard** | 5174 | http://localhost:5174 | Audit Microsoft 365 |
| **Teams Bot** | 5175 | http://localhost:5175 | Bot conversationnel |
| **AI Security Backend** | 8081 | http://localhost:8081 | API DLP Spring Boot |
| **AI Security Python** | 8002 | http://localhost:8002 | Service analyse DLP |
| **Website** | 3002 | http://localhost:3002 | Site marketing |
| **PostgreSQL** | 5432 | localhost:5432 | Base de donnees |
| **PgAdmin** | 5050 | http://localhost:5050 | Interface DB |
| **Prometheus** | 9090 | http://localhost:9090 | Monitoring |
| **Grafana** | 3300 | http://localhost:3300 | Dashboards monitoring |

---

## Modes de Deploiement

| Profil | Commande | Services | RAM | Temps |
|--------|----------|----------|-----|-------|
| **minimal** | `docker compose --profile minimal up -d` | DB + Dashboard | ~500 MB | ~2 min |
| **node** | `docker compose --profile node up -d` | DB + Node Backend + Dashboard + AI | ~2 GB | ~5 min |
| **central** | `docker compose --profile central up -d` | DB + Central Backend + Dashboard | ~2 GB | ~5 min |
| **ai-security** | `docker compose --profile ai-security up -d` | DB + AI Security Backend + Python AI | ~2 GB | ~5 min |
| **full** | `docker compose --profile full up -d` | Tout (Node + Central + Teams + AI Security + Scanner + Monitoring) | ~8 GB | ~10 min |

---

## Endpoints API — Nouveaux Modules

### Scanner (Python)

```bash
# Lancer un scan
curl -X POST http://localhost:8000/scan \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com", "emails": ["admin@example.com"]}'
```

### Compliance NIS2 (NestJS)

```bash
# Recuperer les 25 questions
curl http://localhost:3006/compliance/questions

# Soumettre les reponses
curl -X POST http://localhost:3006/compliance/submit \
  -H "Content-Type: application/json" \
  -d '{"companyName": "Acme", "answers": {"GOV-01": "oui", "GOV-02": "partiel", ...}}'

# Rapport markdown
curl http://localhost:3006/compliance/report/{sessionId}
```

---

## Variables d'environnement

### Nouvelles variables (V3)

| Variable | Description | Obligatoire |
|----------|-------------|-------------|
| `SCANNER_SERVICE_URL` | URL du microservice scanner | Non (defaut: http://localhost:8000) |
| `SCANNER_DOMAIN` | Domaine a scanner automatiquement | Non |
| `SCANNER_ALERT_EMAIL` | Email pour les alertes de scan | Non |
| `HIBP_API_KEY` | Cle API Have I Been Pwned v3 | Non (module skip si absent) |
| `ABUSEIPDB_API_KEY` | Cle API AbuseIPDB | Non (module skip si absent) |
| `ANTHROPIC_API_KEY` | Cle API Anthropic (Claude) | Pour les rapports IA |
| `SMTP_HOST` | Serveur SMTP pour les emails | Pour les alertes et rapports |
| `SMTP_PORT` | Port SMTP (defaut: 587) | Non |
| `SMTP_USER` | Utilisateur SMTP | Pour les alertes et rapports |
| `SMTP_PASSWORD` | Mot de passe SMTP | Pour les alertes et rapports |

---

## Securite

Le backend Java utilise des **Spring Profiles** pour la securite :

- **dev** (`SECURITY_BYPASS=true`): tous les endpoints sont publics (dev/demo)
- **prod** (`SECURITY_BYPASS=false`): JWT obligatoire, CORS restreint

Variables d'environnement a configurer en production :
- `JWT_SECRET` : cle secrete JWT (obligatoire, pas de defaut)
- `SECURITY_BYPASS=false` : desactive le mode bypass
- `DEV_MODE=false` : desactive le login dev
- `CORS_ORIGINS` : origines autorisees (comma-separated)

---

## Tests

```bash
# Score engine (pas de dependance externe)
cd cybersensei-scanner && python -c "from score_engine import compute_score; print('OK')"

# Scanner en mode graceful (modules skip si outils absents)
cd cybersensei-scanner && python scanner.py example.com

# Tests backend NestJS
cd cybersensei-central/backend && npm test

# Tests backend Java
cd cybersensei-node/backend && mvn test

# Tests Python AI Service
cd cybersensei-ai-security/ai && pytest
```

---

## Stack Technique

| Composant | Technologies |
|-----------|-------------|
| **Node Backend** | Java 21, Spring Boot 3.4, PostgreSQL, JWT, JavaMailSender |
| **Central Backend** | NestJS 11, TypeScript, PostgreSQL, MongoDB, Nodemailer |
| **Scanner** | Python 3.11+, asyncio, nmap, nuclei, testssl.sh, dnstwist |
| **AI Reports** | Python 3.11+, Anthropic SDK, ReportLab, Claude claude-sonnet-4-6 |
| **AI Security Backend** | Java 21, Spring Boot 3.4, PostgreSQL, Liquibase |
| **AI Service** | Python 3.11+, FastAPI, Presidio, LLM Guard, Mistral 7B |
| **Extension** | Chrome Manifest V3, JavaScript |
| **Dashboard** | React, TypeScript, Tailwind CSS |
| **Website** | Next.js 14, Tailwind CSS, Framer Motion |
| **Teams App** | Teams Bot Framework, React |
| **Infrastructure** | Docker, Terraform, Prometheus, Grafana |

---

## Licence

MIT License - Voir [LICENSE](LICENSE)

---

**CyberSensei Team** - Plateforme de cybersecurite intelligente pour PME europeennes
Contact : contact@cybersensei.fr
