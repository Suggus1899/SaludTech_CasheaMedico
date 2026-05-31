package com.saludtech.model;

import com.saludtech.model.enums.MerchantCategory;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "merchants")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Merchant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "legal_name", nullable = false)
    private String legalName;

    @Column(name = "trade_name", nullable = false)
    private String tradeName;

    @Column(name = "rif", unique = true, nullable = false, length = 20)
    private String rif;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 30)
    private MerchantCategory category;

    /** Sub-type within category. For ELDER_CARE: NURSE, CAREGIVER, PHYSIOTHERAPY, GERIATRIC_SPECIALIST */
    @Column(name = "subcategory", length = 50)
    private String subcategory;

    @Column(name = "address", columnDefinition = "text")
    private String address;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "contact_name")
    private String contactName;

    @Column(name = "mdr_rate", nullable = false, precision = 5, scale = 4)
    @Builder.Default
    private BigDecimal mdrRate = new BigDecimal("0.0350");

    @Column(name = "bank_account_bs", length = 50)
    private String bankAccountBs;

    @Column(name = "bank_account_usd", length = 50)
    private String bankAccountUsd;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = false;

    @Column(name = "is_online", nullable = false)
    @Builder.Default
    private boolean isOnline = false;

    @Column(name = "min_transaction", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal minTransaction = new BigDecimal("25.00");

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}

