package io.cybersensei.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Teams token exchange response with backend JWT")
public class TeamsTokenExchangeResponse {

    @Schema(description = "Backend JWT token", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String token;

    @Schema(description = "User ID in local database")
    private Long userId;

    @Schema(description = "User role", example = "EMPLOYEE")
    private String role;

    @Schema(description = "Tenant local ID", example = "tenant-local-123")
    private String tenantLocalId;
}

