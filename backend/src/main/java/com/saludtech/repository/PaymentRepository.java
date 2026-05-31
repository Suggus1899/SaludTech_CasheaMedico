package com.saludtech.repository;

import com.saludtech.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByInstallmentId(UUID installmentId);

    List<Payment> findAllByUserId(UUID userId);

    List<Payment> findAllByInstallmentId(UUID installmentId);

    boolean existsByInstallmentId(UUID installmentId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(p.amount) FROM Payment p WHERE p.user.id = :userId")
    java.math.BigDecimal sumByUserId(@org.springframework.data.repository.query.Param("userId") UUID userId);
}
