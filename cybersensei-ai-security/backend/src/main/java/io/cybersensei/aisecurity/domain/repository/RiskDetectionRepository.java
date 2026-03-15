package io.cybersensei.aisecurity.domain.repository;

import io.cybersensei.aisecurity.domain.entity.RiskDetection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RiskDetectionRepository extends JpaRepository<RiskDetection, Long> {

    List<RiskDetection> findByPromptEventId(Long promptEventId);

    @Query("SELECT rd.category, COUNT(rd) FROM RiskDetection rd " +
            "JOIN rd.promptEvent pe " +
            "WHERE pe.companyId = :companyId AND pe.createdAt > :after " +
            "GROUP BY rd.category ORDER BY COUNT(rd) DESC")
    List<Object[]> countByCategoryAndCompany(
            @Param("companyId") Long companyId, @Param("after") LocalDateTime after);

    void deleteByPromptEventId(Long promptEventId);

    void deleteByPromptEventUserId(Long userId);
}
