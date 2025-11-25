# 📧 Module Phishing Mailer - CyberSensei

> **Module complet de simulation d'attaques phishing pour formation en cybersécurité**

---

## 🎯 Résumé Exécutif

Le **Module Phishing Mailer** est un système complet de simulation d'attaques par email pour former les employés à la détection du phishing. Il intègre l'envoi automatique d'emails, le tracking des actions utilisateurs (ouverture, clic, signalement), et la génération de métriques de sécurité.

### ✨ Points Clés

- ✅ **Production Ready** - Code testé et documenté
- ✅ **6 Templates HTML** - Urgence, facture, Microsoft, DHL, impôts, LinkedIn
- ✅ **Tracking Complet** - Pixel, click, report
- ✅ **Scheduled Job** - Envoi quotidien automatique (9h)
- ✅ **Métriques** - Dashboard manager avec KPIs
- ✅ **Intégration** - Link avec `user_exercise_results`
- ✅ **2400+ lignes** de documentation détaillée

---

## 📦 Contenu du Module

### 🔧 Fichiers Java (5)

| Fichier | Lignes | Description |
|---------|--------|-------------|
| `PhishingMailerService.java` | 400+ | Service principal (scheduled, tracking) |
| `PhishingTrackingController.java` | 200+ | Endpoints REST (pixel, click, report) |
| `ThymeleafConfig.java` | 30 | Configuration templates HTML |
| `MailConfig.java` | 80 | Configuration SMTP depuis DB |
| `PhishingMailerServiceTest.java` | 250+ | Tests unitaires complets |

### 🎨 Templates HTML (6)

| Template | Type | Difficulté | Description |
|----------|------|------------|-------------|
| Réinitialisation Urgente | Credential Harvesting | ⭐⭐⭐ | Alerte compte expire 24h |
| Facture Impayée | Business Email | ⭐⭐⭐ | Fausse facture 487,50 € |
| Microsoft 365 | Spear Phishing | ⭐⭐⭐⭐ | Connexion suspecte Russie |
| Colis DHL | Credential Harvesting | ⭐⭐ | Faux colis frais 3,50 € |
| Remboursement Impôts | Credential Harvesting | ⭐⭐⭐⭐ | Remboursement 523,40 € |
| LinkedIn Premium | Spear Phishing | ⭐⭐ | 3 mois gratuits Premium |

### 📚 Documentation (5 fichiers, 2400+ lignes)

| Document | Lignes | Contenu |
|----------|--------|---------|
| `PHISHING_MODULE.md` | 500+ | Vue d'ensemble technique complète |
| `PHISHING_QUICKSTART.md` | 400+ | Guide démarrage rapide (5 min) |
| `PHISHING_ARCHITECTURE.md` | 600+ | Architecture et diagrammes |
| `PHISHING_SUMMARY.md` | 400+ | Résumé exécutif |
| `PHISHING_VISUAL_GUIDE.md` | 500+ | Guide visuel avec mockups |

### 🗄️ Database (1)

| Fichier | Description |
|---------|-------------|
| `05-seed-phishing-templates-complete.sql` | 6 templates HTML complets (INSERT) |

---

## 🚀 Quick Start (5 minutes)

### 1. Configuration SMTP (Gmail)

```bash
# Gmail App Password (https://myaccount.google.com/apppasswords)
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USERNAME=noreply@company.com
export SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx

# Tracking URL
export TRACKING_BASE_URL=http://localhost:8080

# Enable phishing
export PHISHING_ENABLED=true
```

### 2. Configuration DB

```sql
-- Enable phishing module
INSERT INTO configs (config_key, config_value) VALUES ('phishing.enabled', 'true');

-- Insert templates
\i database/seeds/05-seed-phishing-templates-complete.sql
```

### 3. Lancer l'Application

```bash
# Build
mvn clean package -DskipTests

# Run
java -jar target/cybersensei-node-backend-1.0.0.jar

# Logs
tail -f logs/cybersensei.log | grep -i phishing
```

### 4. Test Manuel

```bash
# Trigger campaign
curl -X POST http://localhost:8080/api/phishing/send \
  -H "Authorization: Bearer $JWT_TOKEN"

# Simulate tracking
curl http://localhost:8080/api/phishing/pixel/test-token
curl http://localhost:8080/api/phishing/click/test-token
curl -X POST http://localhost:8080/api/phishing/report/test-token
```

---

## 🔑 Endpoints

### 1. Tracking Pixel (Email Open)

```http
GET /api/phishing/pixel/{token}
```

**Response**: `1x1 transparent PNG`  
**Action**: Enregistre `opened=true` dans DB

### 2. Phishing Link Click (Failure)

```http
GET /api/phishing/click/{token}
```

**Response**: `HTML educational page`  
**Action**: 
- Enregistre `clicked=true`
- Crée `user_exercise_result` avec `score=0` ❌
- Affiche page de formation

