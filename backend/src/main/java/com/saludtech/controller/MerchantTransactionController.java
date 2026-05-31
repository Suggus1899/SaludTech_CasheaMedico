package com.saludtech.controller;

import com.saludtech.dto.PayoutResponse;
import com.saludtech.model.Transaction;
import com.saludtech.model.User;
import com.saludtech.repository.TransactionRepository;
import com.saludtech.service.MerchantPayoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/merchant")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MERCHANT')")
public class MerchantTransactionController {

    private final TransactionRepository transactionRepository;
    private final MerchantPayoutService merchantPayoutService;

    private UUID getAuthenticatedMerchantId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        // Fallback or explicit relation based on User to Merchant logic.
        // Assuming user.getId() mapped to merchant operations or we have a Merchant reference.
        // For simplicity, we assume the user ID matches the merchant ID, 
        // or we use the user ID directly if it's the merchant's "owner" ID.
        // In a real system we'd lookup `merchantRepository.findByOwnerId(user.getId())`.
        return user.getId();
    }

    @GetMapping("/reconciliation/transactions")
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        UUID merchantId = getAuthenticatedMerchantId();
        return ResponseEntity.ok(transactionRepository.findAllByMerchantId(merchantId));
    }

    @GetMapping("/reconciliation/transactions/today")
    public ResponseEntity<List<Transaction>> getTodayTransactions() {
        UUID merchantId = getAuthenticatedMerchantId();
        Instant today = Instant.now().truncatedTo(ChronoUnit.DAYS);
        return ResponseEntity.ok(transactionRepository.findAllByMerchantIdAndCreatedAtAfter(merchantId, today));
    }

    @GetMapping("/payouts")
    public ResponseEntity<List<PayoutResponse>> getPayouts() {
        UUID merchantId = getAuthenticatedMerchantId();
        return ResponseEntity.ok(merchantPayoutService.getPayoutsForMerchant(merchantId));
    }
}
