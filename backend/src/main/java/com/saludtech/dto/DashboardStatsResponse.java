package com.saludtech.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardStatsResponse {
    private BigDecimal totalActiveDebt;
    private long activeCreditLines;
    private long pausedCreditLines;
    private long totalPatients;
    private long activeTransactions;
    private long completedTransactions;
    private long overdueInstallments;
    private BigDecimal overdueAmount;
    private BigDecimal pendingInstallmentsAmount;
    private long activeMerchants;
    private double defaultRate;
    private List<LevelDistribution> levelDistributions;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LevelDistribution {
        private String label;
        private long users;
        private int pct;
    }
}
