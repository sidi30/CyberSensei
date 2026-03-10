package io.cybersensei.aisecurity.domain.repository;

import io.cybersensei.aisecurity.domain.entity.PromptEvent;
import io.cybersensei.aisecurity.domain.enums.RiskLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PromptEventRepository extends JpaRepository<PromptEvent, Long> {

    Page<PromptEvent> findByCompanyIdOrderByCreatedAtDesc(Long companyId, Pageable pageable);

    long countByCompanyIdAndCreatedAtAfter(Long companyId, LocalDateTime after);

    long countByCompanyIdAndRiskLevelInAndCreatedAtAfter(
            Long companyId, List<RiskLevel> riskLevels, LocalDateTime after);

    @Query("SELECT COUNT(DISTINCT pe.userId) FROM PromptEvent pe " +
            "WHERE pe.companyId = :companyId AND pe.createdAt > :after")
    long countDistinctUsersByCompanyIdAndCreatedAtAfter(
            @Param("companyId") Long companyId, @Param("after") LocalDateTime after);

    @Query("SELECT pe.aiTool, COUNT(pe) FROM PromptEvent pe " +
            "WHERE pe.companyId = :companyId AND pe.createdAt > :after " +
            "GROUP BY pe.aiTool ORDER BY COUNT(pe) DESC")
    List<Object[]> countByAiToolAndCompany(
            @Param("companyId") Long companyId, @Param("after") LocalDateTime after);

    @Query("SELECT CAST(pe.createdAt AS localdate), COUNT(pe), AVG(pe.riskScore) " +
            "FROM PromptEvent pe " +
            "WHERE pe.companyId = :companyId AND pe.createdAt > :after " +
            "GROUP BY CAST(pe.createdAt AS localdate) ORDER BY CAST(pe.createdAt AS localdate)")
    List<Object[]> dailyStatsForCompany(
            @Param("companyId") Long companyId, @Param("after") LocalDateTime after);

    long countByCompanyIdAndWasBlockedTrueAndCreatedAtAfter(Long companyId, LocalDateTime after);

    long countByCompanyIdAndWasSanitizedTrueAndCreatedAtAfter(Long companyId, LocalDateTime after);

    // ── RGPD ──

    List<PromptEvent> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserId(Long userId);

    void deleteByUserId(Long userId);

    @Query("SELECT pe FROM PromptEvent pe WHERE pe.retentionExpiresAt IS NOT NULL AND pe.retentionExpiresAt < :now")
    List<PromptEvent> findExpiredEvents(@Param("now") LocalDateTime now);

    @Query("SELECT pe FROM PromptEvent pe WHERE pe.containsArticle9 = true " +
            "AND pe.retentionExpiresAt IS NOT NULL AND pe.retentionExpiresAt < :now")
    List<PromptEvent> findExpiredArticle9Events(@Param("now") LocalDateTime now);

    @Query("SELECT DISTINCT pe.companyId FROM PromptEvent pe WHERE pe.createdAt > :after")
    List<Long> findDistinctCompanyIdsByCreatedAtAfter(@Param("after") LocalDateTime after);
}
