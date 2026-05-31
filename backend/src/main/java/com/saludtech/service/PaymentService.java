package com.saludtech.service;

import com.saludtech.dto.PaymentRequest;
import com.saludtech.exception.BusinessLogicException;
import com.saludtech.exception.ResourceNotFoundException;
import com.saludtech.model.Installment;
import com.saludtech.model.Payment;
import com.saludtech.model.Transaction;
import com.saludtech.model.enums.InstallmentStatus;
import com.saludtech.model.enums.TransactionStatus;
import com.saludtech.repository.InstallmentRepository;
import com.saludtech.repository.PaymentRepository;
import com.saludtech.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InstallmentRepository installmentRepository;
    private final TransactionRepository transactionRepository;
    private final LevelService levelService;
    private final GamificationService gamificationService;

    @Transactional
    public Payment processInstallmentPayment(PaymentRequest request) {
        Installment installment = installmentRepository.findById(request.getInstallmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Installment not found"));

        if (installment.getStatus() == InstallmentStatus.PAID) {
            throw new BusinessLogicException("Installment is already paid");
        }

        BigDecimal totalRequired = installment.getAmount().add(installment.getReactivationFee());
        
        if (request.getAmount().compareTo(totalRequired) < 0) {
            throw new BusinessLogicException("Payment amount is less than the required amount: " + totalRequired);
        }

        Payment payment = new Payment();
        payment.setInstallment(installment);
        payment.setUser(installment.getUser());
        payment.setAmountPaid(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setReferenceCode(request.getReferenceCode());
        
        Payment savedPayment = paymentRepository.save(payment);

        installment.setStatus(InstallmentStatus.PAID);
        installment.setPaidAt(Instant.now());
        installmentRepository.save(installment);

        // Check if transaction is fully paid
        // Since Transaction doesn't hold installments list, we need to fetch them
        Transaction transaction = installment.getTransaction();
        List<Installment> transactionInstallments = installmentRepository.findAllByTransactionId(transaction.getId());
        boolean allPaid = transactionInstallments.stream()
                .allMatch(inst -> inst.getStatus() == InstallmentStatus.PAID);

        if (allPaid) {
            transaction.setStatus(TransactionStatus.COMPLETED);
            transactionRepository.save(transaction);
        }

        // Evaluate Gamification points
        // If payment is made strictly before the dueDate it's early. Else if on dueDate, on time.
        boolean isEarly = java.time.LocalDate.now().isBefore(installment.getDueDate());
        gamificationService.awardPointsForPayment(transaction.getUser(), isEarly);

        // Evaluate user upgrade
        long paidInstallmentsCount = installmentRepository.countByTransactionUserIdAndStatus(
                transaction.getUser().getId(), InstallmentStatus.PAID);
        
        BigDecimal totalPaid = paymentRepository.sumByUserId(transaction.getUser().getId());
        levelService.evaluateLevelUpgrade(transaction.getUser(), totalPaid, (int) paidInstallmentsCount);

        return savedPayment;
    }
}
