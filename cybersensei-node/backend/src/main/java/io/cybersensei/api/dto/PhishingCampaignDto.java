package io.cybersensei.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhishingCampaignDto {
    private Long id;
    private Long templateId;
    private LocalDateTime sentAt;
    private Integer totalSent;
    private Integer totalClicked;
    private Integer totalOpened;
    private Integer totalReported;
    private Double clickRate;
    private Double openRate;
    private Double reportRate;
}


