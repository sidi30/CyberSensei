package com.cybersensei.backend.phishing.repository;

import com.cybersensei.backend.phishing.entity.PhishingEvent;
import com.cybersensei.backend.phishing.entity.PhishingEvent.EventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PhishingEventRepository extends JpaRepository<PhishingEvent, UUID> {

    List<PhishingEvent> findByToken(String token);

    List<PhishingEvent> findByCampaignId(UUID campaignId);

    List<PhishingEvent> findByCampaignIdAndEventType(UUID campaignId, EventType eventType);

    List<PhishingEvent> findByUserId(UUID userId);

    @Query("SELECT e FROM PhishingEvent e WHERE e.campaign.id = :campaignId " +
           "AND e.eventAt >= :startDate AND e.eventAt <= :endDate")
    List<PhishingEvent> findByCampaignIdAndDateRange(
            @Param("campaignId") UUID campaignId,
            @Param("startDate") OffsetDateTime startDate,
            @Param("endDate") OffsetDateTime endDate);

    @Query("SELECT e.eventType, COUNT(e) FROM PhishingEvent e " +
           "WHERE e.campaign.id = :campaignId GROUP BY e.eventType")
    List<Object[]> countEventsByCampaignGroupByType(@Param("campaignId") UUID campaignId);

    @Query("SELECT DATE(e.eventAt), e.eventType, COUNT(e) FROM PhishingEvent e " +
           "WHERE e.campaign.id = :campaignId GROUP BY DATE(e.eventAt), e.eventType")
    List<Object[]> countEventsByCampaignGroupByDayAndType(@Param("campaignId") UUID campaignId);

    @Query("SELECT COUNT(e) FROM PhishingEvent e WHERE e.campaign.id = :campaignId AND e.eventType = :type")
    Long countByCampaignIdAndEventType(@Param("campaignId") UUID campaignId, @Param("type") EventType type);

    @Query("SELECT e FROM PhishingEvent e WHERE e.token = :token AND e.eventType = :type")
    List<PhishingEvent> findByTokenAndEventType(@Param("token") String token, @Param("type") EventType type);

    @Query("SELECT COUNT(e) > 0 FROM PhishingEvent e WHERE e.token = :token AND e.eventType = :type")
    boolean existsByTokenAndEventType(@Param("token") String token, @Param("type") EventType type);

    @Modifying
    @Query("DELETE FROM PhishingEvent e WHERE e.campaign.id = :campaignId AND e.eventAt < :beforeDate")
    int deleteOldEvents(@Param("campaignId") UUID campaignId, @Param("beforeDate") OffsetDateTime beforeDate);

    // For time-to-click calculation
    @Query("SELECT e.token, MIN(e.eventAt) FROM PhishingEvent e " +
           "WHERE e.campaign.id = :campaignId AND e.eventType = 'CLICKED' " +
           "GROUP BY e.token")
    List<Object[]> findFirstClickTimesByCampaign(@Param("campaignId") UUID campaignId);

    // Department breakdown
    @Query("SELECT r.department, e.eventType, COUNT(e) FROM PhishingEvent e " +
           "JOIN PhishingRecipient r ON e.recipient.id = r.id " +
           "WHERE e.campaign.id = :campaignId " +
           "GROUP BY r.department, e.eventType")
    List<Object[]> countEventsByCampaignGroupByDepartmentAndType(@Param("campaignId") UUID campaignId);
}

