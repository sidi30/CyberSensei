# 🔧 Guide de Dépannage - GitHub Actions

## 🎯 Problèmes Courants et Solutions

---

## ❌ Erreur : `npm ci` échoue

### Symptômes
```
npm ERR! cipm can only install packages with an existing package-lock.json
```

### Causes
- `package-lock.json` manquant ou corrompu
- Version de npm incompatible

### Solution

**Option 1 : Régénérer le lockfile**
```bash
cd cybersensei-node/dashboard
rm package-lock.json
npm install
git add package-lock.json
git commit -m "fix: régénère package-lock.json"
git push
```

**Option 2 : Utiliser `npm install` au lieu de `npm ci`**

Modifier le workflow :
```yaml
- name: Install dependencies
  run: npm install  # Au lieu de npm ci
```

---

## ❌ Erreur : Maven build échoue

### Symptômes
```
[ERROR] Failed to execute goal ... Could not resolve dependencies
```

### Causes
- Dépendances Maven introuvables
- `pom.xml` invalide
- Cache Maven corrompu

### Solution

**1. Vérifier `pom.xml` localement**
```bash
cd cybersensei-node/backend
mvn validate
mvn dependency:tree
```

**2. Nettoyer le cache dans le workflow**

Ajouter dans le workflow :
```yaml
- name: Clean Maven cache
  run: rm -rf ~/.m2/repository
```

**3. Vérifier les repositories Maven**

Dans `pom.xml`, assure-toi d'avoir :
```xml
<repositories>
    <repository>
        <id>central</id>
        <url>https://repo.maven.apache.org/maven2</url>
    </repository>
</repositories>
```

---

## ❌ Erreur : Docker build échoue

### Symptômes
```
ERROR: failed to solve: failed to compute cache key
```

### Causes
- Fichier référencé dans `Dockerfile` manquant
- Contexte de build incorrect

### Solution

**1. Vérifier le Dockerfile localement**
```bash
cd cybersensei-node/backend
docker build -t test .
```

**2. Vérifier le context dans le workflow**

Le `context` doit pointer vers le dossier contenant le `Dockerfile` :
```yaml
- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: ./cybersensei-node/backend  # ✅ Correct
    file: ./cybersensei-node/backend/Dockerfile
```

**3. Vérifier les fichiers copiés**

Dans le `Dockerfile`, vérifie que tous les fichiers `COPY` existent :
```dockerfile
# ❌ Mauvais - fichier n'existe pas
COPY config.json .

# ✅ Bon - fichier existe
COPY pom.xml .
```

---

## ❌ Erreur : Permission denied (Docker push)

### Symptômes
```
denied: permission_denied: write_package
```

### Causes
- Permissions insuffisantes dans le workflow
- Registry incorrect

### Solution

**1. Vérifier les permissions du workflow**
```yaml
jobs:
  docker:
    permissions:
      contents: read
      packages: write  # ✅ Nécessaire !
```

**2. Vérifier le registry**
```yaml
env:
  REGISTRY: ghcr.io  # ✅ Correct pour GitHub
```

**3. Vérifier le nom de l'image**
```yaml
# ❌ Mauvais - Majuscules non supportées
ghcr.io/UserName/CyberSensei/node-backend

# ✅ Bon - Tout en minuscules
ghcr.io/username/cybersensei/node-backend
```

---

## ❌ Erreur : Tests échouent

### Symptômes
```
Tests run: 10, Failures: 3, Errors: 0, Skipped: 0
```

### Causes
- Base de données PostgreSQL non disponible
- Variables d'environnement manquantes
- Tests non adaptés à l'environnement CI

### Solution

**1. Vérifier le service PostgreSQL**
```yaml
services:
  postgres:
    image: postgres:15-alpine
    env:
      POSTGRES_DB: cybersensei_test
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

**2. Vérifier les variables d'environnement**
```yaml
- name: Run Tests
  env:
    SPRING_DATASOURCE_URL: jdbc:postgresql://localhost:5432/cybersensei_test
    SPRING_DATASOURCE_USERNAME: test
    SPRING_DATASOURCE_PASSWORD: test
  run: mvn test
