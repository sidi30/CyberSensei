package io.cybersensei.phishing.repository;

import io.cybersensei.phishing.entity.PhishingRecipient;
import io.cybersensei.phishing.entity.PhishingRecipient.RecipientStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PhishingRecipientRepository extends JpaRepository<PhishingRecipient, UUID> {

    Optional<PhishingRecipient> findByToken(String token);

    List<PhishingRecipient> findByCampaignId(UUID campaignId);

    List<PhishingRecipient> findByCampaignRunId(UUID campaignRunId);

    List<PhishingRecipient> findByStatus(RecipientStatus status);

    List<PhishingRecipient> findByCampaignIdAndStatus(UUID campaignId, RecipientStatus status);

    @Query("SELECT r FROM PhishingRecipient r WHERE r.status = :status " +
           "AND r.retryCount < :maxRetries ORDER BY r.sentAt ASC")
    List<PhishingRecipient> findFailedRecipientsForRetry(
            @Param("status") RecipientStatus status,
            @Param("maxRetries") Integer maxRetries);

    @Query("SELECT r FROM PhishingRecipient r WHERE r.campaignRun.id = :runId " +
           "AND r.status IN ('PENDING', 'SENDING')")
    List<PhishingRecipient> findPendingRecipientsByRun(@Param("runId") UUID runId);

    @Query("SELECT COUNT(r) FROM PhishingRecipient r WHERE r.campaignRun.id = :runId")
    Long countByRunId(@Param("runId") UUID runId);

    @Query("SELECT COUNT(r) FROM PhishingRecipient r WHERE r.campaignRun.id = :runId AND r.status = :status")
    Long countByRunIdAndStatus(@Param("runId") UUID runId, @Param("status") RecipientStatus status);

    @Query("SELECT DISTINCT r.department FROM PhishingRecipient r WHERE r.campaign.id = :campaignId")
    List<String> findDistinctDepartmentsByCampaign(@Param("campaignId") UUID campaignId);

    @Modifying
    @Query("DELETE FROM PhishingRecipient r WHERE r.campaign.id = :campaignId AND r.sentAt < :beforeDate")
    int deleteOldRecipients(@Param("campaignId") UUID campaignId, @Param("beforeDate") OffsetDateTime beforeDate);

    boolean existsByToken(String token);

    @Query("SELECT r.userId FROM PhishingRecipient r WHERE r.campaign.id = :campaignId")
    List<UUID> findUserIdsByCampaign(@Param("campaignId") UUID campaignId);
}

