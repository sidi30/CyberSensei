package io.cybersensei.phishing.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO for individual user results (privacy-aware)
 */
public class UserResultDTO {

    private UUID recipientId;
    private String identifier; // Can be anonymized or real name
    private String department;
    private Boolean isAnonymized;
    
    // For identified mode
    private String email;
    private String firstName;
    private String lastName;
    
    // Actions taken
    private Boolean emailDelivered;
    private Boolean emailOpened;
    private Boolean linkClicked;
    private Boolean dataSubmitted;
    private Boolean reported;
    
    // Timing
    private OffsetDateTime sentAt;
    private OffsetDateTime firstOpenAt;
    private OffsetDateTime firstClickAt;
    private OffsetDateTime reportedAt;
    private Integer timeToClickSeconds;
    
    // Events
    private List<UserEventDTO> events;

    public UserResultDTO() {}

    // Anonymization helper
    public static UserResultDTO createAnonymized(UUID recipientId, String department) {
        UserResultDTO dto = new UserResultDTO();
        dto.setRecipientId(recipientId);
        dto.setIdentifier("User-" + recipientId.toString().substring(0, 8));
        dto.setDepartment(department);
        dto.setIsAnonymized(true);
        return dto;
    }

    public static UserResultDTO createIdentified(UUID recipientId, String email, 
            String firstName, String lastName, String department) {
        UserResultDTO dto = new UserResultDTO();
        dto.setRecipientId(recipientId);
        dto.setEmail(email);
        dto.setFirstName(firstName);
        dto.setLastName(lastName);
        dto.setDepartment(department);
        dto.setIdentifier(firstName + " " + lastName);
        dto.setIsAnonymized(false);
        return dto;
    }

    // Getters and Setters
    public UUID getRecipientId() { return recipientId; }
    public void setRecipientId(UUID recipientId) { this.recipientId = recipientId; }

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Boolean getIsAnonymized() { return isAnonymized; }
    public void setIsAnonymized(Boolean isAnonymized) { this.isAnonymized = isAnonymized; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public Boolean getEmailDelivered() { return emailDelivered; }
    public void setEmailDelivered(Boolean emailDelivered) { this.emailDelivered = emailDelivered; }

    public Boolean getEmailOpened() { return emailOpened; }
    public void setEmailOpened(Boolean emailOpened) { this.emailOpened = emailOpened; }

    public Boolean getLinkClicked() { return linkClicked; }
    public void setLinkClicked(Boolean linkClicked) { this.linkClicked = linkClicked; }

    public Boolean getDataSubmitted() { return dataSubmitted; }
    public void setDataSubmitted(Boolean dataSubmitted) { this.dataSubmitted = dataSubmitted; }

    public Boolean getReported() { return reported; }
    public void setReported(Boolean reported) { this.reported = reported; }

    public OffsetDateTime getSentAt() { return sentAt; }
    public void setSentAt(OffsetDateTime sentAt) { this.sentAt = sentAt; }

    public OffsetDateTime getFirstOpenAt() { return firstOpenAt; }
    public void setFirstOpenAt(OffsetDateTime firstOpenAt) { this.firstOpenAt = firstOpenAt; }

    public OffsetDateTime getFirstClickAt() { return firstClickAt; }
    public void setFirstClickAt(OffsetDateTime firstClickAt) { this.firstClickAt = firstClickAt; }

    public OffsetDateTime getReportedAt() { return reportedAt; }
    public void setReportedAt(OffsetDateTime reportedAt) { this.reportedAt = reportedAt; }

    public Integer getTimeToClickSeconds() { return timeToClickSeconds; }
    public void setTimeToClickSeconds(Integer timeToClickSeconds) { this.timeToClickSeconds = timeToClickSeconds; }

    public List<UserEventDTO> getEvents() { return events; }
    public void setEvents(List<UserEventDTO> events) { this.events = events; }

    // Nested DTO for events
    public static class UserEventDTO {
        private String eventType;
        private OffsetDateTime eventAt;
        private String linkId;

        public String getEventType() { return eventType; }
        public void setEventType(String eventType) { this.eventType = eventType; }

        public OffsetDateTime getEventAt() { return eventAt; }
        public void setEventAt(OffsetDateTime eventAt) { this.eventAt = eventAt; }

        public String getLinkId() { return linkId; }
        public void setLinkId(String linkId) { this.linkId = linkId; }
    }
}

