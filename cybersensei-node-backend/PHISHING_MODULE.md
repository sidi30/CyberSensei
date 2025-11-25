# 📧 Module Phishing Mailer - Documentation

## 🎯 Vue d'Ensemble

Module complet de phishing training pour CyberSensei avec :
- ✅ Configuration SMTP depuis la base de données
- ✅ Templates HTML Thymeleaf
- ✅ Tracking pixels et liens uniques
- ✅ Cron job automatique (9h du matin, lundi-vendredi)
- ✅ Métriques complètes (ouverture, clic, signalement)
- ✅ Intégration avec `user_exercise_results`

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│         PhishingMailerService                   │
│  - sendDailyPhishingCampaign() [@Scheduled]     │
│  - sendPhishingEmail()                          │
│  - trackEmailOpen()                             │
│  - trackLinkClick()                             │
│  - trackPhishingReport()                        │
└───────────────┬─────────────────────────────────┘
                │
                ├── JavaMailSender (SMTP)
                ├── TemplateEngine (Thymeleaf)
                └── Repositories (DB)
                
┌─────────────────────────────────────────────────┐
│      PhishingTrackingController                 │
│  GET  /api/phishing/pixel/{token}               │
│  GET  /api/phishing/click/{token}               │
│  POST /api/phishing/report/{token}              │
└─────────────────────────────────────────────────┘
```

---

## 📋 Composants Créés

### 1. **PhishingMailerService.java** (400+ lignes)

**Responsabilités:**
- Envoi d'emails avec templates Thymeleaf
- Génération de tokens uniques (UUID)
- Tracking des événements (open, click, report)
- Job schedulé quotidien
- Intégration avec `user_exercise_results`

**Méthodes principales:**

```java
// Scheduled job (9:00 AM, Mon-Fri)
@Scheduled(cron = "0 0 9 * * MON-FRI")
public void sendDailyPhishingCampaign()

// Send email to one user
public void sendPhishingEmail(User user, PhishingTemplate template, PhishingCampaign campaign)

// Track events
public void trackEmailOpen(String token)
public PhishingTracker trackLinkClick(String token)
public void trackPhishingReport(String token)

// Manual trigger (for testing)
public void triggerManualCampaign(Long templateId)
```

**Configuration SMTP depuis DB:**
```java
// Récupère depuis table `configs`
- smtp.host
- smtp.port
- smtp.username
- smtp.password
- smtp.from_email
- smtp.from_name
- company.name
```

### 2. **PhishingTrackingController.java**

**Endpoints:**

#### GET /api/phishing/pixel/{token}
```bash
curl http://localhost:8080/api/phishing/pixel/abc-123-def
# Returns: 1x1 transparent PNG
# Action: Records email open event
```

**Implémentation:**
- Retourne PNG 1x1 transparent (Base64 décodé)
- Enregistre `opened=true` dans `phishing_trackers`
- Headers: `no-cache` pour éviter le cache
- Ne fail jamais (même si token invalide)

#### GET /api/phishing/click/{token}
```bash
curl http://localhost:8080/api/phishing/click/abc-123-def
# Returns: HTML educational page
# Action: Records click + creates exercise result (FAILED)
```

**Page éducative:**
- ⚠️ Warning header animé
- Score: 0/100 (échec)
- 6 tips de protection
- Bouton CTA vers formation
- Design moderne et responsive
- Animation CSS

#### POST /api/phishing/report/{token}
```bash
curl -X POST http://localhost:8080/api/phishing/report/abc-123-def
# Returns: {"success": true, "message": "...", "score": 100}
# Action: Records report + creates exercise result (PASSED)
```

### 3. **Templates Thymeleaf** (4 fichiers)

#### phishing-email-base.html
Template de base réutilisable avec :
- Header personnalisable
- Content block (th:block)
- Footer
- Tracking pixel intégré

**Variables:**
- `${emailTitle}`
- `${userName}`
- `${companyName}`
- `${trackingPixel}`
- `${phishingLink}`

#### phishing-urgent-password.html
🔴 **Template "Réinitialisation Urgente"**
- Header rouge alerte
- Urgence 24h
- Bouton vert "Vérifier mon compte"
- Tracking pixel

#### phishing-fake-invoice.html
📄 **Template "Facture Impayée"**
- Header bleu professionnel
- Tableau avec détails facture
- Montant: 487,50 €
- Bouton orange "Télécharger"

#### phishing-microsoft365.html
💼 **Template "Microsoft 365 Alert"**
- Design Microsoft authentique
- Connexion suspecte (Russie)
- Détails: location, heure, appareil
- Bouton bleu Microsoft

**Utilisation:**
```java
Context context = new Context();
context.setVariable("userName", "Alice");
context.setVariable("trackingPixel", "http://...");
context.setVariable("phishingLink", "http://...");

