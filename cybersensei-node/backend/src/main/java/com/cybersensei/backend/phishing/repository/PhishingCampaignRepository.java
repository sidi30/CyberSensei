package com.cybersensei.backend.phishing.repository;

import com.cybersensei.backend.phishing.entity.PhishingCampaign;
import com.cybersensei.backend.phishing.entity.PhishingCampaign.CampaignStatus;
import com.cybersensei.backend.phishing.entity.PhishingCampaign.ScheduleFrequency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PhishingCampaignRepository extends JpaRepository<PhishingCampaign, UUID> {

    List<PhishingCampaign> findByStatus(CampaignStatus status);

    List<PhishingCampaign> findByStatusIn(List<CampaignStatus> statuses);

    @Query("SELECT c FROM PhishingCampaign c WHERE c.status = :status " +
           "AND (c.scheduleStartDate IS NULL OR c.scheduleStartDate <= :today) " +
           "AND (c.scheduleEndDate IS NULL OR c.scheduleEndDate >= :today)")
    List<PhishingCampaign> findScheduledCampaignsForDate(
            @Param("status") CampaignStatus status,
            @Param("today") LocalDate today);

    @Query("SELECT c FROM PhishingCampaign c WHERE c.status IN (:statuses) " +
           "AND c.scheduleWindowStart <= :currentTime " +
           "AND c.scheduleWindowEnd >= :currentTime")
    List<PhishingCampaign> findCampaignsInTimeWindow(
            @Param("statuses") List<CampaignStatus> statuses,
            @Param("currentTime") LocalTime currentTime);

    @Query("SELECT c FROM PhishingCampaign c WHERE c.status = 'SCHEDULED' " +
           "AND c.scheduleFrequency = :frequency " +
           "AND (c.scheduleStartDate IS NULL OR c.scheduleStartDate <= :today) " +
           "AND (c.scheduleEndDate IS NULL OR c.scheduleEndDate >= :today)")
    List<PhishingCampaign> findCampaignsToRun(
            @Param("frequency") ScheduleFrequency frequency,
            @Param("today") LocalDate today);

    List<PhishingCampaign> findByCreatedBy(UUID createdBy);

    @Query("SELECT c FROM PhishingCampaign c ORDER BY c.createdAt DESC")
    List<PhishingCampaign> findAllOrderByCreatedAtDesc();

    long countByStatus(CampaignStatus status);

    @Query("SELECT c.theme, COUNT(c) FROM PhishingCampaign c GROUP BY c.theme")
    List<Object[]> countByTheme();
}

