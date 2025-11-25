# 📦 UpdateService - Guide Complet

Guide d'utilisation du service de gestion des mises à jour pour CyberSensei Central Backend.

---

## 🎯 Vue d'Ensemble

Le `UpdateService` permet de :
1. **Uploader des packages de mise à jour** (SUPERADMIN uniquement)
2. **Vérifier les mises à jour disponibles** (nodes clients)
3. **Télécharger les packages** (nodes clients)

### Architecture

```
┌─────────────────┐
│   SUPERADMIN    │
│                 │
│  Upload ZIP     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│     UpdateService (NestJS)          │
│                                     │
│  1. Validate ZIP                    │
│  2. Extract version.json            │
│  3. Store in GridFS (MongoDB)       │
│  4. Save metadata (PostgreSQL)      │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────┐    ┌──────────────┐
│   PostgreSQL    │    │   MongoDB    │
│   (Metadata)    │    │   (ZIP File) │
└─────────────────┘    └──────────────┘
         │                     │
         └──────────┬──────────┘
                    ▼
         ┌──────────────────┐
         │  Node Clients    │
         │                  │
         │  1. Check update │
         │  2. Download ZIP │
         │  3. Apply update │
         └──────────────────┘
```

---

## 📝 Structure du fichier version.json

### Champs Requis

Le fichier ZIP **DOIT** contenir un fichier `version.json` à la racine avec les champs suivants :

```json
{
  "version": "1.2.0",
  "changelog": "Description des changements",
  "requiredNodeVersion": "1.0.0"
}
```

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `version` | string | ✅ | Version semver (ex: 1.2.0) |
| `changelog` | string | ✅ | Notes de version (support Markdown) |
| `requiredNodeVersion` | string | ✅ | Version minimale du node requise (semver) |

### Champs Optionnels

```json
{
  "version": "1.2.0",
  "changelog": "...",
  "requiredNodeVersion": "1.0.0",
  "platform": "linux",
  "architecture": "x64",
  "breaking": false,
  "securityUpdate": true,
  "dependencies": {
    "node": ">=14.0.0",
    "postgresql": ">=12.0"
  },
  "createdAt": "2025-11-24T10:30:00.000Z"
}
```

| Champ | Type | Description |
|-------|------|-------------|
| `platform` | string | Plateforme cible (linux, windows, darwin) |
| `architecture` | string | Architecture (x64, arm64, arm) |
| `breaking` | boolean | Indique si la MAJ contient des breaking changes |
| `securityUpdate` | boolean | Indique si c'est une mise à jour de sécurité |
| `dependencies` | object | Dépendances système requises |
| `createdAt` | string | Date de création (ISO 8601) |

### Exemple Complet

Voir le fichier : [`examples/version.json`](examples/version.json)

---

## 🔐 Endpoints API

### 1. Upload d'une Mise à Jour (SUPERADMIN)

**POST** `/admin/update/upload`

**Authorization** : Bearer Token (SUPERADMIN role)

**Body** : `multipart/form-data`
- `file` : Fichier ZIP contenant version.json

**Exemple avec cURL** :
```bash
curl -X POST http://localhost:3000/admin/update/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@cybersensei-1.2.0.zip"
```

