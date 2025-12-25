# 🚀 GitHub Actions Workflows - CyberSensei Monorepo

## 📋 Vue d'Ensemble

Ce dossier contient les workflows CI/CD pour l'ensemble du monorepo CyberSensei. Chaque projet dispose de son propre workflow optimisé avec caching, tests, linting et déploiement Docker.

---

## 📦 Workflows Disponibles

| Workflow | Déclencheur | Statut | Description |
|----------|-------------|--------|-------------|
| **central-backend.yml** | `cybersensei-central/backend/**` | ✅ | NestJS Backend (SaaS) |
| **central-dashboard.yml** | `cybersensei-central/dashboard/**` | ✅ | React Dashboard (SaaS) |
| **node-backend.yml** | `cybersensei-node/backend/**` | ✅ | Spring Boot Backend (Node) |
| **node-ai.yml** | `cybersensei-node/ai/**` | ✅ | FastAPI AI Service |
| **node-dashboard.yml** | `cybersensei-node/dashboard/**` | ✅ | React Dashboard (Node) |
| **teams-app.yml** | `cybersensei-teams-app/**` | ✅ | Teams App Package |

---

## 🎯 Fonctionnalités Communes

Tous les workflows incluent :

### ✅ **Lint & Test**
- Linting du code (ESLint, Pylint, Checkstyle)
- Type checking (TypeScript, Java)
- Tests unitaires avec coverage
- Upload coverage vers Codecov

### ✅ **Caching Intelligent**
- Cache des dépendances (npm, Maven, pip)
- Cache Docker layers (GitHub Actions cache)
- Restauration automatique des caches

### ✅ **Security Scanning** (optionnel)
- Snyk security scan
- npm audit / OWASP Dependency Check / Safety
- Bandit (Python)

### ✅ **Build & Artifacts**
- Build optimisé
- Upload des artifacts (JAR, dist, ZIP)
- Rétention 7-90 jours

### ✅ **Docker Build & Push**
- Multi-stage Docker builds
- Push vers GitHub Container Registry (GHCR)
- Tags automatiques: `latest`, `sha`, `branch`
- Cache Docker optimisé

---

## 🏗️ Workflows Détaillés

### 1. **central-backend.yml** (NestJS)

**Déclencheurs:**
- Push sur `main` ou `develop` avec changements dans `cybersensei-central/backend/`
- Pull requests sur `main` ou `develop`

**Jobs:**
1. **lint-and-test**
   - Setup Node.js 18 avec cache npm
   - Cache node_modules
   - Lint (ESLint)
   - Type check (TypeScript)
   - Tests avec coverage
   - Upload Codecov

2. **security-scan**
   - Snyk security scan
   - npm audit

3. **build**
   - Build NestJS
   - Upload artifact `dist/`

4. **docker**
   - Build multi-stage
   - Push to GHCR: `ghcr.io/{owner}/central-backend:latest`
   - Tags: `latest`, `main-{sha}`, `develop-{sha}`

5. **deploy**
   - Notification de déploiement

**Image Docker:**
```
ghcr.io/{owner}/cybersensei/central-backend:latest
ghcr.io/{owner}/cybersensei/central-backend:main-abc1234
```

---

### 2. **central-dashboard.yml** (React + Vite)

**Déclencheurs:**
- Push sur `main` ou `develop` avec changements dans `cybersensei-central/dashboard/`
- Pull requests sur `main` ou `develop`

**Jobs:**
1. **lint-and-test**
   - Setup Node.js 18
   - Lint + Type check
   - Tests avec coverage

2. **build**
   - Build Vite (production)
   - Upload artifact `dist/`

3. **docker**
   - Build avec Nginx
   - Push to GHCR

**Image Docker:**
```
ghcr.io/{owner}/cybersensei/central-dashboard:latest
```

---

### 3. **node-backend.yml** (Spring Boot + Java 21)

**Déclencheurs:**
- Push sur `main` ou `develop` avec changements dans `cybersensei-node/backend/`
- Pull requests sur `main` ou `develop`

**Jobs:**
1. **lint-and-test**
   - Setup JDK 21 (Temurin)
   - Cache Maven packages
   - PostgreSQL test service
   - Checkstyle lint
   - Maven build & test
   - JaCoCo coverage report
   - Upload Codecov

