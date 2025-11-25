package io.cybersensei.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Phishing email templates for training campaigns
 */
@Entity
@Table(name = "phishing_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhishingTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String htmlContent;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String textContent;

    @Column(nullable = false)
    private String subject;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PhishingType type;

    @Column(nullable = false)
    private Boolean active = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum PhishingType {
        SPEAR_PHISHING,
        WHALING,
        BUSINESS_EMAIL_COMPROMISE,
        CREDENTIAL_HARVESTING,
        MALWARE_ATTACHMENT
    }
}


