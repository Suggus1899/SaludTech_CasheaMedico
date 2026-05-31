package com.saludtech.controller;

import com.saludtech.model.Transaction;
import com.saludtech.repository.TransactionRepository;
import com.saludtech.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/merchant/reconciliation")
@RequiredArgsConstructor
public class ReconciliationController {

        private final TransactionRepository transactionRepository;

        @GetMapping("/transactions")
        public ResponseEntity<List<Transaction>> getMyTransactions(
                        @RequestParam(required = false) UUID merchantId) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

                UUID resolvedMerchantId = merchantId != null ? merchantId : userDetails.getId();
                List<Transaction> transactions = transactionRepository.findAllByMerchantId(resolvedMerchantId);
                return ResponseEntity.ok(transactions);
        }

        @GetMapping("/summary")
        public ResponseEntity<Map<String, Object>> getSummary(@RequestParam(required = false) UUID merchantId) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

                UUID resolvedMerchantId = merchantId != null ? merchantId : userDetails.getId();
                List<Transaction> transactions = transactionRepository.findAllByMerchantId(resolvedMerchantId);

                long total = transactions.size();
                double totalAmount = transactions.stream()
                                .mapToDouble(t -> t.getTotalAmount().doubleValue())
                                .sum();
                double totalMdrFees = transactions.stream()
                                .mapToDouble(t -> t.getMdrFee() != null ? t.getMdrFee().doubleValue() : 0.0)
                                .sum();

                return ResponseEntity.ok(Map.of(
                                "totalTransactions", total,
                                "totalAmount", totalAmount,
                                "totalMdrFees", totalMdrFees,
                                "netAmount", totalAmount - totalMdrFees));
        }

        @GetMapping("/transactions/today")
        public ResponseEntity<List<Transaction>> getTodayTransactions(
                        @RequestParam(required = false) UUID merchantId) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

                UUID resolvedMerchantId = merchantId != null ? merchantId : userDetails.getId();
                Instant startOfDay = LocalDate.now(ZoneOffset.UTC).atStartOfDay(ZoneOffset.UTC).toInstant();
                List<Transaction> transactions = transactionRepository
                                .findAllByMerchantIdAndCreatedAtAfter(resolvedMerchantId, startOfDay);
                return ResponseEntity.ok(transactions);
        }
}
