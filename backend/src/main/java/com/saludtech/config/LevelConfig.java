package com.saludtech.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.Map;

@Configuration
@ConfigurationProperties(prefix = "saludtech.levels")
@Data
public class LevelConfig {

    private Map<Short, LevelRule> rules;

    @Data
    public static class LevelRule {
        private BigDecimal minDownPaymentRatio; // e.g., 0.60 for 60%
        private short maxInstallments;
        private BigDecimal requiredTotalPaid; // e.g., 120.00
        private int requiredInstallmentsPaidCount; // e.g., 5
    }
}
