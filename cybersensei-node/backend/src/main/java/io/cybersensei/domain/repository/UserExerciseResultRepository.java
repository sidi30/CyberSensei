package io.cybersensei.domain.repository;

import io.cybersensei.domain.entity.UserExerciseResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for UserExerciseResult entity
 */
@Repository
public interface UserExerciseResultRepository extends JpaRepository<UserExerciseResult, Long> {
    
    List<UserExerciseResult> findByUserId(Long userId);
    
    List<UserExerciseResult> findByExerciseId(Long exerciseId);
    
    @Query("SELECT COUNT(r) FROM UserExerciseResult r WHERE r.date >= :startDate AND r.date < :endDate")
    Long countByDateBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT r FROM UserExerciseResult r WHERE r.userId = :userId ORDER BY r.date DESC")
    List<UserExerciseResult> findRecentByUserId(@Param("userId") Long userId);
    
    @Query("SELECT AVG(r.score) FROM UserExerciseResult r WHERE r.userId = :userId")
    Double findAverageScoreByUserId(@Param("userId") Long userId);
    
    @Query("SELECT AVG(r.score) FROM UserExerciseResult r WHERE r.date >= :since")
    Double findAverageScoreSince(@Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(r) FROM UserExerciseResult r WHERE r.date >= :since")
    Long countResultsSince(@Param("since") LocalDateTime since);
}
