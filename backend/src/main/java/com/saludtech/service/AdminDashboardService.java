package com.saludtech.service;

import com.saludtech.dto.DashboardStatsResponse;
import com.saludtech.dto.TransactionResponse;
import com.saludtech.mapper.TransactionMapper;
import com.saludtech.model.enums.CreditLineStatus;
import com.saludtech.model.enums.InstallmentStatus;
import com.saludtech.model.enums.TransactionStatus;
import com.saludtech.repository.CreditLineRepository;
import com.saludtech.repository.InstallmentRepository;
import com.saludtech.repository.MerchantRepository;
import com.saludtech.repository.TransactionRepository;
import com.saludtech.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final TransactionRepository transactionRepository;
    private final InstallmentRepository installmentRepository;
    private final CreditLineRepository creditLineRepository;
    private final MerchantRepository merchantRepository;
    private final UserRepository userRepository;
    private final TransactionMapper transactionMapper;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getGlobalStats() {
        long totalPatients = userRepository.count();
        long activeCreditLines = creditLineRepository.countByStatus(CreditLineStatus.ACTIVE);
        long pausedCreditLines = creditLineRepository.countByStatus(CreditLineStatus.PAUSED);
        long activeTransactions = transactionRepository.countByStatus(TransactionStatus.ACTIVE);
        long completedTransactions = transactionRepository.countByStatus(TransactionStatus.COMPLETED);
        long overdueInstallments = installmentRepository.countByStatus(InstallmentStatus.OVERDUE);
        long totalInstallments = installmentRepository.count();
        long activeMerchants = merchantRepository.countByIsActive(true);

        BigDecimal totalActiveDebt = transactionRepository.sumActiveFinancedAmount();
        BigDecimal overdueAmount = installmentRepository.sumOverdueAmount();
        BigDecimal pendingAmount = installmentRepository.sumPendingAmount();

        double defaultRate = 0.0;
        if (totalInstallments > 0) {
            defaultRate = BigDecimal.valueOf(overdueInstallments)
                    .divide(BigDecimal.valueOf(totalInstallments), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }

        List<DashboardStatsResponse.LevelDistribution> distributions = new java.util.ArrayList<>();
        if (totalPatients > 0) {
            long l1 = userRepository.countByLevel(1);
            long l2 = userRepository.countByLevel(2) + userRepository.countByLevel(3);
            long l4 = userRepository.countByLevel(4) + userRepository.countByLevel(5);
            long l6 = userRepository.countByLevel(6);

            distributions.add(new DashboardStatsResponse.LevelDistribution("Nivel 6 (Max)", l6,
                    (int) ((l6 * 100.0) / totalPatients)));
            distributions.add(new DashboardStatsResponse.LevelDistribution("Nivel 4–5", l4,
                    (int) ((l4 * 100.0) / totalPatients)));
            distributions.add(new DashboardStatsResponse.LevelDistribution("Nivel 2–3", l2,
                    (int) ((l2 * 100.0) / totalPatients)));
            distributions.add(new DashboardStatsResponse.LevelDistribution("Nivel 1 (Base)", l1,
                    (int) ((l1 * 100.0) / totalPatients)));
        }

        return DashboardStatsResponse.builder()
                .totalActiveDebt(totalActiveDebt != null ? totalActiveDebt : BigDecimal.ZERO)
                .activeCreditLines(activeCreditLines)
                .pausedCreditLines(pausedCreditLines)
                .totalPatients(totalPatients)
                .activeTransactions(activeTransactions)
                .completedTransactions(completedTransactions)
                .overdueInstallments(overdueInstallments)
                .overdueAmount(overdueAmount != null ? overdueAmount : BigDecimal.ZERO)
                .pendingInstallmentsAmount(pendingAmount != null ? pendingAmount : BigDecimal.ZERO)
                .activeMerchants(activeMerchants)
                .defaultRate(defaultRate)
                .levelDistributions(distributions)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getAllTransactions(Pageable pageable) {
        return transactionRepository.findAllWithUserAndMerchant(pageable)
                .map(transactionMapper::toDto);
    }
}
