package io.cybersensei.service;

import io.cybersensei.api.dto.ExerciseDto;
import io.cybersensei.api.dto.SubmitExerciseRequest;
import io.cybersensei.api.dto.UserExerciseResultDto;
import io.cybersensei.api.mapper.ExerciseMapper;
import io.cybersensei.api.mapper.UserExerciseResultMapper;
import io.cybersensei.domain.entity.AIProfile;
import io.cybersensei.domain.entity.Exercise;
import io.cybersensei.domain.entity.User;
import io.cybersensei.domain.entity.UserExerciseResult;
import io.cybersensei.domain.repository.AIProfileRepository;
import io.cybersensei.domain.repository.ExerciseRepository;
import io.cybersensei.domain.repository.UserExerciseResultRepository;
import io.cybersensei.domain.repository.UserRepository;
import io.cybersensei.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;

/**
 * Quiz and Exercise Service
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class QuizService {

    private final ExerciseRepository exerciseRepository;
    private final UserExerciseResultRepository resultRepository;
    private final AIProfileRepository aiProfileRepository;
    private final UserRepository userRepository;
    private final ExerciseMapper exerciseMapper;
    private final UserExerciseResultMapper resultMapper;
    private final Random random = new Random();

    @Transactional(readOnly = true)
    public ExerciseDto getTodayQuiz() {
        UserPrincipal principal = getCurrentUser();
        Long userId = principal.getId();

        // Get user's AI profile to personalize quiz
        AIProfile profile = aiProfileRepository.findByUserId(userId).orElse(null);
        
        Exercise.Difficulty difficulty = determineDifficulty(userId, profile);
        
        // Find suitable quiz
        List<Exercise> exercises = exerciseRepository.findByDifficultyAndActiveTrue(difficulty);
        
        if (exercises.isEmpty()) {
            // Fallback to random active exercise
            Exercise exercise = exerciseRepository.findRandomActiveExercise();
            return exerciseMapper.toDto(exercise);
        }
        
        // Select random exercise from the filtered list
        Exercise exercise = exercises.get(random.nextInt(exercises.size()));
        return exerciseMapper.toDto(exercise);
    }

    @Transactional
    public UserExerciseResultDto submitExercise(Long exerciseId, SubmitExerciseRequest request) {
        UserPrincipal principal = getCurrentUser();
        Long userId = principal.getId();

        // Verify exercise exists
        exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new RuntimeException("Exercise not found: " + exerciseId));

        UserExerciseResult result = UserExerciseResult.builder()
                .userId(userId)
                .exerciseId(exerciseId)
                .score(request.getScore())
                .success(request.getSuccess())
                .duration(request.getDuration())
                .detailsJSON(request.getDetailsJSON())
                .build();

        result = resultRepository.save(result);
        
        log.info("User {} submitted exercise {} with score {}", userId, exerciseId, request.getScore());
        
        return resultMapper.toDto(result);
    }

    private Exercise.Difficulty determineDifficulty(Long userId, AIProfile profile) {
        // Calculate average score
        Double avgScore = resultRepository.findAverageScoreByUserId(userId);
        
        if (avgScore == null) {
            return Exercise.Difficulty.BEGINNER;
        }
        
        // Adaptive difficulty based on performance
        if (avgScore >= 85.0) {
            return Exercise.Difficulty.EXPERT;
        } else if (avgScore >= 70.0) {
            return Exercise.Difficulty.ADVANCED;
        } else if (avgScore >= 50.0) {
            return Exercise.Difficulty.INTERMEDIATE;
        } else {
            return Exercise.Difficulty.BEGINNER;
        }
    }

    private UserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        // MODE BYPASS : Si pas d'authentification ou authentification anonyme, retourner un utilisateur par défaut
        if (authentication == null || !authentication.isAuthenticated() || 
            "anonymousUser".equals(authentication.getPrincipal())) {
            // Récupérer le premier utilisateur de la base comme utilisateur par défaut
            User defaultUser = userRepository.findAll().stream()
                    .findFirst()
                    .orElse(User.builder()
                            .id(1L)
                            .email("admin@cybersensei.io")
                            .name("Admin Bypass")
                            .role(User.UserRole.ADMIN)
                            .active(true)
                            .build());
            return UserPrincipal.create(defaultUser);
        }
        
        return (UserPrincipal) authentication.getPrincipal();
    }
}


