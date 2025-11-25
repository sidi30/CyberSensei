# 📧 Module Phishing Mailer - Guide Visuel

## 🎨 Templates Disponibles

### 📋 Vue d'Ensemble

| # | Template | Type | Objectif | Difficulté |
|---|----------|------|----------|------------|
| 1 | Réinitialisation Urgente | Credential Harvesting | Créer urgence | ⭐⭐⭐ |
| 2 | Facture Impayée | Business Email | Pression financière | ⭐⭐⭐ |
| 3 | Microsoft 365 | Spear Phishing | Imiter service réel | ⭐⭐⭐⭐ |
| 4 | Colis DHL | Credential Harvesting | Faux colis | ⭐⭐ |
| 5 | Remboursement Impôts | Credential Harvesting | Appât financier | ⭐⭐⭐⭐ |
| 6 | LinkedIn Premium | Spear Phishing | Offre gratuite | ⭐⭐ |

---

## 🖼️ Template 1: Réinitialisation Urgente

```
┌─────────────────────────────────────────┐
│  ⚠️ ALERTE SÉCURITÉ                    │ ← Header rouge
├─────────────────────────────────────────┤
│                                         │
│  Cher(e) **Alice Martin**,              │
│                                         │
│  Votre compte alice@company.com expire  │
│  dans **24 heures**.                    │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  [Vérifier mon compte]            │ │ ← Bouton vert
│  └───────────────────────────────────┘ │
│                                         │
│  ⚠️ Si vous ne vérifiez pas, suppression│
│                                         │
├─────────────────────────────────────────┤
│  Service Informatique                   │ ← Footer
└─────────────────────────────────────────┘
     [tracking pixel 1x1]
```

**Indicateurs de phishing:**
- ❌ Urgence exagérée ("24 heures")
- ❌ Menace de suppression
- ❌ Bouton vert suspect
- ❌ "Ne pas répondre"

---

## 🖼️ Template 2: Facture Impayée

```
┌─────────────────────────────────────────┐
│  📧 Facture en attente                  │ ← Header bleu
├─────────────────────────────────────────┤
│                                         │
│  Bonjour **Bob Dupont**,                │
│                                         │
│  Facture de **487,50 €** en attente     │
│                                         │
│  ┌───────────┬────────────────────────┐│
│  │ Numéro    │ INV-2024-5847          ││
│  │ Date      │ 24/11/2024             ││
│  │ Montant   │ 487,50 € 🔴           ││
│  └───────────┴────────────────────────┘│
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  [Télécharger la facture]  🟠    │ │ ← Bouton orange
│  └───────────────────────────────────┘ │
│                                         │
│  ⚠️ Frais supplémentaires sous 48h     │
│                                         │
├─────────────────────────────────────────┤
│  Service Comptabilité                   │
└─────────────────────────────────────────┘
     [tracking pixel 1x1]
```

**Indicateurs de phishing:**
- ❌ Facture non sollicitée
- ❌ Montant précis suspect (487,50 €)
- ❌ Urgence (48h)
- ❌ "Télécharger" = risque malware

---

## 🖼️ Template 3: Microsoft 365

```
┌─────────────────────────────────────────┐
│  Microsoft 365                          │ ← Header bleu Microsoft
├─────────────────────────────────────────┤
│                                         │
│  Bonjour **Charlie Dubois**,            │
│                                         │
│  🔔 Connexion inhabituelle détectée     │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 📍 Localisation: Russie (Moscou) │ │ ← Alerte orange
│  │ 🕐 Heure: 03:47                   │ │
│  │ 💻 Appareil: Chrome/Windows       │ │
│  └───────────────────────────────────┘ │
│                                         │
│  **Était-ce vous ?**                    │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  [Sécuriser mon compte]           │ │ ← Bouton bleu MS
│  └───────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│  Microsoft Corporation                  │
│  One Microsoft Way, Redmond, WA         │
└─────────────────────────────────────────┘
     [tracking pixel 1x1]
```

**Indicateurs de phishing:**
- ⚠️ Design très réaliste (dangereux!)
- ❌ Localisation effrayante (Russie)
- ❌ Heure suspecte (03:47)
- ✅ Mais: Microsoft ne demande jamais de cliquer

---

## 🖼️ Template 4: Colis DHL

