package com.cybersensei.backend.phishing.service;

import com.cybersensei.backend.phishing.repository.PhishingRecipientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TokenServiceTest {

    @Mock
    private PhishingRecipientRepository recipientRepository;

    private TokenService tokenService;

    @BeforeEach
    void setUp() {
        tokenService = new TokenService(recipientRepository);
    }

    @Test
    void generateSecureToken_ShouldReturnNonNullToken() {
        String token = tokenService.generateSecureToken();
        
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void generateSecureToken_ShouldReturnUrlSafeToken() {
        String token = tokenService.generateSecureToken();
        
        // URL-safe base64 only contains A-Z, a-z, 0-9, -, _
        assertTrue(token.matches("^[A-Za-z0-9_-]+$"));
    }

    @Test
    void generateSecureToken_ShouldReturnSufficientLength() {
        String token = tokenService.generateSecureToken();
        
        // 64 bytes base64 encoded = ~86 characters
        assertTrue(token.length() >= 80);
    }

    @Test
    void generateUniqueToken_ShouldReturnUniqueTokens() {
        when(recipientRepository.existsByToken(anyString())).thenReturn(false);

        Set<String> tokens = new HashSet<>();
        int count = 100;

        for (int i = 0; i < count; i++) {
            tokens.add(tokenService.generateUniqueToken());
        }

        assertEquals(count, tokens.size(), "All tokens should be unique");
    }

    @Test
    void generateUniqueToken_ShouldRetryOnCollision() {
        // First two calls return true (collision), third returns false
        when(recipientRepository.existsByToken(anyString()))
                .thenReturn(true)
                .thenReturn(true)
                .thenReturn(false);

        String token = tokenService.generateUniqueToken();

        assertNotNull(token);
    }

    @Test
    void generateShortToken_ShouldReturn32Characters() {
        String token = tokenService.generateShortToken();
        
        assertEquals(32, token.length());
    }

    @Test
    void isValidTokenFormat_ShouldAcceptValidTokens() {
        String validToken = tokenService.generateSecureToken();
        
        assertTrue(tokenService.isValidTokenFormat(validToken));
    }

    @Test
    void isValidTokenFormat_ShouldRejectNullToken() {
        assertFalse(tokenService.isValidTokenFormat(null));
    }

    @Test
    void isValidTokenFormat_ShouldRejectEmptyToken() {
        assertFalse(tokenService.isValidTokenFormat(""));
    }

    @Test
    void isValidTokenFormat_ShouldRejectShortToken() {
        assertFalse(tokenService.isValidTokenFormat("abc123"));
    }

    @Test
    void isValidTokenFormat_ShouldRejectTokenWithInvalidCharacters() {
        assertFalse(tokenService.isValidTokenFormat("token with spaces"));
        assertFalse(tokenService.isValidTokenFormat("token+plus+signs"));
        assertFalse(tokenService.isValidTokenFormat("token/with/slashes"));
    }
}

