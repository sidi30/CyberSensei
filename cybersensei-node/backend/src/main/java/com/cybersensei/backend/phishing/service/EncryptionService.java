package com.cybersensei.backend.phishing.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Service for encrypting sensitive data like SMTP passwords.
 * Uses AES-256-GCM for authenticated encryption.
 */
@Service
public class EncryptionService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final SecretKey secretKey;

    public EncryptionService(@Value("${cybersensei.encryption.key:#{null}}") String encryptionKeyBase64) {
        if (encryptionKeyBase64 != null && !encryptionKeyBase64.isEmpty()) {
            byte[] keyBytes = Base64.getDecoder().decode(encryptionKeyBase64);
            this.secretKey = new SecretKeySpec(keyBytes, "AES");
        } else {
            // Generate a default key for development (should be configured in production)
            byte[] keyBytes = new byte[32]; // 256 bits
            SECURE_RANDOM.nextBytes(keyBytes);
            this.secretKey = new SecretKeySpec(keyBytes, "AES");
        }
    }

    /**
     * Encrypt a plaintext string.
     * 
     * @param plaintext The text to encrypt
     * @return Base64-encoded ciphertext (IV + encrypted data + auth tag)
     */
    public String encrypt(String plaintext) {
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            SECURE_RANDOM.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);

            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

            // Combine IV + ciphertext
            byte[] combined = new byte[iv.length + ciphertext.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(ciphertext, 0, combined, iv.length, ciphertext.length);

            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    /**
     * Decrypt a ciphertext string.
     * 
     * @param ciphertext Base64-encoded ciphertext
     * @return Decrypted plaintext
     */
    public String decrypt(String ciphertext) {
        try {
            byte[] combined = Base64.getDecoder().decode(ciphertext);

            // Extract IV
            byte[] iv = new byte[GCM_IV_LENGTH];
            System.arraycopy(combined, 0, iv, 0, GCM_IV_LENGTH);

            // Extract actual ciphertext
            byte[] encryptedData = new byte[combined.length - GCM_IV_LENGTH];
            System.arraycopy(combined, GCM_IV_LENGTH, encryptedData, 0, encryptedData.length);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);

            byte[] plaintext = cipher.doFinal(encryptedData);
            return new String(plaintext, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Decryption failed", e);
        }
    }

    /**
     * Generate a new encryption key.
     * 
     * @return Base64-encoded 256-bit key
     */
    public static String generateKey() {
        byte[] keyBytes = new byte[32];
        SECURE_RANDOM.nextBytes(keyBytes);
        return Base64.getEncoder().encodeToString(keyBytes);
    }
}

