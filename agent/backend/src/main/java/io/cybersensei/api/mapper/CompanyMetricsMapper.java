package io.cybersensei.api.mapper;

import io.cybersensei.api.dto.CompanyMetricsDto;
import io.cybersensei.domain.entity.CompanyMetrics;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface CompanyMetricsMapper {
    CompanyMetricsDto toDto(CompanyMetrics metrics);
    CompanyMetrics toEntity(CompanyMetricsDto dto);
}


