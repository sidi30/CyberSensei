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
 * AI Profile for personalized learning paths
 * Enhanced with preferences and analytics for personalized UI
 */
@Entity
@Table(name = "ai_profiles", indexes = {
    @Index(name = "idx_ai_profile_user", columnList = "user_id", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false)
    private String style; // e.g., "visual", "practical", "theoretical"

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "weaknesses_json", columnDefinition = "jsonb")
    private Map<String, Object> weaknessesJSON; // topics and scores

    // User preferences for UI personalization
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "preferences_json", columnDefinition = "jsonb")
    private Map<String, Object> preferencesJSON;
    // Contains: preferredDifficulty, uiTheme, notificationsEnabled, dailyGoal, preferredTopics

    // Analytics data for personalized recommendations
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "analytics_json", columnDefinition = "jsonb")
    private Map<String, Object> analyticsJSON;
    // Contains: avgResponseTime, streakDays, totalXP, lastActiveDate, topicProgress

    // Current streak (consecutive days)
    @Column(name = "streak_days", nullable = false)
    @Builder.Default
    private Integer streakDays = 0;

    // Total experience points earned
    @Column(name = "total_xp", nullable = false)
    @Builder.Default
    private Integer totalXP = 0;

    // Current level based on XP
    @Column(name = "current_level", nullable = false)
    @Builder.Default
    private Integer currentLevel = 1;

    // Last date the user completed an exercise
    @Column(name = "last_activity_date")
    private LocalDateTime lastActivityDate;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    /**
     * Calculate level from XP (100 XP per level, increasing)
     */
    public void recalculateLevel() {
        // Level 1: 0-99 XP, Level 2: 100-299 XP, Level 3: 300-599 XP, etc.
        int xp = this.totalXP != null ? this.totalXP : 0;
        int level = 1;
        int threshold = 100;
        while (xp >= threshold) {
            xp -= threshold;
            level++;
            threshold += 100;
        }
        this.currentLevel = level;
    }

    /**
     * Add XP and recalculate level
     */
    public void addXP(int xp) {
        this.totalXP = (this.totalXP != null ? this.totalXP : 0) + xp;
        recalculateLevel();
    }
}


