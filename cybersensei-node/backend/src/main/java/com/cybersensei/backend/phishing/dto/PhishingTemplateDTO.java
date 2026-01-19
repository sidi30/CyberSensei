package com.cybersensei.backend.phishing.dto;

import com.cybersensei.backend.phishing.entity.PhishingTemplate;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class PhishingTemplateDTO {

    private UUID id;
    private String name;
    private String theme;
    private Integer difficulty;
    private String subject;
    private String htmlBody;
    private String textBody;
    private List<LinkDefinitionDTO> linkDefinitions;
    private String landingPageHtml;
    private Boolean isActive;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    // Constructors
    public PhishingTemplateDTO() {}

    public static PhishingTemplateDTO fromEntity(PhishingTemplate entity) {
        PhishingTemplateDTO dto = new PhishingTemplateDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setTheme(entity.getTheme());
        dto.setDifficulty(entity.getDifficulty());
        dto.setSubject(entity.getSubject());
        dto.setHtmlBody(entity.getHtmlBody());
        dto.setTextBody(entity.getTextBody());
        dto.setLandingPageHtml(entity.getLandingPageHtml());
        dto.setIsActive(entity.getIsActive());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        if (entity.getLinkDefinitions() != null) {
            dto.setLinkDefinitions(entity.getLinkDefinitions().stream()
                    .map(LinkDefinitionDTO::fromEntity)
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }

    public PhishingTemplate toEntity() {
        PhishingTemplate entity = new PhishingTemplate();
        entity.setId(this.id);
        entity.setName(this.name);
        entity.setTheme(this.theme);
        entity.setDifficulty(this.difficulty);
        entity.setSubject(this.subject);
        entity.setHtmlBody(this.htmlBody);
        entity.setTextBody(this.textBody);
        entity.setLandingPageHtml(this.landingPageHtml);
        entity.setIsActive(this.isActive != null ? this.isActive : true);
        
        if (this.linkDefinitions != null) {
            entity.setLinkDefinitions(this.linkDefinitions.stream()
                    .map(LinkDefinitionDTO::toEntity)
                    .collect(Collectors.toList()));
        }
        
        return entity;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }

    public Integer getDifficulty() { return difficulty; }
    public void setDifficulty(Integer difficulty) { this.difficulty = difficulty; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getHtmlBody() { return htmlBody; }
    public void setHtmlBody(String htmlBody) { this.htmlBody = htmlBody; }

    public String getTextBody() { return textBody; }
    public void setTextBody(String textBody) { this.textBody = textBody; }

    public List<LinkDefinitionDTO> getLinkDefinitions() { return linkDefinitions; }
    public void setLinkDefinitions(List<LinkDefinitionDTO> linkDefinitions) { this.linkDefinitions = linkDefinitions; }

    public String getLandingPageHtml() { return landingPageHtml; }
    public void setLandingPageHtml(String landingPageHtml) { this.landingPageHtml = landingPageHtml; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Nested DTO for link definitions
    public static class LinkDefinitionDTO {
        private String linkId;
        private String label;
        private String type;

        public static LinkDefinitionDTO fromEntity(PhishingTemplate.LinkDefinition entity) {
            LinkDefinitionDTO dto = new LinkDefinitionDTO();
            dto.setLinkId(entity.getLinkId());
            dto.setLabel(entity.getLabel());
            dto.setType(entity.getType());
            return dto;
        }

        public static PhishingTemplate.LinkDefinition toEntity(LinkDefinitionDTO dto) {
            PhishingTemplate.LinkDefinition entity = new PhishingTemplate.LinkDefinition();
            entity.setLinkId(dto.getLinkId());
            entity.setLabel(dto.getLabel());
            entity.setType(dto.getType());
            return entity;
        }

        public String getLinkId() { return linkId; }
        public void setLinkId(String linkId) { this.linkId = linkId; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
    }
}

