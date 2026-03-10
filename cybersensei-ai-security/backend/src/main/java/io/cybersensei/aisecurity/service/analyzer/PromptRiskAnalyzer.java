package io.cybersensei.aisecurity.service.analyzer;

import io.cybersensei.aisecurity.domain.enums.RiskLevel;
import io.cybersensei.aisecurity.domain.enums.SensitiveDataCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Hybrid prompt risk analyzer combining regex patterns and heuristic NLP classification.
 * Detects sensitive data categories and computes a risk score from 0-100.
 */
@Slf4j
@Service
public class PromptRiskAnalyzer {

    @Data
    @Builder
    @AllArgsConstructor
    public static class AnalysisResult {
        private int riskScore;
        private RiskLevel riskLevel;
        private List<Detection> detections;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class Detection {
        private SensitiveDataCategory category;
        private int confidence;
        private String method;
        private String matchedPattern;
        private String redactedSnippet;
    }

    // ── Regex patterns per category ──

    private static final Map<SensitiveDataCategory, List<PatternRule>> PATTERNS = Map.of(
            SensitiveDataCategory.PERSONAL_DATA, List.of(
                    new PatternRule(Pattern.compile("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b"), "email", 70),
                    new PatternRule(Pattern.compile("(?:^|\\s)(?:\\+33|0033|0)[1-9](?:[\\s.-]?\\d{2}){4}\\b"), "phone_fr", 65),
                    new PatternRule(Pattern.compile("\\b\\d{3}[-.\\s]?\\d{3}[-.\\s]?\\d{4}\\b"), "phone_us", 60),
                    new PatternRule(Pattern.compile("\\b[12]\\s?\\d{2}\\s?\\d{2}\\s?\\d{2}\\s?[A-Za-z]?\\s?\\d{3}\\s?\\d{3}\\s?\\d{2}\\b"), "ssn_fr", 90),
                    new PatternRule(Pattern.compile("\\b\\d{3}-\\d{2}-\\d{4}\\b"), "ssn_us", 90),
                    new PatternRule(Pattern.compile("(?i)\\b(?:nom|name|prenom|surname|first.?name|last.?name)\\s*[:=]\\s*[A-Z][a-zÀ-ÿ]+"), "name_field", 50)
            ),
            SensitiveDataCategory.FINANCIAL_DATA, List.of(
                    new PatternRule(Pattern.compile("\\b(?:FR)?\\d{2}\\s?\\d{4}\\s?\\d{4}\\s?\\d{4}\\s?\\d{4}\\s?\\d{3}\\b"), "iban", 90),
                    new PatternRule(Pattern.compile("\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b"), "credit_card", 85),
                    new PatternRule(Pattern.compile("(?i)\\b(?:salaire|salary|revenue|chiffre.?d.?affaires|ca|bilan|facture)\\s*[:=]?\\s*\\d"), "financial_term", 60)
            ),
            SensitiveDataCategory.CREDENTIALS_SECRETS, List.of(
                    new PatternRule(Pattern.compile("(?i)(?:password|mot.?de.?passe|pwd|secret|token|api.?key|apikey)\\s*[:=]\\s*\\S+"), "credential_pair", 95),
                    new PatternRule(Pattern.compile("(?i)(?:sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36}|glpat-[a-zA-Z0-9-]{20,})"), "api_key_pattern", 95),
                    new PatternRule(Pattern.compile("-----BEGIN (?:RSA |EC )?PRIVATE KEY-----"), "private_key", 100),
                    new PatternRule(Pattern.compile("(?i)(?:aws_access_key_id|aws_secret_access_key)\\s*=\\s*\\S+"), "aws_key", 95),
                    new PatternRule(Pattern.compile("(?i)(?:jdbc|mongodb|redis|mysql|postgres)://[^\\s]+"), "connection_string", 90)
            ),
            SensitiveDataCategory.SOURCE_CODE, List.of(
                    new PatternRule(Pattern.compile("(?m)^\\s*(?:public|private|protected)\\s+(?:static\\s+)?(?:class|interface|enum)\\s+\\w+"), "java_class", 70),
                    new PatternRule(Pattern.compile("(?m)^\\s*(?:def|class|import|from)\\s+\\w+"), "python_code", 60),
                    new PatternRule(Pattern.compile("(?m)^\\s*(?:function|const|let|var|export|import)\\s+\\w+"), "js_code", 55),
                    new PatternRule(Pattern.compile("(?i)(?:SELECT|INSERT|UPDATE|DELETE)\\s+.*?\\bFROM\\b"), "sql_query", 65)
            ),
            SensitiveDataCategory.CLIENT_INFORMATION, List.of(
                    new PatternRule(Pattern.compile("(?i)\\b(?:client|customer|prospect|fournisseur|supplier)\\s*[:=]?\\s*[A-Z][\\w\\s]{2,30}"), "client_name", 60),
                    new PatternRule(Pattern.compile("(?i)\\b(?:contrat|contract|accord|agreement)\\s+(?:n[°o.]?|#)?\\s*[A-Z0-9-]+"), "contract_ref", 70),
                    new PatternRule(Pattern.compile("(?i)\\b(?:SIRET|SIREN|TVA|VAT)\\s*[:=]?\\s*[A-Z]{0,2}\\d{9,14}"), "company_id", 75)
            ),
            SensitiveDataCategory.LEGAL_DOCUMENTS, List.of(
                    new PatternRule(Pattern.compile("(?i)\\b(?:confidentiel|confidential|secret.?défense|propriétaire|proprietary|nda|non.?disclosure)\\b"), "confidential_marker", 80),
                    new PatternRule(Pattern.compile("(?i)\\b(?:clause|article|paragraphe|avenant|amendment)\\s+\\d+"), "legal_clause", 55)
            ),
            SensitiveDataCategory.MEDICAL_DATA, List.of(
                    new PatternRule(Pattern.compile("(?i)\\b(?:diagnostic|pathologie|traitement|prescription|ordonnance|allergie|symptôme)\\b"), "medical_term", 70),
                    new PatternRule(Pattern.compile("(?i)\\b(?:patient|malade|hospitalisation|consultation)\\s*[:=]?\\s*[A-Z]"), "patient_ref", 75)
            ),
            SensitiveDataCategory.COMPANY_CONFIDENTIAL, List.of(
                    new PatternRule(Pattern.compile("(?i)\\b(?:stratégie|roadmap|plan.?stratégique|business.?plan|pricing|tarification)\\b"), "strategy_term", 55),
                    new PatternRule(Pattern.compile("(?i)\\b(?:r&d|brevet|patent|invention|prototype)\\b"), "ip_term", 60)
            ),
            SensitiveDataCategory.INTELLECTUAL_PROPERTY, List.of(
                    new PatternRule(Pattern.compile("(?i)\\b(?:algorithme|architecture|schéma|design.?pattern|propriétaire)\\s+(?:de|du|des)\\s+"), "ip_description", 50),
                    new PatternRule(Pattern.compile("(?i)\\b(?:copyright|©|all.?rights.?reserved|brevet|patent)\\b"), "ip_marker", 55)
            )
    );

