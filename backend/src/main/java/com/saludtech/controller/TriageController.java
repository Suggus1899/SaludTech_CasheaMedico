package com.saludtech.controller;

import com.saludtech.dto.TriageRequestDto;
import com.saludtech.dto.TriageResponseDto;
import com.saludtech.model.User;
import com.saludtech.service.TriageService;
import com.saludtech.service.TransactionService;
import com.saludtech.dto.TransactionRequest;
import com.saludtech.dto.TransactionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/patient/triage")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class TriageController {

    private final TriageService triageService;
    private final TransactionService transactionService;

    private UUID getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        return user.getId();
    }

    @PostMapping
    public ResponseEntity<TriageResponseDto> submitTriage(@RequestBody TriageRequestDto request) {
        UUID userId = getAuthenticatedUserId();
        TriageResponseDto response = triageService.submitTriage(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<TriageResponseDto>> getMyTriages() {
        UUID userId = getAuthenticatedUserId();
        return ResponseEntity.ok(triageService.getUserTriages(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TriageResponseDto> getTriageById(@PathVariable UUID id) {
        UUID userId = getAuthenticatedUserId();
        return ResponseEntity.ok(triageService.getTriageById(userId, id));
    }

    /** Returns merchants matching the specialty recommended for a given triage */
    @GetMapping("/{id}/recommended-merchants")
    public ResponseEntity<List<Map<String, Object>>> getRecommendedMerchants(@PathVariable UUID id) {
        return ResponseEntity.ok(triageService.getRecommendedMerchants(id));
    }

    /**
     * Shortcut to book a BNPL transaction directly from a triage result.
     * The request body must include merchantId, amount, requestedInstallments, and qrToken.
     */
    @PostMapping("/{id}/book")
    public ResponseEntity<TransactionResponse> bookFromTriage(
            @PathVariable UUID id,
            @RequestBody TransactionRequest request) {
        UUID userId = getAuthenticatedUserId();
        TransactionResponse response = transactionService.createTransaction(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
