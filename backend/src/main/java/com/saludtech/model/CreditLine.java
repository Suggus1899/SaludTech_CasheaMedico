package com.saludtech.model;

import com.saludtech.model.enums.CreditLineStatus;
import com.saludtech.model.enums.CreditLineType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "credit_lines", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "type" }))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditLine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 30)
    @Builder.Default
    private CreditLineType type = CreditLineType.ESPECIALIDAD_PRINCIPAL;

    @Column(name = "limit_usd", nullable = false, precision = 10, scale = 2)
    private BigDecimal limitUsd;

    @Column(name = "used_usd", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal usedUsd = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private CreditLineStatus status = CreditLineStatus.ACTIVE;

    @Column(name = "paused_at")
    private Instant pausedAt;

    @Column(name = "reactivated_at")
    private Instant reactivatedAt;

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

    /**
     * Returns the available credit (limit - used).
     */
    public BigDecimal getAvailable() {
        return limitUsd.subtract(usedUsd);
    }
}
