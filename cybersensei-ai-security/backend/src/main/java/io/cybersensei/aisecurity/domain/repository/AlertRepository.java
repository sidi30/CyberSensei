package io.cybersensei.aisecurity.domain.repository;

import io.cybersensei.aisecurity.domain.entity.Alert;
import io.cybersensei.aisecurity.domain.enums.AlertStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    Page<Alert> findByCompanyIdOrderByCreatedAtDesc(Long companyId, Pageable pageable);

    Page<Alert> findByCompanyIdAndStatusOrderByCreatedAtDesc(
            Long companyId, AlertStatus status, Pageable pageable);

    long countByCompanyIdAndStatus(Long companyId, AlertStatus status);

    List<Alert> findByCompanyIdAndStatusIn(Long companyId, List<AlertStatus> statuses);
}