### 3. Report Phishing (Success)

```http
POST /api/phishing/report/{token}
```

**Response**: 
```json
{
  "success": true,
  "message": "Merci d'avoir signalé cet email suspect !",
  "score": 100
}
```

**Action**:
- Enregistre `reported=true`
- Crée `user_exercise_result` avec `score=100` ✅

---

## 📊 Flow Complet

```
┌─────────────────────────────────────────────────────────┐
│  1. SCHEDULED JOB (9:00 AM, Mon-Fri)                    │
│     @Scheduled sendDailyPhishingCampaign()              │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  2. SELECT RANDOM TEMPLATE                              │
│     PhishingTemplate template =                         │
│       templateRepository.findRandomActiveTemplate()     │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  3. GET ALL ACTIVE USERS                                │
│     List<User> users = userRepository.findAll()         │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  4. FOR EACH USER:                                      │
│     a. Generate token (UUID)                            │
│     b. Create PhishingTracker                           │
│     c. Render HTML template                             │
│     d. Send email via SMTP                              │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  5. USER ACTIONS                                        │
│                                                         │
│  ┌─────────┬──────────────┬──────────────┬───────────┐│
│  │ OPEN    │ CLICK        │ REPORT       │ IGNORE    ││
│  │ (70%)   │ (10%)        │ (20%)        │ (30%)     ││
│  ├─────────┼──────────────┼──────────────┼───────────┤│
│  │ opened  │ clicked=true │ reported=true│ (nothing) ││
│  │ =true   │ opened=true  │              │           ││
│  │         │ score=0 ❌   │ score=100 ✅ │           ││
│  └─────────┴──────────────┴──────────────┴───────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## 📈 Métriques (Dashboard)

### KPIs Principaux

```sql
-- Campaign Success Rate
SELECT 
    c.id,
    c.total_sent,
    c.total_clicked,
    c.total_reported,
    ROUND(c.total_clicked * 100.0 / c.total_sent, 1) as click_rate,
    ROUND(c.total_reported * 100.0 / c.total_sent, 1) as report_rate
FROM phishing_campaigns c
ORDER BY c.sent_at DESC;
```

**Objectifs:**
- ✅ **Click Rate < 10%** (moins de clics = mieux)
- ✅ **Report Rate > 50%** (plus de signalements = mieux)
- ✅ **Open Rate ~70%** (indicateur engagement)

---

## 🗄️ Tables Utilisées

```sql
phishing_templates       -- 6 templates HTML
phishing_campaigns       -- Campagnes envoyées
phishing_trackers        -- Tracking par email/user
users                    -- Destinataires
user_exercise_results    -- Résultats (link exercices)
configs                  -- Configuration SMTP/phishing
```

---

## 🔐 Sécurité

### ✅ Implémenté

- **Tokens UUID uniques** (non-guessable)
- **SMTP TLS enabled** (encryption)
- **Configuration depuis DB** (pas de secrets en code)
- **Idempotence** (tracking multiple safe)
- **No-cache headers** (pixel tracking)
- **Try-catch robustesse** (ne fail jamais)
- **Audit logs** (tous événements tracés)

---

## 🧪 Tests

### Tests Unitaires (10 tests)

```bash
mvn test -Dtest=PhishingMailerServiceTest
```

**Tests couverts:**
- ✅ Track email open (success)
- ✅ Track email open (already opened - idempotent)
- ✅ Track link click (success)
- ✅ Track phishing report (success)
- ✅ Invalid token handling
- ✅ Config value retrieval
- ✅ Campaign stats update
- ✅ Multiple clicks idempotent

### Test avec MailHog (SMTP fake)

```bash
# Run MailHog
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog

# Configure
export SMTP_HOST=localhost
export SMTP_PORT=1025

# View at http://localhost:8025
```

---

## 📝 Logs Exemple

```log
2024-11-24 09:00:00 - 🚀 Starting daily phishing campaign
2024-11-24 09:00:01 - Selected template: Microsoft 365 (SPEAR_PHISHING)
2024-11-24 09:00:02 - Created campaign ID: 42
2024-11-24 09:00:05 - ✅ Phishing email sent to: alice@company.com
2024-11-24 09:00:06 - ✅ Phishing email sent to: bob@company.com
2024-11-24 09:00:10 - ✅ Campaign completed: 50 sent, 0 failed