2. **security-scan**
   - OWASP Dependency Check
   - Snyk Maven scan

3. **build**
   - Maven package
   - Upload JAR artifact

4. **docker**
   - Build multi-stage (Maven + JRE)
   - Push to GHCR

**Image Docker:**
```
ghcr.io/{owner}/cybersensei/node-backend:latest
```

---

### 4. **node-ai.yml** (FastAPI + Python 3.11)

**Déclencheurs:**
- Push sur `main` ou `develop` avec changements dans `cybersensei-node/ai/`
- Pull requests sur `main` ou `develop`

**Jobs:**
1. **lint-and-test**
   - Setup Python 3.11
   - Cache pip packages
   - Flake8 + Black + Pylint
   - Pytest avec coverage

2. **security-scan**
   - Safety check
   - Bandit security scan
   - Snyk Python scan

3. **build**
   - Validation server.py
   - Création BUILD_INFO.txt
   - Upload artifact

4. **docker**
   - Build Python image
   - Push to GHCR

**Image Docker:**
```
ghcr.io/{owner}/cybersensei/node-ai:latest
```

**Note:** Le modèle Mistral 7B (~4 GB) doit être téléchargé séparément.

---

### 5. **node-dashboard.yml** (React + Vite)

**Déclencheurs:**
- Push sur `main` ou `develop` avec changements dans `cybersensei-node/dashboard/`
- Pull requests sur `main` ou `develop`

**Jobs:**
1. **lint-and-test**
   - Setup Node.js 18
   - Lint + Type check
   - Tests avec coverage

2. **build**
   - Build Vite
   - Upload artifact `dist/`

3. **docker**
   - Build avec Nginx
   - Push to GHCR

**Image Docker:**
```
ghcr.io/{owner}/cybersensei/node-dashboard:latest
```

---

### 6. **teams-app.yml** (Teams App Package)

**Déclencheurs:**
- Push sur `main` ou `develop` avec changements dans `cybersensei-teams-app/`
- Pull requests sur `main` ou `develop`

**Jobs:**
1. **lint-test-employee-tab**
   - Lint + Type check + Tests (Employee Tab)

2. **lint-test-manager-tab**
   - Lint + Type check + Tests (Manager Tab)

3. **lint-test-bot**
   - Lint + Type check + Tests (Bot)

4. **build-employee-tab**
   - Build Employee Tab
   - Upload artifact

5. **build-manager-tab**
   - Build Manager Tab
   - Upload artifact

6. **build-bot**
   - Build Bot
   - Upload artifact

7. **package**
   - Download tous les builds
   - Génération VERSION.txt
   - Update manifest.json (version)
   - Création ZIP package
   - Upload artifact (rétention 90 jours)
   - **Création GitHub Release** (si `main`)

**Artifact:**
```
CyberSensei-Teams-App-v1.0.{run_number}.zip
```

**GitHub Release:**
- Tag: `teams-app-v1.0.{run_number}`
- Inclut le ZIP prêt pour upload Teams Admin Center

---

## 🔐 Secrets Requis

### GitHub Secrets à Configurer

| Secret | Description | Requis pour |
|--------|-------------|-------------|
| `SNYK_TOKEN` | Token Snyk pour security scan | Tous les workflows (optionnel) |
| `CODECOV_TOKEN` | Token Codecov pour coverage upload | Tous les workflows (optionnel) |
| `VITE_API_URL` | URL API Central Dashboard | central-dashboard.yml (optionnel) |
| `NODE_DASHBOARD_API_URL` | URL API Node Dashboard | node-dashboard.yml (optionnel) |

### Permissions Requises

Les workflows nécessitent les permissions suivantes (configurées automatiquement) :
- **contents: read** - Lecture du code
- **packages: write** - Push vers GHCR
- **issues: write** - Commentaires PR (optionnel)

---

## 📊 Caching Strategy

### Niveaux de Cache

1. **Dependencies Cache**
   - npm: `~/.npm` + `node_modules/`
   - Maven: `~/.m2/repository/`
   - pip: `~/.cache/pip/`
   - Clé: Hash du fichier de lock

2. **Docker Layer Cache**
   - Type: GitHub Actions cache
   - Mode: `max` (cache agressif)
   - Utilise `docker/build-push-action@v5`

