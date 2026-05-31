package com.saludtech.controller;

import com.saludtech.dto.DashboardStatsResponse;
import com.saludtech.dto.RegisterRequest;
import com.saludtech.dto.TransactionResponse;
import com.saludtech.model.Installment;
import com.saludtech.model.Merchant;
import com.saludtech.model.User;
import com.saludtech.model.enums.InstallmentStatus;
import com.saludtech.model.enums.MerchantCategory;
import com.saludtech.repository.InstallmentRepository;
import com.saludtech.repository.MerchantRepository;
import com.saludtech.repository.UserRepository;
import com.saludtech.service.AdminDashboardService;
import com.saludtech.service.AuthService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;
    private final InstallmentRepository installmentRepository;
    private final UserRepository userRepository;
    private final MerchantRepository merchantRepository;
    private final AuthService authService;
    private final com.saludtech.service.ElderCareSubscriptionService elderCareSubscriptionService;
    private final com.saludtech.service.SubscriptionService subscriptionService;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        return ResponseEntity.ok(dashboardService.getGlobalStats());
    }

    @GetMapping("/installments/overdue")
    public ResponseEntity<List<Installment>> getOverdueInstallments() {
        return ResponseEntity.ok(installmentRepository.findAllByUserIdAndStatus(
                null, InstallmentStatus.OVERDUE));
    }

    @GetMapping("/installments")
    public ResponseEntity<List<Installment>> getAllOverdue() {
        return ResponseEntity.ok(installmentRepository.findAllByStatus(InstallmentStatus.OVERDUE));
    }

    @GetMapping("/users")
    public ResponseEntity<Page<User>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(userRepository.findAll(pageable));
    }

    @GetMapping("/transactions")
    public ResponseEntity<Page<TransactionResponse>> getAllTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(dashboardService.getAllTransactions(pageable));
    }

    @PostMapping("/users")
    public ResponseEntity<?> createPatient(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.registerUser(request));
    }

    @GetMapping("/merchants")
    public ResponseEntity<List<Merchant>> getAllMerchants() {
        return ResponseEntity.ok(merchantRepository.findAll());
    }

    @GetMapping("/elder-care")
    public ResponseEntity<?> getElderCareDashboard() {
        var activeSubs = elderCareSubscriptionService.getAllActiveSubscriptions();
        var elderMerchants = merchantRepository.findAll().stream()
                .filter(m -> m.getCategory() == MerchantCategory.ELDER_CARE)
                .toList();
        return ResponseEntity.ok(java.util.Map.of(
                "activeSubscriptions", activeSubs,
                "elderCareMerchants", elderMerchants,
                "totalActiveSubscribers", activeSubs.size()));
    }

    @GetMapping("/subscriptions/all")
    public ResponseEntity<?> getAllActiveSubscriptions() {
        return ResponseEntity.ok(subscriptionService.getAllActiveSubscriptions());
    }

    @PostMapping("/merchants")
    public ResponseEntity<Merchant> createMerchant(@Valid @RequestBody CreateMerchantRequest request) {
        Merchant merchant = Merchant.builder()
                .legalName(request.getLegalName())
                .tradeName(request.getTradeName())
                .rif(request.getRif())
                .category(MerchantCategory.valueOf(request.getCategory()))
                .email(request.getEmail())
                .phone(request.getPhone())
                .city(request.getCity())
                .address(request.getAddress())
                .contactName(request.getContactName())
                .mdrRate(new BigDecimal("0.0350"))
                .isActive(false)
                .build();
        Merchant saved = merchantRepository.save(merchant);
        return ResponseEntity.ok(saved);
    }

    @Data
    public static class CreateMerchantRequest {
        private String legalName;
        private String tradeName;
        private String rif;
        private String category;
        private String subcategory;
        private String email;
        private String phone;
        private String city;
        private String address;
        private String contactName;
    }
}
