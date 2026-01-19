package com.cybersensei.backend.phishing.service;

import com.cybersensei.backend.phishing.dto.PhishingTemplateDTO;
import com.cybersensei.backend.phishing.entity.PhishingTemplate;
import com.cybersensei.backend.phishing.entity.SettingsBranding;
import com.cybersensei.backend.phishing.repository.PhishingTemplateRepository;
import com.cybersensei.backend.phishing.repository.SettingsBrandingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Service for managing phishing email templates.
 */
@Service
@Transactional
public class TemplateService {

    private final PhishingTemplateRepository templateRepository;
    private final SettingsBrandingRepository brandingRepository;

    private static final Pattern VARIABLE_PATTERN = Pattern.compile("\\{\\{(\\w+(?::\\w+)?)\\}\\}");

    public TemplateService(PhishingTemplateRepository templateRepository,
                          SettingsBrandingRepository brandingRepository) {
        this.templateRepository = templateRepository;
        this.brandingRepository = brandingRepository;
    }

    public PhishingTemplateDTO createTemplate(PhishingTemplateDTO dto) {
        PhishingTemplate entity = dto.toEntity();
        entity = templateRepository.save(entity);
        return PhishingTemplateDTO.fromEntity(entity);
    }

    public PhishingTemplateDTO updateTemplate(UUID id, PhishingTemplateDTO dto) {
        PhishingTemplate existing = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found: " + id));
        
        existing.setName(dto.getName());
        existing.setTheme(dto.getTheme());
        existing.setDifficulty(dto.getDifficulty());
        existing.setSubject(dto.getSubject());
        existing.setHtmlBody(dto.getHtmlBody());
        existing.setTextBody(dto.getTextBody());
        existing.setLandingPageHtml(dto.getLandingPageHtml());
        existing.setIsActive(dto.getIsActive());
        
        if (dto.getLinkDefinitions() != null) {
            existing.setLinkDefinitions(dto.getLinkDefinitions().stream()
                    .map(PhishingTemplateDTO.LinkDefinitionDTO::toEntity)
                    .collect(Collectors.toList()));
        }
        
        existing = templateRepository.save(existing);
        return PhishingTemplateDTO.fromEntity(existing);
    }

    public void deleteTemplate(UUID id) {
        templateRepository.deleteById(id);
    }

    public PhishingTemplateDTO getTemplate(UUID id) {
        PhishingTemplate entity = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found: " + id));
        return PhishingTemplateDTO.fromEntity(entity);
    }

    public List<PhishingTemplateDTO> getAllTemplates() {
        return templateRepository.findAll().stream()
                .map(PhishingTemplateDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PhishingTemplateDTO> getActiveTemplates() {
        return templateRepository.findByIsActiveTrue().stream()
                .map(PhishingTemplateDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PhishingTemplateDTO> getTemplatesByTheme(String theme) {
        return templateRepository.findByTheme(theme).stream()
                .map(PhishingTemplateDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<String> getAvailableThemes() {
        return templateRepository.findDistinctThemes();
    }

    /**
     * Render template with variable substitution.
     * 
     * @param template The template to render
     * @param variables Map of variable names to values
     * @param trackingBaseUrl Base URL for tracking links
     * @param token The recipient's unique token
     * @return Rendered content map with subject, htmlBody, textBody
     */
    public Map<String, String> renderTemplate(PhishingTemplate template, 
            Map<String, String> variables, String trackingBaseUrl, String token) {
        
        Map<String, String> result = new HashMap<>();
        
        // Add branding variables
        SettingsBranding branding = brandingRepository.findFirstByOrderByCreatedAtDesc().orElse(null);
        if (branding != null) {
            variables.putIfAbsent("companyName", branding.getCompanyName());
            variables.putIfAbsent("logoUrl", branding.getLogoUrl() != null ? branding.getLogoUrl() : "");
            variables.putIfAbsent("senderName", branding.getDefaultSenderName() != null ? 
                    branding.getDefaultSenderName() : "IT Security");
        }
        
        // Render subject
        result.put("subject", substituteVariables(template.getSubject(), variables, trackingBaseUrl, token, template));
        
        // Render HTML body with tracking pixel
        String htmlBody = substituteVariables(template.getHtmlBody(), variables, trackingBaseUrl, token, template);
        // Add tracking pixel before closing body tag
        String trackingPixel = String.format(
            "<img src=\"%s/t/%s/p\" width=\"1\" height=\"1\" style=\"display:none\" alt=\"\" />",
            trackingBaseUrl, token);
        htmlBody = htmlBody.replace("</body>", trackingPixel + "</body>");
        result.put("htmlBody", htmlBody);
        
        // Render text body
        if (template.getTextBody() != null) {
            result.put("textBody", substituteVariables(template.getTextBody(), variables, trackingBaseUrl, token, template));
        }
        
        return result;
    }

    private String substituteVariables(String content, Map<String, String> variables, 
            String trackingBaseUrl, String token, PhishingTemplate template) {
        
        if (content == null) return null;
        
        StringBuffer result = new StringBuffer();
        Matcher matcher = VARIABLE_PATTERN.matcher(content);
        
        while (matcher.find()) {
            String variable = matcher.group(1);
            String replacement;
            
            if (variable.startsWith("link:")) {
                // Handle link variables
                String linkId = variable.substring(5);
                replacement = String.format("%s/t/%s/l/%s", trackingBaseUrl, token, linkId);
            } else {
                // Regular variable
                replacement = variables.getOrDefault(variable, "{{" + variable + "}}");
            }
            
            matcher.appendReplacement(result, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(result);
        
        return result.toString();
    }

    /**
     * Render landing page for a clicked link.
     */
    public String renderLandingPage(PhishingTemplate template, Map<String, String> variables) {
        if (template.getLandingPageHtml() == null) {
            return getDefaultLandingPage();
        }
        
        return substituteVariables(template.getLandingPageHtml(), variables, "", "", template);
    }

    private String getDefaultLandingPage() {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Security Awareness Training</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 700px; margin: 50px auto; padding: 20px; }
                    .alert { background: #fff3cd; border: 1px solid #ffc107; padding: 20px; border-radius: 8px; }
                    h1 { color: #856404; }
                </style>
            </head>
            <body>
                <div class="alert">
                    <h1>⚠️ This was a security awareness exercise</h1>
                    <p>You clicked on a link in a simulated phishing email.</p>
                    <p>This was a training exercise to help improve your security awareness.</p>
                    <p><strong>Remember:</strong> Always verify suspicious emails before clicking on links.</p>
                </div>
            </body>
            </html>
            """;
    }
}