```
┌─────────────────────────────────────────┐
│  DHL Express 🟨                         │ ← Header jaune/rouge
├─────────────────────────────────────────┤
│                                         │
│  Bonjour **Diana Rousseau**,            │
│                                         │
│  📦 Colis #DHL847592847 en attente      │
│                                         │
│  Statut: ⏳ En attente                  │
│  Frais de douane: **3,50 €**           │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  [Payer et suivre]  🔴           │ │ ← Bouton rouge DHL
│  └───────────────────────────────────┘ │
│                                         │
│  ⚠️ Retour expéditeur sous 48h          │
│                                         │
├─────────────────────────────────────────┤
│  DHL Express - Service Client           │
└─────────────────────────────────────────┘
     [tracking pixel 1x1]
```

**Indicateurs de phishing:**
- ❌ Colis non commandé
- ❌ Frais minimes (3,50 €) = appât
- ❌ Urgence (48h)
- ✅ DHL utilise toujours son site officiel

---

## 🖼️ Template 5: Remboursement Impôts

```
┌─────────────────────────────────────────┐
│  🇫🇷 RÉPUBLIQUE FRANÇAISE                │ ← Header bleu marine
│  Direction Générale des Finances        │
├─────────────────────────────────────────┤
│                                         │
│  Madame, Monsieur **Emma Bernard**,     │
│                                         │
│  Suite vérification fiscale:            │
│  Trop-perçu d'impôts constaté           │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Montant du remboursement         │ │ ← Box verte
│  │  💰 **523,40 €**                  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  [Percevoir mon remboursement]    │ │ ← Bouton bleu
│  └───────────────────────────────────┘ │
│                                         │
│  Numéro de dossier: 2024-FR-xxx         │
│                                         │
├─────────────────────────────────────────┤
│  Ministère de l'Économie                │
└─────────────────────────────────────────┘
     [tracking pixel 1x1]
```

**Indicateurs de phishing:**
- ❌ Remboursement non attendu
- ❌ Montant précis (523,40 €)
- ❌ Demande coordonnées bancaires
- ✅ Impots.gouv.fr utilise TOUJOURS son espace sécurisé

---

## 🖼️ Template 6: LinkedIn Premium

```
┌─────────────────────────────────────────┐
│  in  LinkedIn                           │ ← Header bleu LinkedIn
├─────────────────────────────────────────┤
│                                         │
│  Bonjour **Frank Martin**,              │
│                                         │
│  🎉 Vous êtes sélectionné(e) pour:      │
│  **3 mois gratuits LinkedIn Premium**   │
│                                         │
│  ✨ Avantages:                           │
│  • InMail illimités                     │
│  • Voir qui a vu votre profil           │
│  • Formations en ligne                  │
│  • Badge Premium                        │
│                                         │
│  ⚠️ Limité aux 500 premiers             │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  [Activer LinkedIn Premium]       │ │ ← Bouton bleu
│  └───────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│  © 2024 LinkedIn Corporation            │
└─────────────────────────────────────────┘
     [tracking pixel 1x1]
```

**Indicateurs de phishing:**
- ❌ "Sélectionné" = faux sentiment d'exclusivité
- ❌ Limitation artificielle ("500 premiers")
- ❌ Offre trop belle
- ✅ LinkedIn envoie depuis @linkedin.com

---

## 📊 Flow Utilisateur

### Scenario 1: User Opens Email (70%)

```
User opens email
     ↓
📧 Tracking Pixel loads
     ↓
GET /api/phishing/pixel/{token}
     ↓
Database: opened = true ✅
     ↓
Campaign stats updated
     ↓
[No exercise result created]
```

### Scenario 2: User Clicks Link (10% - FAIL ❌)

```
User clicks phishing link
     ↓
GET /api/phishing/click/{token}
     ↓
Database: clicked = true ❌
Database: opened = true
     ↓
Create exercise_result:
  - score = 0.0
  - success = false
     ↓
Show educational page:

┌────────────────────────────────────┐
│  ⚠️ Attention !                    │
│  Vous avez cliqué sur un phishing  │
│                                    │
│  Score : 0/100 ❌                  │
│                                    │
│  🛡️ Comment se protéger:           │
│  ✓ Vérifier l'expéditeur           │
│  ✓ Survoler les liens              │
│  ✓ Méfiance urgence                │
│  ✓ Pas d'identifiants par email    │
│  ✓ Contacter IT si doute           │
│  ✓ Activer 2FA                     │
│                                    │
│  [📚 Formation]                    │
└────────────────────────────────────┘
```

### Scenario 3: User Reports Email (20% - PASS ✅)

```
User identifies phishing
     ↓
Clicks "Report Phishing" button
     ↓
POST /api/phishing/report/{token}
     ↓
Database: reported = true ✅
     ↓
Create exercise_result:
  - score = 100.0
  - success = true
     ↓
Return JSON:
{
  "success": true,
  "message": "Merci ! Vigilance ++",
  "score": 100
}
```

---

## 📈 Dashboard Manager (Métriques)