    // ── Keyword density heuristic (NLP-lite) ──

    private static final Map<SensitiveDataCategory, List<String>> KEYWORDS = Map.of(
            SensitiveDataCategory.PERSONAL_DATA,
            List.of("nom", "prénom", "adresse", "date de naissance", "numéro", "identité", "passeport"),
            SensitiveDataCategory.FINANCIAL_DATA,
            List.of("compte bancaire", "rib", "virement", "facture", "montant", "paiement", "devis"),
            SensitiveDataCategory.CREDENTIALS_SECRETS,
            List.of("mot de passe", "identifiant", "login", "clé api", "token", "secret", "certificat"),
            SensitiveDataCategory.SOURCE_CODE,
            List.of("repository", "git", "commit", "merge", "deploy", "pipeline", "dockerfile"),
            SensitiveDataCategory.CLIENT_INFORMATION,
            List.of("client", "contrat", "prestation", "facturation", "commande", "livraison")
    );

    /**
     * Analyze a prompt for sensitive data using hybrid detection.
     */
    public AnalysisResult analyze(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            return new AnalysisResult(0, RiskLevel.SAFE, List.of());
        }

        List<Detection> detections = new ArrayList<>();

        // Phase 1: Regex-based detection
        for (var entry : PATTERNS.entrySet()) {
            for (PatternRule rule : entry.getValue()) {
                var matcher = rule.pattern().matcher(prompt);
                while (matcher.find()) {
                    String matched = matcher.group();
                    detections.add(Detection.builder()
                            .category(entry.getKey())
                            .confidence(rule.confidence())
                            .method("regex")
                            .matchedPattern(rule.name())
                            .redactedSnippet(redact(matched))
                            .build());
                }
            }
        }

