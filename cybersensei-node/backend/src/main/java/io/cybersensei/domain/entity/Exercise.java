package io.cybersensei.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Exercise entity representing training exercises and quizzes
 * Enhanced with sync fields for Central → Node injection
 */
@Entity
@Table(name = "exercises", indexes = {
    @Index(name = "idx_exercise_type", columnList = "type"),
    @Index(name = "idx_exercise_difficulty", columnList = "difficulty"),
    @Index(name = "idx_exercise_central_id", columnList = "central_id", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Unique ID from Central for sync purposes
    @Column(name = "central_id", unique = true)
    private String centralId;

    // Version from Central for conflict resolution
    @Column
    private String version;

    // Last sync timestamp
    @Column(name = "synced_at")
    private LocalDateTime syncedAt;

    @Column(nullable = false)
    private String topic;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExerciseType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload_json", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> payloadJSON;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ExerciseType {
        QUIZ,
        SIMULATION,
        SCENARIO,
        CHALLENGE
    }

    public enum Difficulty {
        BEGINNER,
        INTERMEDIATE,
        ADVANCED,
        EXPERT
    }
}