```
╔════════════════════════════════════════════════════════════╗
║  📊 CAMPAGNE PHISHING - 24/11/2024                        ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Template: Microsoft 365 - Activité suspecte              ║
║  Envoyés: 50 emails                                        ║
║                                                            ║
║  ┌────────────┬──────────┬───────────┐                    ║
║  │ Métrique   │ Count    │ Rate      │                    ║
║  ├────────────┼──────────┼───────────┤                    ║
║  │ Ouverts    │ 35       │ 70%  📧   │                    ║
║  │ Cliqués    │ 5        │ 10%  ❌   │ ← À réduire       ║
║  │ Signalés   │ 10       │ 20%  ✅   │ ← À augmenter     ║
║  │ Ignorés    │ 30       │ 60%  ➖   │                    ║
║  └────────────┴──────────┴───────────┘                    ║
║                                                            ║
║  🎯 OBJECTIF: Click Rate < 10%, Report Rate > 50%         ║
║                                                            ║
║  👥 UTILISATEURS LES PLUS VULNÉRABLES:                     ║
║  1. Alice Martin (3 clics / 5 emails) 🔴                  ║
║  2. Bob Dupont (2 clics / 5 emails) 🟠                    ║
║  3. Charlie Dubois (1 clic / 5 emails) 🟡                 ║
║                                                            ║
║  ✅ MEILLEURS DÉTECTEURS:                                  ║
║  1. Diana Rousseau (5 signalements / 5) 🏆               ║
║  2. Emma Bernard (4 signalements / 5) 🥈                  ║
║  3. Frank Martin (3 signalements / 5) 🥉                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

---

## 🔧 Configuration Rapide (Copy-Paste)

### 1. Variables d'Environnement

```bash
# Gmail SMTP
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USERNAME=noreply@company.com
export SMTP_PASSWORD=your-app-password-here

# Tracking
export TRACKING_BASE_URL=http://localhost:8080

# Features
export PHISHING_ENABLED=true
```

### 2. Configuration DB

```sql
-- Enable phishing
INSERT INTO configs (config_key, config_value) VALUES 
('phishing.enabled', 'true'),
('smtp.host', 'smtp.gmail.com'),
('smtp.port', '587'),
('smtp.username', 'noreply@company.com'),
('smtp.password', 'your-app-password'),
('smtp.from_email', 'noreply@cybersensei.io'),
('smtp.from_name', 'CyberSensei'),
('company.name', 'CyberSensei Demo');
```

### 3. Insérer Templates

```bash
# Execute SQL file
psql -U cybersensei -d cybersensei -f database/seeds/05-seed-phishing-templates-complete.sql
```

### 4. Test Immédiat

```bash
# Trigger manual campaign
curl -X POST http://localhost:8080/api/phishing/send \
  -H "Authorization: Bearer $JWT_TOKEN"

# Simulate tracking
curl http://localhost:8080/api/phishing/pixel/test-token-123
curl http://localhost:8080/api/phishing/click/test-token-123
curl -X POST http://localhost:8080/api/phishing/report/test-token-123
```

---

## 📚 Documentation Complète

| Document | Description | Lignes |
|----------|-------------|--------|
| `PHISHING_MODULE.md` | Vue d'ensemble technique | 500+ |
| `PHISHING_QUICKSTART.md` | Guide 5 minutes | 400+ |
| `PHISHING_ARCHITECTURE.md` | Architecture détaillée | 600+ |
| `PHISHING_SUMMARY.md` | Résumé exécutif | 400+ |
| `PHISHING_VISUAL_GUIDE.md` | Ce fichier (visuel) | 500+ |

**Total: 2400+ lignes de documentation** 📚

---

## ✅ Checklist Finale

### Développeur

- [x] PhishingMailerService.java créé (400+ lignes)
- [x] PhishingTrackingController.java créé (200+ lignes)
- [x] ThymeleafConfig.java créé
- [x] MailConfig.java créé
- [x] 6 templates HTML créés
- [x] application.yml configuré
- [x] pom.xml mis à jour (Thymeleaf)
- [x] Tests unitaires créés
- [x] Documentation complète (2400+ lignes)
- [x] SQL seeds avec templates complets

### Admin

- [ ] SMTP configuré (Gmail App Password)
- [ ] Templates insérés en DB
- [ ] Configuration DB (phishing.enabled = true)
- [ ] Test manuel réussi
- [ ] Cron job vérifié (9h)
- [ ] Dashboard métriques configuré
- [ ] Formation utilisateurs planifiée

---

**Status**: ✅ Module Production Ready  
**Version**: 1.0.0  
**Date**: 2024-11-24


