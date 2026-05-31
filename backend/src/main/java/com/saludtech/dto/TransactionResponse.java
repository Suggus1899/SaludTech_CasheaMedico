package com.saludtech.dto;

import com.saludtech.model.enums.TransactionStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
public class TransactionResponse {
    private UUID id;
    private UUID userId;
    private String userFullName;
    private UUID merchantId;
    private String merchantTradeName;
    private BigDecimal amount;
    private BigDecimal downPayment;
    private BigDecimal remainingBalance;
    private int numberOfInstallments;
    private TransactionStatus status;
    private Instant createdAt;
    private List<InstallmentResponse> installments;

    /** Nested summary objects used by web dashboards */
    private UserSummary user;
    private MerchantSummary merchant;

    @Data
    public static class UserSummary {
        private UUID id;
        private String fullName;
    }

    @Data
    public static class MerchantSummary {
        private UUID id;
        private String tradeName;
    }
}
