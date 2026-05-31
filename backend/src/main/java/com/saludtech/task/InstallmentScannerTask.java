package com.saludtech.task;

import com.saludtech.model.Installment;
import com.saludtech.model.User;
import com.saludtech.model.enums.InstallmentStatus;
import com.saludtech.repository.InstallmentRepository;
import com.saludtech.repository.UserRepository;
import com.saludtech.service.ElderCareSubscriptionService;
import com.saludtech.service.LevelService;
import com.saludtech.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class InstallmentScannerTask {

    private final InstallmentRepository installmentRepository;
    private final UserRepository userRepository;
    private final LevelService levelService;
    private final SubscriptionService subscriptionService;
    private final ElderCareSubscriptionService elderCareSubscriptionService;

    // Runs every day at 00:01 AM
    @Scheduled(cron = "0 1 0 * * ?")
    @Transactional
    public void scanOverdueInstallments() {
        log.info("Starting scheduled scan for overdue installments...");

        LocalDate today = LocalDate.now();

        // Find installments that are PENDING or OVERDUE and dueDate is in the past
        List<Installment> overdueInstallments = installmentRepository.findAllByStatusInAndDueDateBefore(
                List.of(InstallmentStatus.PENDING, InstallmentStatus.OVERDUE), today);

        for (Installment inst : overdueInstallments) {
            // Calculate days overdue based on difference between today and dueDate
            long daysOverdue = ChronoUnit.DAYS.between(inst.getDueDate(), today);
            if (daysOverdue < 0) daysOverdue = 0;
            
            inst.setDaysOverdue((int) daysOverdue);

            if (daysOverdue > 2) {
                if (inst.getStatus() == InstallmentStatus.PENDING) {
                    inst.setStatus(InstallmentStatus.OVERDUE);
                    
                    User user = inst.getUser();
                    // Freeze credit line for non-emergencies
                    user.setCreditFrozenForElectives(true);

                    log.info("Installment {} is overdue by {} days (past grace period). Freezing user {}", inst.getId(), daysOverdue, user.getId());

                    // Apply gamification penalties strictly
                    levelService.applyOverduePenalty(user, (int) daysOverdue);
                    userRepository.save(user);
                }
                
                // $1 daily fee after 2-day grace period
                int chargeableDays = (int) daysOverdue - 2;
                // Cap the maximum penalty based on user level or fixed amount (e.g., $30 max)
                int maxPenalty = 30;
                if (chargeableDays > maxPenalty) chargeableDays = maxPenalty;
                
                inst.setReactivationFee(java.math.BigDecimal.valueOf(chargeableDays));
            }

            installmentRepository.save(inst);
        }

        log.info("Completed overdue scan. Found {} newly overdue installments.", overdueInstallments.size());

        // ── Renew pharmacy subscriptions due today ─────────────────────────────
        log.info("Starting pharmacy subscription renewal scan...");
        try {
            subscriptionService.renewDueSubscriptions();
        } catch (Exception e) {
            log.error("Error renewing pharmacy subscriptions: {}", e.getMessage(), e);
        }

        // ── Renew elder care subscriptions due today ───────────────────────────
        log.info("Starting elder care subscription renewal scan...");
        try {
            elderCareSubscriptionService.renewDueSubscriptions();
        } catch (Exception e) {
            log.error("Error renewing elder care subscriptions: {}", e.getMessage(), e);
        }

        log.info("Daily scan completed.");
    }
}