**Réponse (201)** :
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "version": "1.2.0",
  "changelog": "- Correctifs de sécurité\n- Nouvelles fonctionnalités",
  "filename": "cybersensei-1.2.0.zip",
  "fileSize": 52428800,
  "checksum": "sha256:a1b2c3d4e5f6...",
  "requiredNodeVersion": "1.0.0",
  "createdAt": "2025-11-24T10:30:00.000Z"
}
```

**Erreurs** :
- `400` : Fichier invalide, version.json manquant ou invalide
- `409` : Version déjà existante

---

### 2. Vérifier les Mises à Jour (Nodes)

**GET** `/update/check?tenantId={UUID}&version={CURRENT_VERSION}`

**Authorization** : Aucune (validation par tenantId + licence)

**Query Parameters** :
- `tenantId` (required) : UUID du tenant
- `version` (required) : Version actuelle du node (semver)

**Exemple** :
```bash
curl "http://localhost:3000/update/check?tenantId=550e8400-e29b-41d4-a716-446655440000&version=1.0.0"
```

**Réponse (200) - Mise à jour disponible** :
```json
{
  "available": true,
  "updateId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "currentVersion": "1.0.0",
  "latestVersion": "1.2.0",
  "changelog": "- Correctifs de sécurité\n- Nouvelles fonctionnalités",
  "fileSize": 52428800,
  "checksum": "sha256:a1b2c3d4...",
  "requiredNodeVersion": "1.0.0",
  "breaking": false,
  "securityUpdate": true,
  "createdAt": "2025-11-24T10:30:00.000Z"
}
```

**Réponse (200) - Node à jour** :
```json
{
  "available": false,
  "message": "Le node est à jour",
  "currentVersion": "1.2.0",
  "latestVersion": "1.2.0"
}
```

**Réponse (200) - Node trop ancien** :
```json
{
  "available": false,
  "message": "Mise à jour disponible mais nécessite une version du node >= 1.5.0. Veuillez d'abord mettre à jour votre node.",
  "currentVersion": "1.0.0",
  "latestVersion": "2.0.0",
  "requiredNodeVersion": "1.5.0"
}
```

**Validations effectuées** :
1. ✅ Tenant existe et est actif
2. ✅ Licence active et non expirée
3. ✅ Comparaison de versions (semver)
4. ✅ Vérification de compatibilité du node

**Erreurs** :
- `400` : Tenant inactif, licence expirée ou invalide
- `404` : Tenant non trouvé

---

### 3. Télécharger une Mise à Jour (Nodes)

**GET** `/update/download/{updateId}`

**Authorization** : Aucune

**Path Parameter** :
- `updateId` (required) : UUID de la mise à jour (obtenu via `/update/check`)

**Exemple** :
```bash
curl -X GET "http://localhost:3000/update/download/7c9e6679-7425-40de-944b-e07fc1f90ae7" \
  -o cybersensei-update.zip
```

**Réponse (200)** :
- Body : Stream binaire du fichier ZIP
- Headers :
  - `Content-Type: application/zip`
  - `Content-Disposition: attachment; filename="cybersensei-1.2.0.zip"`
  - `Content-Length: 52428800`
  - `X-Update-Version: 1.2.0`
  - `X-Checksum: sha256:a1b2c3d4...`

**Erreurs** :
- `404` : Mise à jour non trouvée ou fichier absent
- `400` : Mise à jour désactivée

---

## 💻 Workflow Complet pour les Nodes

### Étape 1 : Vérifier les Mises à Jour

```typescript
import axios from 'axios';

interface UpdateCheckResponse {
  available: boolean;
  updateId?: string;
  currentVersion: string;
  latestVersion?: string;
  changelog?: string;
  fileSize?: number;
  checksum?: string;
  requiredNodeVersion?: string;
  breaking?: boolean;
  securityUpdate?: boolean;
  message?: string;
}

async function checkForUpdates(
  tenantId: string,
  currentVersion: string
): Promise<UpdateCheckResponse> {
  const response = await axios.get(
    `http://central-backend.cybersensei.com/update/check`,
    {
      params: { tenantId, version: currentVersion }
    }
  );
  
  return response.data;
}

// Utilisation
const result = await checkForUpdates(
  '550e8400-e29b-41d4-a716-446655440000',
  '1.0.0'
);

if (result.available) {
  console.log(`Mise à jour disponible: ${result.latestVersion}`);
  console.log(`Changelog:\n${result.changelog}`);
  
  if (result.breaking) {
    console.warn('⚠️ ATTENTION: Cette mise à jour contient des breaking changes!');
  }
  
  if (result.securityUpdate) {
    console.warn('🔒 SÉCURITÉ: Cette mise à jour corrige des vulnérabilités!');
  }
}
```

### Étape 2 : Télécharger la Mise à Jour

```typescript
import * as fs from 'fs';
import * as crypto from 'crypto';

