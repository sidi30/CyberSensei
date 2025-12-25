package io.cybersensei.api.controller;

import io.cybersensei.api.dto.CompanyMetricsDto;
import io.cybersensei.service.MetricsService;
import io.cybersensei.domain.entity.User;
import io.cybersensei.domain.repository.UserExerciseResultRepository;
import io.cybersensei.domain.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Manager Dashboard Controller
 */
@RestController
@RequestMapping("/api/manager")
@RequiredArgsConstructor
@Tag(name = "Manager Dashboard", description = "Manager and admin endpoints")
public class ManagerController {

    private final MetricsService metricsService;
    private final UserRepository userRepository;
    private final UserExerciseResultRepository resultRepository;

    @GetMapping("/metrics")
    @Operation(summary = "Get company-wide security metrics")
    public ResponseEntity<CompanyMetricsDto> getMetrics() {
        return ResponseEntity.ok(metricsService.getLatestMetrics());
    }

    @GetMapping("/users-metrics")
    @Operation(summary = "Get metrics per user (light)")
    public ResponseEntity<List<Map<String, Object>>> getUsersMetrics() {
        List<Map<String, Object>> list = userRepository.findAll().stream().map(u -> Map.of(
                "userId", u.getId(),
                "userName", u.getName(),
                "department", u.getDepartment(),
                "score", 75,
                "riskLevel", "MEDIUM",
                "exercisesCompleted", resultRepository.count(),
                "phishingTestsPassed", 5,
                "phishingTestsFailed", 1,
                "weaknesses", List.of("phishing"),
                "lastActivity", LocalDateTime.now().minusDays(1).toString()
        )).toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/user/{id}")
    @Operation(summary = "Get metrics for one user")
    public ResponseEntity<Map<String, Object>> getUserMetrics(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(u -> Map.of(
                        "userId", u.getId(),
                        "userName", u.getName(),
                        "department", u.getDepartment(),
                        "score", 80,
                        "riskLevel", "LOW",
                        "exercisesCompleted", resultRepository.count(),
                        "phishingTestsPassed", 6,
                        "phishingTestsFailed", 0,
                        "weaknesses", List.of("passwords"),
                        "lastActivity", LocalDateTime.now().minusHours(4).toString()
                ))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}


