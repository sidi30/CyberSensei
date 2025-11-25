package io.cybersensei.api.dto;

import io.cybersensei.domain.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String msTeamsId;
    private String name;
    private String email;
    private User.UserRole role;
    private String department;
    private LocalDateTime createdAt;
    private Boolean active;
}