String html = templateEngine.process("phishing-urgent-password", context);
```

### 4. **Configuration Classes**

#### ThymeleafConfig.java
```java
@Bean
public SpringResourceTemplateResolver emailTemplateResolver()
    - Prefix: classpath:/templates/
    - Suffix: .html
    - Mode: HTML
    - Encoding: UTF-8
    - Cache: false (dev)

@Bean
public SpringTemplateEngine templateEngine()
```

#### MailConfig.java
```java
@Bean
public JavaMailSender javaMailSender()
    - Load SMTP from DB (configs table)
    - Fallback to application.yml
    - Properties: TLS, auth, timeouts
```

---

## 🔄 Flow Complet

### 1. **Campaign Scheduling**

```
09:00 AM (Mon-Fri)
    ↓
@Scheduled triggers sendDailyPhishingCampaign()
    ↓
Check config: phishing.enabled = true
    ↓
Select random PhishingTemplate
    ↓
Get all active Users
    ↓
Create PhishingCampaign
    ↓
For each user:
    - Generate unique token (UUID)
    - Create PhishingTracker
    - Render HTML template
    - Send email via SMTP
    ↓
Log success/failure
```

### 2. **Email Tracking**

```
User receives email
    ↓
Opens email
    ↓
Loads tracking pixel
    ↓
GET /api/phishing/pixel/{token}
    ↓
PhishingMailerService.trackEmailOpen(token)
    ↓
Update phishing_trackers:
    - opened = true
    - opened_at = NOW()
    ↓
Update campaign stats
```

### 3. **Link Click (Failure)**

```
User clicks phishing link
    ↓
GET /api/phishing/click/{token}
    ↓
PhishingMailerService.trackLinkClick(token)
    ↓
Update phishing_trackers:
    - clicked = true
    - clicked_at = NOW()
    - opened = true (if not already)
    ↓
Update campaign stats
    ↓
Create user_exercise_results:
    - score = 0.0
    - success = false
    - duration = time since sent
    - detailsJSON = {campaignId, action: "clicked"}
    ↓
Return educational HTML page
```

### 4. **Report Phishing (Success)**

```
User reports email as suspicious
    ↓
POST /api/phishing/report/{token}
    ↓
PhishingMailerService.trackPhishingReport(token)
    ↓
Update phishing_trackers:
    - reported = true
    - reported_at = NOW()
    ↓
Update campaign stats
    ↓
Create user_exercise_results:
    - score = 100.0
    - success = true
    - duration = time since sent
    - detailsJSON = {campaignId, action: "reported"}
    ↓
Return {"success": true, "score": 100}
```

---

## 🗄️ Base de Données

### Interactions

**Tables utilisées:**
```sql
-- Configuration
configs (smtp.*, phishing.*, company.*)

-- Templates
phishing_templates (label, htmlContent, subject, type)

-- Campaigns
phishing_campaigns (templateId, totalSent, totalClicked, totalOpened, totalReported)

-- Tracking
phishing_trackers (token, userId, campaignId, clicked, opened, reported, timestamps)

-- Users
users (id, email, name, active)

