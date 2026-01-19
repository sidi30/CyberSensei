# 🔄 GitHub Actions Workflows

## 📋 Vue d'ensemble

Ce projet utilise **GitHub Actions** pour l'intégration et le déploiement continus (CI/CD).

---

## 🎯 Workflows Disponibles

### 1️⃣ **Build and Test** (`build-and-test.yml`)

**Déclenchement:**
- ✅ Push sur `main` ou `develop`
- ✅ Pull Request vers `main` ou `develop`
- ✅ Détection intelligente des changements (ne build que ce qui a changé)

**Actions:**
- Détecte automatiquement quels services ont changé
- Build et teste uniquement les services modifiés
- Upload des artefacts de build (JAR, bundles JS)
- Génère un résumé de build

**Services:**
- `node-backend` (Spring Boot + Maven + Tests JUnit)
- `node-dashboard` (React + Vite)
- `central-backend` (NestJS + TypeScript)
- `central-dashboard` (React + Vite)
- `teams-app` (React + Teams Toolkit)

---

### 2️⃣ **Docker Publish** (`docker-publish.yml`)

**Déclenchement:**
- ✅ Push sur `main`
- ✅ Tags `v*` (releases)
- ✅ Manuel (`workflow_dispatch`)

**Actions:**
- Build des images Docker multi-plateformes
- Publication sur GitHub Container Registry (`ghcr.io`)
- Tagging automatique (branch, SHA, latest, semver)
- Cache intelligent pour builds rapides

**Images publiées:**
```
ghcr.io/<username>/cybersensei/node-backend:latest
ghcr.io/<username>/cybersensei/node-dashboard:latest
ghcr.io/<username>/cybersensei/central-backend:latest
ghcr.io/<username>/cybersensei/central-dashboard:latest
ghcr.io/<username>/cybersensei/node-ai:latest
```

---

## 🚀 Utilisation

### Workflow automatique

Les workflows se déclenchent automatiquement sur push/PR :

```bash
# Déclenche build-and-test.yml
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main

# Déclenche docker-publish.yml (si push sur main)
git push origin main

# Déclenche docker-publish.yml avec tag semver
git tag v1.0.0
git push origin v1.0.0
```

### Workflow manuel

Pour déclencher manuellement le build Docker :

1. Va sur **Actions** dans GitHub
2. Sélectionne **Docker - Build & Publish**
3. Clique sur **Run workflow**
4. Sélectionne la branche
5. Clique sur **Run workflow**

---

## 📦 Artefacts

Les artefacts de build sont conservés **7 jours** :

| Artefact | Contenu | Taille approx |
|----------|---------|---------------|
| `node-backend-jar` | JAR Spring Boot | ~50 MB |
| `node-dashboard-build` | Bundle React optimisé | ~2 MB |
| `central-backend-build` | Dist NestJS | ~10 MB |
| `central-dashboard-build` | Bundle React optimisé | ~2 MB |
| `teams-app-build` | Bundle Teams app | ~3 MB |

---

## 🐳 Utiliser les Images Docker

### Depuis GitHub Container Registry

```bash
# Login (nécessite un Personal Access Token avec scope `read:packages`)
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull l'image
docker pull ghcr.io/<username>/cybersensei/node-backend:latest

# Run
docker run -p 8080:8080 ghcr.io/<username>/cybersensei/node-backend:latest
```

### Images publiques

Pour rendre les images publiques :

1. Va sur **Packages** dans ton profil GitHub
2. Sélectionne le package
3. **Package settings** → **Change visibility** → **Public**

---

## ⚡ Optimisations

### Détection de changements

Le workflow `build-and-test.yml` utilise `dorny/paths-filter` pour détecter les changements :

- ✅ Build uniquement ce qui a changé
- ✅ Économise du temps de CI (5-10x plus rapide)
- ✅ Réduit la consommation de minutes GitHub Actions

### Cache

- **Maven** : `~/.m2/repository`
- **npm** : `node_modules` (via actions/setup-node)
- **Docker** : Layers via GitHub Actions cache

### Parallélisation

- Tous les services buildent en **parallèle**
- Utilise la matrice GitHub Actions pour les images Docker

---

## 🔧 Configuration Requise

### Secrets GitHub

Aucun secret n'est nécessaire ! Le workflow utilise `GITHUB_TOKEN` automatiquement.

### Permissions

Les workflows ont besoin de :

```yaml
permissions:
  contents: read       # Lire le code
  packages: write      # Publier sur ghcr.io
```

Ces permissions sont déjà configurées dans les workflows.

---

## 🐛 Dépannage

### ❌ Build échoue sur Maven

**Problème :** `Cannot resolve dependencies`

**Solution :**
```bash
# Vérifier que pom.xml est valide
mvn validate -f cybersensei-node/backend/pom.xml

# Vérifier les dépendances
mvn dependency:tree
```

### ❌ Build échoue sur npm

**Problème :** `Cannot find module`

**Solution :**
```bash
# Vérifier package-lock.json
npm install
npm ci

# Régénérer lockfile si nécessaire
rm package-lock.json
npm install
```

### ❌ Docker push échoue

**Problème :** `denied: permission_denied`

**Solution :**
1. Vérifie que tu as les permissions `packages: write`
2. Vérifie que le registry est `ghcr.io`
3. Vérifie que l'image name est en minuscules

### ❌ Workflow ne se déclenche pas

**Problème :** Le push ne déclenche pas le workflow

**Solution :**
1. Vérifie que tu push sur `main` ou `develop`
2. Vérifie que les paths correspondent (`cybersensei-node/backend/**`)
3. Regarde l'onglet **Actions** pour voir les logs

---

## 📊 Badges de Status

Ajoute ces badges dans ton `README.md` principal :

```markdown
![Build Status](https://github.com/<username>/CyberSensei/actions/workflows/build-and-test.yml/badge.svg)
![Docker](https://github.com/<username>/CyberSensei/actions/workflows/docker-publish.yml/badge.svg)
```

---

## 🔄 Workflows Legacy (à supprimer)

Les anciens workflows individuels peuvent être **supprimés** :

```bash
rm .github/workflows/central-backend.yml
rm .github/workflows/central-dashboard.yml
rm .github/workflows/node-backend.yml
rm .github/workflows/node-dashboard.yml
rm .github/workflows/node-ai.yml
rm .github/workflows/teams-app.yml
rm .github/workflows/docker-build.yml
rm .github/workflows/ci.yml
rm .github/workflows/ci-fixed.yml
```

Les nouveaux workflows sont **meilleurs** :
- ✅ Plus rapides (détection de changements)
- ✅ Plus simples (2 fichiers au lieu de 9)
- ✅ Plus maintenables
- ✅ Mieux documentés

---

## 📚 Ressources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Build Push Action](https://github.com/docker/build-push-action)

---

**Auteur:** CyberSensei Team  
**Dernière mise à jour:** 2026-01-19

