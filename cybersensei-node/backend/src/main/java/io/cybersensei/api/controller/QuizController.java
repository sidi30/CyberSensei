package io.cybersensei.api.controller;

import io.cybersensei.api.dto.ExerciseDto;
import io.cybersensei.api.dto.SubmitExerciseRequest;
import io.cybersensei.api.dto.UserExerciseResultDto;
import io.cybersensei.domain.repository.UserExerciseResultRepository;
import io.cybersensei.service.QuizService;
import io.cybersensei.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Quiz Controller
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Quiz & Exercises", description = "Quiz and exercise endpoints")
@SecurityRequirement(name = "bearer-jwt")
public class QuizController {

    private final QuizService quizService;
    private final UserService userService;
    private final UserExerciseResultRepository resultRepository;

    @GetMapping("/quiz/today")
    @Operation(summary = "Get today's personalized quiz")
    public ResponseEntity<ExerciseDto> getTodayQuiz() {
        return ResponseEntity.ok(quizService.getTodayQuiz());
    }

    @PostMapping("/exercise/{id}/submit")
    @Operation(summary = "Submit exercise results")
    public ResponseEntity<UserExerciseResultDto> submitExercise(
            @PathVariable Long id,
            @Valid @RequestBody SubmitExerciseRequest request) {
        return ResponseEntity.ok(quizService.submitExercise(id, request));
    }

    @GetMapping("/exercises/history")
    @Operation(summary = "Get exercise history for current user")
    public ResponseEntity<List<UserExerciseResultDto>> getExerciseHistory() {
        // Get current user
        var currentUser = userService.getCurrentUser();
        
        // Get all results for this user, ordered by date desc
        var results = resultRepository.findRecentByUserId(currentUser.getId());
        
        // Convert to DTOs
        var dtos = results.stream()
                .map(result -> UserExerciseResultDto.builder()
                        .id(result.getId())
                        .exerciseId(result.getExerciseId())
                        .userId(result.getUserId())
                        .title(result.getExercise() != null ? result.getExercise().getTopic() : "Unknown")
                        .score(result.getScore())
                        .maxScore(100.0) // Default max score
                        .success(result.getSuccess())
                        .duration(result.getDuration())
                        .date(result.getDate())
                        .completedAt(result.getDate()) // Alias for Teams app compatibility
                        .detailsJSON(result.getDetailsJSON())
                        .build())
                .toList();
        
        return ResponseEntity.ok(dtos);
    }
}


