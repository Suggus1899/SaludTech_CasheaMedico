package com.saludtech.dto;

import com.saludtech.model.enums.InstallmentStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.util.UUID;

@Data
public class InstallmentResponse {
    private UUID id;
    private short installmentNumber;
    private BigDecimal amount;
    private BigDecimal penaltyAmount;
    private LocalDate dueDate;
    private InstallmentStatus status;
    private Instant paidAt;
}
