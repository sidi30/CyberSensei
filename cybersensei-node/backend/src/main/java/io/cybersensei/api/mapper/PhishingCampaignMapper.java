package io.cybersensei.api.mapper;

import io.cybersensei.api.dto.PhishingCampaignDto;
import io.cybersensei.domain.entity.PhishingCampaign;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface PhishingCampaignMapper {
    
    @Mapping(target = "clickRate", expression = "java(calculateRate(campaign.getTotalClicked(), campaign.getTotalSent()))")
    @Mapping(target = "openRate", expression = "java(calculateRate(campaign.getTotalOpened(), campaign.getTotalSent()))")
    @Mapping(target = "reportRate", expression = "java(calculateRate(campaign.getTotalReported(), campaign.getTotalSent()))")
    PhishingCampaignDto toDto(PhishingCampaign campaign);
    
    PhishingCampaign toEntity(PhishingCampaignDto dto);
    
    default Double calculateRate(Integer count, Integer total) {
        if (total == null || total == 0) return 0.0;
        return (count != null ? count : 0) * 100.0 / total;
    }
}