```

**3. Skip les tests temporairement**
```yaml
- name: Build
  run: mvn package -DskipTests  # ⚠️ Temporaire seulement !
```

---

## ❌ Workflow ne se déclenche pas

### Symptômes
- Push sur `main` mais aucune action ne démarre

### Causes
- Paths ne correspondent pas
- Branch incorrecte
- Workflow désactivé

### Solution

**1. Vérifier les paths**
```yaml
on:
  push:
    paths:
      - 'cybersensei-node/backend/**'  # ✅ Vérifie que tes fichiers sont dans ce dossier
```

**2. Forcer le trigger**
```yaml
on:
  push:
    branches: [main, develop]
    # Retire les paths temporairement pour tester
```

**3. Vérifier que le workflow est activé**

1. Va sur **Actions** dans GitHub
2. Vérifie que le workflow n'est pas désactivé
3. Re-run si nécessaire

---

## ❌ Cache ne fonctionne pas

### Symptômes
- Builds très lents à chaque fois
- `Cache not found for key ...`

### Causes
- Clé de cache change à chaque fois
- Cache expiré (7 jours)

### Solution

**1. Utiliser une clé stable**
```yaml
- uses: actions/cache@v3
  with:
    path: ~/.m2/repository
    key: ${{ runner.os }}-maven-${{ hashFiles('**/pom.xml') }}
    restore-keys: |
      ${{ runner.os }}-maven-
```

**2. Pour npm, utiliser `actions/setup-node` avec cache**
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'
    cache-dependency-path: package-lock.json
```

---

## ❌ Out of disk space

### Symptômes
```
ERROR: No space left on device
```

### Causes
- Images Docker trop volumineuses
- Cache trop grand
- Artefacts trop lourds

### Solution

**1. Nettoyer après build**
```yaml
- name: Clean up
  run: |
    docker system prune -af
    rm -rf ~/.m2/repository
```

**2. Utiliser multi-stage builds**
```dockerfile
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
# ... build

FROM eclipse-temurin:21-jre-alpine
COPY --from=builder /app/target/*.jar app.jar
# Image finale beaucoup plus petite
```

**3. Limiter la retention des artefacts**
```yaml
- uses: actions/upload-artifact@v4
  with:
    retention-days: 3  # Au lieu de 7
```

---

## 🚀 Best Practices

### 1. Always test locally first
```bash
# Test Maven build
mvn clean package

# Test Docker build
docker build -t test .

# Test npm build
npm ci && npm run build
```

### 2. Use continue-on-error for non-critical steps
```yaml
- name: Lint
  run: npm run lint
  continue-on-error: true  # Ne bloque pas le build
```

### 3. Add timeout to prevent stuck jobs
```yaml
jobs:
  build:
    timeout-minutes: 30  # Max 30 minutes
```

### 4. Use matrix for multiple versions
```yaml
strategy:
  matrix:
    node-version: [16, 18, 20]
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
```

---

## 📊 Monitoring

### Voir les logs détaillés

1. Va sur **Actions** dans GitHub
2. Clique sur le workflow échoué
3. Clique sur le job échoué
4. Développe les steps pour voir les logs

### Re-run un workflow

1. Va sur **Actions**
2. Sélectionne le workflow
3. Clique sur **Re-run jobs** → **Re-run failed jobs**

### Debug mode

Pour activer les logs de debug :

**Settings** → **Secrets** → **New repository secret**

Nom: `ACTIONS_RUNNER_DEBUG`  
Valeur: `true`

---

## 📞 Support

Si tu rencontres toujours des problèmes :

1. 📖 Consulte [GitHub Actions Docs](https://docs.github.com/en/actions)
2. 🔍 Cherche l'erreur sur [GitHub Community](https://github.community/)
3. 💬 Demande de l'aide dans le Discord/Slack de l'équipe

---

**Auteur:** CyberSensei DevOps Team  
**Dernière mise à jour:** 2026-01-19

