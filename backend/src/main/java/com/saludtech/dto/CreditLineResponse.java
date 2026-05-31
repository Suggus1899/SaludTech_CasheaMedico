package com.saludtech.dto;

import com.saludtech.model.enums.CreditLineStatus;
import com.saludtech.model.enums.CreditLineType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class CreditLineResponse {
    private UUID id;
    private CreditLineType type;
    private BigDecimal limitUsd;
    private BigDecimal usedUsd;
    private BigDecimal availableUsd;
    private CreditLineStatus status;
}
