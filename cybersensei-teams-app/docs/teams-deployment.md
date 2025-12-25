# 📚 CyberSensei Teams App - Guide de Déploiement via Teams Admin Center

Ce guide détaille le processus complet de déploiement de l'application CyberSensei Teams via le Teams Admin Center, incluant le versioning, l'installation, les mises à jour et les rollbacks.

---

## 📋 Table des Matières

1. [Versioning](#versioning)
2. [Génération du Package](#génération-du-package)
3. [Installation Initiale](#installation-initiale)
4. [Processus de Mise à Jour](#processus-de-mise-à-jour)
5. [Rollback](#rollback)
6. [Dépannage](#dépannage)

---

## 🔢 Versioning

### Schéma de Versioning

CyberSensei Teams App utilise le versioning sémantique (SemVer) :

```
MAJOR.MINOR.PATCH
```

- **MAJOR** : Changements incompatibles avec les versions précédentes
- **MINOR** : Nouvelles fonctionnalités rétrocompatibles
- **PATCH** : Corrections de bugs rétrocompatibles

**Exemples** :
- `1.0.0` : Version initiale
- `1.1.0` : Ajout d'une nouvelle fonctionnalité
- `1.1.1` : Correction d'un bug
- `2.0.0` : Changement majeur (nouveau backend, etc.)

### Fichier version.json

Le fichier `version.json` à la racine du projet suit l'historique des builds :

```json
{
  "version": "1.2.3",
  "builds": [
    {
      "version": "1.2.3",
      "timestamp": "2024-12-21T15:30:00Z",
      "appId": "12345678-1234-1234-1234-123456789012",
      "botId": "12345678-1234-1234-1234-123456789012",
      "hostname": "cybersensei-tabs.azurewebsites.net",
      "clientName": "CompanyX",
      "packageFile": "cybersensei-teams-app-CompanyX-v1.2.3.zip",
      "packageSize": 45.2
    }
  ]
}
```

### Stratégie de Versioning Recommandée

| Scénario | Action | Exemple |
|----------|--------|---------|
| Correction de bug mineur | PATCH | 1.0.0 → 1.0.1 |
| Nouvelle fonctionnalité | MINOR | 1.0.1 → 1.1.0 |
| Refonte majeure | MAJOR | 1.1.0 → 2.0.0 |
| Hotfix critique | PATCH | 1.2.3 → 1.2.4 |

---

## 📦 Génération du Package

### Méthode 1 : Script PowerShell (Windows)

#### Utilisation Interactive

```powershell
cd cybersensei-teams-app
.\scripts\package-teams-app.ps1
```

Le script vous demandera :
- Version (ou auto-incrémente)
- Microsoft App ID
- Bot ID
- Hostname
- Nom du client (optionnel)

#### Utilisation avec Paramètres

```powershell
# Avec version spécifique
.\scripts\package-teams-app.ps1 -Version "1.2.0" `
    -AppId "12345678-1234-1234-1234-123456789012" `
    -BotId "12345678-1234-1234-1234-123456789012" `
    -Hostname "cybersensei-tabs.azurewebsites.net" `
    -ClientName "CompanyX"

# Avec auto-incrémentation
.\scripts\package-teams-app.ps1 -AutoIncrement `
    -AppId "12345678-1234-1234-1234-123456789012" `
    -Hostname "cybersensei-tabs.azurewebsites.net" `
    -ClientName "CompanyX"

# Utiliser les variables d'environnement depuis .env
.\scripts\package-teams-app.ps1 -UseEnv -AutoIncrement
```

#### Paramètres Disponibles

| Paramètre | Description | Obligatoire |
|-----------|-------------|-------------|
| `-Version` | Version à utiliser (ex: "1.2.0") | Non |
| `-AppId` | Microsoft App ID | Oui* |
| `-BotId` | Bot ID (défaut: même que AppId) | Non |
| `-Hostname` | Hostname des tabs déployés | Oui* |
| `-ClientName` | Nom du client pour le package | Non |
| `-AutoIncrement` | Incrémente automatiquement la version patch | Non |
| `-UseEnv` | Charge les variables depuis .env | Non |

*Sauf si `-UseEnv` est utilisé

### Méthode 2 : Script Bash (Linux/Mac)

```bash
cd cybersensei-teams-app

# Interactif
./scripts/package-teams-app.sh

# Avec paramètres
./scripts/package-teams-app.sh \
    --version "1.2.0" \
    --app-id "12345678-1234-1234-1234-123456789012" \
    --bot-id "12345678-1234-1234-1234-123456789012" \
    --hostname "cybersensei-tabs.azurewebsites.net" \
    --client "CompanyX"

# Auto-incrémentation
./scripts/package-teams-app.sh --auto-increment --use-env
```

### Méthode 3 : Node.js (Cross-platform)

```bash
cd cybersensei-teams-app
npm run package
```

### Sortie du Script

Après exécution, vous obtiendrez :

```
dist/
├── cybersensei-teams-app-CompanyX-v1.2.0.zip   ← Package Teams
└── CHANGELOG-v1.2.0.md                          ← Notes de version
```

Le package ZIP contient :
- `manifest.json` (avec variables remplacées)
- `color.png` (192x192)
- `outline.png` (32x32)

---

## 🚀 Installation Initiale

### Prérequis

- ✅ Compte Microsoft 365 avec accès Teams Admin
- ✅ Rôle **Global Administrator** ou **Teams Service Administrator**
- ✅ Backend CyberSensei déployé et accessible
- ✅ Azure Bot configuré et canal Teams activé
- ✅ Package ZIP généré

### Étape 1 : Accéder au Teams Admin Center

1. Ouvrez un navigateur
2. Accédez à : https://admin.teams.microsoft.com
3. Connectez-vous avec vos identifiants administrateur

### Étape 2 : Activer le Sideloading (Si Nécessaire)

Pour les tests ou organisations qui n'utilisent pas l'App Store :

1. Dans le menu de gauche, allez à **Teams apps** > **Setup policies**
2. Sélectionnez la politique **Global (Org-wide default)** ou créez-en une nouvelle
3. Activez **Upload custom apps** (Télécharger des applications personnalisées)
4. Cliquez sur **Save**

### Étape 3 : Uploader l'Application

#### Option A : Upload pour Tests (Sideloading)

1. Allez à **Teams apps** > **Manage apps**
2. Cliquez sur **⬆️ Upload** (en haut à droite)
3. Sélectionnez **Upload an app**
4. Parcourez et sélectionnez le fichier `.zip`
5. Attendez que l'upload se termine
6. L'application apparaît dans la liste avec le statut **Uploaded** (custom app)

#### Option B : Publier pour Toute l'Organisation

1. Allez à **Teams apps** > **Manage apps**
2. Cliquez sur **⬆️ Upload** > **Upload an app**
3. Sélectionnez le fichier `.zip`
4. Une fois uploadé, trouvez l'application dans la liste
5. Cliquez sur le nom de l'application
6. Dans la page de détails, cliquez sur **Publish**
7. Confirmez la publication

### Étape 4 : Configurer les Permissions

1. Dans **Teams apps** > **Manage apps**, trouvez **CyberSensei**
2. Cliquez sur le nom de l'application
3. Allez dans l'onglet **Permissions**
4. Vérifiez les permissions demandées :
   - User.Read
   - email
   - profile
5. Cliquez sur **Grant admin consent** si nécessaire

### Étape 5 : Créer une Permission Policy

1. Allez à **Teams apps** > **Permission policies**
2. Cliquez sur **Add** pour créer une nouvelle politique
3. Donnez un nom : `CyberSensei-Policy`
4. Dans **Custom apps**, sélectionnez **Allow specific apps and block all others**
5. Cliquez sur **Allow apps**
6. Recherchez et sélectionnez **CyberSensei**
7. Ajoutez d'autres apps si nécessaire
8. Cliquez sur **Save**

### Étape 6 : Assigner la Politique aux Utilisateurs

#### Option A : Assigner à des Utilisateurs Spécifiques

1. Restez dans **Teams apps** > **Permission policies**
2. Sélectionnez la politique **CyberSensei-Policy**
3. Cliquez sur **Manage users**
4. Recherchez et ajoutez les utilisateurs
5. Cliquez sur **Apply**

#### Option B : Assigner à un Groupe

1. Dans **Teams apps** > **Permission policies**
2. Sélectionnez la politique **CyberSensei-Policy**
3. Cliquez sur **Group policy assignment**
4. Cliquez sur **Add group**
5. Recherchez le groupe (ex: Security Group Azure AD)
6. Définissez le rang de priorité
7. Cliquez sur **Apply**

### Étape 7 : Vérifier l'Installation

1. Ouvrez Microsoft Teams (client desktop ou web)
2. Cliquez sur **Apps** dans la barre latérale
3. Recherchez **CyberSensei**
4. Cliquez sur **Add** pour installer l'application
5. Vérifiez que les onglets s'affichent correctement

**Délai de propagation** : 24 heures maximum (généralement 1-2 heures)

---

## 🔄 Processus de Mise à Jour

### Stratégie de Mise à Jour

| Type de Mise à Jour | Stratégie | Impact |
|---------------------|-----------|--------|
| Patch (1.0.0 → 1.0.1) | Mise à jour directe | Aucun (rétrocompatible) |
| Minor (1.0.0 → 1.1.0) | Mise à jour progressive | Faible (nouvelles features) |
| Major (1.x.x → 2.0.0) | Mise à jour planifiée | Élevé (peut nécessiter migration) |

### Étape 1 : Préparation

1. **Générer le nouveau package**
   ```powershell
   .\scripts\package-teams-app.ps1 -Version "1.2.0" -UseEnv
   ```

2. **Tester le nouveau package**
   - Sideloadez le package dans un tenant de test
   - Vérifiez toutes les fonctionnalités
   - Validez avec des utilisateurs pilotes

3. **Préparer les notes de version**
   - Éditez le fichier `CHANGELOG-v1.2.0.md` généré
   - Ajoutez les changements et nouveautés
   - Documentez les éventuels breaking changes

4. **Communiquer avec les utilisateurs**
   - Envoyez un email annonçant la mise à jour
   - Indiquez la date et l'heure de la mise à jour
   - Expliquez les nouveautés et changements

### Étape 2 : Mise à Jour dans Teams Admin Center

#### Méthode 1 : Remplacement Direct (Recommandé)

1. Allez à **Teams apps** > **Manage apps**
2. Recherchez **CyberSensei** dans la liste
3. Cliquez sur le nom de l'application
4. Cliquez sur **Update** (ou le bouton "..." > **Update**)
5. Sélectionnez le nouveau fichier `.zip`
6. Attendez la validation
7. Une fois validé, cliquez sur **Publish** pour publier la mise à jour

**⚠️ Important** : Le manifest doit contenir le même `id` (App ID) mais une `version` différente.

#### Méthode 2 : Upload Nouvelle Version (Si Problème)

Si la mise à jour directe échoue :

1. **Ne supprimez PAS l'ancienne version**
2. Uploadez la nouvelle version avec un nom légèrement différent
3. Testez la nouvelle version
4. Une fois validée, supprimez l'ancienne
5. Renommez la nouvelle si nécessaire

### Étape 3 : Validation Post-Mise à Jour

1. **Vérifier l'état de l'application**
   - Allez dans **Manage apps**
   - Vérifiez que le statut est **Published**
   - Vérifiez que la version affichée est correcte

2. **Tester avec un compte pilote**
   - Connectez-vous avec un compte de test
   - Ouvrez l'application dans Teams
   - Vérifiez que la nouvelle version est active
   - Testez les fonctionnalités clés

3. **Monitorer les erreurs**
   - Consultez les logs du backend
   - Consultez les logs Azure Bot
   - Surveillez les retours utilisateurs

### Étape 4 : Déploiement Progressif (Optionnel)

Pour les mises à jour majeures, déployez progressivement :

1. **Phase 1** : Groupe pilote (10-20 utilisateurs)
   - Durée : 1-3 jours
   - Collectez les feedbacks

2. **Phase 2** : Département IT (20-30% des utilisateurs)
   - Durée : 1 semaine
   - Validation technique

3. **Phase 3** : Déploiement général
   - Durée : Progressive sur 2 semaines
   - Monitoring continu

### Calendrier de Mise à Jour Recommandé

```
J-7  : Annonce de la mise à jour
J-3  : Tests finaux et validation
J-1  : Communication de rappel
J0   : Mise à jour (hors heures ouvrées)
J+1  : Monitoring et support
J+7  : Bilan et retours
```

---

## ⏪ Rollback

En cas de problème avec une nouvelle version, vous pouvez effectuer un rollback.

### Scénario 1 : Rollback Immédiat (< 24h)

Si un problème critique est détecté dans les 24 premières heures :

1. **Ne paniquez pas** - Les utilisateurs peuvent continuer à utiliser l'ancienne version installée
2. Allez dans **Teams apps** > **Manage apps**
3. Trouvez **CyberSensei**
4. Cliquez sur **Update** et uploadez l'ancienne version
5. Publiez la version précédente

### Scénario 2 : Rollback après Suppression

Si l'ancienne version a été supprimée :

1. **Récupérer l'ancien package**
   - Consultez `dist/` pour retrouver l'ancien ZIP
   - Ou consultez `version.json` pour les détails

2. **Re-créer le package**
   ```powershell
   .\scripts\package-teams-app.ps1 `
       -Version "1.1.0" `
       -AppId "..." `
       -Hostname "..."
   ```

3. **Uploader et publier**
   - Suivez la procédure de mise à jour
   - Utilisez l'ancienne version

### Scénario 3 : Rollback Progressif

Pour minimiser l'impact :

1. **Créer une nouvelle Permission Policy**
   - Nommez-la `CyberSensei-Rollback`
   - Pointez vers l'ancienne version

2. **Assigner progressivement**
   - Commencez par les groupes affectés
   - Étendez au fur et à mesure

3. **Communiquer**
   - Informez les utilisateurs du rollback
   - Expliquez les raisons
   - Donnez une timeline pour la correction

### Checklist de Rollback

- [ ] Identifier la version stable précédente
- [ ] Récupérer ou recréer le package
- [ ] Tester le package en sideloading
- [ ] Mettre à jour l'application dans Teams Admin Center
- [ ] Publier la version rollback
- [ ] Vérifier avec des comptes pilotes
- [ ] Communiquer avec les utilisateurs
- [ ] Documenter l'incident
- [ ] Planifier la correction et la re-déploiement

### Prévention des Rollbacks

Pour éviter les rollbacks :

1. **Tests rigoureux** : Testez toujours en environnement de test
2. **Déploiement progressif** : Commencez par un petit groupe
3. **Monitoring** : Surveillez les logs et métriques
4. **Hotfix rapide** : Préparez des correctifs rapides (patch versions)
5. **Communication** : Gardez les utilisateurs informés

---

## 🔧 Dépannage

### Problème : "App validation failed"

**Cause** : Problème dans le manifest ou icônes invalides

**Solution** :
1. Vérifiez que le manifest est un JSON valide
2. Vérifiez que les icônes sont aux bonnes dimensions :
   - color.png : 192x192 px
   - outline.png : 32x32 px
3. Vérifiez que tous les URLs sont valides (HTTPS)
4. Utilisez l'App Studio pour valider le manifest

### Problème : "App not appearing in Teams"

**Cause** : Permission policy ou délai de propagation

**Solution** :
1. Vérifiez la permission policy de l'utilisateur
2. Attendez jusqu'à 24h pour la propagation
3. Demandez à l'utilisateur de se déconnecter/reconnecter
4. Videz le cache Teams :
   - Windows : `%appdata%\Microsoft\Teams`
   - Mac : `~/Library/Application Support/Microsoft/Teams`

### Problème : "Bot not responding"

**Cause** : Endpoint invalide ou bot non démarré

**Solution** :
1. Vérifiez l'endpoint dans Azure Bot Configuration
2. Vérifiez que le bot est démarré et accessible
3. Testez l'endpoint :
   ```bash
   curl https://your-bot.azurewebsites.net/api/messages
   ```
4. Consultez les logs du bot

### Problème : "Tabs show white screen"

**Cause** : URLs invalides ou erreur JavaScript

**Solution** :
1. Ouvrez la console du navigateur (F12)
2. Vérifiez les erreurs JavaScript
3. Vérifiez que les URLs des tabs sont correctes dans le manifest
4. Vérifiez que les tabs sont déployés et accessibles
5. Vérifiez les certificats SSL (HTTPS requis)

### Problème : "Version conflict"

**Cause** : Tentative d'upload avec même version

**Solution** :
1. Incrémentez la version dans le manifest
2. Utilisez le script avec `-AutoIncrement`
3. Vérifiez `version.json` pour la version actuelle

---

## 📊 Métriques de Déploiement

### KPIs à Suivre

| Métrique | Cible | Comment Mesurer |
|----------|-------|-----------------|
| Temps de déploiement | < 2 heures | Temps entre upload et disponibilité |
| Taux d'adoption | > 80% dans 2 semaines | Nombre d'utilisateurs actifs / Total |
| Taux d'erreur | < 1% | Erreurs signalées / Utilisations |
| Satisfaction | > 4/5 | Survey post-déploiement |

### Dashboard Recommandé

Suivez ces métriques dans votre tableau de bord :

1. **Utilisation**
   - Utilisateurs actifs quotidiens
   - Utilisateurs actifs mensuels
   - Quiz complétés par jour

2. **Performance**
   - Temps de réponse moyen
   - Taux d'erreur
   - Disponibilité

3. **Adoption**
   - Taux d'installation
   - Taux d'activation (première utilisation)
   - Taux de rétention (utilisation continue)

---

## 📞 Support et Ressources

### Documentation

- [README.md](../README.md) - Vue d'ensemble
- [DEPLOYMENT_E2E_GUIDE.md](../DEPLOYMENT_E2E_GUIDE.md) - Déploiement Azure complet
- [API_ENDPOINTS_SPECIFICATION.md](../API_ENDPOINTS_SPECIFICATION.md) - Endpoints requis

### Scripts

- [package-teams-app.ps1](../scripts/package-teams-app.ps1) - Script PowerShell
- [package-teams-app.sh](../scripts/package-teams-app.sh) - Script Bash

### Checklist

- [admin-checklist.md](./admin-checklist.md) - Checklist pour admin IT

### Support Microsoft

- [Teams Admin Center](https://admin.teams.microsoft.com)
- [Teams Developer Portal](https://dev.teams.microsoft.com)
- [Microsoft Teams Documentation](https://docs.microsoft.com/en-us/microsoftteams/)

---

**Version du document** : 1.0.0  
**Dernière mise à jour** : 21 décembre 2024  
**Auteur** : Équipe CyberSensei

