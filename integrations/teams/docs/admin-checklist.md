# ✅ Checklist Admin IT - Déploiement CyberSensei Teams App

Cette checklist guide l'administrateur IT à travers toutes les étapes nécessaires pour déployer avec succès l'application CyberSensei Teams dans l'organisation.

---

## 📋 Avant de Commencer

### Informations à Collecter

- [ ] **Microsoft App ID** : `________________________________`
- [ ] **Bot ID** : `________________________________`
- [ ] **Tenant ID** : `________________________________`
- [ ] **Backend URL** : `________________________________`
- [ ] **Tabs Hostname** : `________________________________`
- [ ] **Nombre d'utilisateurs cibles** : `________`
- [ ] **Date de déploiement prévue** : `________`

### Accès Requis

- [ ] Accès **Teams Admin Center** (Global Admin ou Teams Admin)
- [ ] Accès **Azure Portal** (pour vérifier le Bot)
- [ ] Accès **Backend CyberSensei** (pour vérifier la disponibilité)
- [ ] Droits pour créer des **Security Groups** (si déploiement par groupe)

---

## 🏗️ Phase 1 : Préparation (J-7 avant déploiement)

### 1.1 Vérification du Backend

- [ ] Backend CyberSensei Node déployé et accessible
- [ ] URL backend accessible via HTTPS
- [ ] Endpoint `/api/auth/teams/exchange` implémenté
  ```bash
  curl -X POST https://BACKEND_URL/api/auth/teams/exchange \
    -H "Content-Type: application/json" \
    -d '{"teamsUserId":"test","email":"test@test.com","displayName":"Test"}'
  ```
- [ ] Tous les endpoints API fonctionnels (voir [API_ENDPOINTS_SPECIFICATION.md](../API_ENDPOINTS_SPECIFICATION.md))
- [ ] CORS configuré pour Teams (`https://teams.microsoft.com`)
- [ ] Certificat SSL valide

### 1.2 Vérification Azure

- [ ] App Registration créée dans Azure AD
- [ ] Client Secret créé et noté en lieu sûr
- [ ] Permissions API configurées :
  - [ ] User.Read (Delegated)
  - [ ] email (Delegated)
  - [ ] profile (Delegated)
- [ ] Consentement admin accordé pour les permissions
- [ ] API exposée avec scope `access_as_user`
- [ ] Azure Bot créé et configuré
- [ ] Canal Microsoft Teams activé sur le Bot
- [ ] Endpoint de messaging configuré sur le Bot

### 1.3 Vérification des Tabs Déployés

- [ ] Employee Tab déployé et accessible
  ```bash
  curl https://EMPLOYEE_TAB_URL
  ```
- [ ] Manager Tab déployé et accessible
  ```bash
  curl https://MANAGER_TAB_URL
  ```
- [ ] Certificats SSL valides sur les tabs
- [ ] URLs notées pour le manifest

### 1.4 Génération du Package

- [ ] Node.js installé (v18+)
- [ ] Script de packaging téléchargé
- [ ] Icônes générées (color.png + outline.png)
  ```powershell
  cd manifest
  node generate-icons.js
  ```
- [ ] Package généré avec succès
  ```powershell
  .\scripts\package-teams-app.ps1 -UseEnv
  ```
- [ ] Fichier ZIP créé dans `dist/`
- [ ] CHANGELOG généré et révisé

### 1.5 Tests en Environnement de Test (Recommandé)

- [ ] Tenant de test disponible
- [ ] Package sideloadé dans le tenant de test
- [ ] Authentification Teams testée
- [ ] Quiz du jour testé
- [ ] Bot testé (commandes + cartes adaptives)
- [ ] Onglet Manager testé (si applicable)
- [ ] Chat IA testé
- [ ] Aucune erreur critique détectée

---

## 📢 Phase 2 : Communication (J-3 avant déploiement)

### 2.1 Communication aux Utilisateurs

- [ ] Email d'annonce envoyé à tous les utilisateurs cibles
  - [ ] Date et heure du déploiement
  - [ ] Objectif de l'application
  - [ ] Fonctionnalités principales
  - [ ] Instructions d'accès
  - [ ] Contact support

### 2.2 Communication à l'Équipe IT

