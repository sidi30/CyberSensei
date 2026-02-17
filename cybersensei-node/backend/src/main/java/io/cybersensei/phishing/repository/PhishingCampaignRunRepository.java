package io.cybersensei.phishing.repository;

import io.cybersensei.phishing.entity.PhishingCampaignRun;
import io.cybersensei.phishing.entity.PhishingCampaignRun.RunStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PhishingCampaignRunRepository extends JpaRepository<PhishingCampaignRun, UUID> {

    List<PhishingCampaignRun> findByCampaignId(UUID campaignId);

    List<PhishingCampaignRun> findByCampaignIdOrderByRunAtDesc(UUID campaignId);

    Optional<PhishingCampaignRun> findFirstByCampaignIdOrderByRunAtDesc(UUID campaignId);

    List<PhishingCampaignRun> findByStatus(RunStatus status);

    @Query("SELECT r FROM PhishingCampaignRun r WHERE r.campaign.id = :campaignId " +
           "AND DATE(r.runAt) = :date")
    List<PhishingCampaignRun> findByCampaignIdAndDate(
            @Param("campaignId") UUID campaignId,
            @Param("date") LocalDate date);

    @Query("SELECT r FROM PhishingCampaignRun r WHERE r.campaign.id = :campaignId " +
           "AND r.runAt >= :startDate AND r.runAt <= :endDate " +
           "ORDER BY r.runAt DESC")
    List<PhishingCampaignRun> findByCampaignIdAndDateRange(
            @Param("campaignId") UUID campaignId,
            @Param("startDate") OffsetDateTime startDate,
            @Param("endDate") OffsetDateTime endDate);

    @Query("SELECT SUM(r.sentCount) FROM PhishingCampaignRun r WHERE r.campaign.id = :campaignId")
    Long getTotalSentCountByCampaign(@Param("campaignId") UUID campaignId);

    @Query("SELECT COUNT(r) FROM PhishingCampaignRun r WHERE r.campaign.id = :campaignId")
    Long getRunCountByCampaign(@Param("campaignId") UUID campaignId);

    boolean existsByCampaignIdAndStatus(UUID campaignId, RunStatus status);
}

