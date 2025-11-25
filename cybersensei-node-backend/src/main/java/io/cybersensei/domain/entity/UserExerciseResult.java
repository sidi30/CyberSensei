package io.cybersensei.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * User exercise result tracking completion and performance
 */
@Entity
@Table(name = "user_exercise_results", indexes = {
    @Index(name = "idx_result_user", columnList = "userId"),
    @Index(name = "idx_result_exercise", columnList = "exerciseId"),
    @Index(name = "idx_result_date", columnList = "date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserExerciseResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long exerciseId;

    @Column(nullable = false)
    private Double score; // 0.0 to 100.0

    @Column(nullable = false)
    private Boolean success;

    @Column(nullable = false)
    private Integer duration; // in seconds

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> detailsJSON;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exerciseId", insertable = false, updatable = false)
    private Exercise exercise;
}


