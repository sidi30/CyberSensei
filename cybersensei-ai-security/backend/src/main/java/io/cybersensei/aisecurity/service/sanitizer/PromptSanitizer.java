package io.cybersensei.aisecurity.service.sanitizer;

import io.cybersensei.aisecurity.service.analyzer.PromptRiskAnalyzer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Sanitizes prompts by replacing detected sensitive data with generic placeholders.
 * Preserves the intent of the prompt while removing risky content.
 */
@Slf4j
@Service
public class PromptSanitizer {

    private static final List<ReplacementRule> REPLACEMENT_RULES = List.of(
            // Emails
            new ReplacementRule(
                    Pattern.compile("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b"),
                    "[EMAIL]"
            ),
            // Phone numbers (FR)
            new ReplacementRule(
                    Pattern.compile("(?:^|(?<=\\s))(?:\\+33|0033|0)[1-9](?:[\\s.-]?\\d{2}){4}\\b"),
                    "[TELEPHONE]"
            ),
            // Phone numbers (US/INT)
            new ReplacementRule(
                    Pattern.compile("\\b\\d{3}[-.\\s]?\\d{3}[-.\\s]?\\d{4}\\b"),
                    "[TELEPHONE]"
            ),
            // SSN FR
            new ReplacementRule(
                    Pattern.compile("\\b[12]\\s?\\d{2}\\s?\\d{2}\\s?\\d{2}\\s?[A-Za-z]?\\s?\\d{3}\\s?\\d{3}\\s?\\d{2}\\b"),
                    "[NUMERO_SECURITE_SOCIALE]"
            ),
            // SSN US
            new ReplacementRule(
                    Pattern.compile("\\b\\d{3}-\\d{2}-\\d{4}\\b"),
                    "[SSN]"
            ),
            // IBAN
            new ReplacementRule(
                    Pattern.compile("\\b(?:FR)?\\d{2}\\s?\\d{4}\\s?\\d{4}\\s?\\d{4}\\s?\\d{4}\\s?\\d{3}\\b"),
                    "[IBAN]"
            ),
            // Credit cards
            new ReplacementRule(
                    Pattern.compile("\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b"),
                    "[CARTE_BANCAIRE]"
            ),
            // Private keys (must be before credential pairs)
            new ReplacementRule(
                    Pattern.compile("-----BEGIN (?:RSA |EC )?PRIVATE KEY-----[\\s\\S]*?-----END (?:RSA |EC )?PRIVATE KEY-----"),
                    "[CLE_PRIVEE]"
            ),
            // API keys / tokens (must be before credential pairs)
            new ReplacementRule(
                    Pattern.compile("(?i)(?:sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36,}|glpat-[a-zA-Z0-9-]{20,})"),
                    "[CLE_API]"
            ),
            // Credential pairs (token only matches if value is not a known API key prefix)
            new ReplacementRule(
                    Pattern.compile("(?i)(password|mot.?de.?passe|pwd|secret|token|api.?key)\\s*[:=]\\s*(?!(?:sk-|ghp_|glpat-|\\[))\\S+"),
                    "$1=[MASQUE]"
            ),
            // Connection strings
            new ReplacementRule(
                    Pattern.compile("(?i)(?:jdbc|mongodb|redis|mysql|postgres)://[^\\s]+"),
                    "[URL_CONNEXION]"
            ),
            // AWS keys
            new ReplacementRule(
                    Pattern.compile("(?i)(aws_access_key_id|aws_secret_access_key)\\s*=\\s*\\S+"),
                    "$1=[MASQUE]"
            ),
            // SIRET/SIREN/TVA
            new ReplacementRule(
                    Pattern.compile("(?i)(SIRET|SIREN|TVA|VAT)\\s*[:=]?\\s*[A-Z]{0,2}\\d{9,14}"),
                    "$1 [NUMERO_MASQUE]"
            ),
            // Contract references
            new ReplacementRule(
                    Pattern.compile("(?i)(contrat|contract|accord|agreement)\\s+(?:n[°o.]?|#)?\\s*[A-Z0-9-]+"),
                    "$1 [REF_MASQUEE]"
            ),
            // Company/client names after keywords
            new ReplacementRule(
                    Pattern.compile("(?i)(client|customer|société|company|entreprise|fournisseur)\\s*[:=]?\\s*([A-Z][\\w\\s]{2,25})"),
                    "$1 [ENTITE]"
            )
    );

    private static final Map<String, String> CONTEXTUAL_REPLACEMENTS = Map.of(
            "banque", "[BANQUE]",
            "hôpital", "[ETABLISSEMENT]",
            "cabinet", "[ETABLISSEMENT]"
    );

    /**
     * Sanitize a prompt by replacing sensitive data with generic placeholders.
     */
    public String sanitize(String prompt, List<PromptRiskAnalyzer.Detection> detections) {
        if (prompt == null || prompt.isBlank()) return prompt;
        if (detections == null || detections.isEmpty()) return prompt;

        String sanitized = prompt;

        for (ReplacementRule rule : REPLACEMENT_RULES) {
            sanitized = rule.pattern().matcher(sanitized).replaceAll(rule.replacement());
        }

        log.debug("Prompt sanitized: original_length={}, sanitized_length={}",
                prompt.length(), sanitized.length());

        return sanitized;
    }

    private record ReplacementRule(Pattern pattern, String replacement) {}
}
