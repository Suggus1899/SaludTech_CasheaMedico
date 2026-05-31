package com.saludtech.controller;

import com.saludtech.dto.ElderCareSubscriptionRequest;
import com.saludtech.dto.ElderCareSubscriptionResponse;
import com.saludtech.model.User;
import com.saludtech.service.ElderCareSubscriptionService;
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
@RequestMapping("/api/v1/patient/elder-care/subscriptions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class ElderCareSubscriptionController {

    private final ElderCareSubscriptionService elderCareService;

    private UUID getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        return user.getId();
    }

    @PostMapping
    public ResponseEntity<ElderCareSubscriptionResponse> createSubscription(
            @RequestBody ElderCareSubscriptionRequest request) {
        UUID userId = getAuthenticatedUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(elderCareService.createSubscription(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<ElderCareSubscriptionResponse>> getMySubscriptions() {
        UUID userId = getAuthenticatedUserId();
        return ResponseEntity.ok(elderCareService.getUserSubscriptions(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelSubscription(@PathVariable UUID id) {
        UUID userId = getAuthenticatedUserId();
        elderCareService.cancelSubscription(userId, id);
        return ResponseEntity.noContent().build();
    }
}
