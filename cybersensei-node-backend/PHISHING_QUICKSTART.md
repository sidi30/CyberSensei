# 🚀 Guide Rapide - Module Phishing Mailer

## ⚡ Configuration Express (5 minutes)

### 1. Configuration SMTP (Gmail)

**Créer un App Password Gmail:**
1. Aller sur https://myaccount.google.com/security
2. Activer "2-Step Verification"
3. Aller dans "App passwords"
4. Créer un mot de passe pour "Mail" / "Windows Computer"
5. Copier le code généré (ex: `abcd efgh ijkl mnop`)

**Variables d'environnement:**
```bash
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USERNAME=your-email@gmail.com
export SMTP_PASSWORD=abcd-efgh-ijkl-mnop
export TRACKING_BASE_URL=http://localhost:8080
export PHISHING_ENABLED=true
```

**Ou dans application.yml:**
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: abcd-efgh-ijkl-mnop

cybersensei:
  phishing:
    enabled: true
    tracking-url: http://localhost:8080
```

---

### 2. Insérer des Templates dans la DB

```sql
-- Template 1: Urgence mot de passe
INSERT INTO phishing_templates (label, subject, html_content, text_content, type, active, created_at)
VALUES (
    'Réinitialisation Urgente',
    '⚠️ ALERTE SÉCURITÉ - Votre compte expire dans 24h',
    '<html>Voir fichier: phishing-urgent-password.html</html>',
    'Votre compte expire. Vérifiez votre identité.',
    'CREDENTIAL_HARVESTING',
    true,
    NOW()
);

-- Template 2: Fausse facture
INSERT INTO phishing_templates (label, subject, html_content, text_content, type, active, created_at)
VALUES (
    'Facture Impayée',
    '📧 Facture en attente - 487,50 € à régler',
    '<html>Voir fichier: phishing-fake-invoice.html</html>',
    'Une facture est en attente de paiement.',
    'BUSINESS_EMAIL_COMPROMISE',
    true,
    NOW()
);

-- Template 3: Microsoft 365
INSERT INTO phishing_templates (label, subject, html_content, text_content, type, active, created_at)
VALUES (
    'Microsoft 365 - Activité suspecte',
    'Microsoft 365 - Connexion inhabituelle détectée',
    '<html>Voir fichier: phishing-microsoft365.html</html>',
    'Activité inhabituelle détectée sur votre compte.',
    'SPEAR_PHISHING',
    true,
    NOW()
);
```

---

### 3. Activer le Module

```sql
-- Dans la table configs
INSERT INTO configs (config_key, config_value, description, created_at)
VALUES ('phishing.enabled', 'true', 'Enable phishing campaigns', NOW());
```

---

### 4. Tester l'Envoi

**Option A: Via API (manuel)**
```bash
# Trigger une campagne immédiate
curl -X POST http://localhost:8080/api/phishing/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Option B: Via Service (code)**
```java
@Autowired
private PhishingMailerService phishingMailerService;

// Trigger avec un template spécifique
phishingMailerService.triggerManualCampaign(1L); // templateId = 1
```

**Option C: Attendre le cron job**
- Par défaut: 9h00 du matin (lundi-vendredi)
- Modifier dans `application.yml`:
```yaml
cybersensei:
  phishing:
    daily-send-cron: "0 * * * * *"  # Toutes les minutes (test)
```

---

## 📧 Tracking des Événements

### 1. Email Ouvert (Tracking Pixel)

**URL:**
```
GET http://localhost:8080/api/phishing/pixel/{token}
```

**Résultat:**
- Retourne: PNG 1x1 transparent
- Enregistre: `opened=true` dans `phishing_trackers`
- Met à jour: `totalOpened` dans `phishing_campaigns`

**Test:**
```bash
curl http://localhost:8080/api/phishing/pixel/abc-123-def-456
# Returns: [PNG binary data]
```

---

### 2. Lien Cliqué (Échec)

**URL:**
```
GET http://localhost:8080/api/phishing/click/{token}
```

**Résultat:**
- Retourne: Page HTML éducative
- Enregistre: `clicked=true` dans `phishing_trackers`
- Crée: `user_exercise_results` avec `score=0` (échec)
- Met à jour: `totalClicked` dans `phishing_campaigns`

