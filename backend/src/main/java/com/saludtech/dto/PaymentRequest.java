package com.saludtech.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class PaymentRequest {
    private UUID installmentId;
    private BigDecimal amount;
    private String paymentMethod;
    private String referenceCode;
}
