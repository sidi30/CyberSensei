package io.cybersensei.api.controller;

import io.cybersensei.api.dto.AuthRequest;
import io.cybersensei.api.dto.AuthResponse;
import io.cybersensei.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication endpoints")
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and get JWT token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(userService.authenticate(request));
    }

    @PostMapping("/teams")
    @Operation(summary = "Authenticate via Microsoft Teams SSO")
    public ResponseEntity<AuthResponse> teamsLogin(@RequestParam String msTeamsToken) {
        // In production, validate MS Teams token and extract user info
        // For now, this is a placeholder
        throw new UnsupportedOperationException("Teams SSO not yet implemented");
    }
}


