package io.cybersensei.aisecurity.service.analyzer;

import io.cybersensei.aisecurity.domain.enums.RiskLevel;
import io.cybersensei.aisecurity.domain.enums.SensitiveDataCategory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class PromptRiskAnalyzerTest {

    private PromptRiskAnalyzer analyzer;

    @BeforeEach
    void setUp() {
        analyzer = new PromptRiskAnalyzer();
    }

    // ── Null / Empty / Blank inputs ──

    @Nested
    @DisplayName("Null, empty, and blank inputs")
    class NullAndBlankInputs {

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = {"   ", "\t", "\n"})
        @DisplayName("should return SAFE with score 0 for null, empty, or blank prompts")
        void shouldReturnSafeForNullOrBlank(String input) {
            var result = analyzer.analyze(input);

            assertThat(result.getRiskScore()).isZero();
            assertThat(result.getRiskLevel()).isEqualTo(RiskLevel.SAFE);
            assertThat(result.getDetections()).isEmpty();
        }
    }

    // ── Clean prompts (no risk) ──

    @Nested
    @DisplayName("Clean prompts with no sensitive data")
    class CleanPrompts {

        @Test
        @DisplayName("should return SAFE for a simple question")
        void shouldReturnSafeForSimpleQuestion() {
            var result = analyzer.analyze("Comment optimiser une requete SQL ?");

            assertThat(result.getRiskScore()).isZero();
            assertThat(result.getRiskLevel()).isEqualTo(RiskLevel.SAFE);
            assertThat(result.getDetections()).isEmpty();
        }

        @Test
        @DisplayName("should return SAFE for generic text")
        void shouldReturnSafeForGenericText() {
            var result = analyzer.analyze("Bonjour, peux-tu me donner des conseils pour apprendre Java ?");

            assertThat(result.getRiskScore()).isZero();
            assertThat(result.getRiskLevel()).isEqualTo(RiskLevel.SAFE);
        }
    }

    // ── Email detection ──

    @Nested
    @DisplayName("Email detection")
    class EmailDetection {

        @Test
        @DisplayName("should detect a standard email address")
        void shouldDetectEmail() {
            var result = analyzer.analyze("Contactez-moi a john.doe@example.com pour plus d'infos");

            assertThat(result.getDetections()).isNotEmpty();
            assertThat(result.getDetections())
                    .anyMatch(d -> d.getCategory() == SensitiveDataCategory.PERSONAL_DATA
                            && d.getMatchedPattern().equals("email"));
            assertThat(result.getRiskScore()).isGreaterThan(0);
        }

        @Test
        @DisplayName("should detect multiple email addresses")
        void shouldDetectMultipleEmails() {
            var result = analyzer.analyze("Envoyer a alice@test.fr et bob@company.com");

            long emailCount = result.getDetections().stream()
                    .filter(d -> d.getMatchedPattern().equals("email"))
                    .count();
            assertThat(emailCount).isEqualTo(2);
        }
    }

    // ── Phone number detection ──

    @Nested
    @DisplayName("Phone number detection")
    class PhoneDetection {

        @Test
        @DisplayName("should detect French phone number")
        void shouldDetectFrenchPhone() {
            var result = analyzer.analyze("Mon numero est 06 12 34 56 78");

            assertThat(result.getDetections())
                    .anyMatch(d -> d.getMatchedPattern().equals("phone_fr"));
        }

        @Test
        @DisplayName("should detect French phone number with +33 prefix")
        void shouldDetectFrenchPhoneWithPrefix() {
            var result = analyzer.analyze("Appelez-moi au +33612345678");

            assertThat(result.getDetections())
                    .anyMatch(d -> d.getMatchedPattern().equals("phone_fr"));
        }

        @Test
        @DisplayName("should detect US phone number")
        void shouldDetectUSPhone() {
            var result = analyzer.analyze("Call me at 555-123-4567");

            assertThat(result.getDetections())
                    .anyMatch(d -> d.getMatchedPattern().equals("phone_us"));
        }
    }

    // ── Credit card detection ──

    @Nested
    @DisplayName("Credit card detection")
    class CreditCardDetection {

        @Test
        @DisplayName("should detect credit card number with spaces")
        void shouldDetectCreditCardWithSpaces() {
            var result = analyzer.analyze("Ma carte est 4111 1111 1111 1111");

            assertThat(result.getDetections())
                    .anyMatch(d -> d.getCategory() == SensitiveDataCategory.FINANCIAL_DATA
                            && d.getMatchedPattern().equals("credit_card"));
        }

        @Test
        @DisplayName("should detect credit card number with dashes")
        void shouldDetectCreditCardWithDashes() {
            var result = analyzer.analyze("Numero de carte: 5500-0000-0000-0004");

            assertThat(result.getDetections())
                    .anyMatch(d -> d.getMatchedPattern().equals("credit_card"));
        }
    }

    // ── IBAN detection ──

    @Nested
    @DisplayName("IBAN detection")
    class IbanDetection {

        @Test
        @DisplayName("should detect IBAN number")
        void shouldDetectIban() {
            var result = analyzer.analyze("Virement sur FR76 3000 6000 0112 3456 789");

            assertThat(result.getDetections())
                    .anyMatch(d -> d.getCategory() == SensitiveDataCategory.FINANCIAL_DATA
                            && d.getMatchedPattern().equals("iban"));
        }
    }

    // ── API key detection ──

    @Nested
    @DisplayName("API key detection")
    class ApiKeyDetection {

        @Test
        @DisplayName("should detect OpenAI API key pattern")
        void shouldDetectOpenAiKey() {
            var result = analyzer.analyze("Voici ma cle: sk-abcdefghijklmnopqrstuvwxyz1234567890");

            assertThat(result.getDetections())
                    .anyMatch(d -> d.getCategory() == SensitiveDataCategory.CREDENTIALS_SECRETS
                            && d.getMatchedPattern().equals("api_key_pattern"));
        }

        @Test
        @DisplayName("should detect GitHub personal access token")
        void shouldDetectGitHubToken() {
            var result = analyzer.analyze("Token: ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij");

            assertThat(result.getDetections())
                    .anyMatch(d -> d.getMatchedPattern().equals("api_key_pattern"));
        }

        @Test
        @DisplayName("should detect GitLab personal access token")
        void shouldDetectGitLabToken() {
            var result = analyzer.analyze("Token: glpat-ABCDEFGHIJKLMNOPQRSTUVWXYZab");

            assertThat(result.getDetections())
                    .anyMatch(d -> d.getMatchedPattern().equals("api_key_pattern"));
        }
    }

    // ── Private key detection ──

    @Nested
    @DisplayName("Private key detection")
    class PrivateKeyDetection {

        @Test
        @DisplayName("should detect RSA private key header")
        void shouldDetectRSAPrivateKey() {
            var result = analyzer.analyze("-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----");

            assertThat(result.getDetections())
                    .anyMatch(d -> d.getCategory() == SensitiveDataCategory.CREDENTIALS_SECRETS
                            && d.getMatchedPattern().equals("private_key"));
        }

        @Test
        @DisplayName("should detect generic private key header")
        void shouldDetectGenericPrivateKey() {
            var result = analyzer.analyze("-----BEGIN PRIVATE KEY-----");

            assertThat(result.getDetections())
                    .anyMatch(d -> d.getMatchedPattern().equals("private_key"));
        }
    }

    // ── SSN detection ──

    @Nested
    @DisplayName("SSN detection")
    class SsnDetection {

        @Test
        @DisplayName("should detect US SSN")
        void shouldDetectUsSsn() {
            var result = analyzer.analyze("Mon SSN est 123-45-6789");

            assertThat(result.getDetections())
                    .anyMatch(d -> d.getCategory() == SensitiveDataCategory.PERSONAL_DATA
                            && d.getMatchedPattern().equals("ssn_us"));
        }

        @Test
        @DisplayName("should detect French SSN (numero de securite sociale)")
        void shouldDetectFrenchSsn() {
            var result = analyzer.analyze("Numero secu: 1 85 12 75 115 003 42");

            assertThat(result.getDetections())
                    .anyMatch(d -> d.getMatchedPattern().equals("ssn_fr"));
        }
    }

    // ── Password / credential pair detection ──

    @Nested
    @DisplayName("Password and credential detection")
    class PasswordDetection {

        @Test
        @DisplayName("should detect password=value pattern")
        void shouldDetectPasswordField() {
            var result = analyzer.analyze("password=MyS3cretP@ss!");

            assertThat(result.getDetections())
                    .anyMatch(d -> d.getCategory() == SensitiveDataCategory.CREDENTIALS_SECRETS
                            && d.getMatchedPattern().equals("credential_pair"));
        }

        @Test
        @DisplayName("should detect mot de passe pattern (French)")
        void shouldDetectMotDePasse() {
            var result = analyzer.analyze("mot de passe: SuperSecret123");

            assertThat(result.getDetections())
                    .anyMatch(d -> d.getMatchedPattern().equals("credential_pair"));
        }

        @Test
        @DisplayName("should detect api_key=value pattern")
        void shouldDetectApiKeyField() {
            var result = analyzer.analyze("api_key=AKIAIOSFODNN7EXAMPLE");

            assertThat(result.getDetections())
                    .anyMatch(d -> d.getMatchedPattern().equals("credential_pair"));
        }
    }

    // ── Connection string detection ──

    @Nested
    @DisplayName("Connection string detection")
    class ConnectionStringDetection {

        @Test
        @DisplayName("should detect JDBC connection string")
        void shouldDetectJdbcUrl() {
            var result = analyzer.analyze("URL: jdbc://localhost:5432/mydb?user=admin&password=secret");

            assertThat(result.getDetections())
                    .anyMatch(d -> d.getCategory() == SensitiveDataCategory.CREDENTIALS_SECRETS
                            && d.getMatchedPattern().equals("connection_string"));
        }

        @Test
        @DisplayName("should detect MongoDB connection string")
        void shouldDetectMongoUrl() {
            var result = analyzer.analyze("mongodb://admin:password@cluster0.example.net/db");

            assertThat(result.getDetections())
                    .anyMatch(d -> d.getMatchedPattern().equals("connection_string"));
        }

        @Test
        @DisplayName("should detect Redis connection string")
        void shouldDetectRedisUrl() {
            var result = analyzer.analyze("redis://default:mypassword@redis-host:6379");

            assertThat(result.getDetections())
                    .anyMatch(d -> d.getMatchedPattern().equals("connection_string"));
        }
    }

    // ── AWS key detection ──

    @Nested
    @DisplayName("AWS key detection")
    class AwsKeyDetection {

        @Test
        @DisplayName("should detect AWS access key")
        void shouldDetectAwsAccessKey() {
            var result = analyzer.analyze("aws_access_key_id = AKIAIOSFODNN7EXAMPLE");

            assertThat(result.getDetections())
                    .anyMatch(d -> d.getCategory() == SensitiveDataCategory.CREDENTIALS_SECRETS
                            && d.getMatchedPattern().equals("aws_key"));
        }
    }

    // ── Risk score computation ──

    @Nested
    @DisplayName("Risk score computation and risk levels")
    class RiskScoreComputation {

        @Test
        @DisplayName("should return SAFE level for score 0")
        void shouldReturnSafeForZeroScore() {
            var result = analyzer.analyze("Bonjour, comment allez-vous ?");

            assertThat(result.getRiskScore()).isZero();
            assertThat(result.getRiskLevel()).isEqualTo(RiskLevel.SAFE);
        }

        @Test
        @DisplayName("should return non-zero score when detections exist")
        void shouldReturnNonZeroForDetections() {
            var result = analyzer.analyze("Mon email est test@example.com");

            assertThat(result.getRiskScore()).isGreaterThan(0);
            assertThat(result.getRiskLevel()).isNotEqualTo(RiskLevel.SAFE);
        }

        @Test
        @DisplayName("credentials should produce high risk score due to category weight 1.5")
        void shouldProduceHighScoreForCredentials() {
            var result = analyzer.analyze("password=MySuperSecretPassword123! et api_key=sk-abcdefghijklmnopqrstuvwxyz1234567890");

            assertThat(result.getRiskScore()).isGreaterThanOrEqualTo(60);
            assertThat(result.getRiskLevel()).isIn(RiskLevel.HIGH, RiskLevel.CRITICAL);
        }

        @Test
        @DisplayName("multiple categories should increase score via diversity factor")
        void shouldIncreaseScoreWithMultipleCategories() {
            // Mix of personal data + financial data + credentials
            String prompt = "email: test@test.com, carte: 4111 1111 1111 1111, password=secret123";
            var result = analyzer.analyze(prompt);

            assertThat(result.getRiskScore()).isGreaterThanOrEqualTo(40);
            assertThat(result.getDetections().stream()
                    .map(PromptRiskAnalyzer.Detection::getCategory)
                    .distinct()
                    .count()).isGreaterThanOrEqualTo(2);
        }
    }

    // ── Mixed content ──

    @Nested
    @DisplayName("Mixed content with sensitive and clean data")
    class MixedContent {

        @Test
        @DisplayName("should detect sensitive data within normal text")
        void shouldDetectWithinNormalText() {
            String prompt = "Bonjour, je souhaite envoyer un email a jean.dupont@societe.fr "
                    + "concernant le contrat. Mon numero est 06 11 22 33 44.";

            var result = analyzer.analyze(prompt);

            assertThat(result.getDetections()).hasSizeGreaterThanOrEqualTo(2);
            assertThat(result.getRiskLevel()).isNotEqualTo(RiskLevel.SAFE);
        }

        @Test
        @DisplayName("should handle prompt with multiple types of sensitive data")
        void shouldHandleMultipleSensitiveTypes() {
            String prompt = "Voici les infos:\n"
                    + "Email: admin@corp.com\n"
                    + "Password: P@ssw0rd!\n"
                    + "Carte: 4111 1111 1111 1111\n"
                    + "-----BEGIN PRIVATE KEY-----\n"
                    + "MIIEvgIBADANBg...\n"
                    + "-----END PRIVATE KEY-----";

            var result = analyzer.analyze(prompt);

            assertThat(result.getDetections().size()).isGreaterThanOrEqualTo(3);
            assertThat(result.getRiskScore()).isGreaterThanOrEqualTo(40);
        }
    }

    // ── Keyword density heuristic ──

    @Nested
    @DisplayName("Keyword density heuristic detection")
    class KeywordDensityDetection {

        @Test
        @DisplayName("should trigger keyword density detection with 2+ matching keywords")
        void shouldTriggerKeywordDensity() {
            // Two PERSONAL_DATA keywords: "nom" and "adresse"
            String prompt = "Le nom du client et son adresse sont necessaires";

            var result = analyzer.analyze(prompt);

            assertThat(result.getDetections())
                    .anyMatch(d -> d.getMethod().equals("keyword_density"));
        }

        @Test
        @DisplayName("should not trigger keyword density with only one keyword")
        void shouldNotTriggerWithSingleKeyword() {
            String prompt = "Le nom est important";

            var result = analyzer.analyze(prompt);

            assertThat(result.getDetections().stream()
                    .filter(d -> d.getMethod().equals("keyword_density"))
                    .count()).isZero();
        }
    }

    // ── Redaction ──

    @Nested
    @DisplayName("Redacted snippets")
    class RedactedSnippets {

        @Test
        @DisplayName("should redact matched values in detections")
        void shouldRedactMatchedValues() {
            var result = analyzer.analyze("Mon email: contact@example.com");

            var emailDetection = result.getDetections().stream()
                    .filter(d -> d.getMatchedPattern().equals("email"))
                    .findFirst();

            assertThat(emailDetection).isPresent();
            assertThat(emailDetection.get().getRedactedSnippet()).contains("****");
            // Should not contain the full email
            assertThat(emailDetection.get().getRedactedSnippet()).doesNotContain("contact@example.com");
        }
    }
}
