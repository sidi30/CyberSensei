package com.cybersensei.backend.phishing.service;

import com.cybersensei.backend.phishing.dto.CampaignResultsDTO;
import com.cybersensei.backend.phishing.dto.CampaignResultsDTO.*;
import com.cybersensei.backend.phishing.dto.UserResultDTO;
import com.cybersensei.backend.phishing.entity.*;
import com.cybersensei.backend.phishing.entity.PhishingCampaign.PrivacyMode;
import com.cybersensei.backend.phishing.entity.PhishingEvent.EventType;
import com.cybersensei.backend.phishing.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for campaign reporting and analytics.
 */
@Service
@Transactional(readOnly = true)
public class ReportingService {

    private final PhishingCampaignRepository campaignRepository;
    private final PhishingEventRepository eventRepository;
    private final PhishingRecipientRepository recipientRepository;
    private final PhishingResultsDailyRepository resultsDailyRepository;
    private final TrackingService trackingService;

    public ReportingService(PhishingCampaignRepository campaignRepository,
                           PhishingEventRepository eventRepository,
                           PhishingRecipientRepository recipientRepository,
                           PhishingResultsDailyRepository resultsDailyRepository,
                           TrackingService trackingService) {
        this.campaignRepository = campaignRepository;
        this.eventRepository = eventRepository;
        this.recipientRepository = recipientRepository;
        this.resultsDailyRepository = resultsDailyRepository;
        this.trackingService = trackingService;
    }

    /**
     * Get full campaign results.
     */
    public CampaignResultsDTO getCampaignResults(UUID campaignId) {
        PhishingCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found: " + campaignId));

        CampaignResultsDTO results = new CampaignResultsDTO();
        results.setCampaignId(campaignId);
        results.setCampaignName(campaign.getName());
        results.setStatus(campaign.getStatus().name());

        // Get event counts
        List<Object[]> eventCounts = eventRepository.countEventsByCampaignGroupByType(campaignId);
        Map<String, Long> countMap = new HashMap<>();
        for (Object[] row : eventCounts) {
            countMap.put(row[0].toString(), ((Number) row[1]).longValue());
        }

        results.setTotalDelivered(countMap.getOrDefault("DELIVERED", 0L));
        results.setTotalOpened(countMap.getOrDefault("OPENED", 0L));
        results.setTotalClicked(countMap.getOrDefault("CLICKED", 0L));
        results.setTotalReported(countMap.getOrDefault("REPORTED", 0L));
        results.setTotalDataSubmitted(countMap.getOrDefault("DATA_SUBMITTED", 0L));

        // Get sent count from recipients
        long sentCount = recipientRepository.findByCampaignId(campaignId).stream()
                .filter(r -> r.getSentAt() != null)
                .count();
        results.setTotalSent(sentCount);

        // Calculate rates
        if (results.getTotalDelivered() > 0) {
            results.setOpenRate((float) results.getTotalOpened() / results.getTotalDelivered() * 100);
            results.setClickRate((float) results.getTotalClicked() / results.getTotalDelivered() * 100);
            results.setReportRate((float) results.getTotalReported() / results.getTotalDelivered() * 100);
            results.setDataSubmitRate((float) results.getTotalDataSubmitted() / results.getTotalDelivered() * 100);
        }

        // Calculate risk score
        results.setRiskScore(calculateRiskScore(results));
        results.setRiskLevel(getRiskLevel(results.getRiskScore()));

        // Get daily results
        List<PhishingResultsDaily> dailyResults = resultsDailyRepository.findByCampaignIdOrderByDayDesc(campaignId);
        results.setDailyResults(dailyResults.stream()
                .map(this::toDailyResultDTO)
                .collect(Collectors.toList()));

        // Get department breakdown
        results.setDepartmentResults(getDepartmentBreakdown(campaignId));

        // Get trend
        results.setTrend(getTrend(campaignId));

        return results;
    }