async function downloadUpdate(
  updateId: string,
  outputPath: string
): Promise<boolean> {
  try {
    const response = await axios.get(
      `http://central-backend.cybersensei.com/update/download/${updateId}`,
      { responseType: 'stream' }
    );
    
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);
    
    // Récupérer les headers
    const version = response.headers['x-update-version'];
    const expectedChecksum = response.headers['x-checksum'];
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    
    console.log(`✅ Fichier téléchargé: ${outputPath}`);
    console.log(`Version: ${version}`);
    
    // Vérifier le checksum
    if (expectedChecksum) {
      const actualChecksum = await calculateChecksum(outputPath);
      if (actualChecksum === expectedChecksum) {
        console.log('✅ Checksum vérifié');
        return true;
      } else {
        console.error('❌ Checksum invalide!');
        fs.unlinkSync(outputPath);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erreur de téléchargement:', error.message);
    return false;
  }
}

function calculateChecksum(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve('sha256:' + hash.digest('hex')));
    stream.on('error', reject);
  });
}
```

### Étape 3 : Appliquer la Mise à Jour

```typescript
import * as AdmZip from 'adm-zip';
import * as path from 'path';

async function applyUpdate(zipPath: string, installDir: string): Promise<void> {
  console.log('📦 Extraction de la mise à jour...');
  
  // 1. Créer un backup
  await createBackup(installDir);
  
  // 2. Extraire le ZIP
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(installDir, true);
  
  // 3. Lire version.json
  const versionPath = path.join(installDir, 'version.json');
  const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
  
  console.log(`✅ Mise à jour ${versionData.version} appliquée`);
  
  // 4. Redémarrer le service
  await restartService();
}

async function createBackup(dir: string): Promise<void> {
  const backupDir = `${dir}_backup_${Date.now()}`;
  // Implémenter la logique de backup
  console.log(`💾 Backup créé: ${backupDir}`);
}

