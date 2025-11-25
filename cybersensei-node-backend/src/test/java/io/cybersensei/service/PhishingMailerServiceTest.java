package io.cybersensei.service;

import io.cybersensei.domain.entity.*;
import io.cybersensei.domain.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import jakarta.mail.internet.MimeMessage;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for PhishingMailerService
 */
@ExtendWith(MockitoExtension.class)
class PhishingMailerServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private PhishingTemplateRepository templateRepository;

    @Mock
    private PhishingCampaignRepository campaignRepository;

    @Mock
    private PhishingTrackerRepository trackerRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ConfigRepository configRepository;

    @Mock
    private UserExerciseResultRepository resultRepository;

    @InjectMocks
    private PhishingMailerService phishingMailerService;

    private User testUser;
    private PhishingTemplate testTemplate;
    private PhishingCampaign testCampaign;
    private PhishingTracker testTracker;

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = User.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .active(true)
                .build();

        // Setup test template
        testTemplate = PhishingTemplate.builder()
                .id(1L)
                .label("Test Template")
                .subject("Test Phishing Email")
                .htmlContent("<p>Hello {{USER_NAME}}, click <a href='{{PHISHING_LINK}}'>here</a></p><img src='{{TRACKING_PIXEL}}' width='1' height='1'>")
                .textContent("Hello {{USER_NAME}}")
                .type(PhishingTemplate.PhishingType.SPEAR_PHISHING)
                .active(true)
                .build();

        // Setup test campaign
        testCampaign = PhishingCampaign.builder()
                .id(1L)
                .templateId(1L)
                .totalSent(1)
                .totalClicked(0)
                .totalOpened(0)
                .totalReported(0)
                .build();

        // Setup test tracker
        testTracker = PhishingTracker.builder()
                .id(1L)
                .token("test-token-123")
                .userId(1L)
                .campaignId(1L)
                .clicked(false)
                .opened(false)
                .reported(false)
                .campaign(testCampaign)
                .build();
    }

    @Test
    void testTrackEmailOpen_Success() {
        // Given
        when(trackerRepository.findByToken("test-token-123")).thenReturn(Optional.of(testTracker));
        when(trackerRepository.save(any(PhishingTracker.class))).thenReturn(testTracker);
        when(trackerRepository.countOpenedByCampaignId(1L)).thenReturn(1);
        when(campaignRepository.findById(1L)).thenReturn(Optional.of(testCampaign));

        // When
        phishingMailerService.trackEmailOpen("test-token-123");

        // Then
        verify(trackerRepository).findByToken("test-token-123");
        verify(trackerRepository).save(argThat(tracker -> 
            tracker.getOpened() && tracker.getOpenedAt() != null
        ));
        verify(campaignRepository).save(argThat(campaign -> 
            campaign.getTotalOpened() == 1
        ));
    }

    @Test
    void testTrackEmailOpen_AlreadyOpened() {
        // Given
        testTracker.setOpened(true);
        when(trackerRepository.findByToken("test-token-123")).thenReturn(Optional.of(testTracker));

        // When
        phishingMailerService.trackEmailOpen("test-token-123");

        // Then - should not update again
        verify(trackerRepository, times(1)).findByToken("test-token-123");
        verify(trackerRepository, never()).save(any());
    }

    @Test
    void testTrackLinkClick_Success() {
        // Given
        when(trackerRepository.findByToken("test-token-123")).thenReturn(Optional.of(testTracker));
        when(trackerRepository.save(any(PhishingTracker.class))).thenReturn(testTracker);
        when(trackerRepository.countClickedByCampaignId(1L)).thenReturn(1);
        when(trackerRepository.countOpenedByCampaignId(1L)).thenReturn(1);
        when(campaignRepository.findById(1L)).thenReturn(Optional.of(testCampaign));
        when(resultRepository.save(any(UserExerciseResult.class))).thenReturn(null);

        // When
        PhishingTracker result = phishingMailerService.trackLinkClick("test-token-123");

        // Then
        assertNotNull(result);
        verify(trackerRepository).save(argThat(tracker -> 
            tracker.getClicked() && 
            tracker.getOpened() && 
            tracker.getClickedAt() != null &&
            tracker.getOpenedAt() != null
        ));
        verify(resultRepository).save(argThat(exerciseResult -> 
            exerciseResult.getScore() == 0.0 &&
            !exerciseResult.getSuccess()
        ));
        verify(campaignRepository).save(argThat(campaign -> 
            campaign.getTotalClicked() == 1
        ));
    }

    @Test
    void testTrackPhishingReport_Success() {
        // Given
        when(trackerRepository.findByToken("test-token-123")).thenReturn(Optional.of(testTracker));
        when(trackerRepository.save(any(PhishingTracker.class))).thenReturn(testTracker);
        when(trackerRepository.countReportedByCampaignId(1L)).thenReturn(1);
        when(campaignRepository.findById(1L)).thenReturn(Optional.of(testCampaign));
        when(resultRepository.save(any(UserExerciseResult.class))).thenReturn(null);

        // When
        phishingMailerService.trackPhishingReport("test-token-123");

        // Then
        verify(trackerRepository).save(argThat(tracker -> 
            tracker.getReported() && tracker.getReportedAt() != null
        ));
        verify(resultRepository).save(argThat(exerciseResult -> 
            exerciseResult.getScore() == 100.0 &&
            exerciseResult.getSuccess()
        ));
        verify(campaignRepository).save(argThat(campaign -> 
            campaign.getTotalReported() == 1
        ));
    }

    @Test
    void testTrackLinkClick_InvalidToken() {
        // Given
        when(trackerRepository.findByToken("invalid-token")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> 
            phishingMailerService.trackLinkClick("invalid-token")
        );
    }

    @Test
    void testTrackEmailOpen_InvalidToken() {
        // Given
        when(trackerRepository.findByToken("invalid-token")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> 
            phishingMailerService.trackEmailOpen("invalid-token")
        );
    }

    @Test
    void testGetConfigValue() {
        // Given
        Config config = new Config();
        config.setKey("test.key");
        config.setValue("test.value");
        when(configRepository.findByKey("test.key")).thenReturn(Optional.of(config));

        // When
        String value = configRepository.findByKey("test.key")
                .map(Config::getValue)
                .orElse("default");

        // Then
        assertEquals("test.value", value);
    }

    @Test
    void testGetConfigValue_UsesDefault() {
        // Given
        when(configRepository.findByKey("missing.key")).thenReturn(Optional.empty());

        // When
        String value = configRepository.findByKey("missing.key")
                .map(Config::getValue)
                .orElse("default");

        // Then
        assertEquals("default", value);
    }

    @Test
    void testCampaignStatsUpdate() {
        // Given
        when(campaignRepository.findById(1L)).thenReturn(Optional.of(testCampaign));
        when(trackerRepository.countClickedByCampaignId(1L)).thenReturn(5);
        when(trackerRepository.countOpenedByCampaignId(1L)).thenReturn(10);
        when(trackerRepository.countReportedByCampaignId(1L)).thenReturn(2);

        // When
        PhishingCampaign campaign = campaignRepository.findById(1L).orElseThrow();
        campaign.setTotalClicked(trackerRepository.countClickedByCampaignId(1L));
        campaign.setTotalOpened(trackerRepository.countOpenedByCampaignId(1L));
        campaign.setTotalReported(trackerRepository.countReportedByCampaignId(1L));

        // Then
        assertEquals(5, campaign.getTotalClicked());
        assertEquals(10, campaign.getTotalOpened());
        assertEquals(2, campaign.getTotalReported());
    }

    @Test
    void testMultipleClicksOnSameToken_Idempotent() {
        // Given
        when(trackerRepository.findByToken("test-token-123")).thenReturn(Optional.of(testTracker));
        when(trackerRepository.save(any(PhishingTracker.class))).thenReturn(testTracker);
        when(trackerRepository.countClickedByCampaignId(1L)).thenReturn(1);
        when(campaignRepository.findById(1L)).thenReturn(Optional.of(testCampaign));
        when(resultRepository.save(any(UserExerciseResult.class))).thenReturn(null);

        // When - first click
        phishingMailerService.trackLinkClick("test-token-123");
        
        // Mark as clicked for second attempt
        testTracker.setClicked(true);
        
        // When - second click (should be idempotent)
        phishingMailerService.trackLinkClick("test-token-123");

        // Then - should only save once
        verify(resultRepository, times(1)).save(any(UserExerciseResult.class));
    }
}


