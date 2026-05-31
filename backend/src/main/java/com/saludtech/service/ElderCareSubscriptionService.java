package com.saludtech.service;

import com.saludtech.dto.ElderCareSubscriptionRequest;
import com.saludtech.dto.ElderCareSubscriptionResponse;
import com.saludtech.exception.BusinessLogicException;
import com.saludtech.exception.ResourceNotFoundException;
import com.saludtech.model.CreditLine;
import com.saludtech.model.ElderCareSubscription;
import com.saludtech.model.Merchant;
import com.saludtech.model.User;
import com.saludtech.model.enums.CreditLineType;
import com.saludtech.model.enums.MerchantCategory;
import com.saludtech.model.enums.SubscriptionStatus;
import com.saludtech.repository.CreditLineRepository;
import com.saludtech.repository.ElderCareSubscriptionRepository;
import com.saludtech.repository.MerchantRepository;
import com.saludtech.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ElderCareSubscriptionService {

    private final ElderCareSubscriptionRepository elderCareRepository;
    private final UserRepository userRepository;
    private final MerchantRepository merchantRepository;
    private final CreditLineRepository creditLineRepository;

    @Transactional
    public ElderCareSubscriptionResponse createSubscription(UUID userId, ElderCareSubscriptionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Merchant merchant = merchantRepository.findById(request.getMerchantId())
                .orElseThrow(() -> new ResourceNotFoundException("Merchant not found"));

        if (merchant.getCategory() != MerchantCategory.ELDER_CARE) {
            throw new BusinessLogicException("Elder care subscriptions require an ELDER_CARE merchant");
        }

        // Requires level 4+ for MAYOR_CUIDADO line
        if (user.getLevel() < 4) {
            throw new BusinessLogicException("Elder care subscriptions require level 4 or higher (MAYOR_CUIDADO line)");
        }

        List<CreditLine> creditLines = creditLineRepository.findAllByUserId(userId);
        CreditLine mayorCuidadoLine = creditLines.stream()
                .filter(cl -> cl.getType() == CreditLineType.MAYOR_CUIDADO)
                .findFirst()
                .orElseThrow(() -> new BusinessLogicException("No MAYOR_CUIDADO credit line found"));

        if (request.getMonthlyAmount().compareTo(mayorCuidadoLine.getAvailable()) > 0) {
            throw new BusinessLogicException("Insufficient available credit in MAYOR_CUIDADO line");
        }

        // Reserve first month's amount
        mayorCuidadoLine.setUsedUsd(mayorCuidadoLine.getUsedUsd().add(request.getMonthlyAmount()));
        creditLineRepository.save(mayorCuidadoLine);

        ElderCareSubscription sub = ElderCareSubscription.builder()
                .user(user)
                .merchant(merchant)
                .creditLine(mayorCuidadoLine)
                .serviceType(request.getServiceType())
                .monthlyAmount(request.getMonthlyAmount())
                .status(SubscriptionStatus.ACTIVE)
                .nextBillingDate(Instant.now().plus(30, ChronoUnit.DAYS))
                .build();

        return mapToResponse(elderCareRepository.save(sub));
    }

    @Transactional(readOnly = true)
    public List<ElderCareSubscriptionResponse> getUserSubscriptions(UUID userId) {
        return elderCareRepository.findAllByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelSubscription(UUID userId, UUID subscriptionId) {
        ElderCareSubscription sub = elderCareRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Elder care subscription not found"));

        if (!sub.getUser().getId().equals(userId)) {
            throw new BusinessLogicException("Access denied");
        }
        if (sub.getStatus() == SubscriptionStatus.CANCELLED) {
            throw new BusinessLogicException("Subscription is already cancelled");
        }

        sub.setStatus(SubscriptionStatus.CANCELLED);
        elderCareRepository.save(sub);
        log.info("Elder care subscription {} cancelled for user {}", subscriptionId, userId);
    }

    /**
     * Called by InstallmentScannerTask daily — renews elder care subscriptions due today or earlier.
     */
    @Transactional
    public void renewDueSubscriptions() {
        List<ElderCareSubscription> due = elderCareRepository
                .findAllByStatusAndNextBillingDateBefore(SubscriptionStatus.ACTIVE, Instant.now());

        for (ElderCareSubscription sub : due) {
            CreditLine line = sub.getCreditLine();
            if (line == null || sub.getMonthlyAmount().compareTo(line.getAvailable()) > 0) {
                log.warn("Elder care subscription {} cannot renew — insufficient credit", sub.getId());
                continue;
            }
            line.setUsedUsd(line.getUsedUsd().add(sub.getMonthlyAmount()));
            creditLineRepository.save(line);
            sub.setNextBillingDate(sub.getNextBillingDate().plus(30, ChronoUnit.DAYS));
            elderCareRepository.save(sub);
            log.info("Renewed elder care subscription {} for user {}", sub.getId(), sub.getUser().getId());
        }
    }

    @Transactional(readOnly = true)
    public List<ElderCareSubscriptionResponse> getAllActiveSubscriptions() {
        return elderCareRepository.findAllByStatus(SubscriptionStatus.ACTIVE).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ElderCareSubscriptionResponse mapToResponse(ElderCareSubscription sub) {
        return ElderCareSubscriptionResponse.builder()
                .id(sub.getId())
                .merchantId(sub.getMerchant().getId())
                .merchantName(sub.getMerchant().getTradeName())
                .serviceType(sub.getServiceType())
                .monthlyAmount(sub.getMonthlyAmount())
                .status(sub.getStatus())
                .nextBillingDate(sub.getNextBillingDate())
                .createdAt(sub.getCreatedAt())
                .build();
    }
}
