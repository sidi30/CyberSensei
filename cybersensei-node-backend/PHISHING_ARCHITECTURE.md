# 🏗️ Architecture du Module Phishing Mailer

## 📊 Diagramme de Flux

```
┌──────────────────────────────────────────────────────────────────┐
│                     PHISHING CAMPAIGN FLOW                        │
└──────────────────────────────────────────────────────────────────┘

                         ┌─────────────────┐
                         │ @Scheduled Cron │
                         │ 9:00 AM Daily   │
                         └────────┬────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │ PhishingMailerService   │
                    │ .sendDailyPhishingCamp()│
                    └────────┬────────────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
        [Check Config] [Get Template] [Get Users]
                │            │            │
                └────────────┼────────────┘
                             ▼
                   ┌─────────────────┐
                   │ For each user:  │
                   │ 1. Create token │
                   │ 2. Save tracker │
                   │ 3. Render HTML  │
                   │ 4. Send email   │
                   └────────┬────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
    ┌──────────────┐ ┌──────────┐ ┌──────────┐
    │ User Inbox   │ │ Database │ │ Campaign │
    │              │ │ Tracking │ │ Stats    │
    └──────┬───────┘ └──────────┘ └──────────┘
           │
    ┌──────┴──────────────────────────────────────┐
    │                                              │
    ▼                                              ▼
┌────────────┐                            ┌─────────────┐
│ Opens Email│                            │ Clicks Link │
│    (Pixel) │                            │  (Phishing) │
└─────┬──────┘                            └──────┬──────┘
      │                                          │
      ▼                                          ▼
GET /pixel/{token}                      GET /click/{token}
      │                                          │
      ├─> Update: opened=true                   ├─> Update: clicked=true
      ├─> Update campaign stats                 ├─> Update campaign stats
      └─> Return 1x1 PNG                        ├─> Create exercise_result (FAIL)
                                                 └─> Show educational page

                            ┌─────────────────┐
                            │ Reports Email   │
                            │  (Suspicious)   │
                            └────────┬────────┘
                                     │
                                     ▼
                           POST /report/{token}
                                     │
                                     ├─> Update: reported=true
                                     ├─> Update campaign stats
                                     ├─> Create exercise_result (PASS)
                                     └─> Return {"score": 100}
```

---

## 🗂️ Structure des Fichiers

```
cybersensei-node-backend/
│
├── src/main/java/io/cybersensei/
│   │
│   ├── service/
│   │   └── PhishingMailerService.java       ★★★ Service principal (400+ lignes)
│   │       ├── @Scheduled sendDailyPhishingCampaign()
│   │       ├── sendPhishingEmail()
│   │       ├── trackEmailOpen()
│   │       ├── trackLinkClick()
│   │       ├── trackPhishingReport()
│   │       ├── renderTemplate()
│   │       └── generateUniqueToken()
│   │
│   ├── api/controller/
│   │   └── PhishingTrackingController.java  ★★★ Tracking endpoints
│   │       ├── GET  /api/phishing/pixel/{token}
│   │       ├── GET  /api/phishing/click/{token}
│   │       └── POST /api/phishing/report/{token}
│   │
│   ├── config/
│   │   ├── ThymeleafConfig.java             ★ Template engine config
│   │   └── MailConfig.java                  ★ SMTP config from DB
│   │
│   ├── domain/
│   │   ├── entity/
│   │   │   ├── PhishingTemplate.java
│   │   │   ├── PhishingCampaign.java
│   │   │   ├── PhishingTracker.java
│   │   │   ├── User.java
│   │   │   └── UserExerciseResult.java
│   │   │
│   │   └── repository/
│   │       ├── PhishingTemplateRepository.java
│   │       │   └── findRandomActiveTemplate()
│   │       ├── PhishingCampaignRepository.java
│   │       ├── PhishingTrackerRepository.java
│   │       │   ├── findByToken()
│   │       │   ├── countClickedByCampaignId()
│   │       │   ├── countOpenedByCampaignId()
│   │       │   └── countReportedByCampaignId()
│   │       ├── UserRepository.java
│   │       └── ConfigRepository.java
│   │
│   └── ...
│
├── src/main/resources/
│   │
│   ├── templates/                           ★★★ Email Templates
│   │   ├── phishing-email-base.html         → Base template
│   │   ├── phishing-urgent-password.html    → Template 1: Urgence
│   │   ├── phishing-fake-invoice.html       → Template 2: Facture
│   │   └── phishing-microsoft365.html       → Template 3: Microsoft
│   │
│   ├── application.yml                      ★ Configuration principale
│   │   ├── spring.mail.*                    → SMTP config
│   │   ├── cybersensei.phishing.*           → Phishing config
│   │   └── spring.thymeleaf.*               → Template config
│   │
│   └── db/changelog/changes/
│       ├── 001-create-users-table.xml
│       ├── 006-create-phishing-templates-table.xml
│       ├── 007-create-phishing-campaigns-table.xml
│       ├── 008-create-phishing-trackers-table.xml
│       └── 010-create-config-table.xml
│
├── pom.xml                                  ★ Dependencies
│   ├── spring-boot-starter-mail
│   └── spring-boot-starter-thymeleaf
│
├── PHISHING_MODULE.md                       📚 Documentation complète
├── PHISHING_QUICKSTART.md                   🚀 Guide de démarrage rapide
└── PHISHING_ARCHITECTURE.md                 🏗️ Architecture (ce fichier)
```

