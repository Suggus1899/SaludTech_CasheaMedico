package com.saludtech.service;

import com.saludtech.dto.SubscriptionRequest;
import com.saludtech.dto.SubscriptionResponse;
import com.saludtech.exception.BusinessLogicException;
import com.saludtech.exception.ResourceNotFoundException;
import com.saludtech.model.CreditLine;
import com.saludtech.model.Merchant;
import com.saludtech.model.Subscription;
import com.saludtech.model.User;
import com.saludtech.model.enums.CreditLineType;
import com.saludtech.model.enums.MerchantCategory;
import com.saludtech.model.enums.SubscriptionStatus;
import com.saludtech.repository.CreditLineRepository;
import com.saludtech.repository.MerchantRepository;
import com.saludtech.repository.SubscriptionRepository;
import com.saludtech.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final MerchantRepository merchantRepository;
    private final CreditLineRepository creditLineRepository;

    @Transactional
    public SubscriptionResponse createSubscription(UUID userId, SubscriptionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Merchant merchant = merchantRepository.findById(request.getMerchantId())
                .orElseThrow(() -> new ResourceNotFoundException("Merchant not found"));

        if (merchant.getCategory() != MerchantCategory.PHARMACY) {
            throw new BusinessLogicException("Pharmacy subscriptions are only allowed for PHARMACY merchants");
        }

        List<CreditLine> creditLines = creditLineRepository.findAllByUserId(userId);
        CreditLine targetCreditLine = creditLines.stream()
                .filter(cl -> cl.getType() == CreditLineType.SALUD_COTIDIANA)
                .findFirst()
                .orElseThrow(() -> new BusinessLogicException("No active credit line found for SALUD_COTIDIANA"));

        BigDecimal availableCredit = targetCreditLine.getAvailable();
        if (request.getAmount().compareTo(availableCredit) > 0) {
            throw new BusinessLogicException("Insufficient available credit for subscription");
        }

        // Reserve first month's amount
        targetCreditLine.setUsedUsd(targetCreditLine.getUsedUsd().add(request.getAmount()));
        creditLineRepository.save(targetCreditLine);

        Subscription subscription = new Subscription();
        subscription.setUser(user);
        subscription.setMerchant(merchant);
        subscription.setAmount(request.getAmount());
        subscription.setProductName(request.getProductName());
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setNextBillingDate(Instant.now().plus(30, ChronoUnit.DAYS));

        Subscription saved = subscriptionRepository.save(subscription);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SubscriptionResponse> getUserSubscriptions(UUID userId) {
        return subscriptionRepository.findAllByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelSubscription(UUID userId, UUID subscriptionId) {
        Subscription sub = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));

        if (!sub.getUser().getId().equals(userId)) {
            throw new BusinessLogicException("Access denied");
        }
        if (sub.getStatus() == SubscriptionStatus.CANCELLED) {
            throw new BusinessLogicException("Subscription is already cancelled");
        }

        sub.setStatus(SubscriptionStatus.CANCELLED);
        subscriptionRepository.save(sub);
        log.info("Pharmacy subscription {} cancelled for user {}", subscriptionId, userId);
    }

    /**
     * Called by InstallmentScannerTask — renews pharmacy subscriptions due today or earlier.
     */
    @Transactional
    public void renewDueSubscriptions() {
        List<Subscription> due = subscriptionRepository
                .findAllByStatusAndNextBillingDateBefore(SubscriptionStatus.ACTIVE, Instant.now());

        for (Subscription sub : due) {
            List<CreditLine> lines = creditLineRepository.findAllByUserId(sub.getUser().getId());
            CreditLine line = lines.stream()
                    .filter(cl -> cl.getType() == CreditLineType.SALUD_COTIDIANA)
                    .findFirst()
                    .orElse(null);

            if (line == null || sub.getAmount().compareTo(line.getAvailable()) > 0) {
                log.warn("Pharmacy subscription {} cannot renew — insufficient credit", sub.getId());
                continue;
            }

            line.setUsedUsd(line.getUsedUsd().add(sub.getAmount()));
            creditLineRepository.save(line);
            sub.setNextBillingDate(sub.getNextBillingDate().plus(30, ChronoUnit.DAYS));
            subscriptionRepository.save(sub);
            log.info("Renewed pharmacy subscription {} for user {}", sub.getId(), sub.getUser().getId());
        }
    }

    @Transactional(readOnly = true)
    public List<SubscriptionResponse> getAllActiveSubscriptions() {
        return subscriptionRepository.findAllByStatus(SubscriptionStatus.ACTIVE).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private SubscriptionResponse mapToResponse(Subscription subscription) {
        return SubscriptionResponse.builder()
                .id(subscription.getId())
                .merchantId(subscription.getMerchant().getId())
                .merchantName(subscription.getMerchant().getTradeName())
                .amount(subscription.getAmount())
                .productName(subscription.getProductName())
                .status(subscription.getStatus())
                .nextBillingDate(subscription.getNextBillingDate())
                .createdAt(subscription.getCreatedAt())
                .build();
    }
}
