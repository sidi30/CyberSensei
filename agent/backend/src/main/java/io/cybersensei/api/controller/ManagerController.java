package io.cybersensei.api.controller;

import io.cybersensei.api.dto.CompanyMetricsDto;
import io.cybersensei.service.MetricsService;
import io.cybersensei.domain.entity.User;
import io.cybersensei.domain.repository.UserExerciseResultRepository;
import io.cybersensei.domain.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Manager Dashboard Controller
 */
@RestController
@RequestMapping("/api/manager")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
@SecurityRequirement(name = "bearer-jwt")
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

    @GetMapping("/users")
    @Operation(summary = "Get all users for manager dashboard")
    public ResponseEntity<List<Map<String, Object>>> getUsers(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String topic) {
        List<User> users = userRepository.findAll();

        if (department != null && !department.isEmpty()) {
            users = users.stream()
                    .filter(u -> department.equals(u.getDepartment()))
                    .toList();
        }

        List<Map<String, Object>> result = users.stream().map(u -> {
            Long exerciseCount = resultRepository.countByUserId(u.getId());
            Double avgScore = resultRepository.findAverageScoreByUserId(u.getId());

            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", u.getId().toString());
            map.put("displayName", u.getName());
            map.put("email", u.getEmail());
            map.put("department", u.getDepartment() != null ? u.getDepartment() : "Non assigné");
            map.put("score", avgScore != null ? avgScore : 0.0);
            map.put("completedExercises", exerciseCount != null ? exerciseCount.intValue() : 0);
            map.put("riskLevel", calculateRiskLevel(avgScore));

            return map;
        }).toList();

        return ResponseEntity.ok(result);
    }

    private String calculateRiskLevel(Double avgScore) {
        if (avgScore == null || avgScore < 50) return "HIGH";
        if (avgScore < 70) return "MEDIUM";
        return "LOW";
    }

    @GetMapping("/users-metrics")
    @Operation(summary = "Get metrics per user (light)")
    public ResponseEntity<List<Map<String, Object>>> getUsersMetrics() {
        List<Map<String, Object>> list = userRepository.findAll().stream().map(u -> {
            Long exerciseCount = resultRepository.countByUserId(u.getId());
            Double avgScore = resultRepository.findAverageScoreByUserId(u.getId());

            Map<String, Object> map = new java.util.HashMap<>();
            map.put("userId", u.getId());
            map.put("userName", u.getName());
            map.put("department", u.getDepartment());
            map.put("score", avgScore != null ? avgScore : 0.0);
            map.put("riskLevel", calculateRiskLevel(avgScore));
            map.put("exercisesCompleted", exerciseCount != null ? exerciseCount.intValue() : 0);

            return map;
        }).toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/user/{id}")
    @Operation(summary = "Get metrics for one user")
    public ResponseEntity<Map<String, Object>> getUserMetrics(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(u -> {
                    Long exerciseCount = resultRepository.countByUserId(u.getId());
                    Double avgScore = resultRepository.findAverageScoreByUserId(u.getId());

                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("userId", u.getId());
                    map.put("userName", u.getName());
                    map.put("department", u.getDepartment());
                    map.put("score", avgScore != null ? avgScore : 0.0);
                    map.put("riskLevel", calculateRiskLevel(avgScore));
                    map.put("exercisesCompleted", exerciseCount != null ? exerciseCount.intValue() : 0);

                    return map;
                })
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}


