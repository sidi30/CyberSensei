package com.cybersensei.backend.phishing.service;

import com.cybersensei.backend.phishing.repository.PhishingRecipientRepository;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * Service for generating cryptographically secure tokens for tracking.
 */
@Service
public class TokenService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int TOKEN_LENGTH = 64; // 64 bytes = 512 bits of entropy
    
    private final PhishingRecipientRepository recipientRepository;

    public TokenService(PhishingRecipientRepository recipientRepository) {
        this.recipientRepository = recipientRepository;
    }

    /**
     * Generate a unique, cryptographically secure token.
     * Ensures uniqueness by checking against existing tokens.
     */
    public String generateUniqueToken() {
        String token;
        int attempts = 0;
        final int maxAttempts = 10;

        do {
            token = generateSecureToken();
            attempts++;
            if (attempts >= maxAttempts) {
                throw new RuntimeException("Failed to generate unique token after " + maxAttempts + " attempts");
            }
        } while (recipientRepository.existsByToken(token));

        return token;
    }

    /**
     * Generate a secure random token without uniqueness check.
     */
    public String generateSecureToken() {
        byte[] bytes = new byte[TOKEN_LENGTH];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /**
     * Generate a short token for URLs (32 chars).
     */
    public String generateShortToken() {
        byte[] bytes = new byte[24]; // 24 bytes = 32 chars in base64
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /**
     * Validate token format.
     */
    public boolean isValidTokenFormat(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }
        // URL-safe base64 characters only
        return token.matches("^[A-Za-z0-9_-]+$") && token.length() >= 32;
    }
}

