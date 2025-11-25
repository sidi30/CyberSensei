# 🧹 Guide de Nettoyage et Réorganisation - CyberSensei Monorepo

## ❌ Problèmes Identifiés

La structure actuelle contient :
- ❌ Dossiers en double
- ❌ Dossiers mal nommés (`CyberSensei - saas`, `CyberSensei - teams`)
- ❌ Projets à la racine au lieu d'être dans les bons dossiers
- ❌ Dossier vide (`cybersensei-node/` vide)
- ❌ Ancien dossier (`cybersensei-frontend/` obsolète)

---

## ✅ Structure Cible (Architecture Définie)

```
cybersensei/
├── cybersensei-central/          # SaaS Platform
│   ├── backend/                  # Backend NestJS
│   ├── dashboard/                # Dashboard React
│   └── infrastructure/           # Monitoring (Prometheus, Grafana)
│
├── cybersensei-node/             # On-Premise Node
│   ├── backend/                  # Backend Spring Boot
│   ├── dashboard/                # Dashboard React
│   ├── ai/                       # AI Service (Python)
│   └── compose/                  # Docker Compose configs
│
└── cybersensei-teams-app/        # Teams Extension
    ├── tabs/                     # React Tabs
    ├── bot/                      # Bot Framework
    └── manifest/                 # Teams Manifest
```

---

## 🔄 Actions de Réorganisation

### 1. CyberSensei Central (SaaS)

#### Backend
```bash
# Déplacer le backend
mv "CyberSensei - saas/cybersensei-central-backend/"* cybersensei-central/backend/

# Le backend est en NestJS/TypeScript
```

#### Dashboard
```bash
# Déplacer le dashboard
mv "CyberSensei - saas/cybersensei-central-dashboard/"* cybersensei-central/dashboard/
```

#### Infrastructure
```bash
# Déplacer le monitoring
mv "CyberSensei - saas/cybersensei-central-backend/monitoring" cybersensei-central/infrastructure/
```

---

### 2. CyberSensei Node (On-Premise)

#### Backend
```bash
# Déplacer le backend
mv cybersensei-node-backend/ cybersensei-node/backend/
```

#### Dashboard
```bash
# Déplacer le dashboard
mv cybersensei-node-dashboard/ cybersensei-node/dashboard/
```

#### AI
```bash
# Déplacer le service AI
mv cybersensei-node-ai/ cybersensei-node/ai/
```

#### Compose
```bash
# Créer le dossier compose
mkdir -p cybersensei-node/compose

# Déplacer les fichiers Docker Compose de la racine
mv docker-compose.yml cybersensei-node/compose/
mv docker-compose.dev.yml cybersensei-node/compose/
mv docker-compose.prod.yml cybersensei-node/compose/
mv Makefile cybersensei-node/compose/

# Déplacer les docs Docker
mv DOCKER_*.md cybersensei-node/compose/
mv START_HERE.md cybersensei-node/compose/
```

---

### 3. CyberSensei Teams App

```bash
# Le dossier existe déjà mais est vide
# Déplacer le contenu depuis CyberSensei - teams/

# Tabs
mv "CyberSensei - teams/cybersensei-teams-app/tabs/"* cybersensei-teams-app/tabs/

# Bot
mv "CyberSensei - teams/cybersensei-teams-app/bot/"* cybersensei-teams-app/bot/

# Manifest
mv "CyberSensei - teams/cybersensei-teams-app/manifest/"* cybersensei-teams-app/manifest/

# Common (utilitaires partagés)
mv "CyberSensei - teams/cybersensei-teams-app/common" cybersensei-teams-app/

# Docs
mv "CyberSensei - teams/cybersensei-teams-app/"*.md cybersensei-teams-app/
mv "CyberSensei - teams/cybersensei-teams-app/package.json" cybersensei-teams-app/
mv "CyberSensei - teams/cybersensei-teams-app/tsconfig.json" cybersensei-teams-app/
```

---

## 🗑️ Suppressions

### Dossiers à Supprimer

```bash
# 1. Dossier SaaS (après déplacement)
rm -rf "CyberSensei - saas/"

# 2. Dossier Teams (après déplacement)
rm -rf "CyberSensei - teams/"

# 3. Ancien frontend (obsolète)
rm -rf cybersensei-frontend/

# 4. Dossier node vide (sera recréé avec contenu)
# (Déjà remplacé par les déplacements ci-dessus)
```

