package com.saludtech.controller;

import com.saludtech.model.Merchant;
import com.saludtech.model.User;
import com.saludtech.repository.MerchantRepository;
import com.saludtech.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final MerchantRepository merchantRepository;
    private final UserRepository userRepository;

    @GetMapping("/merchants/pending")
    public ResponseEntity<List<Merchant>> getPendingMerchants() {
        return ResponseEntity.ok(merchantRepository.findAll().stream()
                .filter(m -> !m.isActive())
                .toList());
    }

    @PostMapping("/merchants/{id}/approve")
    public ResponseEntity<Merchant> approveMerchant(@PathVariable UUID id) {
        Merchant merchant = merchantRepository.findById(id).orElseThrow();
        merchant.setActive(true);
        return ResponseEntity.ok(merchantRepository.save(merchant));
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    /**
     * Activates or pauses a user account.
     * Replaces the legacy /kyc endpoint (KycStatus was removed in V3).
     * @param activate true to activate, false to pause
     */
    @PostMapping("/users/{id}/status")
    public ResponseEntity<User> updateUserStatus(@PathVariable UUID id,
                                                  @RequestParam boolean activate) {
        User user = userRepository.findById(id).orElseThrow();
        user.setActive(activate);
        return ResponseEntity.ok(userRepository.save(user));
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<?> getAllSubscriptions() {
        return ResponseEntity.ok(java.util.Map.of("message", "Use /admin/dashboard for subscription metrics"));
    }
}
