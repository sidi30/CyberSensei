package io.cybersensei.api.mapper;

import io.cybersensei.api.dto.UserExerciseResultDto;
import io.cybersensei.domain.entity.UserExerciseResult;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserExerciseResultMapper {
    UserExerciseResultDto toDto(UserExerciseResult result);
    UserExerciseResult toEntity(UserExerciseResultDto dto);
}


