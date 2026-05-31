package com.saludtech.repository;

import com.saludtech.model.TriageRequest;
import com.saludtech.model.enums.TriageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TriageRepository extends JpaRepository<TriageRequest, UUID> {
    List<TriageRequest> findAllByUserIdOrderByCreatedAtDesc(UUID userId);
    List<TriageRequest> findAllByStatus(TriageStatus status);
}

