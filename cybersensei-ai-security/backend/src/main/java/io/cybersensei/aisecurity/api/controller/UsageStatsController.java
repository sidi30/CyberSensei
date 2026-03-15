package io.cybersensei.aisecurity.api.controller;

import io.cybersensei.aisecurity.api.dto.response.UsageStatsResponse;
import io.cybersensei.aisecurity.service.UsageStatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai-security")
@RequiredArgsConstructor
@Tag(name = "Usage Stats", description = "Statistiques d'utilisation AI")
public class UsageStatsController {

    private final UsageStatsService usageStatsService;

    @GetMapping("/usage-stats")
    @Operation(summary = "Obtenir les statistiques d'utilisation", description = "Retourne les statistiques d'utilisation AI pour une entreprise")
    public ResponseEntity<UsageStatsResponse> getUsageStats(
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(usageStatsService.getUsageStats(companyId, days));
    }
}
