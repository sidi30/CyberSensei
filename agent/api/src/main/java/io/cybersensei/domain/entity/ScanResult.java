package io.cybersensei.domain.entity;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Historique des résultats de scan de sécurité.
 * Stocke chaque scan pour permettre la comparaison et le suivi de tendance.
 */
@Entity
@Table(name = "scan_results", indexes = {
    @Index(name = "idx_scan_results_domain", columnList = "domain"),
    @Index(name = "idx_scan_results_scanned_at", columnList = "scanned_at")
})
public class ScanResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String domain;

    @Column(nullable = false)
    private int score;

    @Column(name = "scan_type", nullable = false)
    private String scanType; // "daily" ou "weekly"

    @Column(columnDefinition = "jsonb")
    private String detailsJson;

    @Column(name = "critical_ports_json", columnDefinition = "jsonb")
    private String criticalPortsJson;

    @Column(name = "cve_ids_json", columnDefinition = "jsonb")
    private String cveIdsJson;

    @Column(name = "weak_tls")
    private boolean weakTls;

    @Column(name = "cert_expired")
    private boolean certExpired;

    @Column(name = "typosquats_json", columnDefinition = "jsonb")
    private String typosquatsJson;

    @Column(name = "breached_emails_json", columnDefinition = "jsonb")
    private String breachedEmailsJson;

    @Column(name = "abuse_score")
    private int abuseScore;

    @Column(name = "scanned_at", nullable = false)
    private Instant scannedAt;

    @PrePersist
    public void prePersist() {
        if (this.scannedAt == null) {
            this.scannedAt = Instant.now();
        }
    }

    // --- Getters / Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public String getScanType() { return scanType; }
    public void setScanType(String scanType) { this.scanType = scanType; }

    public String getDetailsJson() { return detailsJson; }
    public void setDetailsJson(String detailsJson) { this.detailsJson = detailsJson; }

    public String getCriticalPortsJson() { return criticalPortsJson; }
    public void setCriticalPortsJson(String criticalPortsJson) { this.criticalPortsJson = criticalPortsJson; }

    public String getCveIdsJson() { return cveIdsJson; }
    public void setCveIdsJson(String cveIdsJson) { this.cveIdsJson = cveIdsJson; }

    public boolean isWeakTls() { return weakTls; }
    public void setWeakTls(boolean weakTls) { this.weakTls = weakTls; }

    public boolean isCertExpired() { return certExpired; }
    public void setCertExpired(boolean certExpired) { this.certExpired = certExpired; }

    public String getTyposquatsJson() { return typosquatsJson; }
    public void setTyposquatsJson(String typosquatsJson) { this.typosquatsJson = typosquatsJson; }

    public String getBreachedEmailsJson() { return breachedEmailsJson; }
    public void setBreachedEmailsJson(String breachedEmailsJson) { this.breachedEmailsJson = breachedEmailsJson; }

    public int getAbuseScore() { return abuseScore; }
    public void setAbuseScore(int abuseScore) { this.abuseScore = abuseScore; }

    public Instant getScannedAt() { return scannedAt; }
    public void setScannedAt(Instant scannedAt) { this.scannedAt = scannedAt; }
}
