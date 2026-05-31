package com.saludtech.controller;

import com.saludtech.dto.PaymentRequest;
import com.saludtech.model.Payment;
import com.saludtech.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/patient/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<Payment> processPayment(@Valid @RequestBody PaymentRequest request) {
        // In a real scenario we'd check if the user paying is the owner, etc.
        Payment response = paymentService.processInstallmentPayment(request);
        return ResponseEntity.ok(response);
    }
}
