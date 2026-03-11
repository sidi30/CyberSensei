package io.cybersensei.aisecurity.api.dto.request;

import io.cybersensei.aisecurity.domain.enums.AiTool;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyzePromptRequest {

    @NotBlank(message = "Le prompt ne peut pas être vide")
    @Size(max = 50000, message = "Le prompt ne peut pas dépasser 50000 caractères")
    private String prompt;

    @NotNull(message = "L'outil AI est requis")
    private AiTool aiTool;

    @NotNull(message = "L'identifiant entreprise est requis")
    private Long companyId;

    @NotNull(message = "L'identifiant utilisateur est requis")
    private Long userId;

    private String sourceUrl;
}
