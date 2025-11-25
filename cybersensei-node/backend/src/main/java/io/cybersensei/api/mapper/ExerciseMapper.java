package io.cybersensei.api.mapper;

import io.cybersensei.api.dto.ExerciseDto;
import io.cybersensei.domain.entity.Exercise;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ExerciseMapper {
    ExerciseDto toDto(Exercise exercise);
    Exercise toEntity(ExerciseDto dto);
}


