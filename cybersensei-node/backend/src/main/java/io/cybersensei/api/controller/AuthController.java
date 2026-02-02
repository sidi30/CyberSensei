package io.cybersensei.api.controller;

import io.cybersensei.api.dto.AuthRequest;
import io.cybersensei.api.dto.AuthResponse;
import io.cybersensei.api.dto.TeamsTokenExchangeRequest;
import io.cybersensei.api.dto.TeamsTokenExchangeResponse;
import io.cybersensei.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication endpoints")
public class AuthController {

    private final UserService userService;

    @Value("${cybersensei.dev-mode:true}")
    private boolean devModeEnabled;

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and get JWT token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(userService.authenticate(request));
    }

    @PostMapping("/teams/exchange")
    @Operation(
        summary = "Exchange Teams SSO token for backend JWT",
        description = "Creates or updates user from Teams info and returns a backend JWT token"
    )
    public ResponseEntity<TeamsTokenExchangeResponse> exchangeTeamsToken(
            @Valid @RequestBody TeamsTokenExchangeRequest request) {
        log.info("Teams token exchange requested for user: {}", request.getEmail());
        TeamsTokenExchangeResponse response = userService.exchangeTeamsToken(request);
        log.info("Teams token exchanged successfully for user: {}", response.getUserId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/dev-login")
    @Operation(
        summary = "Development mode authentication",
        description = "Returns a JWT token for development/testing purposes. Only available when dev-mode is enabled."
    )
    public ResponseEntity<TeamsTokenExchangeResponse> devLogin(
            @RequestParam(required = false, defaultValue = "EMPLOYEE") String role) {
        if (!devModeEnabled) {
            log.warn("Dev login attempted but dev-mode is disabled");
            return ResponseEntity.status(403).build();
        }

        log.info("Dev login requested for role: {}", role);
        TeamsTokenExchangeResponse response = userService.devLogin(role);
        log.info("Dev login successful for user: {}", response.getUserId());
        return ResponseEntity.ok(response);
    }
}


