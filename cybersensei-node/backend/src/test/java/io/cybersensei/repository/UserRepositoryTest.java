package io.cybersensei.repository;

import io.cybersensei.domain.entity.User;
import io.cybersensei.domain.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Repository tests with Testcontainers
 */
@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UserRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("cybersensei_test")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldSaveAndFindUser() {
        // Given
        User user = User.builder()
                .name("Test User")
                .email("test@example.com")
                .role(User.UserRole.EMPLOYEE)
                .active(true)
                .build();

        // When
        User savedUser = userRepository.save(user);

        // Then
        assertThat(savedUser.getId()).isNotNull();
        assertThat(userRepository.findByEmail("test@example.com")).isPresent();
    }

    @Test
    void shouldFindByMsTeamsId() {
        // Given
        User user = User.builder()
                .name("Teams User")
                .email("teams@example.com")
                .msTeamsId("teams-123")
                .role(User.UserRole.EMPLOYEE)
                .active(true)
                .build();

        // When
        userRepository.save(user);

        // Then
        assertThat(userRepository.findByMsTeamsId("teams-123")).isPresent();
    }
}


