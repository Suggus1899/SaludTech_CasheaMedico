package com.saludtech.repository;

import com.saludtech.model.UserGamificationHistory;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserGamificationHistoryRepository extends org.springframework.data.jpa.repository.JpaRepository<UserGamificationHistory, UUID> {
    java.util.List<UserGamificationHistory> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