        // Phase 2: Keyword density heuristic
        String lowerPrompt = prompt.toLowerCase();
        for (var entry : KEYWORDS.entrySet()) {
            long matchCount = entry.getValue().stream()
                    .filter(lowerPrompt::contains)
                    .count();
            if (matchCount >= 2) {
                int confidence = (int) Math.min(40 + matchCount * 15, 80);
                detections.add(Detection.builder()
                        .category(entry.getKey())
                        .confidence(confidence)
                        .method("keyword_density")
                        .matchedPattern(matchCount + " keywords matched")
                        .redactedSnippet("[keyword cluster detected]")
                        .build());
            }
        }

        // Phase 3: Compute risk score
        int riskScore = computeRiskScore(detections, prompt.length());
        RiskLevel riskLevel = toRiskLevel(riskScore);

        log.info("Prompt analyzed: score={}, level={}, detections={}", riskScore, riskLevel, detections.size());
        return new AnalysisResult(riskScore, riskLevel, detections);
    }

    private int computeRiskScore(List<Detection> detections, int promptLength) {
        if (detections.isEmpty()) return 0;

        double weightedSum = detections.stream()
                .mapToDouble(d -> d.getConfidence() * getCategoryWeight(d.getCategory()))
                .sum();

        // Normalize: more categories = higher risk, cap at 100
        double categoryDiversity = detections.stream()
                .map(Detection::getCategory)
                .distinct()
                .count();

        double score = Math.min(100, (weightedSum / detections.size()) * (1 + categoryDiversity * 0.1));

        // Long prompts with many detections get a boost
        if (promptLength > 1000 && detections.size() > 3) {
            score = Math.min(100, score * 1.15);
        }

        return (int) Math.round(score);
    }

    private double getCategoryWeight(SensitiveDataCategory category) {
        return switch (category) {
            case CREDENTIALS_SECRETS -> 1.5;
            case HEALTH_DATA, BIOMETRIC_DATA, CRIMINAL_DATA -> 1.6;
            case POLITICAL_OPINION, UNION_MEMBERSHIP, RELIGIOUS_BELIEF,
                 SEXUAL_ORIENTATION, ETHNIC_ORIGIN -> 1.5;
            case PERSONAL_DATA, MEDICAL_DATA -> 1.3;
            case FINANCIAL_DATA, LEGAL_DOCUMENTS -> 1.2;
            case CLIENT_INFORMATION, COMPANY_CONFIDENTIAL -> 1.1;
            case SOURCE_CODE, INTELLECTUAL_PROPERTY -> 1.0;
        };
    }

    private RiskLevel toRiskLevel(int score) {
        if (score >= 80) return RiskLevel.CRITICAL;
        if (score >= 60) return RiskLevel.HIGH;
        if (score >= 40) return RiskLevel.MEDIUM;
        if (score >= 20) return RiskLevel.LOW;
        return RiskLevel.SAFE;
    }

    private String redact(String value) {
        if (value.length() <= 4) return "****";
        return value.substring(0, 2) + "****" + value.substring(value.length() - 2);
    }

    private record PatternRule(Pattern pattern, String name, int confidence) {}
}
