package com.saludtech.dto;

import com.saludtech.model.enums.SubscriptionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionResponse {
    private UUID id;
    private UUID merchantId;
    private String merchantName;
    private BigDecimal amount;
    private String productName;
    private SubscriptionStatus status;
    private Instant nextBillingDate;
    private Instant createdAt;
}