async function restartService(): Promise<void> {
  console.log('🔄 Redémarrage du service...');
  // Implémenter la logique de redémarrage
}
```

### Workflow Complet

```typescript
async function updateWorkflow(tenantId: string, currentVersion: string) {
  console.log('🔍 Vérification des mises à jour...');
  
  // 1. Vérifier
  const check = await checkForUpdates(tenantId, currentVersion);
  
  if (!check.available) {
    console.log(check.message || 'Aucune mise à jour disponible');
    return;
  }
  
  // 2. Afficher les informations
  console.log(`\n📦 Mise à jour disponible: ${check.latestVersion}`);
  console.log(`Taille: ${(check.fileSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`\nChangelog:\n${check.changelog}\n`);
  
  if (check.breaking) {
    const confirm = await askUser('Cette mise à jour contient des breaking changes. Continuer? (y/n)');
    if (confirm !== 'y') return;
  }
  
  // 3. Télécharger
  const zipPath = `/tmp/cybersensei-update-${check.latestVersion}.zip`;
  console.log('⬇️ Téléchargement en cours...');
  
  const success = await downloadUpdate(check.updateId, zipPath);
  if (!success) {
    console.error('❌ Échec du téléchargement');
    return;
  }
  
  // 4. Appliquer
  console.log('🔧 Application de la mise à jour...');
  await applyUpdate(zipPath, '/opt/cybersensei');
  
  // 5. Nettoyer
  fs.unlinkSync(zipPath);
  
  console.log('✅ Mise à jour terminée avec succès!');
}

// Exécution
updateWorkflow(
  '550e8400-e29b-41d4-a716-446655440000',
  '1.0.0'
);
```

---

## 🔧 Administration (SUPERADMIN)

### Lister toutes les Mises à Jour

**GET** `/admin/updates`

```bash
curl -X GET http://localhost:3000/admin/updates \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Voir les Détails d'une Mise à Jour

**GET** `/admin/update/{id}`

```bash
curl -X GET http://localhost:3000/admin/update/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Supprimer une Mise à Jour

**DELETE** `/admin/update/{id}`

```bash
curl -X DELETE http://localhost:3000/admin/update/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**⚠️ ATTENTION** : Supprime le fichier ZIP de GridFS ET les métadonnées PostgreSQL.

### Statistiques de Téléchargement

**GET** `/admin/update/{id}/stats`

```bash
curl -X GET http://localhost:3000/admin/update/550e8400-e29b-41d4-a716-446655440000/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 Validation et Sécurité

### Validations Automatiques

#### Lors de l'Upload
1. ✅ Fichier est un ZIP valide
2. ✅ `version.json` présent à la racine
3. ✅ Champs requis présents (`version`, `changelog`, `requiredNodeVersion`)
4. ✅ Format semver valide (ex: 1.2.0)
5. ✅ Version n'existe pas déjà
6. ✅ Calcul du checksum SHA-256

#### Lors de la Vérification (Check)
1. ✅ Tenant existe
2. ✅ Tenant est actif
3. ✅ Licence active trouvée
4. ✅ Licence non expirée
5. ✅ Comparaison de versions (semver)
6. ✅ Vérification de compatibilité du node

#### Lors du Téléchargement
1. ✅ Mise à jour existe
2. ✅ Mise à jour est active
3. ✅ Fichier présent dans GridFS

---

## 🐛 Gestion des Erreurs

### Erreurs Côté Upload

```typescript
try {
  const result = await upload(file);
} catch (error) {
  if (error.status === 400) {
    // Fichier invalide, version.json manquant ou invalide
    console.error('Erreur de validation:', error.message);
  } else if (error.status === 409) {
    // Version existe déjà
    console.error('Cette version existe déjà');
  } else {
    console.error('Erreur serveur:', error);
  }
}
```

### Erreurs Côté Node

```typescript
try {
  const check = await checkForUpdates(tenantId, version);
} catch (error) {
  if (error.response?.status === 400) {
    // Tenant inactif ou licence invalide
    console.error('Licence invalide:', error.response.data.message);
  } else if (error.response?.status === 404) {
    // Tenant non trouvé
    console.error('Tenant non trouvé');
  } else {
    console.error('Erreur réseau:', error.message);
  }
}
```

---

## 📚 Ressources

### Fichiers Générés
- [`update.service.ts`](src/modules/update/update.service.ts) - Service principal
- [`update.controller.ts`](src/modules/update/update.controller.ts) - Contrôleur REST
- [`update.module.ts`](src/modules/update/update.module.ts) - Module NestJS
- [`upload-update.dto.ts`](src/modules/update/dto/upload-update.dto.ts) - DTO upload
- [`check-update.dto.ts`](src/modules/update/dto/check-update.dto.ts) - DTO vérification
- [`version-metadata.interface.ts`](src/modules/update/interfaces/version-metadata.interface.ts) - Interface TypeScript

### Exemple
- [`examples/version.json`](examples/version.json) - Exemple de version.json complet

### Documentation
- [README Principal](README.md)
- [Guide Admin](ADMIN_GUIDE.md)
- [Guide Node Client](GUIDE_NODE_CLIENT.md)

---

## ✅ Checklist de Déploiement

### Préparation du Package
- [ ] Créer le fichier `version.json` avec tous les champs requis
- [ ] Tester le package localement
- [ ] Générer le checksum SHA-256
- [ ] Créer le fichier ZIP avec `version.json` à la racine

### Upload
- [ ] Se connecter en tant que SUPERADMIN
- [ ] Uploader via `/admin/update/upload`
- [ ] Vérifier les métadonnées dans PostgreSQL
- [ ] Vérifier le fichier dans MongoDB GridFS

### Tests
- [ ] Tester `/update/check` avec un tenant de test
- [ ] Télécharger le package via `/update/download`
- [ ] Vérifier le checksum
- [ ] Extraire et valider le ZIP

### Monitoring
- [ ] Surveiller les logs backend
- [ ] Vérifier les téléchargements
- [ ] Monitorer les erreurs éventuelles

---

**✅ Le UpdateService est complet et prêt à l'emploi !**

