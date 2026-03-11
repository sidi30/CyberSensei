package io.cybersensei.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private static final String SECRET = "ThisIsAVeryLongSecretKeyForTestingJwtTokenProviderAtLeast32Bytes!!";
    private static final long EXPIRATION_MS = 3600000L; // 1 hour
    private static final long REFRESH_EXPIRATION_MS = 86400000L; // 24 hours

    private JwtTokenProvider tokenProvider;

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider(SECRET, EXPIRATION_MS, REFRESH_EXPIRATION_MS);
    }

    // ---- Token generation ----

    @Test
    void generateToken_shouldReturnNonNullToken() {
        String token = tokenProvider.generateToken(1L, "alice@test.com");

        assertThat(token).isNotNull().isNotBlank();
    }

    @Test
    void generateRefreshToken_shouldReturnNonNullToken() {
        String token = tokenProvider.generateRefreshToken(1L, "alice@test.com");

        assertThat(token).isNotNull().isNotBlank();
    }

    @Test
    void generateToken_differentUsers_shouldReturnDifferentTokens() {
        String token1 = tokenProvider.generateToken(1L, "alice@test.com");
        String token2 = tokenProvider.generateToken(2L, "bob@test.com");

        assertThat(token1).isNotEqualTo(token2);
    }

    // ---- Token validation ----

    @Test
    void validateToken_validToken_shouldReturnTrue() {
        String token = tokenProvider.generateToken(1L, "alice@test.com");

        assertThat(tokenProvider.validateToken(token)).isTrue();
    }

    @Test
    void validateToken_invalidToken_shouldReturnFalse() {
        assertThat(tokenProvider.validateToken("invalid.jwt.token")).isFalse();
    }

    @Test
    void validateToken_tamperedToken_shouldReturnFalse() {
        String token = tokenProvider.generateToken(1L, "alice@test.com");
        // Tamper with the token by changing a character
        String tampered = token.substring(0, token.length() - 2) + "XX";

        assertThat(tokenProvider.validateToken(tampered)).isFalse();
    }

    @Test
    void validateToken_expiredToken_shouldReturnFalse() {
        // Create a token provider with 0ms expiration (already expired)
        JwtTokenProvider expiredProvider = new JwtTokenProvider(SECRET, 0L, 0L);
        String token = expiredProvider.generateToken(1L, "alice@test.com");

        assertThat(expiredProvider.validateToken(token)).isFalse();
    }

    @Test
    void validateToken_tokenSignedWithDifferentKey_shouldReturnFalse() {
        SecretKey otherKey = Keys.hmacShaKeyFor(
                "AnotherSecretKeyThatIsDifferentAndAtLeast32BytesLong!!".getBytes(StandardCharsets.UTF_8));

        String foreignToken = Jwts.builder()
                .setSubject("1")
                .claim("email", "hacker@evil.com")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(otherKey, SignatureAlgorithm.HS256)
                .compact();

        assertThat(tokenProvider.validateToken(foreignToken)).isFalse();
    }

    // ---- Claims extraction ----

    @Test
    void getUserIdFromToken_shouldReturnCorrectUserId() {
        String token = tokenProvider.generateToken(42L, "alice@test.com");

        Long userId = tokenProvider.getUserIdFromToken(token);

        assertThat(userId).isEqualTo(42L);
    }

    @Test
    void getEmailFromToken_shouldReturnCorrectEmail() {
        String token = tokenProvider.generateToken(1L, "alice@test.com");

        String email = tokenProvider.getEmailFromToken(token);

        assertThat(email).isEqualTo("alice@test.com");
    }

    @Test
    void getEmailFromToken_refreshToken_shouldAlsoWork() {
        String refreshToken = tokenProvider.generateRefreshToken(7L, "bob@cybersensei.io");

        Long userId = tokenProvider.getUserIdFromToken(refreshToken);
        String email = tokenProvider.getEmailFromToken(refreshToken);

        assertThat(userId).isEqualTo(7L);
        assertThat(email).isEqualTo("bob@cybersensei.io");
    }
}
