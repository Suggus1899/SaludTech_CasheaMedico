package com.saludtech.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayoutResponse {
    private String id;
    private String periodStart;
    private String periodEnd;
    private BigDecimal grossAmount;
    private BigDecimal mdrDeducted;
    private BigDecimal netAmount;
    private String status;
    private String paidAt;
}
