package com.saludtech.repository;

import com.saludtech.model.ElderCareSubscription;
import com.saludtech.model.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface ElderCareSubscriptionRepository extends JpaRepository<ElderCareSubscription, UUID> {
    List<ElderCareSubscription> findAllByUserId(UUID userId);
    List<ElderCareSubscription> findAllByStatus(SubscriptionStatus status);
    List<ElderCareSubscription> findAllByStatusAndNextBillingDateBefore(SubscriptionStatus status, Instant date);
}
