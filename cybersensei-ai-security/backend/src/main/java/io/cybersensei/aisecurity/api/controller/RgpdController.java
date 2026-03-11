package io.cybersensei.aisecurity.api.controller;

import io.cybersensei.aisecurity.domain.entity.RetentionPolicy;
import io.cybersensei.aisecurity.service.RgpdComplianceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Endpoints RGPD — Articles 15, 17, 20 et 30.
 *
 * Chaque appel est audité automatiquement dans rgpd_audit_log.
 */
@RestController
@RequestMapping("/api/v1/rgpd")
@RequiredArgsConstructor
@Tag(name = "RGPD Compliance", description = "Conformité RGPD : accès, effacement, portabilité, registre")
public class RgpdController {

    private final RgpdComplianceService rgpdService;

    // ── Art. 15 — Droit d'accès ─────────────────────────────────────

    @GetMapping("/access/{userId}")
    @Operation(summary = "Droit d'accès (Art. 15)",
            description = "Retourne toutes les données traitées concernant un utilisateur")
    public ResponseEntity<Map<String, Object>> accessUserData(
            @PathVariable Long userId,
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "0") Long requestedBy
    ) {
        return ResponseEntity.ok(rgpdService.accessUserData(userId, requestedBy, companyId));
    }

    // ── Art. 17 — Droit à l'effacement ──────────────────────────────

    @DeleteMapping("/erasure/{userId}")
    @Operation(summary = "Droit à l'effacement (Art. 17)",
            description = "Supprime toutes les données traitées concernant un utilisateur")
    public ResponseEntity<Map<String, Object>> eraseUserData(
            @PathVariable Long userId,
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "0") Long requestedBy
    ) {
        return ResponseEntity.ok(rgpdService.eraseUserData(userId, requestedBy, companyId));
    }

    // ── Art. 20 — Droit à la portabilité ────────────────────────────

    @GetMapping("/export/{userId}")
    @Operation(summary = "Droit à la portabilité (Art. 20)",
            description = "Export structuré JSON des données d'un utilisateur")
    public ResponseEntity<Map<String, Object>> exportUserData(
            @PathVariable Long userId,
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "0") Long requestedBy
    ) {
        return ResponseEntity.ok(rgpdService.exportUserData(userId, requestedBy, companyId));
    }

    // ── Art. 30 — Registre des traitements ──────────────────────────

    @GetMapping("/registry")
    @Operation(summary = "Registre des traitements (Art. 30)",
            description = "Génère automatiquement le registre des traitements RGPD")
    public ResponseEntity<Map<String, Object>> getProcessingRegistry(
            @RequestParam Long companyId
    ) {
        return ResponseEntity.ok(rgpdService.getProcessingRegistry(companyId));
    }

    // ── Politique de rétention ───────────────────────────────────────

    @PutMapping("/retention")
    @Operation(summary = "Configurer la politique de rétention",
            description = "Définit la durée de conservation des données (standard et Art. 9)")
    public ResponseEntity<RetentionPolicy> updateRetentionPolicy(
            @RequestParam Long companyId,
            @RequestParam @Min(1) int retentionDays,
            @RequestParam @Min(1) int article9RetentionDays
    ) {
        return ResponseEntity.ok(
                rgpdService.upsertRetentionPolicy(companyId, retentionDays, article9RetentionDays));
    }

    // ── Journal d'audit RGPD ────────────────────────────────────────

    @GetMapping("/audit-log")
    @Operation(summary = "Journal d'audit RGPD",
            description = "Consulte l'historique de toutes les opérations RGPD")
    public ResponseEntity<List<Map<String, Object>>> getAuditLog(
            @RequestParam Long companyId
    ) {
        return ResponseEntity.ok(rgpdService.getAuditLog(companyId));
    }
}
