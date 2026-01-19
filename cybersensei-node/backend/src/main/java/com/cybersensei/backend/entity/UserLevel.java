package com.cybersensei.backend.entity;

import io.cybersensei.domain.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_level")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLevel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "current_level", nullable = false)
    private Integer currentLevel = 1;

    @Column(name = "total_xp", nullable = false)
    private Integer totalXp = 0;

    @Column(name = "xp_to_next_level", nullable = false)
    private Integer xpToNextLevel = 100;

    @Column(name = "modules_completed", nullable = false)
    private Integer modulesCompleted = 0;

    @Column(name = "total_badges", nullable = false)
    private Integer totalBadges = 0;

    @Column(name = "streak_days", nullable = false)
    private Integer streakDays = 0;

    @Column(name = "last_activity_date")
    private LocalDate lastActivityDate;

    @Column(name = "rank", nullable = false, length = 50)
    private String rank = "DÉBUTANT"; // DÉBUTANT, INTERMÉDIAIRE, AVANCÉ, EXPERT

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

