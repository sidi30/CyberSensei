package io.cybersensei.aisecurity.api.controller;

import io.cybersensei.aisecurity.api.dto.response.RiskScoreResponse;
import io.cybersensei.aisecurity.service.scoring.RiskScoringService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai-security")
@RequiredArgsConstructor
@Tag(name = "Risk Score", description = "Score de risque par entreprise")
public class RiskScoreController {

    private final RiskScoringService riskScoringService;

    @GetMapping("/risk-score")
    @Operation(summary = "Obtenir le score de risque", description = "Retourne le score de risque global d'une entreprise")
    public ResponseEntity<RiskScoreResponse> getRiskScore(
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(riskScoringService.getRiskScore(companyId, days));
    }
}
