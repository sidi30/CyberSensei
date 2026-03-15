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

@RestController
@RequestMapping("/api/ai-security")
@RequiredArgsConstructor
@Tag(name = "Prompt Analysis", description = "Analyse de sécurité des prompts AI")
public class PromptAnalysisController {

    private final PromptSecurityService promptSecurityService;

    @PostMapping("/analyze")
    @Operation(summary = "Analyser un prompt", description = "Analyse un prompt pour détecter les données sensibles et les risques de fuite")
    public ResponseEntity<AnalyzePromptResponse> analyzePrompt(@Valid @RequestBody AnalyzePromptRequest request) {
        return ResponseEntity.ok(promptSecurityService.analyzeAndProcess(request));
    }
}
