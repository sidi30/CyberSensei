package io.cybersensei.api.controller;

import io.cybersensei.api.dto.UserDto;
import io.cybersensei.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * User Management Controller
 */
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "User management endpoints")
@SecurityRequirement(name = "bearer-jwt")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user information")
    public ResponseEntity<UserDto> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
}


