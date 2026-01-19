package com.cybersensei.backend.phishing.repository;

import com.cybersensei.backend.phishing.entity.PhishingAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PhishingAuditLogRepository extends JpaRepository<PhishingAuditLog, UUID> {

    List<PhishingAuditLog> findByAction(String action);

    List<PhishingAuditLog> findByActorUserId(UUID actorUserId);

    List<PhishingAuditLog> findByEntityTypeAndEntityId(String entityType, UUID entityId);

    Page<PhishingAuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT a FROM PhishingAuditLog a WHERE a.createdAt >= :startDate AND a.createdAt <= :endDate " +
           "ORDER BY a.createdAt DESC")
    List<PhishingAuditLog> findByDateRange(
            @Param("startDate") OffsetDateTime startDate,
            @Param("endDate") OffsetDateTime endDate);

    @Query("SELECT a FROM PhishingAuditLog a WHERE a.entityType = 'CAMPAIGN' AND a.entityId = :campaignId " +
           "ORDER BY a.createdAt DESC")
    List<PhishingAuditLog> findCampaignAuditLogs(@Param("campaignId") UUID campaignId);
}

