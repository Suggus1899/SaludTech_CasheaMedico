package com.saludtech.repository;

import com.saludtech.model.Installment;
import com.saludtech.model.enums.InstallmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface InstallmentRepository extends JpaRepository<Installment, UUID> {

    List<Installment> findAllByStatusAndDueDateBefore(InstallmentStatus status, LocalDate date);
    
    List<Installment> findAllByStatusInAndDueDateBefore(List<InstallmentStatus> statuses, LocalDate date);

    List<Installment> findAllByUserId(UUID userId);

    List<Installment> findAllByTransactionId(UUID transactionId);

    List<Installment> findAllByStatus(InstallmentStatus status);

    long countByStatus(InstallmentStatus status);

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Installment i WHERE i.status = 'OVERDUE'")
    BigDecimal sumOverdueAmount();

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Installment i WHERE i.status = 'PENDING'")
    BigDecimal sumPendingAmount();

    List<Installment> findAllByUserIdAndStatus(UUID userId, InstallmentStatus status);

    List<Installment> findByStatus(InstallmentStatus status);

    long countByTransactionUserIdAndStatus(UUID userId, InstallmentStatus status);
}