3. **Build Cache**
   - Artifacts intermediaires
   - Réutilisation entre jobs

### Exemple de Clé de Cache

```yaml
key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
restore-keys: |
  ${{ runner.os }}-npm-
```

---

## 🏷️ Docker Tags Strategy

### Tags Automatiques

| Branch | Tags générés |
|--------|--------------|
| **main** | `latest`, `main-{sha}`, `{version}` |
| **develop** | `develop`, `develop-{sha}` |
| **PR** | Build uniquement (pas de push) |

### Format des Tags

```
ghcr.io/{owner}/cybersensei/{service}:latest
ghcr.io/{owner}/cybersensei/{service}:main-abc1234
ghcr.io/{owner}/cybersensei/{service}:1.0.0
ghcr.io/{owner}/cybersensei/{service}:1.0
```

---

## 🚀 Utilisation

### Déclencher un Workflow Manuellement

```bash
# Via GitHub CLI
gh workflow run central-backend.yml

# Via API
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/{owner}/cybersensei/actions/workflows/central-backend.yml/dispatches \
  -d '{"ref":"main"}'
```

### Voir les Logs

```bash
# Via GitHub CLI
gh run list
gh run view {run_id}
gh run watch {run_id}
```

### Pull les Images Docker

```bash
# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u {username} --password-stdin

# Pull images
docker pull ghcr.io/{owner}/cybersensei/central-backend:latest
docker pull ghcr.io/{owner}/cybersensei/central-dashboard:latest
docker pull ghcr.io/{owner}/cybersensei/node-backend:latest
docker pull ghcr.io/{owner}/cybersensei/node-ai:latest
docker pull ghcr.io/{owner}/cybersensei/node-dashboard:latest
```

---

## 📈 Monitoring & Notifications

### GitHub Actions Dashboard

Voir tous les workflows : https://github.com/{owner}/cybersensei/actions

### Status Badges

Ajouter dans `README.md` :

```markdown
![Central Backend](https://github.com/{owner}/cybersensei/actions/workflows/central-backend.yml/badge.svg)
![Central Dashboard](https://github.com/{owner}/cybersensei/actions/workflows/central-dashboard.yml/badge.svg)
![Node Backend](https://github.com/{owner}/cybersensei/actions/workflows/node-backend.yml/badge.svg)
![Node AI](https://github.com/{owner}/cybersensei/actions/workflows/node-ai.yml/badge.svg)
![Node Dashboard](https://github.com/{owner}/cybersensei/actions/workflows/node-dashboard.yml/badge.svg)
![Teams App](https://github.com/{owner}/cybersensei/actions/workflows/teams-app.yml/badge.svg)
```

### Notifications Slack (optionnel)

Ajouter à chaque workflow :

```yaml
- name: Slack Notification
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Build failed for ${{ github.workflow }}'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 🐛 Troubleshooting

### Problème: Cache non restauré

**Solution:**
- Vérifier le hash du fichier de lock
- Nettoyer les caches: Settings → Actions → Caches

### Problème: Docker push échoue

**Solution:**
- Vérifier permissions: Settings → Actions → General → Workflow permissions
- Activer: "Read and write permissions"

### Problème: Tests échouent

**Solution:**
- Vérifier les services (PostgreSQL, MongoDB)
- Ajouter `--passWithNoTests` si pas de tests

### Problème: Build timeout

**Solution:**
- Augmenter timeout: `timeout-minutes: 30`
- Optimiser le cache Docker

---

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Actions Cache](https://github.com/actions/cache)

---

## ✅ Checklist de Configuration

Avant de pousser vers `main` :

- [ ] Configurer `GITHUB_TOKEN` permissions (packages: write)
- [ ] Ajouter `SNYK_TOKEN` si security scan activé
- [ ] Vérifier les paths de déclenchement
- [ ] Tester les workflows sur une branche test
- [ ] Configurer les secrets d'environnement si nécessaire
- [ ] Activer Codecov si coverage upload activé
- [ ] Documenter les images Docker dans le README principal

---

**Version**: 1.0.0  
**Dernière mise à jour**: 21 décembre 2024  
**Maintenu par**: CyberSensei Team

