package com.saludtech.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class TransactionRequest {
    private UUID merchantId;
    private BigDecimal amount;
    private short requestedInstallments;
    private String description;
    private String qrToken;
}
