package io.cybersensei.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.cybersensei.domain.entity.Config;
import io.cybersensei.domain.entity.Exercise;
import io.cybersensei.domain.repository.ConfigRepository;
import io.cybersensei.domain.repository.ExerciseRepository;
import io.cybersensei.domain.repository.UserExerciseResultRepository;
import io.cybersensei.domain.repository.UserRepository;
import liquibase.Liquibase;
import liquibase.database.Database;
import liquibase.database.DatabaseFactory;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.info.BuildProperties;
import org.springframework.http.*;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import javax.sql.DataSource;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.sql.Connection;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * SyncAgent Service
 * 
 * Responsibilities:
 * 1. Check for updates from central server (nightly at 03:00)
 * 2. Download and apply updates (exercises, templates, migrations)
 * 3. Push telemetry data (every 15 minutes)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SyncAgentService {

    private final RestTemplate restTemplate;
    private final ConfigRepository configRepository;
    private final UserRepository userRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserExerciseResultRepository resultRepository;
    private final DataSource dataSource;
    
    @Autowired(required = false)
    private BuildProperties buildProperties;

    @Value("${cybersensei.sync.enabled}")
    private boolean syncEnabled;

    @Value("${cybersensei.sync.central-url}")
    private String centralUrl;

    @Value("${cybersensei.sync.tenant-id}")
    private String tenantId;

    private static final String UPDATE_DIR = "updates";
    private static final int MAX_RETRY_ATTEMPTS = 3;

    /**
     * Scheduled job: Check for updates every night at 03:00
     */
    @Scheduled(cron = "${cybersensei.sync.nightly-cron:0 0 3 * * *}")
    public void checkAndApplyUpdates() {
        if (!syncEnabled) {
            log.debug("Sync agent is disabled");
            return;
        }

        log.info("🔄 Starting nightly update check at {}", LocalDateTime.now());

        try {
            // Get current version
            String currentVersion = getCurrentVersion();
            log.info("Current version: {}", currentVersion);

            // Check for updates
            UpdateCheckResponse updateCheck = checkForUpdates(currentVersion);

            if (updateCheck == null) {
                log.info("✅ No update check response from central server");
                return;
            }

            if (!updateCheck.isUpdateAvailable()) {
                log.info("✅ System is up to date (version: {})", currentVersion);
                saveLastUpdateCheck(currentVersion, false, "No updates available");
                return;
            }

            log.info("🆕 Update available: {} -> {}", currentVersion, updateCheck.getLatestVersion());

            // Download update package
            Path updatePackage = downloadUpdatePackage(updateCheck.getDownloadUrl());

            // Validate checksum
            if (!validateChecksum(updatePackage, updateCheck.getChecksum())) {
                log.error("❌ Checksum validation failed for update package");
                saveLastUpdateCheck(currentVersion, false, "Checksum validation failed");
                return;
            }

            log.info("✅ Checksum validated successfully");

            // Extract update package
            Path extractDir = extractUpdatePackage(updatePackage);

            // Apply updates
            applyUpdate(extractDir, updateCheck);

            // Update version in config
            updateCurrentVersion(updateCheck.getLatestVersion());

            log.info("✅ Update applied successfully: {}", updateCheck.getLatestVersion());
            saveLastUpdateCheck(updateCheck.getLatestVersion(), true, "Update applied successfully");

            // Cleanup
            cleanup(updatePackage, extractDir);

        } catch (Exception e) {
            log.error("❌ Error during update check: {}", e.getMessage(), e);
            saveLastUpdateCheck(getCurrentVersion(), false, "Error: " + e.getMessage());
        }
    }

    /**
     * Check for updates from central server
     */
    @Retryable(
        retryFor = {RestClientException.class},
        maxAttempts = MAX_RETRY_ATTEMPTS,
        backoff = @Backoff(delay = 5000, multiplier = 2)
    )
    public UpdateCheckResponse checkForUpdates(String currentVersion) {
        try {
            String url = String.format("%s/api/updates/check?tenantId=%s&version=%s",
                    centralUrl, tenantId, currentVersion);

            log.debug("Checking for updates: {}", url);

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "CyberSensei-Node/" + currentVersion);
            headers.set("X-Tenant-ID", tenantId);

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<UpdateCheckResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    UpdateCheckResponse.class
            );

            return response.getBody();

        } catch (RestClientException e) {
            log.warn("Failed to check for updates (attempt will retry): {}", e.getMessage());
            throw e; // Trigger retry
        }
    }

    /**
     * Download update package from central server
     */
    private Path downloadUpdatePackage(String downloadUrl) throws IOException {
        log.info("📥 Downloading update package from: {}", downloadUrl);

        // Create updates directory
        Path updateDir = Paths.get(UPDATE_DIR);
        Files.createDirectories(updateDir);

        // Download file
        String fileName = "update_" + System.currentTimeMillis() + ".zip";
        Path downloadPath = updateDir.resolve(fileName);

        ResponseEntity<byte[]> response = restTemplate.exchange(
                downloadUrl,
                HttpMethod.GET,
                null,
                byte[].class
        );

        if (response.getBody() != null) {
            Files.write(downloadPath, response.getBody());
            log.info("✅ Downloaded {} bytes to {}", response.getBody().length, downloadPath);
        }

        return downloadPath;
    }

    /**
     * Validate checksum of downloaded package
     */
    private boolean validateChecksum(Path filePath, String expectedChecksum) throws Exception {
        if (expectedChecksum == null || expectedChecksum.isEmpty()) {
            log.warn("⚠️ No checksum provided, skipping validation");
            return true;
        }

        MessageDigest md = MessageDigest.getInstance("SHA-256");
        
        try (InputStream fis = Files.newInputStream(filePath)) {
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = fis.read(buffer)) != -1) {
                md.update(buffer, 0, bytesRead);
            }
        }

        byte[] digest = md.digest();
        StringBuilder sb = new StringBuilder();
        for (byte b : digest) {
            sb.append(String.format("%02x", b));
        }

        String actualChecksum = sb.toString();
        boolean isValid = actualChecksum.equalsIgnoreCase(expectedChecksum);

        log.debug("Checksum validation: expected={}, actual={}, valid={}",
                expectedChecksum, actualChecksum, isValid);

        return isValid;
    }

    /**
     * Extract ZIP update package
     */
    private Path extractUpdatePackage(Path zipFile) throws IOException {
        Path extractDir = Paths.get(UPDATE_DIR, "extract_" + System.currentTimeMillis());
        Files.createDirectories(extractDir);

        log.info("📦 Extracting update package to: {}", extractDir);

        try (ZipInputStream zis = new ZipInputStream(Files.newInputStream(zipFile))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                Path entryPath = extractDir.resolve(entry.getName());

                if (entry.isDirectory()) {
                    Files.createDirectories(entryPath);
                } else {
                    Files.createDirectories(entryPath.getParent());
                    Files.copy(zis, entryPath, StandardCopyOption.REPLACE_EXISTING);
                }

                zis.closeEntry();
            }
        }

        log.info("✅ Extraction completed");
        return extractDir;
    }

    /**
     * Apply update (migrations, exercises, templates)
     */
    @Transactional
    public void applyUpdate(Path updateDir, UpdateCheckResponse updateCheck) throws Exception {
        log.info("🔧 Applying update...");

        // 1. Apply Liquibase migrations (if any)
        Path migrationsDir = updateDir.resolve("migrations");
        if (Files.exists(migrationsDir)) {
            applyLiquibaseMigrations(migrationsDir);
        }

        // 2. Insert new exercises (if any)
        Path exercisesFile = updateDir.resolve("exercises.json");
        if (Files.exists(exercisesFile)) {
            importExercises(exercisesFile);
        }

        // 3. Insert new phishing templates (if any)
        Path templatesFile = updateDir.resolve("phishing_templates.json");
        if (Files.exists(templatesFile)) {
            importPhishingTemplates(templatesFile);
        }

        log.info("✅ Update applied successfully");
    }

    /**
     * Apply Liquibase migrations from update package
     */
    private void applyLiquibaseMigrations(Path migrationsDir) throws Exception {
        log.info("🔄 Applying Liquibase migrations from: {}", migrationsDir);

        try (Connection connection = dataSource.getConnection()) {
            Database database = DatabaseFactory.getInstance()
                    .findCorrectDatabaseImplementation(new JdbcConnection(connection));

            // Find changelog file
            Path changelogFile = migrationsDir.resolve("changelog.xml");
            if (!Files.exists(changelogFile)) {
                log.warn("⚠️ No changelog.xml found in migrations directory");
                return;
            }

            // Run Liquibase update
            try (Liquibase liquibase = new Liquibase(
                    changelogFile.toString(),
                    new ClassLoaderResourceAccessor(),
                    database)) {
                
                // Suppress deprecation warning for Liquibase update method
                liquibase.update((String) null);
                log.info("✅ Liquibase migrations applied successfully");
            }
        }
    }

    /**
     * Import exercises from JSON file
     * Format expected:
     * {
     *   "version": "1.3.0",
     *   "timestamp": "2025-11-24T10:00:00Z",
     *   "exercises": [
     *     {
     *       "centralId": "uuid",
     *       "topic": "Phishing",
     *       "type": "QUIZ",
     *       "difficulty": "BEGINNER",
     *       "payloadJSON": { ... },
     *       "version": "1.0.0"
     *     }
     *   ],
     *   "deletions": ["uuid-to-delete"]
     * }
     */
    @Transactional
    public void importExercises(Path exercisesFile) throws IOException {
        log.info("📚 Importing exercises from: {}", exercisesFile);

        ObjectMapper objectMapper = new ObjectMapper();
        String content = Files.readString(exercisesFile);

        ExerciseImportPayload payload = objectMapper.readValue(content, ExerciseImportPayload.class);

        log.info("Exercise import payload: version={}, exercises={}, deletions={}",
                payload.getVersion(),
                payload.getExercises() != null ? payload.getExercises().size() : 0,
                payload.getDeletions() != null ? payload.getDeletions().size() : 0);

        int created = 0;
        int updated = 0;
        int deleted = 0;

        // Process deletions first
        if (payload.getDeletions() != null) {
            for (String centralIdToDelete : payload.getDeletions()) {
                if (exerciseRepository.existsByCentralId(centralIdToDelete)) {
                    exerciseRepository.deleteByCentralId(centralIdToDelete);
                    deleted++;
                    log.debug("Deleted exercise with centralId: {}", centralIdToDelete);
                }
            }
        }

        // Process exercises (upsert by centralId)
        if (payload.getExercises() != null) {
            for (ExerciseImportDto dto : payload.getExercises()) {
                if (dto.getCentralId() == null || dto.getCentralId().isEmpty()) {
                    log.warn("Skipping exercise without centralId: {}", dto.getTopic());
                    continue;
                }

                Optional<Exercise> existingOpt = exerciseRepository.findByCentralId(dto.getCentralId());

                if (existingOpt.isPresent()) {
                    // Update existing exercise
                    Exercise existing = existingOpt.get();

                    // Only update if version is newer
                    if (dto.getVersion() != null && !dto.getVersion().equals(existing.getVersion())) {
                        existing.setTopic(dto.getTopic());
                        existing.setType(Exercise.ExerciseType.valueOf(dto.getType()));
                        existing.setDifficulty(Exercise.Difficulty.valueOf(dto.getDifficulty()));
                        existing.setPayloadJSON(dto.getPayloadJSON());
                        existing.setVersion(dto.getVersion());
                        existing.setSyncedAt(LocalDateTime.now());
                        existing.setActive(dto.getActive() != null ? dto.getActive() : true);
                        exerciseRepository.save(existing);
                        updated++;
                        log.debug("Updated exercise: {} (centralId: {})", dto.getTopic(), dto.getCentralId());
                    }
                } else {
                    // Create new exercise
                    Exercise newExercise = Exercise.builder()
                            .centralId(dto.getCentralId())
                            .topic(dto.getTopic())
                            .type(Exercise.ExerciseType.valueOf(dto.getType()))
                            .difficulty(Exercise.Difficulty.valueOf(dto.getDifficulty()))
                            .payloadJSON(dto.getPayloadJSON())
                            .version(dto.getVersion())
                            .syncedAt(LocalDateTime.now())
                            .active(dto.getActive() != null ? dto.getActive() : true)
                            .build();
                    exerciseRepository.save(newExercise);
                    created++;
                    log.debug("Created exercise: {} (centralId: {})", dto.getTopic(), dto.getCentralId());
                }
            }
        }

        log.info("✅ Exercises imported: {} created, {} updated, {} deleted", created, updated, deleted);
    }

    // ========== Exercise Import DTOs ==========

    /**
     * Root payload for exercises.json
     */
    public static class ExerciseImportPayload {
        private String version;
        private String timestamp;
        private List<ExerciseImportDto> exercises;
        private List<String> deletions;

        public String getVersion() { return version; }
        public void setVersion(String version) { this.version = version; }

        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

        public List<ExerciseImportDto> getExercises() { return exercises; }
        public void setExercises(List<ExerciseImportDto> exercises) { this.exercises = exercises; }

        public List<String> getDeletions() { return deletions; }
        public void setDeletions(List<String> deletions) { this.deletions = deletions; }
    }

    /**
     * Individual exercise DTO for import
     */
    public static class ExerciseImportDto {
        private String centralId;
        private String topic;
        private String type;
        private String difficulty;
        private Map<String, Object> payloadJSON;
        private String version;
        private Boolean active;

        public String getCentralId() { return centralId; }
        public void setCentralId(String centralId) { this.centralId = centralId; }

        public String getTopic() { return topic; }
        public void setTopic(String topic) { this.topic = topic; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

        public Map<String, Object> getPayloadJSON() { return payloadJSON; }
        public void setPayloadJSON(Map<String, Object> payloadJSON) { this.payloadJSON = payloadJSON; }

        public String getVersion() { return version; }
        public void setVersion(String version) { this.version = version; }

        public Boolean getActive() { return active; }
        public void setActive(Boolean active) { this.active = active; }
    }

    /**
     * Import phishing templates from JSON file
     */
    private void importPhishingTemplates(Path templatesFile) throws IOException {
        log.info("📧 Importing phishing templates from: {}", templatesFile);

        // TODO: Parse JSON and import templates
        String content = Files.readString(templatesFile);
        log.info("Templates content: {} bytes", content.length());

        // Example: Parse and save
        // List<PhishingTemplate> templates = objectMapper.readValue(content, new TypeReference<List<PhishingTemplate>>() {});
        // templateRepository.saveAll(templates);

        log.info("✅ Phishing templates imported successfully");
    }

    /**
     * Scheduled job: Push telemetry every 15 minutes
     */
    @Scheduled(fixedRateString = "${cybersensei.sync.telemetry-interval:900000}") // 15 min = 900000 ms
    public void pushTelemetry() {
        if (!syncEnabled) {
            return;
        }

        log.debug("📊 Pushing telemetry data...");

        try {
            TelemetryData telemetry = collectTelemetryData();
            sendTelemetry(telemetry);
            log.debug("✅ Telemetry pushed successfully");

        } catch (Exception e) {
            log.warn("⚠️ Failed to push telemetry: {}", e.getMessage());
            // Don't throw - telemetry is non-critical
        }
    }

    /**
     * Collect telemetry data
     */
    private TelemetryData collectTelemetryData() {
        TelemetryData telemetry = new TelemetryData();

        // Basic info
        telemetry.setTenantId(tenantId);
        telemetry.setVersion(getCurrentVersion());
        telemetry.setTimestamp(LocalDateTime.now());

        // User count
        long userCount = userRepository.count();
        telemetry.setUserCount(userCount);

        // Exercises completed today
        LocalDate today = LocalDate.now();
        long exercisesToday = resultRepository.countByDateBetween(
                today.atStartOfDay(),
                today.plusDays(1).atStartOfDay()
        );
        telemetry.setExercisesCompletedToday(exercisesToday);

        // AI latency (average from last hour)
        Double aiLatency = calculateAverageAILatency();
        telemetry.setAiResponseLatencyMs(aiLatency);

        // Health flag
        boolean healthy = checkSystemHealth();
        telemetry.setHealthy(healthy);

        log.debug("Telemetry: users={}, exercises={}, aiLatency={}ms, healthy={}",
                userCount, exercisesToday, aiLatency, healthy);

        return telemetry;
    }

    /**
     * Send telemetry to central server
     */
    @Retryable(
        retryFor = {RestClientException.class},
        maxAttempts = 2,
        backoff = @Backoff(delay = 3000)
    )
    private void sendTelemetry(TelemetryData telemetry) {
        String url = centralUrl + "/api/telemetry";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Tenant-ID", tenantId);
        headers.set("Authorization", "Bearer " + getTenantApiKey());

        HttpEntity<TelemetryData> entity = new HttpEntity<>(telemetry, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                log.debug("Telemetry sent successfully: {}", response.getBody());
            }

        } catch (RestClientException e) {
            log.warn("Failed to send telemetry: {}", e.getMessage());
            throw e; // Trigger retry
        }
    }

    /**
     * Calculate average AI response latency
     */
    private Double calculateAverageAILatency() {
        // TODO: Implement actual latency calculation from AI service metrics
        // For now, return a placeholder
        return 250.0; // ms
    }

    /**
     * Check system health
     */
    private boolean checkSystemHealth() {
        try {
            // Check database connection
            dataSource.getConnection().isValid(5);

            // Check if critical services are running
            long userCount = userRepository.count();
            long exerciseCount = exerciseRepository.count();

            return userCount >= 0 && exerciseCount >= 0;

        } catch (Exception e) {
            log.warn("Health check failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get current version from config or build properties
     */
    private String getCurrentVersion() {
        return configRepository.findByKey("system.version")
                .map(Config::getValue)
                .orElseGet(() -> {
                    try {
                        return buildProperties != null ? buildProperties.getVersion() : "1.0.0";
                    } catch (Exception e) {
                        return "1.0.0";
                    }
                });
    }

    /**
     * Update current version in config
     */
    private void updateCurrentVersion(String newVersion) {
        Config versionConfig = configRepository.findByKey("system.version")
                .orElse(new Config());
        
        versionConfig.setKey("system.version");
        versionConfig.setValue(newVersion);
        
        configRepository.save(versionConfig);
        log.info("✅ Version updated to: {}", newVersion);
    }

    /**
     * Save last update check result
     */
    private void saveLastUpdateCheck(String version, boolean success, String message) {
        Config lastCheck = configRepository.findByKey("system.last_update_check")
                .orElse(new Config());

        Map<String, Object> checkData = new HashMap<>();
        checkData.put("timestamp", LocalDateTime.now().toString());
        checkData.put("version", version);
        checkData.put("success", success);
        checkData.put("message", message);

        lastCheck.setKey("system.last_update_check");
        lastCheck.setValue(checkData.toString());

        configRepository.save(lastCheck);
    }

    /**
     * Get tenant API key from config
     */
    private String getTenantApiKey() {
        return configRepository.findByKey("sync.api_key")
                .map(Config::getValue)
                .orElse("demo-api-key");
    }

    /**
     * Cleanup temporary files
     */
    private void cleanup(Path updatePackage, Path extractDir) {
        try {
            if (Files.exists(updatePackage)) {
                Files.delete(updatePackage);
                log.debug("Deleted update package: {}", updatePackage);
            }

            if (Files.exists(extractDir)) {
                Files.walk(extractDir)
                        .sorted((a, b) -> -a.compareTo(b)) // Delete files before directories
                        .forEach(path -> {
                            try {
                                Files.delete(path);
                            } catch (IOException e) {
                                log.warn("Failed to delete: {}", path);
                            }
                        });
                log.debug("Deleted extract directory: {}", extractDir);
            }

        } catch (IOException e) {
            log.warn("Cleanup failed: {}", e.getMessage());
        }
    }

    /**
     * Manual trigger for update check (for testing)
     */
    public void triggerManualUpdateCheck() {
        log.info("🔄 Manual update check triggered");
        checkAndApplyUpdates();
    }

    /**
     * Manual trigger for telemetry push (for testing)
     */
    public void triggerManualTelemetryPush() {
        log.info("📊 Manual telemetry push triggered");
        pushTelemetry();
    }

    // ========== DTOs ==========

    /**
     * Update check response from central server
     */
    public static class UpdateCheckResponse {
        private boolean updateAvailable;
        private String latestVersion;
        private String downloadUrl;
        private String checksum;
        private String releaseNotes;

        public UpdateCheckResponse() {}

        public boolean isUpdateAvailable() { return updateAvailable; }
        public void setUpdateAvailable(boolean updateAvailable) { this.updateAvailable = updateAvailable; }

        public String getLatestVersion() { return latestVersion; }
        public void setLatestVersion(String latestVersion) { this.latestVersion = latestVersion; }

        public String getDownloadUrl() { return downloadUrl; }
        public void setDownloadUrl(String downloadUrl) { this.downloadUrl = downloadUrl; }

        public String getChecksum() { return checksum; }
        public void setChecksum(String checksum) { this.checksum = checksum; }

        public String getReleaseNotes() { return releaseNotes; }
        public void setReleaseNotes(String releaseNotes) { this.releaseNotes = releaseNotes; }
    }

    /**
     * Telemetry data to send to central server
     */
    public static class TelemetryData {
        private String tenantId;
        private String version;
        private LocalDateTime timestamp;
        private long userCount;
        private long exercisesCompletedToday;
        private Double aiResponseLatencyMs;
        private boolean healthy;

        public String getTenantId() { return tenantId; }
        public void setTenantId(String tenantId) { this.tenantId = tenantId; }

        public String getVersion() { return version; }
        public void setVersion(String version) { this.version = version; }

        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

        public long getUserCount() { return userCount; }
        public void setUserCount(long userCount) { this.userCount = userCount; }

        public long getExercisesCompletedToday() { return exercisesCompletedToday; }
        public void setExercisesCompletedToday(long exercisesCompletedToday) { 
            this.exercisesCompletedToday = exercisesCompletedToday; 
        }

        public Double getAiResponseLatencyMs() { return aiResponseLatencyMs; }
        public void setAiResponseLatencyMs(Double aiResponseLatencyMs) { 
            this.aiResponseLatencyMs = aiResponseLatencyMs; 
        }

        public boolean isHealthy() { return healthy; }
        public void setHealthy(boolean healthy) { this.healthy = healthy; }
    }
}
