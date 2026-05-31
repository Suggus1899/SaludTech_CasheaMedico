package com.saludtech.service;

import com.saludtech.config.LevelConfig;
import com.saludtech.dto.TransactionPreviewResponse;
import com.saludtech.dto.TransactionRequest;
import com.saludtech.dto.TransactionResponse;
import com.saludtech.exception.BusinessLogicException;
import com.saludtech.exception.ResourceNotFoundException;
import com.saludtech.mapper.TransactionMapper;
import com.saludtech.model.*;
import com.saludtech.model.enums.CreditLineType;
import com.saludtech.model.enums.InstallmentStatus;
import com.saludtech.model.enums.TransactionStatus;
import com.saludtech.repository.CreditLineRepository;
import com.saludtech.repository.InstallmentRepository;
import com.saludtech.repository.MerchantRepository;
import com.saludtech.repository.TransactionRepository;
import com.saludtech.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final MerchantRepository merchantRepository;
    private final CreditLineRepository creditLineRepository;
    private final InstallmentRepository installmentRepository;
    private final LevelConfig levelConfig;
    private final TransactionMapper transactionMapper;
    private final QrService qrService;

    @Transactional
    public TransactionResponse createTransaction(UUID userId, TransactionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Merchant merchant = merchantRepository.findById(request.getMerchantId())
                .orElseThrow(() -> new ResourceNotFoundException("Merchant not found"));

        // Validate QR Token to prevent replay attacks and ensure authenticity
        if (request.getQrToken() == null || !qrService.validateAndConsumeToken(request.getQrToken(),
                request.getMerchantId(), request.getAmount().doubleValue())) {
            throw new BusinessLogicException("Invalid, expired, or already consumed QR code");
        }

        // Validate Level Config
        Map<Short, LevelConfig.LevelRule> rules = levelConfig.getRules();
        if (rules == null || !rules.containsKey(user.getLevel())) {
            throw new BusinessLogicException("Level configuration missing for level " + user.getLevel());
        }
        LevelConfig.LevelRule rule = rules.get(user.getLevel());

        int maxAllowedInstallments = rule.getMaxInstallments();
        CreditLineType targetLineType;
        boolean skipMoraBlock = false;

        switch (merchant.getCategory()) {
            case PHARMACY -> {
                targetLineType = CreditLineType.SALUD_COTIDIANA;
                maxAllowedInstallments = Math.min(maxAllowedInstallments, 2);
            }
            case ELDER_CARE -> {
                targetLineType = CreditLineType.MAYOR_CUIDADO;
                maxAllowedInstallments = Math.min(maxAllowedInstallments, 12);
                if (user.getLevel() < 4) {
                    throw new BusinessLogicException("Elder care financing requires level 4 or higher");
                }
            }
            case EMERGENCY_TRIAGE -> {
                targetLineType = CreditLineType.SALUD_COTIDIANA;
                skipMoraBlock = true; // exempt from mora freeze
            }
            default -> // CLINIC, DENTAL, LABORATORY, OPTICS, SPECIALIST, AESTHETIC, WELLNESS, MEDICAL_SUPPLIES
                targetLineType = CreditLineType.ESPECIALIDAD_PRINCIPAL;
        }

        final CreditLineType finalTargetLineType = targetLineType;

        // Mora check — skip for EMERGENCY_TRIAGE
        if (!skipMoraBlock && user.isCreditFrozenForElectives()) {
            throw new BusinessLogicException("Credit is frozen due to overdue installments");
        }

        if (request.getRequestedInstallments() > maxAllowedInstallments) {
            throw new BusinessLogicException("Requested installments exceed maximum allowed (" + maxAllowedInstallments + ")");
        }

        // Calculate amounts
        BigDecimal amount = request.getAmount();
        BigDecimal downPayment = amount.multiply(rule.getMinDownPaymentRatio()).setScale(2, RoundingMode.HALF_UP);
        BigDecimal remainingBalance = amount.subtract(downPayment);

        // Check active credit lines
        List<CreditLine> creditLines = creditLineRepository.findAllByUserId(userId);
        CreditLine targetCreditLine = creditLines.stream()
                .filter(cl -> cl.getType() == finalTargetLineType)
                .findFirst()
                .orElseThrow(() -> new BusinessLogicException("No active credit line found for type " + finalTargetLineType));

        BigDecimal availableCredit = targetCreditLine.getAvailable();

        if (remainingBalance.compareTo(availableCredit) > 0) {
            throw new BusinessLogicException("Insufficient available credit in line " + targetLineType);
        }

        // Generate Transaction
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setMerchant(merchant);
        transaction.setTotalAmount(amount);
        transaction.setDownPayment(downPayment);
        transaction.setFinancedAmount(remainingBalance);
        transaction.setNumInstallments(request.getRequestedInstallments());
        transaction.setStatus(TransactionStatus.PENDING_PAYMENT);
        transaction.setQrCodeToken(request.getQrToken());
        transaction.setQrExpiresAt(Instant.now().plusSeconds(900));
        transaction.setCreditLine(targetCreditLine);

        Transaction savedTransaction = transactionRepository.save(transaction);

        // Generate Installments (1 every 14 days)
        List<Installment> installments = new ArrayList<>();
        BigDecimal installmentAmount = request.getRequestedInstallments() > 0 
                ? remainingBalance.divide(new BigDecimal(request.getRequestedInstallments()), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Adjust last installment for rounding differences
        BigDecimal totalInstallments = installmentAmount.multiply(new BigDecimal(request.getRequestedInstallments()));
        BigDecimal remainder = remainingBalance.subtract(totalInstallments);

        for (short i = 1; i <= request.getRequestedInstallments(); i++) {
            Installment inst = new Installment();
            inst.setTransaction(savedTransaction);
            inst.setUser(user);
            inst.setInstallmentNum(i);

            BigDecimal finalAmount = installmentAmount;
            if (i == request.getRequestedInstallments()) {
                finalAmount = finalAmount.add(remainder);
            }
            inst.setAmount(finalAmount);
            inst.setReactivationFee(BigDecimal.ZERO);
            inst.setDueDate(LocalDate.now().plusDays(14L * i));
            inst.setStatus(InstallmentStatus.PENDING);
            installmentRepository.save(inst);
            installments.add(inst);
        }

        // Update Credit Line
        targetCreditLine.setUsedUsd(targetCreditLine.getUsedUsd().add(remainingBalance));
        creditLineRepository.save(targetCreditLine);

        return transactionMapper.toDto(savedTransaction);
    }

    @Transactional(readOnly = true)
    public TransactionPreviewResponse previewTransaction(UUID userId, TransactionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Merchant merchant = merchantRepository.findById(request.getMerchantId())
                .orElseThrow(() -> new ResourceNotFoundException("Merchant not found"));

        Map<Short, LevelConfig.LevelRule> rules = levelConfig.getRules();
        if (rules == null || !rules.containsKey(user.getLevel())) {
            throw new BusinessLogicException("Level configuration missing for level " + user.getLevel());
        }
        LevelConfig.LevelRule rule = rules.get(user.getLevel());

        int maxAllowedInstallments = rule.getMaxInstallments();
        CreditLineType targetLineType;

        switch (merchant.getCategory()) {
            case PHARMACY -> {
                targetLineType = CreditLineType.SALUD_COTIDIANA;
                maxAllowedInstallments = Math.min(maxAllowedInstallments, 2);
            }
            case ELDER_CARE -> {
                targetLineType = CreditLineType.MAYOR_CUIDADO;
                maxAllowedInstallments = Math.min(maxAllowedInstallments, 12);
            }
            case EMERGENCY_TRIAGE -> targetLineType = CreditLineType.SALUD_COTIDIANA;
            default -> targetLineType = CreditLineType.ESPECIALIDAD_PRINCIPAL;
        }

        final CreditLineType finalTargetLineType = targetLineType;

        int numInstallments = Math.min(request.getRequestedInstallments(), maxAllowedInstallments);
        BigDecimal amount = request.getAmount();
        BigDecimal downPayment = amount.multiply(rule.getMinDownPaymentRatio()).setScale(2, RoundingMode.HALF_UP);
        BigDecimal financed = amount.subtract(downPayment);
        BigDecimal installmentAmount = numInstallments > 0
                ? financed.divide(new BigDecimal(numInstallments), 2, RoundingMode.HALF_UP)
                : financed;

        List<CreditLine> creditLines = creditLineRepository.findAllByUserId(userId);
        CreditLine targetCreditLine = creditLines.stream()
                .filter(cl -> cl.getType() == finalTargetLineType)
                .findFirst()
                .orElseThrow(() -> new BusinessLogicException("No active credit line found for type " + finalTargetLineType));

        BigDecimal available = targetCreditLine.getAvailable();

        List<TransactionPreviewResponse.InstallmentPreview> schedule = new ArrayList<>();
        for (int i = 1; i <= numInstallments; i++) {
            BigDecimal iAmount = (i == numInstallments)
                    ? financed.subtract(installmentAmount.multiply(new BigDecimal(numInstallments - 1)))
                    : installmentAmount;
            schedule.add(TransactionPreviewResponse.InstallmentPreview.builder()
                    .number(i)
                    .amount(iAmount)
                    .dueDate(LocalDate.now().plusDays(14L * i))
                    .build());
        }

        return TransactionPreviewResponse.builder()
                .merchantId(merchant.getId())
                .merchantName(merchant.getTradeName())
                .totalAmount(amount)
                .downPayment(downPayment)
                .financedAmount(financed)
                .requestedInstallments(numInstallments)
                .installmentAmount(installmentAmount)
                .schedule(schedule)
                .userLevel(user.getLevel())
                .availableCredit(available)
                .build();
    }
}
