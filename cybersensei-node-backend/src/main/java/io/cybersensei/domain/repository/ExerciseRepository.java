package io.cybersensei.domain.repository;

import io.cybersensei.domain.entity.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    List<Exercise> findByTypeAndActiveTrue(Exercise.ExerciseType type);
    List<Exercise> findByDifficultyAndActiveTrue(Exercise.Difficulty difficulty);
    
    @Query("SELECT e FROM Exercise e WHERE e.active = true ORDER BY RANDOM() LIMIT 1")
    Exercise findRandomActiveExercise();
}


