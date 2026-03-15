package io.cybersensei.aisecurity.service.sanitizer;

import io.cybersensei.aisecurity.domain.enums.SensitiveDataCategory;
import io.cybersensei.aisecurity.service.analyzer.PromptRiskAnalyzer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class PromptSanitizerTest {

    private PromptSanitizer sanitizer;

    /**
     * Helper: creates a non-empty detections list so sanitization proceeds.
     * The sanitizer only checks that detections is non-null and non-empty;
     * it does not use detection contents for replacement logic.
     */
    private List<PromptRiskAnalyzer.Detection> dummyDetections() {
        return List.of(
                PromptRiskAnalyzer.Detection.builder()
                        .category(SensitiveDataCategory.PERSONAL_DATA)
                        .confidence(80)
                        .method("regex")
                        .matchedPattern("email")
                        .redactedSnippet("te****om")
                        .build()
        );
    }

    @BeforeEach
    void setUp() {
        sanitizer = new PromptSanitizer();
    }

    // ── Null / Blank inputs ──

    @Nested
    @DisplayName("Null and blank inputs")
    class NullAndBlankInputs {

        @Test
        @DisplayName("should return null when prompt is null")
        void shouldReturnNullForNullPrompt() {
            String result = sanitizer.sanitize(null, dummyDetections());
            assertThat(result).isNull();
        }

        @ParameterizedTest
        @ValueSource(strings = {"", "   ", "\t"})
        @DisplayName("should return input as-is for blank prompts")
        void shouldReturnAsIsForBlank(String input) {
            String result = sanitizer.sanitize(input, dummyDetections());
            assertThat(result).isEqualTo(input);
        }

        @Test
        @DisplayName("should return prompt unchanged when detections is null")
        void shouldReturnUnchangedWhenDetectionsNull() {
            String prompt = "password=secret123";
            String result = sanitizer.sanitize(prompt, null);
            assertThat(result).isEqualTo(prompt);
        }

        @Test
        @DisplayName("should return prompt unchanged when detections list is empty")
        void shouldReturnUnchangedWhenDetectionsEmpty() {
            String prompt = "password=secret123";
            String result = sanitizer.sanitize(prompt, List.of());
            assertThat(result).isEqualTo(prompt);
        }
    }

    // ── Email replacement ──

    @Nested
    @DisplayName("Email replacement -> [EMAIL]")
    class EmailReplacement {

        @Test
        @DisplayName("should replace email with [EMAIL]")
        void shouldReplaceEmail() {
            String result = sanitizer.sanitize("Contactez john@example.com", dummyDetections());
            assertThat(result).isEqualTo("Contactez [EMAIL]");
        }

        @Test
        @DisplayName("should replace multiple emails")
        void shouldReplaceMultipleEmails() {
            String result = sanitizer.sanitize("a@b.com et c@d.fr", dummyDetections());
            assertThat(result).isEqualTo("[EMAIL] et [EMAIL]");
        }
    }

    // ── Phone replacement ──

    @Nested
    @DisplayName("Phone number replacement -> [TELEPHONE]")
    class PhoneReplacement {

        @Test
        @DisplayName("should replace French phone number with [TELEPHONE]")
        void shouldReplaceFrenchPhone() {
            String result = sanitizer.sanitize("Appelez 06 12 34 56 78", dummyDetections());
            assertThat(result).isEqualTo("Appelez [TELEPHONE]");
        }

        @Test
        @DisplayName("should replace +33 phone number with [TELEPHONE]")
        void shouldReplacePlus33Phone() {
            String result = sanitizer.sanitize("Tel: +33612345678", dummyDetections());
            assertThat(result).isEqualTo("Tel: [TELEPHONE]");
        }

        @Test
        @DisplayName("should replace US phone number with [TELEPHONE]")
        void shouldReplaceUSPhone() {
            String result = sanitizer.sanitize("Call 555-123-4567", dummyDetections());
            assertThat(result).isEqualTo("Call [TELEPHONE]");
        }
    }

    // ── Credit card replacement ──

    @Nested
    @DisplayName("Credit card replacement -> [CARTE_BANCAIRE]")
    class CreditCardReplacement {

        @Test
        @DisplayName("should replace credit card number with [CARTE_BANCAIRE]")
        void shouldReplaceCreditCard() {
            String result = sanitizer.sanitize("Carte: 4111 1111 1111 1111", dummyDetections());
            assertThat(result).isEqualTo("Carte: [CARTE_BANCAIRE]");
        }

        @Test
        @DisplayName("should replace credit card with dashes")
        void shouldReplaceCreditCardWithDashes() {
            String result = sanitizer.sanitize("CB 5500-0000-0000-0004", dummyDetections());
            assertThat(result).isEqualTo("CB [CARTE_BANCAIRE]");
        }
    }

    // ── IBAN replacement ──

    @Nested
    @DisplayName("IBAN replacement -> [IBAN]")
    class IbanReplacement {

        @Test
        @DisplayName("should replace IBAN with [IBAN]")
        void shouldReplaceIban() {
            String result = sanitizer.sanitize("Virement sur FR76 3000 6000 0112 3456 789", dummyDetections());
            assertThat(result).isEqualTo("Virement sur [IBAN]");
        }
    }

    // ── API key replacement ──

    @Nested
    @DisplayName("API key replacement -> [CLE_API]")
    class ApiKeyReplacement {

        @Test
        @DisplayName("should replace OpenAI key with [CLE_API]")
        void shouldReplaceOpenAiKey() {
            String result = sanitizer.sanitize(
                    "Key: sk-abcdefghijklmnopqrstuvwxyz1234567890", dummyDetections());
            assertThat(result).isEqualTo("Key: [CLE_API]");
        }

        @Test
        @DisplayName("should replace GitHub token with [CLE_API]")
        void shouldReplaceGithubToken() {
            String result = sanitizer.sanitize(
                    "Token: ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij", dummyDetections());
            assertThat(result).isEqualTo("Token: [CLE_API]");
        }
    }

    // ── Private key replacement ──

    @Nested
    @DisplayName("Private key replacement -> [CLE_PRIVEE]")
    class PrivateKeyReplacement {

        @Test
        @DisplayName("should replace RSA private key block with [CLE_PRIVEE]")
        void shouldReplaceRSAPrivateKey() {
            String input = "Voici la cle:\n-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----\nFin.";
            String result = sanitizer.sanitize(input, dummyDetections());
            assertThat(result).contains("[CLE_PRIVEE]");
            assertThat(result).doesNotContain("BEGIN RSA PRIVATE KEY");
        }

        @Test
        @DisplayName("should replace generic private key block with [CLE_PRIVEE]")
        void shouldReplaceGenericPrivateKey() {
            String input = "-----BEGIN PRIVATE KEY-----\ndata\n-----END PRIVATE KEY-----";
            String result = sanitizer.sanitize(input, dummyDetections());
            assertThat(result).isEqualTo("[CLE_PRIVEE]");
        }
    }

    // ── Password / credential pair replacement ──

    @Nested
    @DisplayName("Password replacement -> $1=[MASQUE]")
    class PasswordReplacement {

        @Test
        @DisplayName("should replace password=value with password=[MASQUE]")
        void shouldReplacePasswordField() {
            String result = sanitizer.sanitize("password=MySecret123", dummyDetections());
            assertThat(result).isEqualTo("password=[MASQUE]");
        }

        @Test
        @DisplayName("should replace pwd:value with pwd=[MASQUE]")
        void shouldReplacePwdField() {
            String result = sanitizer.sanitize("pwd:secret", dummyDetections());
            assertThat(result).isEqualTo("pwd=[MASQUE]");
        }

        @Test
        @DisplayName("should replace mot de passe: value")
        void shouldReplaceMotDePasse() {
            String result = sanitizer.sanitize("mot de passe: SuperSecret", dummyDetections());
            assertThat(result).isEqualTo("mot de passe=[MASQUE]");
        }

        @Test
        @DisplayName("should replace token=value")
        void shouldReplaceTokenField() {
            String result = sanitizer.sanitize("token=abc123xyz", dummyDetections());
            assertThat(result).isEqualTo("token=[MASQUE]");
        }
    }

    // ── Connection string replacement ──

    @Nested
    @DisplayName("Connection string replacement -> [URL_CONNEXION]")
    class ConnectionStringReplacement {

        @Test
        @DisplayName("should replace JDBC URL with [URL_CONNEXION]")
        void shouldReplaceJdbcUrl() {
            String result = sanitizer.sanitize("jdbc://localhost:5432/db", dummyDetections());
            assertThat(result).isEqualTo("[URL_CONNEXION]");
        }

        @Test
        @DisplayName("should replace MongoDB URL with [URL_CONNEXION]")
        void shouldReplaceMongoUrl() {
            String result = sanitizer.sanitize("mongodb://admin:pass@host/db", dummyDetections());
            assertThat(result).isEqualTo("[URL_CONNEXION]");
        }

        @Test
        @DisplayName("should replace Redis URL with [URL_CONNEXION]")
        void shouldReplaceRedisUrl() {
            String result = sanitizer.sanitize("redis://user:pass@host:6379", dummyDetections());
            assertThat(result).isEqualTo("[URL_CONNEXION]");
        }
    }

    // ── SSN replacement ──

    @Nested
    @DisplayName("SSN replacement")
    class SsnReplacement {

        @Test
        @DisplayName("should replace US SSN with [SSN]")
        void shouldReplaceUsSsn() {
            String result = sanitizer.sanitize("SSN: 123-45-6789", dummyDetections());
            assertThat(result).isEqualTo("SSN: [SSN]");
        }

        @Test
        @DisplayName("should replace French SSN with [NUMERO_SECURITE_SOCIALE]")
        void shouldReplaceFrenchSsn() {
            String result = sanitizer.sanitize("Secu: 1 85 12 75 115 003 42", dummyDetections());
            assertThat(result).isEqualTo("Secu: [NUMERO_SECURITE_SOCIALE]");
        }
    }

    // ── Non-sensitive text preserved ──

    @Nested
    @DisplayName("Non-sensitive text preservation")
    class NonSensitivePreservation {

        @Test
        @DisplayName("should preserve non-sensitive text around replacements")
        void shouldPreserveContext() {
            String result = sanitizer.sanitize(
                    "Bonjour, mon email est test@test.com et je veux de l'aide",
                    dummyDetections());

            assertThat(result).startsWith("Bonjour, mon email est ");
            assertThat(result).endsWith(" et je veux de l'aide");
            assertThat(result).contains("[EMAIL]");
        }

        @Test
        @DisplayName("should not modify prompt with no sensitive data patterns")
        void shouldNotModifyCleanPrompt() {
            String prompt = "Comment optimiser une boucle for en Java ?";
            String result = sanitizer.sanitize(prompt, dummyDetections());
            assertThat(result).isEqualTo(prompt);
        }
    }
}
