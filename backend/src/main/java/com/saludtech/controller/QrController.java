package com.saludtech.controller;

import com.saludtech.model.Transaction;
import com.saludtech.repository.TransactionRepository;
import com.saludtech.security.UserDetailsImpl;
import com.saludtech.service.QrService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/merchant/qr")
@RequiredArgsConstructor
public class QrController {

    private final QrService qrService;
    private final TransactionRepository transactionRepository;

    @PostMapping("/generate")
    public ResponseEntity<?> generateQrCode(@RequestBody QrGenerateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl merchantDetails = (UserDetailsImpl) authentication.getPrincipal();

        String token = qrService.generatePaymentToken(merchantDetails.getId(), request.getAmount());
        return ResponseEntity.ok(Map.of("qrToken", token));
    }

    @GetMapping("/{token}/status")
    public ResponseEntity<?> getQrStatus(@PathVariable String token) {
        return transactionRepository.findByQrCodeToken(token)
                .map((Transaction tx) -> {
                    String status = tx.getStatus().name();
                    boolean expired = tx.getQrExpiresAt().isBefore(Instant.now());
                    if (expired && status.equals("PENDING_PAYMENT")) {
                        status = "EXPIRED";
                    }
                    return ResponseEntity.ok(Map.of(
                            "status", status,
                            "amount", tx.getTotalAmount(),
                            "description", tx.getDescription() != null ? tx.getDescription() : ""));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Data
    public static class QrGenerateRequest {
        private double amount;
        private String description;
    }
}