**Page affichée:**
```
⚠️ Attention ! Vous avez cliqué sur un lien de phishing
Score : 0/100

6 conseils de protection:
✓ Vérifier l'expéditeur
✓ Survoler les liens
✓ Méfiez-vous de l'urgence
✓ Ne jamais communiquer vos identifiants
✓ Contacter le service IT en cas de doute
✓ Utiliser l'authentification 2FA

[📚 Accéder à ma formation]
```

---

### 3. Email Signalé (Succès)

**URL:**
```
POST http://localhost:8080/api/phishing/report/{token}
```

**Résultat:**
- Retourne: `{"success": true, "message": "...", "score": 100}`
- Enregistre: `reported=true` dans `phishing_trackers`
- Crée: `user_exercise_results` avec `score=100` (succès)
- Met à jour: `totalReported` dans `phishing_campaigns`

**Test:**
```bash
curl -X POST http://localhost:8080/api/phishing/report/abc-123-def-456

# Response:
{
  "success": true,
  "message": "Merci d'avoir signalé cet email suspect !",
  "score": 100
}
```

---

## 📊 Consulter les Résultats

### Via SQL

```sql
-- Campagnes récentes
SELECT 
    c.id,
    t.label as template,
    c.sent_at,
    c.total_sent,
    c.total_opened,
    c.total_clicked,
    c.total_reported,
    ROUND(c.total_clicked * 100.0 / c.total_sent, 1) as click_rate,
    ROUND(c.total_reported * 100.0 / c.total_sent, 1) as report_rate
FROM phishing_campaigns c
JOIN phishing_templates t ON t.id = c.template_id
ORDER BY c.sent_at DESC
LIMIT 10;

-- Utilisateurs les plus vulnérables
SELECT 
    u.name,
    u.email,
    COUNT(CASE WHEN pt.clicked THEN 1 END) as clicks,
    COUNT(CASE WHEN pt.reported THEN 1 END) as reports,
    COUNT(*) as total_received,
    ROUND(COUNT(CASE WHEN pt.clicked THEN 1 END) * 100.0 / COUNT(*), 1) as fail_rate
FROM users u
JOIN phishing_trackers pt ON pt.user_id = u.id
GROUP BY u.id, u.name, u.email
ORDER BY fail_rate DESC
LIMIT 10;
```

### Via API (Manager Dashboard)

```bash
# Résultats de phishing
GET /api/phishing/results

# Métriques par utilisateur
GET /api/manager/metrics

# Détails d'un utilisateur
GET /api/user/{id}/phishing-history
```

---

## 🔧 Personnalisation

### Créer un Template Custom

**1. HTML avec variables Thymeleaf:**
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="fr">
<body>
    <p>Bonjour <strong th:text="${userName}">Utilisateur</strong>,</p>
    
    <a th:href="${phishingLink}">Cliquez ici</a>
    
    <img th:src="${trackingPixel}" width="1" height="1" style="display:none;" />
</body>
</html>
```

**2. Ou simple avec placeholders:**
```html
<p>Bonjour <strong>{{USER_NAME}}</strong>,</p>
<a href="{{PHISHING_LINK}}">Cliquez ici</a>
<img src="{{TRACKING_PIXEL}}" width="1" height="1" style="display:none;" />
```

**Variables disponibles:**
- `{{USER_NAME}}` - Nom de l'utilisateur
- `{{USER_EMAIL}}` - Email de l'utilisateur
- `{{PHISHING_LINK}}` - Lien trackable unique
- `{{TRACKING_PIXEL}}` - Pixel de tracking (1x1 PNG)
- `{{COMPANY_NAME}}` - Nom de l'entreprise

---

## 🐛 Debugging

### Logs

```bash
# Tail logs phishing
tail -f logs/cybersensei.log | grep -i phishing

# Exemples de logs:
# ✅ Success
2024-11-24 09:00:15 - 🚀 Starting daily phishing campaign
2024-11-24 09:00:16 - Selected template: Réinitialisation Urgente (CREDENTIAL_HARVESTING)
2024-11-24 09:00:17 - Created campaign ID: 42
2024-11-24 09:00:18 - ✅ Phishing email sent successfully to: user@example.com
2024-11-24 09:00:20 - ✅ Phishing campaign completed: 50 sent, 0 failed

