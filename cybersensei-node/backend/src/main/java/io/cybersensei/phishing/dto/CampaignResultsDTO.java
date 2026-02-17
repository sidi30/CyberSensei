package io.cybersensei.phishing.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for campaign results and reporting
 */
public class CampaignResultsDTO {

    private UUID campaignId;
    private String campaignName;
    private String status;
    
    // Summary stats
    private Long totalSent;
    private Long totalDelivered;
    private Long totalOpened;
    private Long totalClicked;
    private Long totalReported;
    private Long totalDataSubmitted;
    
    // Rates
    private Float openRate;
    private Float clickRate;
    private Float reportRate;
    private Float dataSubmitRate;
    
    // Risk assessment
    private Float riskScore;
    private String riskLevel;
    
    // Time metrics
    private Integer avgTimeToClickSeconds;
    private Integer fastestClickSeconds;
    
    // Daily breakdown
    private List<DailyResultDTO> dailyResults;
    
    // Department breakdown
    private List<DepartmentResultDTO> departmentResults;
    
    // Trend data
    private List<TrendPointDTO> trend;

    public CampaignResultsDTO() {}

    // Getters and Setters
    public UUID getCampaignId() { return campaignId; }
    public void setCampaignId(UUID campaignId) { this.campaignId = campaignId; }

    public String getCampaignName() { return campaignName; }
    public void setCampaignName(String campaignName) { this.campaignName = campaignName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getTotalSent() { return totalSent; }
    public void setTotalSent(Long totalSent) { this.totalSent = totalSent; }

    public Long getTotalDelivered() { return totalDelivered; }
    public void setTotalDelivered(Long totalDelivered) { this.totalDelivered = totalDelivered; }

    public Long getTotalOpened() { return totalOpened; }
    public void setTotalOpened(Long totalOpened) { this.totalOpened = totalOpened; }

    public Long getTotalClicked() { return totalClicked; }
    public void setTotalClicked(Long totalClicked) { this.totalClicked = totalClicked; }

    public Long getTotalReported() { return totalReported; }
    public void setTotalReported(Long totalReported) { this.totalReported = totalReported; }

    public Long getTotalDataSubmitted() { return totalDataSubmitted; }
    public void setTotalDataSubmitted(Long totalDataSubmitted) { this.totalDataSubmitted = totalDataSubmitted; }

    public Float getOpenRate() { return openRate; }
    public void setOpenRate(Float openRate) { this.openRate = openRate; }

    public Float getClickRate() { return clickRate; }
    public void setClickRate(Float clickRate) { this.clickRate = clickRate; }

    public Float getReportRate() { return reportRate; }
    public void setReportRate(Float reportRate) { this.reportRate = reportRate; }

    public Float getDataSubmitRate() { return dataSubmitRate; }
    public void setDataSubmitRate(Float dataSubmitRate) { this.dataSubmitRate = dataSubmitRate; }

    public Float getRiskScore() { return riskScore; }
    public void setRiskScore(Float riskScore) { this.riskScore = riskScore; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public Integer getAvgTimeToClickSeconds() { return avgTimeToClickSeconds; }
    public void setAvgTimeToClickSeconds(Integer avgTimeToClickSeconds) { this.avgTimeToClickSeconds = avgTimeToClickSeconds; }

    public Integer getFastestClickSeconds() { return fastestClickSeconds; }
    public void setFastestClickSeconds(Integer fastestClickSeconds) { this.fastestClickSeconds = fastestClickSeconds; }

    public List<DailyResultDTO> getDailyResults() { return dailyResults; }
    public void setDailyResults(List<DailyResultDTO> dailyResults) { this.dailyResults = dailyResults; }

    public List<DepartmentResultDTO> getDepartmentResults() { return departmentResults; }
    public void setDepartmentResults(List<DepartmentResultDTO> departmentResults) { this.departmentResults = departmentResults; }

    public List<TrendPointDTO> getTrend() { return trend; }
    public void setTrend(List<TrendPointDTO> trend) { this.trend = trend; }

    // Nested DTOs
    public static class DailyResultDTO {
        private LocalDate day;
        private Integer sentCount;
        private Integer openedCount;
        private Integer clickedCount;
        private Integer reportedCount;
        private Float clickRate;
        private Float riskScore;

        public LocalDate getDay() { return day; }
        public void setDay(LocalDate day) { this.day = day; }

        public Integer getSentCount() { return sentCount; }
        public void setSentCount(Integer sentCount) { this.sentCount = sentCount; }

        public Integer getOpenedCount() { return openedCount; }
        public void setOpenedCount(Integer openedCount) { this.openedCount = openedCount; }

        public Integer getClickedCount() { return clickedCount; }
        public void setClickedCount(Integer clickedCount) { this.clickedCount = clickedCount; }

        public Integer getReportedCount() { return reportedCount; }
        public void setReportedCount(Integer reportedCount) { this.reportedCount = reportedCount; }

        public Float getClickRate() { return clickRate; }
        public void setClickRate(Float clickRate) { this.clickRate = clickRate; }

        public Float getRiskScore() { return riskScore; }
        public void setRiskScore(Float riskScore) { this.riskScore = riskScore; }
    }

    public static class DepartmentResultDTO {
        private String department;
        private Integer totalUsers;
        private Integer clickedCount;
        private Integer reportedCount;
        private Float clickRate;
        private Float riskScore;
        private String riskLevel;

        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }

        public Integer getTotalUsers() { return totalUsers; }
        public void setTotalUsers(Integer totalUsers) { this.totalUsers = totalUsers; }

        public Integer getClickedCount() { return clickedCount; }
        public void setClickedCount(Integer clickedCount) { this.clickedCount = clickedCount; }

        public Integer getReportedCount() { return reportedCount; }
        public void setReportedCount(Integer reportedCount) { this.reportedCount = reportedCount; }

        public Float getClickRate() { return clickRate; }
        public void setClickRate(Float clickRate) { this.clickRate = clickRate; }

        public Float getRiskScore() { return riskScore; }
        public void setRiskScore(Float riskScore) { this.riskScore = riskScore; }

        public String getRiskLevel() { return riskLevel; }
        public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    }

    public static class TrendPointDTO {
        private LocalDate date;
        private Float clickRate;
        private Float riskScore;

        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }

        public Float getClickRate() { return clickRate; }
        public void setClickRate(Float clickRate) { this.clickRate = clickRate; }

        public Float getRiskScore() { return riskScore; }
        public void setRiskScore(Float riskScore) { this.riskScore = riskScore; }
    }
}

