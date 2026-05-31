package com.saludtech.controller;

import com.saludtech.dto.SubscriptionRequest;
import com.saludtech.dto.SubscriptionResponse;
import com.saludtech.model.User;
import com.saludtech.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/patient/subscriptions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    private UUID getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        return user.getId();
    }

    @PostMapping
    public ResponseEntity<SubscriptionResponse> createSubscription(@RequestBody SubscriptionRequest request) {
        UUID userId = getAuthenticatedUserId();
        SubscriptionResponse response = subscriptionService.createSubscription(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<SubscriptionResponse>> getSubscriptions() {
        UUID userId = getAuthenticatedUserId();
        return ResponseEntity.ok(subscriptionService.getUserSubscriptions(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelSubscription(@PathVariable UUID id) {
        UUID userId = getAuthenticatedUserId();
        subscriptionService.cancelSubscription(userId, id);
        return ResponseEntity.noContent().build();
    }
}

