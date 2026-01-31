package io.cybersensei.domain.repository;

import io.cybersensei.domain.entity.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    List<Exercise> findByTypeAndActiveTrue(Exercise.ExerciseType type);
    List<Exercise> findByDifficultyAndActiveTrue(Exercise.Difficulty difficulty);

    @Query("SELECT e FROM Exercise e WHERE e.active = true ORDER BY RANDOM() LIMIT 1")
    Exercise findRandomActiveExercise();

    /**
     * Find exercises by difficulty that the user has NOT completed yet
     */
    @Query("SELECT e FROM Exercise e WHERE e.difficulty = :difficulty AND e.active = true " +
           "AND e.id NOT IN (SELECT r.exerciseId FROM UserExerciseResult r WHERE r.userId = :userId)")
    List<Exercise> findUncompletedByDifficultyAndUserId(
            @Param("difficulty") Exercise.Difficulty difficulty,
            @Param("userId") Long userId);

    /**
     * Find any active exercise that the user has NOT completed yet
     */
    @Query("SELECT e FROM Exercise e WHERE e.active = true " +
           "AND e.id NOT IN (SELECT r.exerciseId FROM UserExerciseResult r WHERE r.userId = :userId) " +
           "ORDER BY RANDOM() LIMIT 1")
    Exercise findRandomUncompletedByUserId(@Param("userId") Long userId);

    /**
     * Find exercises by topic that the user has NOT completed yet
     */
    @Query("SELECT e FROM Exercise e WHERE e.topic = :topic AND e.active = true " +
           "AND e.id NOT IN (SELECT r.exerciseId FROM UserExerciseResult r WHERE r.userId = :userId)")
    List<Exercise> findUncompletedByTopicAndUserId(
            @Param("topic") String topic,
            @Param("userId") Long userId);

    /**
     * Count completed exercises by user
     */
    @Query("SELECT COUNT(DISTINCT r.exerciseId) FROM UserExerciseResult r WHERE r.userId = :userId")
    Long countCompletedByUserId(@Param("userId") Long userId);

    /**
     * Count total active exercises
     */
    @Query("SELECT COUNT(e) FROM Exercise e WHERE e.active = true")
    Long countActiveExercises();
}