---

## 🔗 Interactions entre Composants

### 1. **PhishingMailerService** ←→ **Repositories**

```java
// Service récupère un template aléatoire
PhishingTemplate template = templateRepository.findRandomActiveTemplate();

// Service récupère tous les utilisateurs actifs
List<User> users = userRepository.findAll().stream()
    .filter(User::getActive)
    .collect(Collectors.toList());

// Service crée une campagne
PhishingCampaign campaign = campaignRepository.save(campaign);

// Service crée un tracker par email envoyé
PhishingTracker tracker = trackerRepository.save(tracker);

// Service met à jour les statistiques
Integer clicked = trackerRepository.countClickedByCampaignId(campaignId);
campaign.setTotalClicked(clicked);
```

### 2. **PhishingMailerService** ←→ **JavaMailSender**

```java
// Récupère config SMTP depuis DB (MailConfig)
JavaMailSender mailSender;  // Injecté par Spring

// Crée un email MIME
MimeMessage message = mailSender.createMimeMessage();
MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

// Configure l'email
helper.setFrom(fromEmail, fromName);
helper.setTo(user.getEmail());
helper.setSubject(template.getSubject());
helper.setText(textContent, htmlContent);

// Envoie
mailSender.send(message);
```

### 3. **PhishingTrackingController** ←→ **PhishingMailerService**

```java
// Controller reçoit requête → délègue au service
@GetMapping("/pixel/{token}")
public ResponseEntity<byte[]> trackPixel(@PathVariable String token) {
    mailerService.trackEmailOpen(token);  // Service met à jour DB
    return ResponseEntity.ok(generateTransparentPixel());
}

@GetMapping("/click/{token}")
public ResponseEntity<String> trackClick(@PathVariable String token) {
    PhishingTracker tracker = mailerService.trackLinkClick(token);
    return ResponseEntity.ok(generateEducationalPage(tracker));
}
```

### 4. **PhishingMailerService** ←→ **UserExerciseResult**

```java
// Lorsqu'un utilisateur clique (ÉCHEC)
UserExerciseResult result = UserExerciseResult.builder()
    .userId(tracker.getUserId())
    .score(0.0)  // Échec
    .success(false)
    .detailsJSON(Map.of("action", "clicked"))
    .build();
resultRepository.save(result);

// Lorsqu'un utilisateur signale (SUCCÈS)
UserExerciseResult result = UserExerciseResult.builder()
    .userId(tracker.getUserId())
    .score(100.0)  // Succès
    .success(true)
    .detailsJSON(Map.of("action", "reported"))
    .build();
resultRepository.save(result);
```

---

## 🗄️ Modèle de Données

### Tables et Relations

