package io.cybersensei.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCheckResponse {
    private Boolean updateAvailable;
    private String latestVersion;
    private String downloadUrl;
    private String changelogUrl;
}


