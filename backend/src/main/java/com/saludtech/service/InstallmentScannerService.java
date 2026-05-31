package com.saludtech.service;

import com.saludtech.model.CreditLine;
import com.saludtech.model.Installment;
import com.saludtech.model.enums.CreditLineStatus;
import com.saludtech.model.enums.InstallmentStatus;
import com.saludtech.repository.CreditLineRepository;
import com.saludtech.repository.InstallmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InstallmentScannerService {

    private final InstallmentRepository installmentRepository;
    private final CreditLineRepository creditLineRepository;
    private final LevelService levelService;

    // Reactivation fee per overdue installment
    private static final BigDecimal PENALTY_AMOUNT = new BigDecimal("4.00");
    private static final int GRACE_PERIOD_DAYS = 2;

    @Transactional
    public void scanOverdueInstallments() {
        log.info("Starting scheduled scan for overdue installments...");
        LocalDate today = LocalDate.now();

        List<Installment> pendingInstallments = installmentRepository.findByStatus(InstallmentStatus.PENDING);

        for (Installment installment : pendingInstallments) {
            // Apply 2 days of grace period
            if (installment.getDueDate().plusDays(GRACE_PERIOD_DAYS).isBefore(today)) {
                log.info("Installment {} is overdue. Applying penalty.", installment.getId());

                int daysOverdue = (int) ChronoUnit.DAYS.between(
                        installment.getDueDate().plusDays(GRACE_PERIOD_DAYS), today);

                installment.setStatus(InstallmentStatus.OVERDUE);
                installment.setReactivationFee(PENALTY_AMOUNT);
                installmentRepository.save(installment);

                // Pause the user's credit line
                CreditLine line = creditLineRepository.findByUserId(installment.getTransaction().getUser().getId())
                        .orElse(null);
                if (line != null && line.getStatus() != CreditLineStatus.PAUSED) {
                    line.setStatus(CreditLineStatus.PAUSED);
                    creditLineRepository.save(line);
                    log.info("Paused credit line for user {}", line.getUser().getId());
                }

                // Apply escalating penalty based on days overdue (7/14/28 day tiers)
                try {
                    levelService.applyOverduePenalty(installment.getTransaction().getUser(), daysOverdue);
                } catch (Exception e) {
                    log.error("Failed to apply overdue penalty to user {}",
                            installment.getTransaction().getUser().getId(), e);
                }
            }
        }
        log.info("Finished scanning overdue installments.");
    }
}