---

## 📋 Script Automatique de Nettoyage

Créez ce script `scripts/reorganize-monorepo.sh` :

```bash
#!/bin/bash

set -e

echo "🧹 Réorganisation du monorepo CyberSensei..."

# ============================================================================
# 1. CyberSensei Central
# ============================================================================
echo "📦 Réorganisation CyberSensei Central..."

# Backend
if [ -d "CyberSensei - saas/cybersensei-central-backend" ]; then
    echo "  → Déplacement backend..."
    cp -r "CyberSensei - saas/cybersensei-central-backend/"* cybersensei-central/backend/ 2>/dev/null || true
fi

# Dashboard
if [ -d "CyberSensei - saas/cybersensei-central-dashboard" ]; then
    echo "  → Déplacement dashboard..."
    cp -r "CyberSensei - saas/cybersensei-central-dashboard/"* cybersensei-central/dashboard/ 2>/dev/null || true
fi

# Infrastructure
if [ -d "CyberSensei - saas/cybersensei-central-backend/monitoring" ]; then
    echo "  → Déplacement infrastructure..."
    cp -r "CyberSensei - saas/cybersensei-central-backend/monitoring/"* cybersensei-central/infrastructure/ 2>/dev/null || true
fi

# ============================================================================
# 2. CyberSensei Node
# ============================================================================
echo "📦 Réorganisation CyberSensei Node..."

# Backend
if [ -d "cybersensei-node-backend" ]; then
    echo "  → Déplacement backend..."
    mkdir -p cybersensei-node/backend
    cp -r cybersensei-node-backend/* cybersensei-node/backend/
fi

# Dashboard
if [ -d "cybersensei-node-dashboard" ]; then
    echo "  → Déplacement dashboard..."
    mkdir -p cybersensei-node/dashboard
    cp -r cybersensei-node-dashboard/* cybersensei-node/dashboard/
fi

# AI
if [ -d "cybersensei-node-ai" ]; then
    echo "  → Déplacement AI..."
    mkdir -p cybersensei-node/ai
    cp -r cybersensei-node-ai/* cybersensei-node/ai/
fi

# Compose
echo "  → Création dossier compose..."
mkdir -p cybersensei-node/compose
if [ -f "docker-compose.yml" ]; then
    cp docker-compose*.yml cybersensei-node/compose/ 2>/dev/null || true
    cp Makefile cybersensei-node/compose/ 2>/dev/null || true
    cp DOCKER_*.md cybersensei-node/compose/ 2>/dev/null || true
    cp START_HERE.md cybersensei-node/compose/ 2>/dev/null || true
fi

# ============================================================================
# 3. CyberSensei Teams App
# ============================================================================
echo "📦 Réorganisation CyberSensei Teams App..."

if [ -d "CyberSensei - teams/cybersensei-teams-app" ]; then
    echo "  → Déplacement tabs..."
    mkdir -p cybersensei-teams-app/tabs
    cp -r "CyberSensei - teams/cybersensei-teams-app/tabs/"* cybersensei-teams-app/tabs/ 2>/dev/null || true
    
    echo "  → Déplacement bot..."
    mkdir -p cybersensei-teams-app/bot
    cp -r "CyberSensei - teams/cybersensei-teams-app/bot/"* cybersensei-teams-app/bot/ 2>/dev/null || true
    
    echo "  → Déplacement manifest..."
    mkdir -p cybersensei-teams-app/manifest
    cp -r "CyberSensei - teams/cybersensei-teams-app/manifest/"* cybersensei-teams-app/manifest/ 2>/dev/null || true
    
    echo "  → Déplacement common..."
    if [ -d "CyberSensei - teams/cybersensei-teams-app/common" ]; then
        cp -r "CyberSensei - teams/cybersensei-teams-app/common" cybersensei-teams-app/
    fi
    
    echo "  → Déplacement docs..."
    cp "CyberSensei - teams/cybersensei-teams-app/"*.md cybersensei-teams-app/ 2>/dev/null || true
    cp "CyberSensei - teams/cybersensei-teams-app/package.json" cybersensei-teams-app/ 2>/dev/null || true
    cp "CyberSensei - teams/cybersensei-teams-app/tsconfig.json" cybersensei-teams-app/ 2>/dev/null || true
fi

# ============================================================================
# 4. Nettoyage
# ============================================================================
echo "🗑️  Nettoyage..."

# Demander confirmation avant suppression
read -p "Supprimer les anciens dossiers ? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "  → Suppression CyberSensei - saas..."
    rm -rf "CyberSensei - saas/"
    
    echo "  → Suppression CyberSensei - teams..."
    rm -rf "CyberSensei - teams/"
    
    echo "  → Suppression cybersensei-frontend (obsolète)..."
    rm -rf cybersensei-frontend/
    
    echo "  → Suppression anciens dossiers node..."
    rm -rf cybersensei-node-backend/
    rm -rf cybersensei-node-dashboard/
    rm -rf cybersensei-node-ai/
    
    echo "  → Suppression fichiers Docker à la racine..."
    rm -f docker-compose*.yml
    rm -f DOCKER_*.md
    rm -f START_HERE.md
fi

echo ""
echo "✅ Réorganisation terminée !"
echo ""
echo "Nouvelle structure :"
echo "  - cybersensei-central/ (backend, dashboard, infrastructure)"
echo "  - cybersensei-node/ (backend, dashboard, ai, compose)"
echo "  - cybersensei-teams-app/ (tabs, bot, manifest)"
```