-- Results
user_exercise_results (userId, exerciseId, score, success, duration, detailsJSON)
```

**Requêtes custom:**
```java
trackerRepository.countClickedByCampaignId(campaignId)
trackerRepository.countOpenedByCampaignId(campaignId)
trackerRepository.countReportedByCampaignId(campaignId)
templateRepository.findRandomActiveTemplate()
```

---

## ⚙️ Configuration

### application.yml

```yaml
cybersensei:
  phishing:
    tracking-url: ${TRACKING_URL:http://localhost:8080}
    daily-send-cron: "0 0 9 * * MON-FRI"  # 9 AM, weekdays
    enabled: ${PHISHING_ENABLED:true}

spring:
  mail:
    host: ${SMTP_HOST:smtp.gmail.com}
    port: ${SMTP_PORT:587}
    username: ${SMTP_USERNAME:}
    password: ${SMTP_PASSWORD:}
```

### Database Configs

```sql
INSERT INTO configs (config_key, config_value) VALUES
('phishing.enabled', 'true'),
('smtp.host', 'smtp.gmail.com'),
('smtp.port', '587'),
('smtp.username', 'noreply@company.com'),
('smtp.password', 'app-password'),
('smtp.from_email', 'noreply@cybersensei.io'),
('smtp.from_name', 'CyberSensei Platform'),
('company.name', 'CyberSensei Demo');
```

---

## 🧪 Testing

### Test Manuel

```bash
# 1. Créer un template
POST /api/admin/phishing/templates
{
  "label": "Test Template",
  "subject": "Test Email",
  "htmlContent": "<p>Hello {{USER_NAME}}</p>...",
  "textContent": "Hello",
  "type": "SPEAR_PHISHING"
}

# 2. Trigger manuel
POST /api/phishing/send
# Envoie immédiatement une campagne

# 3. Vérifier tracking
GET /api/phishing/pixel/{token}
GET /api/phishing/click/{token}
POST /api/phishing/report/{token}

# 4. Consulter résultats
GET /api/phishing/results
```

### Test Scheduled Job

```java
// Dans PhishingMailerService
// Changer le cron temporairement:
@Scheduled(cron = "0 * * * * *")  // Every minute (for testing)
public void sendDailyPhishingCampaign() { ... }
```

### Test avec MailHog (SMTP fake)

```bash
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog

# Configure
spring.mail.host=localhost
spring.mail.port=1025

# View emails at http://localhost:8025
```

---

## 📊 Métriques

### Dashboard Manager

```sql
-- Campaign success rate
SELECT 
    c.id,
    c.total_sent,
    c.total_clicked,
    c.total_reported,
    (c.total_clicked * 100.0 / c.total_sent) as click_rate,
    (c.total_reported * 100.0 / c.total_sent) as report_rate
FROM phishing_campaigns c
ORDER BY c.sent_at DESC;

-- User vulnerability
SELECT 
    u.name,
    COUNT(CASE WHEN t.clicked THEN 1 END) as clicks,
    COUNT(CASE WHEN t.reported THEN 1 END) as reports,
    COUNT(*) as total_received
FROM users u
JOIN phishing_trackers t ON t.user_id = u.id
GROUP BY u.id, u.name;
```

---

## 🛡️ Sécurité

### Best Practices Implémentées

✅ **Tokens UUID uniques** (non-guessable)
✅ **One-time tracking** (idempotent)
✅ **No cache headers** pour tracking pixel
✅ **SMTP TLS** enabled
✅ **Database config** (pas de secrets en code)
✅ **Try-catch** pour ne jamais fail
✅ **Logging audit** de tous les événements

### Production Checklist

- [ ] Configurer SMTP réel (Gmail App Password, SendGrid, etc.)
- [ ] Changer `TRACKING_URL` vers domaine public
- [ ] Activer cache Thymeleaf (`cacheable=true`)
- [ ] Monitorer taux d'envoi (rate limiting)
- [ ] Backup DB avant campagnes
- [ ] GDPR compliance (consentement utilisateurs)

---

## 🚀 Déploiement

### 1. Configurer SMTP

```bash
# Gmail (App Password required)
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USERNAME=noreply@company.com
export SMTP_PASSWORD=app-password

# SendGrid
export SMTP_HOST=smtp.sendgrid.net
export SMTP_PORT=587
export SMTP_USERNAME=apikey
export SMTP_PASSWORD=SG.xxxxx

# Office 365
export SMTP_HOST=smtp.office365.com
export SMTP_PORT=587
```

### 2. Configurer Tracking URL

```bash
export TRACKING_URL=https://cybersensei.company.com
```

### 3. Activer Phishing

```sql
UPDATE configs SET config_value = 'true' WHERE config_key = 'phishing.enabled';
```

### 4. Tester

```bash
# Logs
tail -f logs/cybersensei.log | grep Phishing

# Force trigger
curl -X POST http://localhost:8080/api/phishing/send \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📚 Exemples d'Utilisation

### Créer un Template Custom

```java
PhishingTemplate template = PhishingTemplate.builder()
    .label("Custom Template")
    .subject("Important: Action Required")
    .htmlContent("""
        <p>Hello {{USER_NAME}},</p>
        <p>Click here: <a href="{{PHISHING_LINK}}">Link</a></p>
        <img src="{{TRACKING_PIXEL}}" width="1" height="1">
    """)
    .textContent("Hello {{USER_NAME}}")
    .type(PhishingType.SPEAR_PHISHING)
    .active(true)
    .build();

templateRepository.save(template);
```

### Trigger Programmatique

```java
@Autowired
private PhishingMailerService phishingMailerService;

// Trigger avec template spécifique
phishingMailerService.triggerManualCampaign(templateId);
```

---

## 📖 Ressources

- [Thymeleaf Docs](https://www.thymeleaf.org/documentation.html)
- [Spring Mail](https://docs.spring.io/spring-framework/reference/integration/email.html)
- [Spring Scheduling](https://docs.spring.io/spring-framework/reference/integration/scheduling.html)

---

**Version**: 1.0.0  
**Auteur**: CyberSensei Team  
**Status**: ✅ Production Ready


