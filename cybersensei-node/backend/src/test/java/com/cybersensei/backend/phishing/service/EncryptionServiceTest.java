package com.cybersensei.backend.phishing.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class EncryptionServiceTest {

    private EncryptionService encryptionService;

    @BeforeEach
    void setUp() {
        // Use default key for testing
        encryptionService = new EncryptionService(null);
    }

    @Test
    void encrypt_ShouldReturnNonNullCiphertext() {
        String plaintext = "MySecretPassword123!";
        
        String ciphertext = encryptionService.encrypt(plaintext);
        
        assertNotNull(ciphertext);
        assertFalse(ciphertext.isEmpty());
    }

    @Test
    void encrypt_ShouldReturnBase64EncodedString() {
        String plaintext = "MySecretPassword123!";
        
        String ciphertext = encryptionService.encrypt(plaintext);
        
        // Base64 characters only (including + and / which are standard, or - and _ for URL-safe)
        assertTrue(ciphertext.matches("^[A-Za-z0-9+/=-]+$"));
    }

    @Test
    void decrypt_ShouldReturnOriginalPlaintext() {
        String originalPlaintext = "MySecretPassword123!";
        
        String ciphertext = encryptionService.encrypt(originalPlaintext);
        String decrypted = encryptionService.decrypt(ciphertext);
        
        assertEquals(originalPlaintext, decrypted);
    }

    @Test
    void encryptDecrypt_ShouldWorkWithEmptyString() {
        String plaintext = "";
        
        String ciphertext = encryptionService.encrypt(plaintext);
        String decrypted = encryptionService.decrypt(ciphertext);
        
        assertEquals(plaintext, decrypted);
    }

    @Test
    void encryptDecrypt_ShouldWorkWithLongText() {
        String plaintext = "A".repeat(10000);
        
        String ciphertext = encryptionService.encrypt(plaintext);
        String decrypted = encryptionService.decrypt(ciphertext);
        
        assertEquals(plaintext, decrypted);
    }

    @Test
    void encryptDecrypt_ShouldWorkWithSpecialCharacters() {
        String plaintext = "P@$$w0rd!#%^&*()_+-=[]{}|;':\",./<>?`~";
        
        String ciphertext = encryptionService.encrypt(plaintext);
        String decrypted = encryptionService.decrypt(ciphertext);
        
        assertEquals(plaintext, decrypted);
    }

    @Test
    void encryptDecrypt_ShouldWorkWithUnicode() {
        String plaintext = "密码パスワード🔐🔑";
        
        String ciphertext = encryptionService.encrypt(plaintext);
        String decrypted = encryptionService.decrypt(ciphertext);
        
        assertEquals(plaintext, decrypted);
    }

    @Test
    void encrypt_ShouldProduceDifferentCiphertextsForSamePlaintext() {
        String plaintext = "MySecretPassword123!";
        
        String ciphertext1 = encryptionService.encrypt(plaintext);
        String ciphertext2 = encryptionService.encrypt(plaintext);
        
        // Due to random IV, same plaintext should produce different ciphertexts
        assertNotEquals(ciphertext1, ciphertext2);
    }

    @Test
    void decrypt_ShouldThrowExceptionForInvalidCiphertext() {
        String invalidCiphertext = "not-valid-ciphertext";
        
        assertThrows(RuntimeException.class, () -> {
            encryptionService.decrypt(invalidCiphertext);
        });
    }

    @Test
    void generateKey_ShouldReturnValidBase64Key() {
        String key = EncryptionService.generateKey();
        
        assertNotNull(key);
        assertEquals(44, key.length()); // 32 bytes in base64 = 44 chars (with padding)
        assertTrue(key.matches("^[A-Za-z0-9+/=]+$"));
    }

    @Test
    void generateKey_ShouldReturnUniqueKeys() {
        String key1 = EncryptionService.generateKey();
        String key2 = EncryptionService.generateKey();
        
        assertNotEquals(key1, key2);
    }
}