# 📧 Open
2024-11-24 09:15:32 - 📧 Email opened by user 5 (token: abc-123)

# ⚠️ Click
2024-11-24 09:20:45 - ⚠️ Phishing link CLICKED by user 7 (token: def-456)

# ✅ Report
2024-11-24 09:25:12 - ✅ Phishing email REPORTED by user 12 (token: ghi-789) - Good job!
```

### Test SMTP avec MailHog

```bash
# Run MailHog (fake SMTP)
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog

# Configure
export SMTP_HOST=localhost
export SMTP_PORT=1025
export SMTP_USERNAME=test
export SMTP_PASSWORD=test

# View emails at:
http://localhost:8025
```

### Vérifier la config DB

```sql
SELECT * FROM configs WHERE config_key LIKE 'smtp%' OR config_key LIKE 'phishing%';
```

---

## 📅 Scheduler Cron

### Modifier le Planning

```yaml
cybersensei:
  phishing:
    daily-send-cron: "0 0 9 * * MON-FRI"  # Default: 9h lundi-vendredi
```

**Exemples:**
```
0 0 9 * * MON-FRI    → 9h00 en semaine
0 30 8 * * *         → 8h30 tous les jours
0 0 10 * * MON       → 10h00 tous les lundis
0 */2 * * * *        → Toutes les 2 heures
0 * * * * *          → Toutes les minutes (TEST ONLY!)
```

### Désactiver le Scheduler

```yaml
cybersensei:
  phishing:
    enabled: false
```

Ou en DB:
```sql
UPDATE configs SET config_value = 'false' WHERE config_key = 'phishing.enabled';
```

---

## 🚨 Troubleshooting

### Erreur: "Failed to connect to SMTP server"

**Solution:**
1. Vérifier les credentials SMTP
2. Tester la connexion:
```bash
telnet smtp.gmail.com 587
```
3. Pour Gmail: Activer "Less secure app access" OU créer un App Password
4. Vérifier le firewall

---

### Erreur: "No active phishing templates found"

**Solution:**
```sql
-- Vérifier les templates
SELECT * FROM phishing_templates WHERE active = true;

-- Activer un template
UPDATE phishing_templates SET active = true WHERE id = 1;
```

---

### Erreur: "Invalid tracking token"

**Solution:**
- Le token est invalide ou expiré
- Vérifier dans la DB:
```sql
SELECT * FROM phishing_trackers WHERE token = 'abc-123-def';
```

---

### Les emails ne sont pas envoyés

**Checklist:**
- [ ] `phishing.enabled = true` dans configs
- [ ] `PHISHING_ENABLED=true` dans env
- [ ] Au moins 1 template actif
- [ ] Au moins 1 utilisateur actif
- [ ] SMTP correctement configuré
- [ ] Application démarrée (scheduler actif)

---

## 📦 Production Checklist

- [ ] Configurer SMTP réel (Gmail, SendGrid, AWS SES)
- [ ] Changer `TRACKING_BASE_URL` vers domaine public
- [ ] Activer cache Thymeleaf (`spring.thymeleaf.cache=true`)
- [ ] Configurer rate limiting (max emails/heure)
- [ ] Activer monitoring (Prometheus/Grafana)
- [ ] Backup DB régulier
- [ ] GDPR compliance: consentement utilisateurs
- [ ] Tester templates sur différents clients mail (Gmail, Outlook, Apple Mail)
- [ ] Vérifier SPF/DKIM/DMARC DNS records
- [ ] Configurer logs centralisés (ELK, Splunk)

---

## 🎯 Prochaines Étapes

1. ✅ Tester avec MailHog
2. ✅ Créer 3-5 templates variés
3. ✅ Lancer une campagne test
4. ✅ Consulter les résultats
5. ✅ Ajuster le planning cron
6. ✅ Déployer en production

---

**Version**: 1.0.0  
**Support**: docs@cybersensei.io  
**Status**: ✅ Production Ready


