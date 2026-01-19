package com.cybersensei.backend.phishing.service;

import com.cybersensei.backend.phishing.entity.*;
import com.cybersensei.backend.phishing.entity.PhishingEvent.EventType;
import com.cybersensei.backend.phishing.repository.*;
import com.cybersensei.backend.phishing.service.TrackingService.TrackingResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TrackingServiceTest {

    @Mock
    private PhishingRecipientRepository recipientRepository;

    @Mock
    private PhishingEventRepository eventRepository;

    @Mock
    private PhishingTemplateRepository templateRepository;

    private TrackingService trackingService;

    private PhishingRecipient testRecipient;
    private PhishingCampaign testCampaign;

    @BeforeEach
    void setUp() {
        trackingService = new TrackingService(recipientRepository, eventRepository, templateRepository);

        // Create test data
        testCampaign = new PhishingCampaign();
        testCampaign.setId(UUID.randomUUID());
        testCampaign.setName("Test Campaign");

        PhishingTemplate template = new PhishingTemplate();
        template.setId(UUID.randomUUID());
        template.setLandingPageHtml("<html><body>Educational landing page</body></html>");
        testCampaign.setTemplate(template);

        testRecipient = new PhishingRecipient();
        testRecipient.setId(UUID.randomUUID());
        testRecipient.setCampaign(testCampaign);
        testRecipient.setToken("valid-test-token-12345678901234567890");
        testRecipient.setUserId(UUID.randomUUID());
        testRecipient.setSentAt(OffsetDateTime.now().minusHours(1));
    }

    @Test
    void trackOpen_ValidToken_CreatesEvent() {
        when(recipientRepository.findByToken(anyString())).thenReturn(Optional.of(testRecipient));
        when(eventRepository.existsByTokenAndEventType(anyString(), eq(EventType.OPENED))).thenReturn(false);
        when(eventRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        TrackingResult result = trackingService.trackOpen(
                testRecipient.getToken(),
                "192.168.1.1",
                "Mozilla/5.0"
        );

        assertTrue(result.success());
        verify(eventRepository).save(any(PhishingEvent.class));
    }

    @Test
    void trackOpen_InvalidToken_ReturnsFailure() {
        when(recipientRepository.findByToken(anyString())).thenReturn(Optional.empty());

        TrackingResult result = trackingService.trackOpen(
                "invalid-token",
                "192.168.1.1",
                "Mozilla/5.0"
        );

        assertFalse(result.success());
        assertEquals("Invalid token", result.errorMessage());
        verify(eventRepository, never()).save(any());
    }

    @Test
    void trackOpen_AlreadyTracked_DoesNotDuplicate() {
        when(recipientRepository.findByToken(anyString())).thenReturn(Optional.of(testRecipient));
        when(eventRepository.existsByTokenAndEventType(anyString(), eq(EventType.OPENED))).thenReturn(true);

        TrackingResult result = trackingService.trackOpen(
                testRecipient.getToken(),
                "192.168.1.1",
                "Mozilla/5.0"
        );

        assertTrue(result.success());
        verify(eventRepository, never()).save(any());
    }

    @Test
    void trackClick_ValidToken_CreatesEventAndReturnsLandingPage() {
        when(recipientRepository.findByToken(anyString())).thenReturn(Optional.of(testRecipient));
        when(eventRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        TrackingResult result = trackingService.trackClick(
                testRecipient.getToken(),
                "reset-link",
                "192.168.1.1",
                "Mozilla/5.0"
        );

        assertTrue(result.success());
        assertNotNull(result.landingPageHtml());
        assertTrue(result.landingPageHtml().contains("Educational landing page"));
        verify(eventRepository).save(any(PhishingEvent.class));
    }

    @Test
    void trackClick_AllowsMultipleClicks() {
        when(recipientRepository.findByToken(anyString())).thenReturn(Optional.of(testRecipient));
        when(eventRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        // First click
        trackingService.trackClick(testRecipient.getToken(), "link1", "192.168.1.1", "Mozilla/5.0");
        // Second click on different link
        trackingService.trackClick(testRecipient.getToken(), "link2", "192.168.1.1", "Mozilla/5.0");

        verify(eventRepository, times(2)).save(any(PhishingEvent.class));
    }

    @Test
    void trackFormSubmit_ValidToken_CreatesEvent() {
        when(recipientRepository.findByToken(anyString())).thenReturn(Optional.of(testRecipient));
        when(eventRepository.existsByTokenAndEventType(anyString(), eq(EventType.DATA_SUBMITTED))).thenReturn(false);
        when(eventRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        TrackingResult result = trackingService.trackFormSubmit(
                testRecipient.getToken(),
                "192.168.1.1",
                "Mozilla/5.0"
        );

        assertTrue(result.success());
        assertNotNull(result.landingPageHtml());
        assertTrue(result.landingPageHtml().contains("simulation"));
        verify(eventRepository).save(any(PhishingEvent.class));
    }

    @Test
    void trackReport_ValidToken_CreatesEvent() {
        when(recipientRepository.findByToken(anyString())).thenReturn(Optional.of(testRecipient));
        when(eventRepository.existsByTokenAndEventType(anyString(), eq(EventType.REPORTED))).thenReturn(false);
        when(eventRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        TrackingResult result = trackingService.trackReport(
                testRecipient.getToken(),
                "192.168.1.1",
                "Mozilla/5.0"
        );

        assertTrue(result.success());
        assertNotNull(result.landingPageHtml());
        assertTrue(result.landingPageHtml().contains("Excellent"));
        verify(eventRepository).save(any(PhishingEvent.class));
    }

    @Test
    void calculateTimeToClick_ReturnsCorrectDuration() {
        when(recipientRepository.findByToken(anyString())).thenReturn(Optional.of(testRecipient));
        
        PhishingEvent clickEvent = new PhishingEvent();
        clickEvent.setEventType(EventType.CLICKED);
        clickEvent.setEventAt(testRecipient.getSentAt().plusMinutes(5)); // 5 minutes after send
        
        when(eventRepository.findByTokenAndEventType(anyString(), eq(EventType.CLICKED)))
                .thenReturn(List.of(clickEvent));

        Integer timeToClick = trackingService.calculateTimeToClick(testRecipient.getToken());

        assertNotNull(timeToClick);
        assertEquals(300, timeToClick); // 5 minutes = 300 seconds
    }

    @Test
    void calculateTimeToClick_NoClick_ReturnsNull() {
        when(recipientRepository.findByToken(anyString())).thenReturn(Optional.of(testRecipient));
        when(eventRepository.findByTokenAndEventType(anyString(), eq(EventType.CLICKED)))
                .thenReturn(List.of());

        Integer timeToClick = trackingService.calculateTimeToClick(testRecipient.getToken());

        assertNull(timeToClick);
    }
}

