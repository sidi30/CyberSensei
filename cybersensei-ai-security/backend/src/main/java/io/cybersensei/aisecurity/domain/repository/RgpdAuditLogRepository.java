package io.cybersensei.aisecurity.domain.repository;

import io.cybersensei.aisecurity.domain.entity.RgpdAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RgpdAuditLogRepository extends JpaRepository<RgpdAuditLog, Long> {

    List<RgpdAuditLog> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    List<RgpdAuditLog> findByTargetUserIdOrderByCreatedAtDesc(Long targetUserId);
}
