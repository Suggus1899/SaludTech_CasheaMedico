package com.saludtech.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class TransactionPreviewResponse {
    private UUID merchantId;
    private String merchantName;
    private BigDecimal totalAmount;
    private BigDecimal downPayment;
    private BigDecimal financedAmount;
    private int requestedInstallments;
    private BigDecimal installmentAmount;
    private List<InstallmentPreview> schedule;
    private short userLevel;
    private BigDecimal availableCredit;

    @Data
    @Builder
    public static class InstallmentPreview {
        private int number;
        private BigDecimal amount;
        private LocalDate dueDate;
    }
}
