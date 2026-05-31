package com.saludtech.repository;

import com.saludtech.model.Subscription;
import com.saludtech.model.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    List<Subscription> findAllByUserId(UUID userId);
    List<Subscription> findAllByStatus(SubscriptionStatus status);
    List<Subscription> findAllByStatusAndNextBillingDateBefore(SubscriptionStatus status, Instant date);
}

