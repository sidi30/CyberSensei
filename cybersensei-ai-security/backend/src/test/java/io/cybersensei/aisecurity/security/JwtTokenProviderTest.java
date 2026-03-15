package io.cybersensei.aisecurity.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    // A 256-bit (32-byte) secret for HMAC-SHA256
    private static final String SECRET = "ThisIsAVerySecretKeyForTestingJWT!!";
    private static final String DIFFERENT_SECRET = "ADifferentSecretKeyForTestingJWT!!";

    private JwtTokenProvider jwtTokenProvider;
    private SecretKey key;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(SECRET);
        key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }

    private String generateToken(Long userId, String email, long expirationMillis) {
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMillis))
                .signWith(key)
                .compact();
    }

    private String generateExpiredToken(Long userId, String email) {
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .issuedAt(new Date(System.currentTimeMillis() - 20000))
                .expiration(new Date(System.currentTimeMillis() - 10000))
                .signWith(key)
                .compact();
    }

    // ── validateToken ──

    @Nested
    @DisplayName("validateToken")
    class ValidateToken {

        @Test
        @DisplayName("should return true for valid token")
        void shouldReturnTrueForValidToken() {
            String token = generateToken(42L, "user@test.com", 3600000);

            assertThat(jwtTokenProvider.validateToken(token)).isTrue();
        }

        @Test
        @DisplayName("should return false for expired token")
        void shouldReturnFalseForExpiredToken() {
            String token = generateExpiredToken(42L, "user@test.com");

            assertThat(jwtTokenProvider.validateToken(token)).isFalse();
        }

        @Test
        @DisplayName("should return false for token signed with different key")
        void shouldReturnFalseForDifferentKey() {
            SecretKey differentKey = Keys.hmacShaKeyFor(DIFFERENT_SECRET.getBytes(StandardCharsets.UTF_8));
            String token = Jwts.builder()
                    .subject("42")
                    .issuedAt(new Date())
                    .expiration(new Date(System.currentTimeMillis() + 3600000))
                    .signWith(differentKey)
                    .compact();

            assertThat(jwtTokenProvider.validateToken(token)).isFalse();
        }

        @Test
        @DisplayName("should return false for malformed token")
        void shouldReturnFalseForMalformedToken() {
            assertThat(jwtTokenProvider.validateToken("not.a.valid.jwt.token")).isFalse();
        }

        @Test
        @DisplayName("should return false for null token")
        void shouldReturnFalseForNullToken() {
            assertThat(jwtTokenProvider.validateToken(null)).isFalse();
        }

        @Test
        @DisplayName("should return false for empty token")
        void shouldReturnFalseForEmptyToken() {
            assertThat(jwtTokenProvider.validateToken("")).isFalse();
        }
    }

    // ── getUserId ──

    @Nested
    @DisplayName("getUserId")
    class GetUserId {

        @Test
        @DisplayName("should extract userId from token subject")
        void shouldExtractUserId() {
            String token = generateToken(123L, "admin@test.com", 3600000);

            Long userId = jwtTokenProvider.getUserId(token);

            assertThat(userId).isEqualTo(123L);
        }

        @Test
        @DisplayName("should extract different userId")
        void shouldExtractDifferentUserId() {
            String token = generateToken(999L, "other@test.com", 3600000);

            assertThat(jwtTokenProvider.getUserId(token)).isEqualTo(999L);
        }
    }

    // ── getEmail ──

    @Nested
    @DisplayName("getEmail")
    class GetEmail {

        @Test
        @DisplayName("should extract email from token claims")
        void shouldExtractEmail() {
            String token = generateToken(42L, "hello@cybersensei.io", 3600000);

            String email = jwtTokenProvider.getEmail(token);

            assertThat(email).isEqualTo("hello@cybersensei.io");
        }

        @Test
        @DisplayName("should return null when email claim is absent")
        void shouldReturnNullWhenNoEmailClaim() {
            String token = Jwts.builder()
                    .subject("42")
                    .issuedAt(new Date())
                    .expiration(new Date(System.currentTimeMillis() + 3600000))
                    .signWith(key)
                    .compact();

            String email = jwtTokenProvider.getEmail(token);

            assertThat(email).isNull();
        }
    }

    // ── getClaims ──

    @Nested
    @DisplayName("getClaims")
    class GetClaims {

        @Test
        @DisplayName("should return all claims from token")
        void shouldReturnAllClaims() {
            String token = generateToken(42L, "test@test.com", 3600000);

            var claims = jwtTokenProvider.getClaims(token);

            assertThat(claims.getSubject()).isEqualTo("42");
            assertThat(claims.get("email", String.class)).isEqualTo("test@test.com");
            assertThat(claims.getIssuedAt()).isNotNull();
            assertThat(claims.getExpiration()).isNotNull();
        }
    }
}