    /**
     * Get user-level results (privacy-aware).
     */
    public List<UserResultDTO> getUserResults(UUID campaignId) {
        PhishingCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found: " + campaignId));

        boolean isAnonymized = campaign.getPrivacyMode() == PrivacyMode.ANONYMIZED;

        List<PhishingRecipient> recipients = recipientRepository.findByCampaignId(campaignId);
        List<UserResultDTO> results = new ArrayList<>();

        for (PhishingRecipient recipient : recipients) {
            UserResultDTO dto;
            if (isAnonymized) {
                dto = UserResultDTO.createAnonymized(recipient.getId(), recipient.getDepartment());
            } else {
                dto = UserResultDTO.createIdentified(
                        recipient.getId(),
                        recipient.getEmail(),
                        recipient.getFirstName(),
                        recipient.getLastName(),
                        recipient.getDepartment()
                );
            }

            // Get events for this recipient
            List<PhishingEvent> events = eventRepository.findByToken(recipient.getToken());
            
            dto.setSentAt(recipient.getSentAt());
            dto.setEmailDelivered(events.stream().anyMatch(e -> e.getEventType() == EventType.DELIVERED));
            dto.setEmailOpened(events.stream().anyMatch(e -> e.getEventType() == EventType.OPENED));
            dto.setLinkClicked(events.stream().anyMatch(e -> e.getEventType() == EventType.CLICKED));
            dto.setDataSubmitted(events.stream().anyMatch(e -> e.getEventType() == EventType.DATA_SUBMITTED));
            dto.setReported(events.stream().anyMatch(e -> e.getEventType() == EventType.REPORTED));

            // Get timestamps
            events.stream()
                    .filter(e -> e.getEventType() == EventType.OPENED)
                    .findFirst()
                    .ifPresent(e -> dto.setFirstOpenAt(e.getEventAt()));

            events.stream()
                    .filter(e -> e.getEventType() == EventType.CLICKED)
                    .min(Comparator.comparing(PhishingEvent::getEventAt))
                    .ifPresent(e -> dto.setFirstClickAt(e.getEventAt()));

            events.stream()
                    .filter(e -> e.getEventType() == EventType.REPORTED)
                    .findFirst()
                    .ifPresent(e -> dto.setReportedAt(e.getEventAt()));

            // Calculate time to click
            dto.setTimeToClickSeconds(trackingService.calculateTimeToClick(recipient.getToken()));

            results.add(dto);
        }

        return results;
    }

    /**
     * Get daily results for a campaign.
     */
    public List<DailyResultDTO> getDailyResults(UUID campaignId, LocalDate startDate, LocalDate endDate) {
        List<PhishingResultsDaily> results;
        if (startDate != null && endDate != null) {
            results = resultsDailyRepository.findByCampaignIdAndDateRange(campaignId, startDate, endDate);
        } else {
            results = resultsDailyRepository.findByCampaignIdOrderByDayDesc(campaignId);
        }

        return results.stream()
                .map(this::toDailyResultDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get department breakdown for a campaign.
     */
    public List<DepartmentResultDTO> getDepartmentBreakdown(UUID campaignId) {
        List<Object[]> deptRanking = resultsDailyRepository.getDepartmentRiskRanking(campaignId);
        List<DepartmentResultDTO> results = new ArrayList<>();

        for (Object[] row : deptRanking) {
            DepartmentResultDTO dto = new DepartmentResultDTO();
            dto.setDepartment((String) row[0]);
            dto.setClickRate(row[1] != null ? ((Number) row[1]).floatValue() : 0f);
            dto.setRiskScore(row[2] != null ? ((Number) row[2]).floatValue() : 0f);
            dto.setRiskLevel(getRiskLevel(dto.getRiskScore()));
            results.add(dto);
        }

        return results;
    }

    /**
     * Get trend data for a campaign.
     */
    private List<TrendPointDTO> getTrend(UUID campaignId) {
        List<Object[]> trendData = resultsDailyRepository.getTrendByCampaign(campaignId);
        List<TrendPointDTO> trend = new ArrayList<>();

        for (Object[] row : trendData) {
            TrendPointDTO dto = new TrendPointDTO();
            dto.setDate(((java.sql.Date) row[0]).toLocalDate());
            dto.setClickRate(row[1] != null ? ((Number) row[1]).floatValue() : 0f);
            dto.setRiskScore(row[2] != null ? ((Number) row[2]).floatValue() : 0f);
            trend.add(dto);
        }

        return trend;
    }

    private DailyResultDTO toDailyResultDTO(PhishingResultsDaily entity) {
        DailyResultDTO dto = new DailyResultDTO();
        dto.setDay(entity.getDay());
        dto.setSentCount(entity.getSentCount());
        dto.setOpenedCount(entity.getOpenedCount());
        dto.setClickedCount(entity.getClickedCount());
        dto.setReportedCount(entity.getReportedCount());
        dto.setClickRate(entity.getClickRate());
        dto.setRiskScore(entity.getRiskScore());
        return dto;
    }

    private float calculateRiskScore(CampaignResultsDTO results) {
        if (results.getTotalDelivered() == 0) return 0f;

        // Weights
        float clickWeight = 0.6f;
        float dataSubmitWeight = 0.3f;
        float reportBonus = 0.1f;

        float clickContribution = (results.getClickRate() != null ? results.getClickRate() : 0) * clickWeight;
        float dataSubmitContribution = (results.getDataSubmitRate() != null ? results.getDataSubmitRate() : 0) * dataSubmitWeight * 2;
        float reportContribution = (results.getReportRate() != null ? results.getReportRate() : 0) * reportBonus;

        return Math.min(100, Math.max(0, clickContribution + dataSubmitContribution - reportContribution));
    }

    private String getRiskLevel(Float score) {
        if (score == null || score < 10) return "EXCELLENT";
        if (score < 25) return "GOOD";
        if (score < 50) return "MODERATE";
        if (score < 75) return "HIGH";
        return "CRITICAL";
    }
}

