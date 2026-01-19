package com.cybersensei.backend.phishing.repository;

import com.cybersensei.backend.phishing.entity.PhishingResultsDaily;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PhishingResultsDailyRepository extends JpaRepository<PhishingResultsDaily, UUID> {

    List<PhishingResultsDaily> findByCampaignId(UUID campaignId);

    List<PhishingResultsDaily> findByCampaignIdOrderByDayDesc(UUID campaignId);

    Optional<PhishingResultsDaily> findByCampaignIdAndDay(UUID campaignId, LocalDate day);

    Optional<PhishingResultsDaily> findByCampaignIdAndDayAndDepartment(UUID campaignId, LocalDate day, String department);

    @Query("SELECT r FROM PhishingResultsDaily r WHERE r.campaign.id = :campaignId " +
           "AND r.day >= :startDate AND r.day <= :endDate ORDER BY r.day ASC")
    List<PhishingResultsDaily> findByCampaignIdAndDateRange(
            @Param("campaignId") UUID campaignId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT r FROM PhishingResultsDaily r WHERE r.campaign.id = :campaignId " +
           "AND r.department = :department ORDER BY r.day ASC")
    List<PhishingResultsDaily> findByCampaignIdAndDepartment(
            @Param("campaignId") UUID campaignId,
            @Param("department") String department);

    @Query("SELECT SUM(r.sentCount), SUM(r.clickedCount), SUM(r.reportedCount) " +
           "FROM PhishingResultsDaily r WHERE r.campaign.id = :campaignId")
    Object[] getTotalsByCampaign(@Param("campaignId") UUID campaignId);

    @Query("SELECT AVG(r.clickRate), AVG(r.reportRate), AVG(r.riskScore) " +
           "FROM PhishingResultsDaily r WHERE r.campaign.id = :campaignId")
    Object[] getAveragesByCampaign(@Param("campaignId") UUID campaignId);

    @Query("SELECT r.department, AVG(r.clickRate), AVG(r.riskScore) " +
           "FROM PhishingResultsDaily r WHERE r.campaign.id = :campaignId " +
           "GROUP BY r.department ORDER BY AVG(r.riskScore) DESC")
    List<Object[]> getDepartmentRiskRanking(@Param("campaignId") UUID campaignId);

    @Query("SELECT DISTINCT r.department FROM PhishingResultsDaily r WHERE r.campaign.id = :campaignId")
    List<String> findDistinctDepartmentsByCampaign(@Param("campaignId") UUID campaignId);

    // Trend analysis
    @Query("SELECT r.day, AVG(r.clickRate), AVG(r.riskScore) FROM PhishingResultsDaily r " +
           "WHERE r.campaign.id = :campaignId GROUP BY r.day ORDER BY r.day ASC")
    List<Object[]> getTrendByCampaign(@Param("campaignId") UUID campaignId);
}

