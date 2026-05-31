package com.saludtech.model;

import com.saludtech.model.enums.TriageStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "triage_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TriageRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "symptoms", nullable = false, length = 1000)
    private String symptoms;

    @Column(name = "perceived_severity")
    private Integer perceivedSeverity; // 1-10

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private TriageStatus status = TriageStatus.PENDING;

    @Column(name = "ai_summary", length = 1000)
    private String aiSummary;

    @Column(name = "doctor_notes", length = 1000)
    private String doctorNotes;

    /** Automatic specialty recommendation: GENERAL_PRACTICE, CARDIOLOGY, DENTISTRY, etc. */
    @Column(name = "specialty_recommended", length = 50)
    private String specialtyRecommended;

    /** Automatic urgency: LOW, MEDIUM, HIGH, EMERGENCY */
    @Column(name = "urgency_level", length = 20)
    private String urgencyLevel;

    /** Timestamp when an admin doctor responded */
    @Column(name = "doctor_response_at")
    private Instant doctorResponseAt;

    /** Merchant recommended/referred by admin after review */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referred_merchant_id")
    private Merchant referredMerchant;

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