```sql
┌─────────────────┐
│ users           │
│─────────────────│
│ id (PK)         │◄───────┐
│ name            │        │
│ email           │        │
│ active          │        │
└─────────────────┘        │
                           │
┌─────────────────────┐    │
│ phishing_templates  │    │
│─────────────────────│    │
│ id (PK)             │◄───┤
│ label               │    │
│ subject             │    │
│ html_content        │    │
│ text_content        │    │
│ type (ENUM)         │    │
│ active (BOOL)       │    │
└─────────────────────┘    │
         │                 │
         │                 │
         ▼                 │
┌─────────────────────┐    │
│ phishing_campaigns  │    │
│─────────────────────│    │
│ id (PK)             │    │
│ template_id (FK)────┼────┘
│ sent_at             │
│ total_sent          │
│ total_clicked       │
│ total_opened        │
│ total_reported      │
└─────────────────────┘
         │
         │
         ▼
┌─────────────────────┐
│ phishing_trackers   │
│─────────────────────│
│ id (PK)             │
│ token (UNIQUE)      │★★★ Clé du tracking
│ user_id (FK)────────┼────┐
│ campaign_id (FK)────┼────┼───> Campaign
│ clicked (BOOL)      │    │
│ clicked_at          │    │
│ opened (BOOL)       │    └───> User
│ opened_at           │
│ reported (BOOL)     │
│ reported_at         │
│ sent_at             │
└─────────────────────┘
         │
         │ (creates on click/report)
         ▼
┌──────────────────────────┐
│ user_exercise_results    │
│──────────────────────────│
│ id (PK)                  │
│ user_id (FK)             │
│ exercise_id (FK)         │
│ score (0.0 or 100.0)     │★★★ Success indicator
│ success (BOOL)           │
│ duration (seconds)       │
│ details_json (JSONB)     │
│   └─> action: "clicked" or "reported"
│   └─> campaignId
└──────────────────────────┘
```

---

## 🔐 Sécurité

### Token Generation

```java
// UUID v4 aléatoire
String token = UUID.randomUUID().toString();
// Exemple: "550e8400-e29b-41d4-a716-446655440000"

// Vérification d'unicité
while (trackerRepository.findByToken(token).isPresent()) {
    token = UUID.randomUUID().toString();
}
```

### SMTP Security

```yaml
spring:
  mail:
    properties:
      mail:
        smtp:
          auth: true                    # Authentication required
          starttls:
            enable: true                # TLS enabled
            required: true              # TLS required
          connectiontimeout: 5000
```

### Configuration depuis DB

```java
// SMTP credentials sont dans la table `configs`, pas dans le code
String host = configRepository.findByKey("smtp.host").map(Config::getValue).orElse(defaultHost);
String password = configRepository.findByKey("smtp.password").map(Config::getValue).orElse(defaultPassword);
```

---

## 📈 Performance

### Optimisations Implémentées

1. **Batch Sending**
   - Emails envoyés en boucle, pas en batch SMTP (simple)
   - Peut être amélioré avec CompletableFuture pour parallélisation

2. **Database Indexes**
   ```sql
   CREATE INDEX idx_tracker_token ON phishing_trackers(token);
   CREATE INDEX idx_tracker_user ON phishing_trackers(user_id);
   CREATE INDEX idx_tracker_campaign ON phishing_trackers(campaign_id);
   CREATE INDEX idx_campaign_template ON phishing_campaigns(template_id);
   CREATE INDEX idx_campaign_date ON phishing_campaigns(sent_at);
   ```

3. **Lazy Loading**
   ```java
   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "userId", insertable = false, updatable = false)
   private User user;
   ```

4. **Connection Pooling**
   ```yaml
   spring:
     datasource:
       hikari:
         maximum-pool-size: 10
         minimum-idle: 5
   ```

---

## 🧪 Cas de Test

### 1. **Test du Scheduler**

```java
@SpringBootTest
class PhishingMailerServiceTest {
    
    @Autowired
    private PhishingMailerService service;
    
    @Test
    void testDailyCampaign() {
        service.sendDailyPhishingCampaign();
        
        // Verify campaign created
        // Verify emails sent
        // Verify trackers created
    }
}
```

### 2. **Test du Tracking**

```java
@Test
void testTrackingPixel() {
    String token = "test-token-123";
    
    // Track open
    service.trackEmailOpen(token);
    
    PhishingTracker tracker = trackerRepository.findByToken(token).orElseThrow();
    assertTrue(tracker.getOpened());
    assertNotNull(tracker.getOpenedAt());
}
```

### 3. **Test du Click**