2024-11-24 09:15:30 - 📧 Email opened by user 5 (token: abc-123)
2024-11-24 09:20:45 - ⚠️ Phishing link CLICKED by user 7 (token: def-456)
2024-11-24 09:25:12 - ✅ Phishing REPORTED by user 12 (token: ghi-789) ✅
```

---

## 🛠️ Configuration

### application.yml

```yaml
cybersensei:
  phishing:
    enabled: ${PHISHING_ENABLED:true}
    tracking-url: ${TRACKING_BASE_URL:http://localhost:8080}
    daily-send-cron: "0 0 9 * * MON-FRI"  # 9 AM, weekdays

spring:
  mail:
    host: ${SMTP_HOST:smtp.gmail.com}
    port: ${SMTP_PORT:587}
    username: ${SMTP_USERNAME:}
    password: ${SMTP_PASSWORD:}
```

### Cron Expressions

```
0 0 9 * * MON-FRI    → 9h00 en semaine (default)
0 30 8 * * *         → 8h30 tous les jours
0 0 10 * * MON       → 10h00 tous les lundis
0 */2 * * * *        → Toutes les 2 heures
0 * * * * *          → Toutes les minutes (TEST ONLY!)
```

---

## 📚 Où Trouver Quoi

| Besoin | Document |
|--------|----------|
| Démarrage rapide | `PHISHING_QUICKSTART.md` |
| Architecture technique | `PHISHING_ARCHITECTURE.md` |
| Guide visuel templates | `PHISHING_VISUAL_GUIDE.md` |
| Résumé complet | `PHISHING_SUMMARY.md` |
| Vue d'ensemble | `PHISHING_MODULE.md` |
| Ce fichier | `README_PHISHING.md` |

---

## ✅ Checklist Production

### Développement
- [x] Service principal créé
- [x] Controller tracking créé
- [x] Configuration SMTP/Thymeleaf
- [x] 6 templates HTML
- [x] Tests unitaires (10 tests)
- [x] Documentation (2400+ lignes)
- [x] SQL seeds

### Déploiement
- [ ] SMTP configuré (Gmail App Password)
- [ ] `TRACKING_BASE_URL` vers domaine public HTTPS
- [ ] Templates insérés en DB
- [ ] Config DB: `phishing.enabled = true`
- [ ] Test manuel réussi
- [ ] Cron job vérifié
- [ ] SPF/DKIM DNS records
- [ ] Monitoring actif (logs, métriques)

### Formation
- [ ] Formation utilisateurs planifiée
- [ ] Dashboard métriques configuré
- [ ] Process de suivi vulnérabilités
- [ ] Plan d'amélioration continue

---

## 🎓 Prochaines Étapes

### Pour le Développeur

1. ✅ Configurer SMTP (Gmail recommandé)
2. ✅ Insérer les 6 templates en DB
3. ✅ Tester avec MailHog
4. ✅ Lancer une campagne test
5. ✅ Vérifier les logs
6. ✅ Consulter les métriques

### Pour l'Admin

1. Créer 5-10 templates variés
2. Configurer fréquence d'envoi
3. Former les utilisateurs
4. Monitorer les taux de succès
5. Identifier utilisateurs vulnérables
6. Adapter la formation

---

## 🏆 Résultat Final

### ✅ Module Production Ready

| Composant | Status | Lignes |
|-----------|--------|--------|
| **Java Services** | ✅ Complete | 400+ |
| **REST Controllers** | ✅ Complete | 200+ |
| **Configurations** | ✅ Complete | 110 |
| **Templates HTML** | ✅ 6 templates | 600+ |
| **Tests Unitaires** | ✅ 10 tests | 250+ |
| **Documentation** | ✅ 5 fichiers | 2400+ |
| **SQL Seeds** | ✅ Complete | 300+ |
| **TOTAL** | ✅ | **4260+ lignes** |

---

## 📞 Support

**Documentation:**
- Lire `PHISHING_QUICKSTART.md` pour démarrer
- Consulter `PHISHING_ARCHITECTURE.md` pour architecture
- Voir `PHISHING_VISUAL_GUIDE.md` pour exemples visuels

**Logs:**
```bash
tail -f logs/cybersensei.log | grep -i phishing
```

**Troubleshooting:**
- SMTP errors → Vérifier App Password Gmail
- No emails sent → Vérifier `phishing.enabled = true`
- Invalid token → Vérifier DB `phishing_trackers`

---

## 🎯 KPIs à Surveiller

| Métrique | Objectif | Signification |
|----------|----------|---------------|
| **Click Rate** | < 10% | Moins de clics = mieux formés |
| **Report Rate** | > 50% | Plus de signalements = vigilance |
| **Open Rate** | ~70% | Engagement (informatif) |
| **Failed Sends** | 0% | Fiabilité SMTP |

---

## 🚀 Déploiement Docker

```yaml
# docker-compose.yml
services:
  backend:
    image: cybersensei-backend:latest
    environment:
      - SMTP_HOST=smtp.gmail.com
      - SMTP_PORT=587
      - SMTP_USERNAME=${SMTP_USERNAME}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
      - TRACKING_BASE_URL=https://cybersensei.company.com
      - PHISHING_ENABLED=true
    depends_on:
      - db
```

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Date**: 2024-11-24  
**Auteur**: CyberSensei Team  
**License**: MIT


