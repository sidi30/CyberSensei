package com.cybersensei.backend.entity;

import io.cybersensei.domain.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_modules_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "module_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserModuleProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    @Column(name = "exercises_completed", nullable = false)
    private Integer exercisesCompleted = 0;

    @Column(name = "exercises_success", nullable = false)
    private Integer exercisesSuccess = 0;

    @Column(name = "total_exercises", nullable = false)
    private Integer totalExercises = 0;

    @Column(name = "completion_percentage", nullable = false)
    private Double completionPercentage = 0.0;

    @Column(name = "average_score", nullable = false)
    private Double averageScore = 0.0;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "NOT_STARTED"; // NOT_STARTED, IN_PROGRESS, COMPLETED

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "last_activity_at")
    private LocalDateTime lastActivityAt;
}

