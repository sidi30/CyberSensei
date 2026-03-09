package io.cybersensei.aisecurity;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AiSecurityApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiSecurityApplication.class, args);
    }
}
