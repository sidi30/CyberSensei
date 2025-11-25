package io.cybersensei.api.controller;

import io.cybersensei.api.dto.ExerciseDto;
import io.cybersensei.api.dto.SubmitExerciseRequest;
import io.cybersensei.api.dto.UserExerciseResultDto;
import io.cybersensei.service.QuizService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}


