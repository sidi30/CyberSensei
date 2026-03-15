package io.cybersensei.aisecurity.domain.enums;

public enum SensitiveDataCategory {
    PERSONAL_DATA,
    COMPANY_CONFIDENTIAL,
    CLIENT_INFORMATION,
    SOURCE_CODE,
    CREDENTIALS_SECRETS,
    FINANCIAL_DATA,
    LEGAL_DOCUMENTS,
    MEDICAL_DATA,
    INTELLECTUAL_PROPERTY,

    // RGPD Article 9 — Données sensibles
    HEALTH_DATA,
    POLITICAL_OPINION,
    UNION_MEMBERSHIP,
    RELIGIOUS_BELIEF,
    SEXUAL_ORIENTATION,
    ETHNIC_ORIGIN,
    BIOMETRIC_DATA,
    CRIMINAL_DATA;

    private static final java.util.Set<SensitiveDataCategory> ARTICLE_9_CATEGORIES = java.util.Set.of(
            HEALTH_DATA, MEDICAL_DATA, POLITICAL_OPINION, UNION_MEMBERSHIP,
            RELIGIOUS_BELIEF, SEXUAL_ORIENTATION, ETHNIC_ORIGIN, BIOMETRIC_DATA, CRIMINAL_DATA
    );

    public boolean isArticle9() {
        return ARTICLE_9_CATEGORIES.contains(this);
    }
}
