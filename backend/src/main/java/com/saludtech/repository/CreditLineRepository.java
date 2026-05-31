package com.saludtech.repository;

import com.saludtech.model.CreditLine;
import com.saludtech.model.enums.CreditLineStatus;
import com.saludtech.model.enums.CreditLineType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CreditLineRepository extends JpaRepository<CreditLine, UUID> {

    Optional<CreditLine> findByUserIdAndType(UUID userId, CreditLineType type);

    List<CreditLine> findAllByUserId(UUID userId);

    Optional<CreditLine> findByUserId(UUID userId);

    long countByStatus(CreditLineStatus status);
}