```java
@Test
void testPhishingClick() {
    String token = "test-token-456";
    
    // Track click
    PhishingTracker tracker = service.trackLinkClick(token);
    
    assertTrue(tracker.getClicked());
    assertTrue(tracker.getOpened());  // Automatically marked as opened
    
    // Verify exercise result created (failure)
    List<UserExerciseResult> results = resultRepository.findByUserId(tracker.getUserId());
    assertEquals(1, results.size());
    assertEquals(0.0, results.get(0).getScore());
    assertFalse(results.get(0).getSuccess());
}
```

---

## 📊 Métriques et Monitoring

### Logs à Surveiller

```bash
# Success
✅ Phishing campaign completed: 50 sent, 0 failed

# Opens
📧 Email opened by user 5 (token: abc-123)

# Clicks (danger!)
⚠️ Phishing link CLICKED by user 7 (token: def-456)

# Reports (good!)
✅ Phishing email REPORTED by user 12 (token: ghi-789) - Good job!

# Errors
❌ Failed to send phishing email to user@example.com: Connection refused
```

### Métriques Business

```sql
-- Success rate (report rate)
SELECT 
    COUNT(CASE WHEN reported THEN 1 END) * 100.0 / COUNT(*) as report_rate
FROM phishing_trackers;

-- Failure rate (click rate) → à minimiser
SELECT 
    COUNT(CASE WHEN clicked THEN 1 END) * 100.0 / COUNT(*) as click_rate
FROM phishing_trackers;

-- Most vulnerable users
SELECT 
    u.name,
    COUNT(CASE WHEN t.clicked THEN 1 END) as failures
FROM users u
JOIN phishing_trackers t ON t.user_id = u.id
GROUP BY u.id
ORDER BY failures DESC
LIMIT 10;
```

---

## 🚀 Déploiement

### Variables d'Environnement Requises

```bash
# SMTP (obligatoire)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=noreply@company.com
SMTP_PASSWORD=app-password-here

# Tracking (obligatoire)
TRACKING_BASE_URL=https://cybersensei.company.com

# Features (optionnel)
PHISHING_ENABLED=true
PHISHING_CRON="0 0 9 * * MON-FRI"

# Database (déjà configuré)
POSTGRES_HOST=db
POSTGRES_DB=cybersensei
POSTGRES_USER=cybersensei
POSTGRES_PASSWORD=secret
```

### Docker Compose

```yaml
services:
  backend:
    image: cybersensei-backend:latest
    environment:
      - SMTP_HOST=smtp.gmail.com
      - SMTP_PORT=587
      - SMTP_USERNAME=${SMTP_USERNAME}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
      - TRACKING_BASE_URL=http://localhost:8080
      - PHISHING_ENABLED=true
    depends_on:
      - db
```

---

## 🔧 Extensibilité

### Ajouter un Nouveau Type de Template

```java
// 1. Ajouter dans PhishingTemplate.PhishingType
public enum PhishingType {
    SPEAR_PHISHING,
    WHALING,
    BUSINESS_EMAIL_COMPROMISE,
    CREDENTIAL_HARVESTING,
    MALWARE_ATTACHMENT,
    CEO_FRAUD  // ← Nouveau type
}

// 2. Créer le fichier HTML
src/main/resources/templates/phishing-ceo-fraud.html

// 3. Insérer en DB
INSERT INTO phishing_templates (label, subject, html_content, ...)
VALUES ('CEO Fraud', 'Urgent: Wire Transfer Needed', '...', ...);
```

### Ajouter une Nouvelle Métrique

```java
// Dans PhishingTracker.java
@Column
private Boolean forwarded = false;  // User forwarded to IT

private LocalDateTime forwardedAt;

// Dans PhishingTrackerRepository
@Query("SELECT COUNT(t) FROM PhishingTracker t WHERE t.campaignId = :campaignId AND t.forwarded = true")
Integer countForwardedByCampaignId(@Param("campaignId") Long campaignId);

// Dans PhishingMailerService
campaign.setTotalForwarded(trackerRepository.countForwardedByCampaignId(campaignId));
```

---

## 📚 Références

- [Spring Mail Docs](https://docs.spring.io/spring-framework/reference/integration/email.html)
- [Thymeleaf Docs](https://www.thymeleaf.org/documentation.html)
- [Spring Scheduling](https://docs.spring.io/spring-framework/reference/integration/scheduling.html)
- [OWASP Phishing](https://owasp.org/www-community/attacks/Phishing)

---

**Version**: 1.0.0  
**Auteur**: CyberSensei Team  
**Date**: 2024-11-24


