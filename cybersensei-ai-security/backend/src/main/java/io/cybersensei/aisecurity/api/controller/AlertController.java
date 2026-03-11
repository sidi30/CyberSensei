package io.cybersensei.aisecurity.api.controller;

import io.cybersensei.aisecurity.api.dto.response.AlertResponse;
import io.cybersensei.aisecurity.domain.enums.AlertStatus;
import io.cybersensei.aisecurity.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai-security/alerts")
@RequiredArgsConstructor
@Tag(name = "Alerts", description = "Gestion des alertes de sécurité AI")
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    @Operation(summary = "Lister les alertes", description = "Retourne les alertes paginées pour une entreprise")
    public ResponseEntity<Page<AlertResponse>> getAlerts(
            @RequestParam Long companyId,
            @RequestParam(required = false) AlertStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(alertService.getAlerts(companyId, status, pageable));
    }

    @GetMapping("/count")
    @Operation(summary = "Compter les alertes ouvertes")
    public ResponseEntity<Map<String, Long>> countOpenAlerts(@RequestParam Long companyId) {
        return ResponseEntity.ok(Map.of("count", alertService.countOpenAlerts(companyId)));
    }

    @PatchMapping("/{alertId}/resolve")
    @Operation(summary = "Résoudre une alerte")
    public ResponseEntity<AlertResponse> resolveAlert(
            @PathVariable Long alertId,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(alertService.resolveAlert(alertId, userId));
    }

    @PatchMapping("/{alertId}/dismiss")
    @Operation(summary = "Rejeter une alerte")
    public ResponseEntity<AlertResponse> dismissAlert(
            @PathVariable Long alertId,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(alertService.dismissAlert(alertId, userId));
    }
}
