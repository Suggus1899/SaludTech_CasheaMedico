package com.saludtech.controller;

import com.saludtech.dto.TransactionPreviewResponse;
import com.saludtech.dto.TransactionRequest;
import com.saludtech.dto.TransactionResponse;
import com.saludtech.model.Installment;
import com.saludtech.model.enums.InstallmentStatus;
import com.saludtech.repository.InstallmentRepository;
import com.saludtech.security.UserDetailsImpl;
import com.saludtech.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/patient/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final InstallmentRepository installmentRepository;

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(@Valid @RequestBody TransactionRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        TransactionResponse response = transactionService.createTransaction(userDetails.getId(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/preview")
    public ResponseEntity<TransactionPreviewResponse> previewTransaction(
            @Valid @RequestBody TransactionRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        TransactionPreviewResponse preview = transactionService.previewTransaction(userDetails.getId(), request);
        return ResponseEntity.ok(preview);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Installment>> getMyInstallments() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        List<Installment> installments = installmentRepository.findAllByUserId(userDetails.getId());
        return ResponseEntity.ok(installments);
    }

    @GetMapping("/my/pending")
    public ResponseEntity<List<Installment>> getMyPendingInstallments() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        List<Installment> installments = installmentRepository.findAllByUserIdAndStatus(
                userDetails.getId(), InstallmentStatus.PENDING);
        return ResponseEntity.ok(installments);
    }
}
