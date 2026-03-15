package io.cybersensei.api.controller;

import io.cybersensei.domain.entity.AIProfile;
import io.cybersensei.service.AIProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AI Profile Controller - Personalization API
 */
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Tag(name = "AI Profile", description = "User profile and personalization endpoints")
@SecurityRequirement(name = "bearer-jwt")
public class AIProfileController {

    private final AIProfileService aiProfileService;

    @GetMapping
    @Operation(summary = "Get current user's AI profile")
    public ResponseEntity<AIProfileResponse> getProfile() {
        AIProfile profile = aiProfileService.getOrCreateProfile();
        return ResponseEntity.ok(toResponse(profile));
    }

    @GetMapping("/greeting")
    @Operation(summary = "Get personalized greeting for dashboard")
    public ResponseEntity<Map<String, Object>> getPersonalizedGreeting() {
        return ResponseEntity.ok(aiProfileService.getPersonalizedGreeting());
    }

    @GetMapping("/recommendations")
    @Operation(summary = "Get personalized learning recommendations")
    public ResponseEntity<Map<String, Object>> getRecommendations() {
        return ResponseEntity.ok(aiProfileService.getRecommendations());
    }

    @PutMapping("/preferences")
    @Operation(summary = "Update user preferences")
    public ResponseEntity<AIProfileResponse> updatePreferences(@RequestBody Map<String, Object> preferences) {
        AIProfile profile = aiProfileService.updatePreferences(preferences);
        return ResponseEntity.ok(toResponse(profile));
    }

    @PutMapping("/style")
    @Operation(summary = "Update learning style")
    public ResponseEntity<AIProfileResponse> updateStyle(@RequestBody StyleUpdateRequest request) {
        AIProfile profile = aiProfileService.updateStyle(request.style());
        return ResponseEntity.ok(toResponse(profile));
    }

    private AIProfileResponse toResponse(AIProfile profile) {
        return new AIProfileResponse(
                profile.getId(),
                profile.getUserId(),
                profile.getStyle(),
                profile.getStreakDays(),
                profile.getTotalXP(),
                profile.getCurrentLevel(),
                profile.getPreferencesJSON(),
                profile.getAnalyticsJSON(),
                profile.getWeaknessesJSON(),
                profile.getLastActivityDate() != null ? profile.getLastActivityDate().toString() : null
        );
    }

    public record AIProfileResponse(
            Long id,
            Long userId,
            String style,
            Integer streakDays,
            Integer totalXP,
            Integer currentLevel,
            Map<String, Object> preferences,
            Map<String, Object> analytics,
            Map<String, Object> weaknesses,
            String lastActivityDate
    ) {}

    public record StyleUpdateRequest(String style) {}
}