---

## ✅ Vérification Post-Nettoyage

Après réorganisation, vérifiez la structure :

```bash
tree -L 3 -I 'node_modules|target|dist|build'
```

**Structure attendue** :

```
cybersensei/
├── cybersensei-central/
│   ├── backend/
│   │   ├── src/
│   │   ├── package.json
│   │   └── ...
│   ├── dashboard/
│   │   ├── src/
│   │   ├── package.json
│   │   └── ...
│   └── infrastructure/
│       ├── prometheus/
│       └── grafana/
│
├── cybersensei-node/
│   ├── backend/
│   │   ├── src/
│   │   ├── pom.xml
│   │   └── ...
│   ├── dashboard/
│   │   ├── src/
│   │   ├── package.json
│   │   └── ...
│   ├── ai/
│   │   ├── server.py
│   │   ├── requirements.txt
│   │   └── ...
│   └── compose/
│       ├── docker-compose.yml
│       ├── Makefile
│       └── ...
│
└── cybersensei-teams-app/
    ├── tabs/
    │   ├── src/
    │   └── ...
    ├── bot/
    │   ├── src/
    │   └── ...
    └── manifest/
        └── manifest.json
```

---

## 🔧 Mise à Jour des Chemins

Après réorganisation, mettez à jour les chemins dans :

### 1. Scripts (scripts/*.sh)

```bash
# Ancien
cd cybersensei-node-backend

# Nouveau
cd cybersensei-node/backend
```

### 2. Docker Compose

```yaml
# Ancien
context: ./cybersensei-node-backend

# Nouveau
context: ./backend
```

### 3. READMEs

Mettez à jour tous les chemins de fichiers mentionnés dans les READMEs.

---

## 📝 Checklist de Réorganisation

- [ ] Créer backup avant réorganisation
- [ ] Exécuter script de réorganisation
- [ ] Vérifier structure avec `tree`
- [ ] Supprimer anciens dossiers
- [ ] Mettre à jour chemins dans scripts
- [ ] Mettre à jour chemins dans docker-compose
- [ ] Mettre à jour READMEs
- [ ] Tester build backend
- [ ] Tester build dashboard
- [ ] Tester docker-compose
- [ ] Commit et push

---

## ⚠️ Important

**Avant de lancer la réorganisation** :

1. **Créer un backup** :
   ```bash
   cd ..
   cp -r CyberSensei CyberSensei-backup
   ```

2. **Vérifier que tout fonctionne** dans l'état actuel

3. **Faire un commit Git** de l'état actuel :
   ```bash
   git add -A
   git commit -m "chore: backup before monorepo reorganization"
   ```

---

**Voulez-vous que je crée et exécute le script de réorganisation maintenant ?**

