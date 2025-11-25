package io.cybersensei.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Configuration key-value store for dynamic settings
 */
@Entity
@Table(name = "configs", indexes = {
    @Index(name = "idx_config_key", columnList = "configKey", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Config {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "config_key", nullable = false, unique = true)
    private String key;

    @Column(name = "config_value", nullable = false, columnDefinition = "TEXT")
    private String value;

    private String description;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}


