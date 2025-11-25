package io.cybersensei.api.controller;

import io.cybersensei.service.SyncAgentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Sync Controller
 * 
 * Provides manual triggers for sync operations (admin only)
 */
@RestController
@RequestMapping("/api/sync")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Sync", description = "Sync agent operations")
public class SyncController {

    private final SyncAgentService syncAgentService;

    /**
     * Manually trigger update check
     * 
     * POST /api/sync/update/check
     */
    @PostMapping("/update/check")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Trigger manual update check", 
               description = "Checks for updates and applies them if available (Admin only)")
    public ResponseEntity<Map<String, String>> triggerUpdateCheck() {
        log.info("📡 Manual update check triggered by admin");

        try {
            // Trigger async to not block the request
            new Thread(() -> syncAgentService.triggerManualUpdateCheck()).start();

            return ResponseEntity.accepted().body(Map.of(
                "status", "accepted",
                "message", "Update check started. Check logs for progress."
            ));

        } catch (Exception e) {
            log.error("Failed to trigger update check: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Manually trigger telemetry push
     * 
     * POST /api/sync/telemetry/push
     */
    @PostMapping("/telemetry/push")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Trigger manual telemetry push", 
               description = "Pushes current telemetry data to central server (Admin only)")
    public ResponseEntity<Map<String, String>> triggerTelemetryPush() {
        log.info("📊 Manual telemetry push triggered by admin");

        try {
            syncAgentService.triggerManualTelemetryPush();

            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Telemetry pushed successfully"
            ));

        } catch (Exception e) {
            log.error("Failed to push telemetry: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Get sync status
     * 
     * GET /api/sync/status
     */
    @GetMapping("/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get sync agent status", 
               description = "Returns current sync agent configuration and status")
    public ResponseEntity<Map<String, Object>> getSyncStatus() {
        // TODO: Implement status retrieval from config
        return ResponseEntity.ok(Map.of(
            "enabled", true,
            "lastUpdateCheck", "2024-11-24T03:00:00",
            "lastTelemetryPush", "2024-11-24T09:00:00",
            "currentVersion", "1.0.0"
        ));
    }
}
