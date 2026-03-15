package io.cybersensei.aisecurity.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "rgpd_audit_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RgpdAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "requested_by_user_id", nullable = false)
    private Long requestedByUserId;

    @Column(name = "target_user_id", nullable = false)
    private Long targetUserId;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "operation", nullable = false, length = 50)
    private String operation;

    @Column(name = "details", length = 2000)
    private String details;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "COMPLETED";

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
