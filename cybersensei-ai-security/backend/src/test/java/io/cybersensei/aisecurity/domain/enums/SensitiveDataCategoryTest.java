package io.cybersensei.aisecurity.domain.enums;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("SensitiveDataCategory")
class SensitiveDataCategoryTest {

    @Nested
    @DisplayName("isArticle9() returns true for Article 9 categories")
    class Article9True {

        @ParameterizedTest
        @EnumSource(value = SensitiveDataCategory.class, names = {
                "HEALTH_DATA", "MEDICAL_DATA", "POLITICAL_OPINION", "UNION_MEMBERSHIP",
                "RELIGIOUS_BELIEF", "SEXUAL_ORIENTATION", "ETHNIC_ORIGIN",
                "BIOMETRIC_DATA", "CRIMINAL_DATA"
        })
        @DisplayName("should return true for Article 9 category")
        void shouldReturnTrueForArticle9(SensitiveDataCategory category) {
            assertThat(category.isArticle9()).isTrue();
        }
    }

    @Nested
    @DisplayName("isArticle9() returns false for non-Article 9 categories")
    class Article9False {

        @ParameterizedTest
        @EnumSource(value = SensitiveDataCategory.class, names = {
                "PERSONAL_DATA", "COMPANY_CONFIDENTIAL", "CLIENT_INFORMATION",
                "SOURCE_CODE", "CREDENTIALS_SECRETS", "FINANCIAL_DATA",
                "LEGAL_DOCUMENTS", "INTELLECTUAL_PROPERTY"
        })
        @DisplayName("should return false for non-Article 9 category")
        void shouldReturnFalseForNonArticle9(SensitiveDataCategory category) {
            assertThat(category.isArticle9()).isFalse();
        }
    }
}
