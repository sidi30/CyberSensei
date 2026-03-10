package io.cybersensei.aisecurity.api.controller;

import io.cybersensei.aisecurity.api.dto.request.AnalyzePromptRequest;
import io.cybersensei.aisecurity.api.dto.response.AnalyzePromptResponse;
import io.cybersensei.aisecurity.service.PromptSecurityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint dédié pour l'extension navigateur CyberSensei.
 * Sécurisé par clé API (pas de JWT requis) pour simplifier le déploiement.
 */
@RestController
@RequestMapping("/api/extension")
@RequiredArgsConstructor
@Tag(name = "Browser Extension", description = "API dédiée à l'extension navigateur CyberSensei")
public class ExtensionController {

    private final PromptSecurityService promptSecurityService;

    @PostMapping("/analyze")
    @Operation(summary = "Analyser un prompt (extension)", description = "Analyse un prompt intercepté par l'extension navigateur")
    public ResponseEntity<AnalyzePromptResponse> analyzeFromExtension(@Valid @RequestBody AnalyzePromptRequest request) {
        return ResponseEntity.ok(promptSecurityService.analyzeAndProcess(request));
    }
}