- [ ] Équipe support informée du déploiement
- [ ] Documentation partagée :
  - [ ] [README.md](../README.md)
  - [ ] [teams-deployment.md](./teams-deployment.md)
  - [ ] [DEPLOYMENT_E2E_GUIDE.md](../DEPLOYMENT_E2E_GUIDE.md)
- [ ] Plan de support préparé
- [ ] Escalation process défini

### 2.3 Préparation du Rollback

- [ ] Ancien package sauvegardé (si mise à jour)
- [ ] Procédure de rollback documentée
- [ ] Critères de rollback définis
- [ ] Équipe de décision identifiée

---

## 🚀 Phase 3 : Déploiement (Jour J)

### 3.1 Upload de l'Application

- [ ] Connexion à [Teams Admin Center](https://admin.teams.microsoft.com)
- [ ] Navigation vers **Teams apps** > **Manage apps**
- [ ] Clic sur **Upload**
- [ ] Sélection du fichier ZIP
- [ ] Upload réussi sans erreurs de validation
- [ ] Application visible dans la liste avec statut "Uploaded"

### 3.2 Configuration des Permissions

- [ ] Application trouvée dans la liste
- [ ] Page de détails ouverte
- [ ] Onglet **Permissions** consulté
- [ ] Permissions vérifiées (User.Read, email, profile)
- [ ] **Grant admin consent** cliqué si nécessaire
- [ ] Consentement accordé avec succès

### 3.3 Publication de l'Application

#### Option A : Publication Globale

- [ ] Bouton **Publish** cliqué sur la page de détails
- [ ] Confirmation de publication
- [ ] Statut changé en "Published"

#### Option B : Publication Progressive (Recommandé)

**Groupe Pilote (J0)** :
- [ ] Permission Policy créée : `CyberSensei-Pilot`
- [ ] Application autorisée dans la policy
- [ ] Policy assignée au groupe pilote (10-20 utilisateurs)
- [ ] Délai de propagation attendu (2-4 heures)
- [ ] Tests avec les utilisateurs pilotes effectués
- [ ] Retours collectés et analysés

**Déploiement IT (J+2)** :
- [ ] Permission Policy créée : `CyberSensei-IT`
- [ ] Policy assignée au département IT
- [ ] Tests effectués par l'IT
- [ ] Aucun problème critique détecté

**Déploiement Général (J+7)** :
- [ ] Permission Policy globale mise à jour
- [ ] Application disponible pour tous les utilisateurs

### 3.4 Vérification du Déploiement

- [ ] Vérification du statut dans **Manage apps**
- [ ] Test avec un compte utilisateur standard :
  - [ ] Application trouvée dans l'App Store Teams
  - [ ] Installation réussie
  - [ ] Onglets chargés correctement
  - [ ] Authentification réussie
  - [ ] Quiz du jour affiché
  - [ ] Bot accessible et fonctionnel

---

## 📊 Phase 4 : Monitoring (J+1 à J+7)

### 4.1 Monitoring Technique

**Quotidien (J+1 à J+3)** :
- [ ] Vérification des logs backend (erreurs 4xx, 5xx)
- [ ] Vérification des logs Azure Bot
- [ ] Vérification de la disponibilité des tabs
- [ ] Temps de réponse API acceptable (< 2s)
- [ ] Taux d'erreur acceptable (< 1%)

**Hebdomadaire (J+7)** :
- [ ] Analyse des métriques d'utilisation
- [ ] Revue des tickets support
- [ ] Identification des problèmes récurrents

### 4.2 Monitoring Utilisateurs

- [ ] Nombre d'installations suivies
  - Cible J+1 : 10% des utilisateurs
  - Cible J+3 : 30% des utilisateurs
  - Cible J+7 : 60% des utilisateurs
  - Cible J+14 : 80%+ des utilisateurs

- [ ] Utilisation active mesurée
  - Quiz complétés par jour
  - Messages au bot
  - Accès onglet Manager (si applicable)

- [ ] Tickets support suivis
  - Nombre de tickets liés à CyberSensei
  - Types de problèmes rencontrés
  - Temps de résolution moyen

### 4.3 Collecte de Feedback

- [ ] Survey post-installation envoyé (J+7)
  - Satisfaction générale (/5)
  - Facilité d'utilisation
  - Utilité perçue
  - Suggestions d'amélioration

- [ ] Retours pilotes analysés
- [ ] Problèmes identifiés documentés
- [ ] Améliorations planifiées

---

## 🔧 Phase 5 : Support et Maintenance

### 5.1 Support Utilisateur

- [ ] Canal de support défini (email, Teams, etc.)
- [ ] FAQ créée et publiée
- [ ] Documentation utilisateur disponible
- [ ] Équipe support formée sur l'application

#### Problèmes Courants et Solutions

**L'application n'apparaît pas** :
- [ ] Vérifier la permission policy de l'utilisateur
- [ ] Attendre la propagation (jusqu'à 24h)
- [ ] Vider le cache Teams
- [ ] Se déconnecter/reconnecter

**Erreur d'authentification** :
- [ ] Vérifier que les permissions sont accordées
- [ ] Vérifier que l'endpoint backend est accessible
- [ ] Consulter les logs backend

**Bot ne répond pas** :
- [ ] Vérifier que le bot est démarré
- [ ] Vérifier l'endpoint dans Azure Bot
- [ ] Consulter les logs du bot

**Tabs affichent un écran blanc** :
- [ ] Ouvrir la console du navigateur (F12)
- [ ] Vérifier les erreurs JavaScript
- [ ] Vérifier que les URLs sont correctes
- [ ] Vérifier les certificats SSL

### 5.2 Maintenance Régulière

**Mensuel** :
- [ ] Vérification des métriques d'utilisation
- [ ] Analyse des tendances
- [ ] Revue des incidents
- [ ] Mise à jour de la documentation si nécessaire

**Trimestriel** :
- [ ] Revue de la stratégie de déploiement
- [ ] Planification des mises à jour
- [ ] Formation de rappel pour les nouveaux utilisateurs
- [ ] Évaluation ROI

### 5.3 Planification des Mises à Jour

- [ ] Processus de mise à jour documenté
- [ ] Calendrier de mise à jour établi
- [ ] Tests de non-régression définis
- [ ] Communication des mises à jour planifiée

---

## 🔄 Phase 6 : Mise à Jour (Quand Applicable)

### 6.1 Préparation de la Mise à Jour

- [ ] Nouvelle version générée
  ```powershell
  .\scripts\package-teams-app.ps1 -Version "1.X.0" -UseEnv
  ```
- [ ] CHANGELOG complété avec les changements
- [ ] Tests en environnement de test effectués
- [ ] Validation par groupe pilote
- [ ] Communication envoyée aux utilisateurs (J-3)

### 6.2 Déploiement de la Mise à Jour

- [ ] Connexion à Teams Admin Center
- [ ] Navigation vers l'application existante
- [ ] Clic sur **Update**
- [ ] Upload du nouveau package (même App ID, version différente)
- [ ] Validation réussie
- [ ] Publication de la mise à jour
- [ ] Vérification de la nouvelle version

### 6.3 Validation Post-Mise à Jour

- [ ] Tests avec comptes pilotes
- [ ] Vérification des fonctionnalités clés
- [ ] Monitoring renforcé (J+1 à J+3)
- [ ] Aucune régression détectée
- [ ] Métriques d'utilisation stables ou améliorées

---

## ⏪ Procédure de Rollback (Si Nécessaire)

### Critères de Déclenchement

Effectuez un rollback si :
- [ ] Taux d'erreur > 5%
- [ ] Fonctionnalité critique non disponible
- [ ] Plus de 10 tickets critiques en 1 heure
- [ ] Indisponibilité prolongée (> 30 minutes)

### Étapes de Rollback

- [ ] Décision de rollback prise et documentée
- [ ] Ancien package récupéré depuis `dist/`
- [ ] Upload de l'ancienne version dans Teams Admin Center
- [ ] Publication immédiate
- [ ] Vérification avec comptes tests
- [ ] Communication aux utilisateurs
- [ ] Analyse de l'incident
- [ ] Planification de la correction

---

## 📈 Métriques de Succès

### KPIs Cibles

| Métrique | Cible | Statut | Valeur Actuelle |
|----------|-------|--------|-----------------|
| Taux d'adoption (J+14) | > 80% | ⬜ | _____% |
| Satisfaction utilisateur | > 4/5 | ⬜ | _____ /5 |
| Taux d'erreur | < 1% | ⬜ | _____% |
| Temps de réponse moyen | < 2s | ⬜ | _____s |
| Quiz complétés/jour | > 50 | ⬜ | _____ |
| Disponibilité | > 99% | ⬜ | _____% |

### Rapport de Déploiement

À compléter après J+14 :

**Résumé Exécutif** :
```
[À remplir avec un résumé du déploiement, des défis rencontrés et des succès]
```

**Métriques Finales** :
- Nombre total d'utilisateurs : _____
- Utilisateurs actifs : _____
- Taux d'adoption : _____%
- Incidents critiques : _____
- Tickets support : _____

**Leçons Apprises** :
```
[À remplir avec les leçons apprises du déploiement]
```

**Recommandations** :
```
[À remplir avec des recommandations pour les futurs déploiements]
```

---

## 📞 Contacts et Escalation

### Équipe CyberSensei

- **Support Niveau 1** : _________________________________
- **Support Niveau 2** : _________________________________
- **Support Niveau 3** : _________________________________
- **Email Support** : support@cybersensei.io

### Équipe IT Interne

- **Admin Teams Principal** : _________________________________
- **Admin Azure** : _________________________________
- **Chef de Projet** : _________________________________
- **Manager IT** : _________________________________

### Escalation

| Niveau | Critères | Contact | SLA |
|--------|----------|---------|-----|
| L1 | Questions générales | Support L1 | 24h |
| L2 | Problèmes techniques | Support L2 | 4h |
| L3 | Incidents critiques | Support L3 | 1h |
| Urgent | Production down | Manager IT | Immédiat |

---

## ✅ Signature de Validation

### Validation Technique

- [ ] Toutes les vérifications techniques complétées
- [ ] Tests réussis en environnement de test
- [ ] Package validé et prêt pour la production

**Nom** : _________________________________  
**Rôle** : _________________________________  
**Date** : _________________________________  
**Signature** : _________________________________

### Validation Métier

- [ ] Objectifs métier clairs et validés
- [ ] Communication préparée
- [ ] Budget approuvé (si applicable)

**Nom** : _________________________________  
**Rôle** : _________________________________  
**Date** : _________________________________  
**Signature** : _________________________________

### Validation Déploiement

- [ ] Déploiement effectué avec succès
- [ ] Tests post-déploiement réussis
- [ ] Monitoring en place

**Nom** : _________________________________  
**Rôle** : _________________________________  
**Date** : _________________________________  
**Signature** : _________________________________

---

## 📚 Annexes

### Documents de Référence

- [README.md](../README.md) - Documentation principale
- [teams-deployment.md](./teams-deployment.md) - Guide de déploiement détaillé
- [DEPLOYMENT_E2E_GUIDE.md](../DEPLOYMENT_E2E_GUIDE.md) - Déploiement Azure E2E
- [API_ENDPOINTS_SPECIFICATION.md](../API_ENDPOINTS_SPECIFICATION.md) - Spécifications API

### Scripts Utiles

```powershell
# Générer un package
.\scripts\package-teams-app.ps1 -UseEnv -AutoIncrement

# Tester l'endpoint backend
curl -X POST https://BACKEND_URL/api/auth/teams/exchange

# Vérifier les tabs
curl https://TABS_URL

# Consulter les logs Azure Bot
az webapp log tail --name BOT_NAME --resource-group RG_NAME
```

### Ressources Microsoft

- [Teams Admin Center](https://admin.teams.microsoft.com)
- [Azure Portal](https://portal.azure.com)
- [Teams Developer Portal](https://dev.teams.microsoft.com)
- [Microsoft Teams Documentation](https://docs.microsoft.com/en-us/microsoftteams/)

---

**Version de la Checklist** : 1.0.0  
**Dernière mise à jour** : 21 décembre 2024  
**Auteur** : Équipe CyberSensei

**💡 Conseil** : Imprimez cette checklist ou utilisez-la dans un outil de gestion de projet pour suivre votre progression étape par étape.

