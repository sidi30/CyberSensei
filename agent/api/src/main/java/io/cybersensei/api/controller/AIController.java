package io.cybersensei.api.controller;

import io.cybersensei.api.dto.AIChatRequest;
import io.cybersensei.api.dto.AIChatResponse;
import io.cybersensei.service.AIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AI Service Controller
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Service", description = "AI chat and assistance endpoints")
@SecurityRequirement(name = "bearer-jwt")
public class AIController {

    private final AIService aiService;

    @PostMapping("/chat")
    @Operation(summary = "Chat with AI assistant")
    public ResponseEntity<AIChatResponse> chat(@Valid @RequestBody AIChatRequest request) {
        return ResponseEntity.ok(aiService.chat(request));
    }
}

