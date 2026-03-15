package io.cybersensei.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Teams SSO token exchange request")
public class TeamsTokenExchangeRequest {

    @NotBlank(message = "Teams User ID is required")
    @Schema(description = "Microsoft Teams user ID", example = "29:1234567890abcdef")
    private String teamsUserId;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Schema(description = "User email address", example = "john.doe@company.com")
    private String email;

    @NotBlank(message = "Display name is required")
    @Schema(description = "User display name", example = "John Doe")
    private String displayName;

    @Schema(description = "Department name", example = "IT")
    private String department;

    @Schema(description = "Job title", example = "Developer")
    private String jobTitle;

    @Schema(description = "User photo URL (optional)")
    private String photo;

    @Schema(description = "Tenant hint (optional)")
    private String tenantHint;
}

