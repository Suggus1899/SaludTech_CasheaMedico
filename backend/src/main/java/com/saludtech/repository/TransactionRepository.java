package com.saludtech.repository;

import com.saludtech.model.Transaction;
import com.saludtech.model.enums.TransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    @Query(value = "SELECT t FROM Transaction t JOIN FETCH t.user JOIN FETCH t.merchant", countQuery = "SELECT COUNT(t) FROM Transaction t")
    Page<Transaction> findAllWithUserAndMerchant(Pageable pageable);

    List<Transaction> findAllByUserId(UUID userId);

    List<Transaction> findAllByMerchantId(UUID merchantId);

    Optional<Transaction> findByQrCodeToken(String qrCodeToken);

    List<Transaction> findAllByStatus(TransactionStatus status);

    @Query("SELECT COALESCE(SUM(t.financedAmount), 0) FROM Transaction t WHERE t.status = 'ACTIVE'")
    BigDecimal sumActiveFinancedAmount();

    @Query("SELECT COALESCE(SUM(t.totalAmount), 0) FROM Transaction t WHERE t.status = 'ACTIVE'")
    BigDecimal sumActiveTotalAmount();

    long countByStatus(TransactionStatus status);

    List<Transaction> findAllByMerchantIdAndCreatedAtAfter(UUID merchantId, Instant after);
}
