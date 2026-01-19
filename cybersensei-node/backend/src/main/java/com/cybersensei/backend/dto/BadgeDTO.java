package com.cybersensei.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgeDTO {
    private Long badgeId;
    private String name;
    private String displayName;
    private String description;
    private String iconUrl;
    private String badgeType;
    private String rarity;
    private Integer points;
    private LocalDateTime earnedAt;
    private Boolean earned;
}

