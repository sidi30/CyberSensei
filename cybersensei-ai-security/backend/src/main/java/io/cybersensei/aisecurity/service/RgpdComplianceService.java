package io.cybersensei.aisecurity.service;

import io.cybersensei.aisecurity.domain.entity.PromptEvent;
import io.cybersensei.aisecurity.domain.entity.RetentionPolicy;
import io.cybersensei.aisecurity.domain.entity.RgpdAuditLog;
import io.cybersensei.aisecurity.domain.entity.RiskDetection;
import io.cybersensei.aisecurity.domain.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service de conformité RGPD.
 *
 * Gère :
 * - Droit d'accès (Art. 15) : export des données d'un utilisateur
 * - Droit à l'effacement (Art. 17) : suppression complète
 * - Droit à la portabilité (Art. 20) : export structuré
 * - Registre des traitements (Art. 30) : description auto-générée
 * - Politique de rétention : purge automatique des données expirées
 * - Journal d'audit : traçabilité de chaque opération RGPD
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RgpdComplianceService {

    private final PromptEventRepository promptEventRepository;
    private final RiskDetectionRepository riskDetectionRepository;
    private final AlertRepository alertRepository;
    private final RetentionPolicyRepository retentionPolicyRepository;
    private final RgpdAuditLogRepository auditLogRepository;

    // ── Droit d'accès (Art. 15) ─────────────────────────────────────

    /**
     * Retourne toutes les données liées à un utilisateur.
     * Conforme Art. 15 RGPD — droit d'accès.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> accessUserData(Long targetUserId, Long requestedByUserId, Long companyId) {
        List<PromptEvent> events = promptEventRepository.findByUserIdOrderByCreatedAtDesc(targetUserId);

        List<Map<String, Object>> eventData = events.stream().map(e -> {
            Map<String, Object> eventMap = new LinkedHashMap<>();
            eventMap.put("event_id", e.getId());
            eventMap.put("timestamp", e.getCreatedAt().toString());
            eventMap.put("ai_tool", e.getAiTool().name());
            eventMap.put("risk_score", e.getRiskScore());
            eventMap.put("risk_level", e.getRiskLevel().name());
            eventMap.put("action", e.getWasBlocked() ? "BLOCKED" : e.getWasSanitized() ? "SANITIZED" : "PASSED");
            eventMap.put("prompt_hash", e.getPromptHash());
            eventMap.put("contains_article9", e.getContainsArticle9());

            // Détections associées (redactées)
            List<RiskDetection> detections = riskDetectionRepository.findByPromptEventId(e.getId());
            eventMap.put("detections", detections.stream().map(d -> {
                Map<String, Object> det = new LinkedHashMap<>();
                det.put("category", d.getCategory().name());
                det.put("confidence", d.getConfidence());
                det.put("method", d.getDetectionMethod());
                det.put("snippet_redacted", d.getDataSnippetRedacted());
                return det;
            }).toList());

            return eventMap;
        }).toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("user_id", targetUserId);
        result.put("total_events", events.size());
        result.put("export_date", LocalDateTime.now().toString());
        result.put("events", eventData);

        // Audit
        logAudit(requestedByUserId, targetUserId, companyId, "ACCESS",
                String.format("Accès aux données : %d events exportés", events.size()));

        return result;
    }

    // ── Droit à l'effacement (Art. 17) ──────────────────────────────

    /**
     * Supprime toutes les données liées à un utilisateur.
     * Conforme Art. 17 RGPD — droit à l'effacement ("droit à l'oubli").
     */
    @Transactional
    public Map<String, Object> eraseUserData(Long targetUserId, Long requestedByUserId, Long companyId) {
        long eventCount = promptEventRepository.countByUserId(targetUserId);

        // Supprimer en cascade : detections → alertes → events
        riskDetectionRepository.deleteByPromptEventUserId(targetUserId);
        alertRepository.deleteByUserId(targetUserId);
        promptEventRepository.deleteByUserId(targetUserId);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("user_id", targetUserId);
        result.put("events_deleted", eventCount);
        result.put("erasure_date", LocalDateTime.now().toString());
        result.put("status", "COMPLETED");

        // Audit (la trace d'audit elle-même est conservée pour la conformité)
        logAudit(requestedByUserId, targetUserId, companyId, "ERASURE",
                String.format("Effacement complet : %d events supprimés", eventCount));

        log.info("RGPD erasure completed for user {} : {} events deleted", targetUserId, eventCount);
        return result;
    }

    // ── Droit à la portabilité (Art. 20) ────────────────────────────

    /**
     * Export structuré (JSON portable) des données d'un utilisateur.
     * Conforme Art. 20 RGPD — droit à la portabilité.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> exportUserData(Long targetUserId, Long requestedByUserId, Long companyId) {
        Map<String, Object> data = accessUserData(targetUserId, requestedByUserId, companyId);

        // Enrichir pour la portabilité
        data.put("export_format", "JSON");
        data.put("export_version", "1.0");
        data.put("data_controller", "CyberSensei AI Security");
        data.put("purpose", "Protection contre les fuites de données sensibles via outils IA");

        // Re-log comme EXPORT (accessUserData a déjà loggé ACCESS)
        logAudit(requestedByUserId, targetUserId, companyId, "EXPORT",
                String.format("Export portabilité : %d events", data.get("total_events")));

        return data;
    }

    // ── Registre des traitements (Art. 30) ──────────────────────────

    /**
     * Génère automatiquement le registre des traitements.
     * Conforme Art. 30 RGPD.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getProcessingRegistry(Long companyId) {
        // Récupérer la politique de rétention active
        Optional<RetentionPolicy> policy = retentionPolicyRepository.findByCompanyIdAndIsActiveTrue(companyId);
        int retentionDays = policy.map(RetentionPolicy::getRetentionDays).orElse(90);
        int art9RetentionDays = policy.map(RetentionPolicy::getArticle9RetentionDays).orElse(30);

        Map<String, Object> registry = new LinkedHashMap<>();

        // 1. Identification du traitement
        registry.put("treatment_name", "CyberSensei AI Security — Analyse DLP des prompts IA");
        registry.put("data_controller", "Entreprise cliente (ID: " + companyId + ")");
        registry.put("data_processor", "CyberSensei SAS");
        registry.put("dpo_contact", "dpo@cybersensei.io");

        // 2. Finalité
        registry.put("purpose", "Détection et prévention des fuites de données sensibles " +
                "lors de l'utilisation d'outils d'intelligence artificielle générative " +
                "(ChatGPT, Gemini, Claude, Copilot, Mistral)");
        registry.put("legal_basis", "Intérêt légitime de l'employeur (Art. 6.1.f RGPD) " +
                "— protection du patrimoine informationnel et conformité réglementaire");

        // 3. Catégories de données traitées
        registry.put("data_categories", List.of(
                Map.of("category", "Données d'identification", "examples", "Noms, emails, téléphones",
                        "retention", retentionDays + " jours"),
                Map.of("category", "Données financières", "examples", "IBAN, numéros CB, montants",
                        "retention", retentionDays + " jours"),
                Map.of("category", "Données de santé (Art. 9)", "examples", "Diagnostics, traitements, médicaments",
                        "retention", art9RetentionDays + " jours"),
                Map.of("category", "Opinions politiques (Art. 9)", "examples", "Appartenance partisane",
                        "retention", art9RetentionDays + " jours"),
                Map.of("category", "Appartenance syndicale (Art. 9)", "examples", "Affiliation syndicale",
                        "retention", art9RetentionDays + " jours"),
                Map.of("category", "Identifiants nationaux", "examples", "NIR, numéro fiscal, SIRET",
                        "retention", retentionDays + " jours"),
                Map.of("category", "Credentials/Secrets", "examples", "Mots de passe, clés API, tokens",
                        "retention", retentionDays + " jours"),
                Map.of("category", "Code source", "examples", "Code propriétaire, algorithmes",
                        "retention", retentionDays + " jours")
        ));

        // 4. Catégories de personnes concernées
        registry.put("data_subjects", List.of(
                "Employés de l'entreprise utilisant des outils IA",
                "Personnes dont les données apparaissent dans les prompts analysés"
        ));

        // 5. Destinataires
        registry.put("recipients", List.of(
                "Administrateurs sécurité de l'entreprise (dashboard)",
                "DPO de l'entreprise (alertes Art. 9)",
                "Aucun transfert vers des tiers ou hors UE"
        ));

        // 6. Durées de conservation
        registry.put("retention_policy", Map.of(
                "standard_events", retentionDays + " jours",
                "article9_events", art9RetentionDays + " jours",
                "audit_logs", "3 ans (obligation légale)",
                "purge_method", "Suppression automatique via job planifié (quotidien à 3h)"
        ));

        // 7. Mesures de sécurité
        registry.put("security_measures", List.of(
                "Prompts jamais stockés en clair — uniquement hash SHA-256",
                "Données sensibles détectées stockées en version redactée/masquée",
                "Analyse 100% on-premise — aucune donnée envoyée à un service cloud",
                "Chiffrement TLS en transit",
                "Authentification JWT pour l'API",
                "Journal d'audit pour chaque opération RGPD",
                "Politique de rétention automatique avec purge planifiée"
        ));

        // 8. Transferts hors UE
        registry.put("international_transfers", "Aucun — traitement intégralement réalisé " +
                "sur l'infrastructure de l'entreprise (on-premise) ou sur des serveurs européens");

        // 9. Droits des personnes
        registry.put("data_subject_rights", Map.of(
                "access", "GET /api/v1/rgpd/access/{userId}",
                "erasure", "DELETE /api/v1/rgpd/erasure/{userId}",
                "portability", "GET /api/v1/rgpd/export/{userId}",
                "contact", "dpo@cybersensei.io"
        ));

        registry.put("generated_at", LocalDateTime.now().toString());

        return registry;
    }

    // ── Politique de rétention ───────────────────────────────────────

    /**
     * Crée ou met à jour la politique de rétention d'une entreprise.
     */
    @Transactional
    public RetentionPolicy upsertRetentionPolicy(Long companyId, int retentionDays, int article9RetentionDays) {
        Optional<RetentionPolicy> existing = retentionPolicyRepository
                .findByCompanyIdAndPolicyName(companyId, "default");

        RetentionPolicy policy;
        if (existing.isPresent()) {
            policy = existing.get();
            policy.setRetentionDays(retentionDays);
            policy.setArticle9RetentionDays(article9RetentionDays);
        } else {
            policy = RetentionPolicy.builder()
                    .companyId(companyId)
                    .policyName("default")
                    .retentionDays(retentionDays)
                    .article9RetentionDays(article9RetentionDays)
                    .build();
        }

        return retentionPolicyRepository.save(policy);
    }

    // ── Job de purge automatique ────────────────────────────────────

    /**
     * Purge quotidienne des events dont la rétention a expiré.
     * Exécuté chaque jour à 3h du matin.
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void purgeExpiredEvents() {
        log.info("Starting RGPD retention purge job");
        LocalDateTime now = LocalDateTime.now();
        int totalPurged = 0;

        // 1. Purger les events expirés (ceux avec retention_expires_at dans le passé)
        List<PromptEvent> expiredEvents = promptEventRepository.findExpiredEvents(now);

        for (PromptEvent event : expiredEvents) {
            riskDetectionRepository.deleteByPromptEventId(event.getId());
            alertRepository.deleteByPromptEventId(event.getId());
            promptEventRepository.delete(event);
            totalPurged++;
        }

        // 2. Pour les events sans date de rétention, appliquer la politique par défaut
        List<Long> companyIds = promptEventRepository
                .findDistinctCompanyIdsByCreatedAtAfter(now.minusYears(1));

        for (Long companyId : companyIds) {
            Optional<RetentionPolicy> policy = retentionPolicyRepository
                    .findByCompanyIdAndIsActiveTrue(companyId);

            int standardDays = policy.map(RetentionPolicy::getRetentionDays).orElse(90);
            int art9Days = policy.map(RetentionPolicy::getArticle9RetentionDays).orElse(30);

            // Purger les events Art. 9 au-delà de la rétention Art. 9
            List<PromptEvent> art9Expired = promptEventRepository
                    .findExpiredArticle9Events(now);
            for (PromptEvent event : art9Expired) {
                if (event.getCompanyId().equals(companyId)) {
                    riskDetectionRepository.deleteByPromptEventId(event.getId());
                    alertRepository.deleteByPromptEventId(event.getId());
                    promptEventRepository.delete(event);
                    totalPurged++;
                }
            }
        }

        log.info("RGPD purge completed: {} events purged", totalPurged);

        // Audit de la purge
        if (totalPurged > 0) {
            auditLogRepository.save(RgpdAuditLog.builder()
                    .requestedByUserId(0L) // Système
                    .targetUserId(0L) // Tous
                    .companyId(0L) // Toutes
                    .operation("RETENTION_PURGE")
                    .details(String.format("Purge automatique : %d events supprimés", totalPurged))
                    .build());
        }
    }

    // ── Audit ───────────────────────────────────────────────────────

    private void logAudit(Long requestedBy, Long target, Long companyId, String operation, String details) {
        auditLogRepository.save(RgpdAuditLog.builder()
                .requestedByUserId(requestedBy)
                .targetUserId(target)
                .companyId(companyId)
                .operation(operation)
                .details(details)
                .build());
    }

    /**
     * Retourne le journal d'audit RGPD pour une entreprise.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAuditLog(Long companyId) {
        return auditLogRepository.findByCompanyIdOrderByCreatedAtDesc(companyId).stream()
                .map(entry -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", entry.getId());
                    map.put("operation", entry.getOperation());
                    map.put("requested_by", entry.getRequestedByUserId());
                    map.put("target_user", entry.getTargetUserId());
                    map.put("details", entry.getDetails());
                    map.put("status", entry.getStatus());
                    map.put("timestamp", entry.getCreatedAt().toString());
                    return map;
                }).toList();
    }
}
