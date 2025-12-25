package io.cybersensei.api.controller;

import io.cybersensei.api.dto.UserDto;
import io.cybersensei.domain.entity.User;
import io.cybersensei.domain.repository.UserRepository;
import io.cybersensei.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

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
    private final UserRepository userRepository;

    @GetMapping("/me")
    @Operation(summary = "Get current user information")
    public ResponseEntity<UserDto> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @GetMapping
    @Operation(summary = "List all users")
    public ResponseEntity<List<User>> listUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    @Operation(summary = "Create user (dev/demo)")
    public ResponseEntity<User> createUser(@RequestBody User payload) {
        // Mot de passe par défaut si absent
        if (payload.getPasswordHash() == null || payload.getPasswordHash().isBlank()) {
            payload.setPasswordHash("$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"); // bcrypt: password
        }
        payload.setActive(true);
        if (payload.getCreatedAt() == null) {
            payload.setCreatedAt(LocalDateTime.now());
        }
        return ResponseEntity.ok(userRepository.save(payload));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user (dev/demo)")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User payload) {
        return userRepository.findById(id)
                .map(existing -> {
                    existing.setName(payload.getName());
                    existing.setEmail(payload.getEmail());
                    existing.setRole(payload.getRole());
                    existing.setDepartment(payload.getDepartment());
                    existing.setActive(payload.getActive() != null ? payload.getActive() : existing.getActive());
                    return ResponseEntity.ok(userRepository.save(existing));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user (dev/demo)")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}


