package io.cybersensei.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "badges")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "icon_url", length = 500)
    private String iconUrl;

    @Column(name = "badge_type", nullable = false, length = 50)
    private String badgeType; // MODULE, LEVEL, STREAK, SPECIAL

    @Column(name = "requirement_type", length = 50)
    private String requirementType;

    @Column(name = "requirement_value")
    private String requirementValue;

    @Column(name = "rarity", nullable = false, length = 50)
    private String rarity = "COMMON"; // COMMON, RARE, EPIC, LEGENDARY

    @Column(name = "points", nullable = false)
    private Integer points = 0;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 0;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

