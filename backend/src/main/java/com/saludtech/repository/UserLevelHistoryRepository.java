package com.saludtech.repository;

import com.saludtech.model.UserLevelHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserLevelHistoryRepository extends JpaRepository<UserLevelHistory, UUID> {

    List<UserLevelHistory> findAllByUserIdOrderByChangedAtDesc(UUID userId);
}
