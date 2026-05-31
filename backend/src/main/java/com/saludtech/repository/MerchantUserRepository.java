package com.saludtech.repository;

import com.saludtech.model.MerchantUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MerchantUserRepository extends JpaRepository<MerchantUser, UUID> {

    Optional<MerchantUser> findByUserId(UUID userId);

    List<MerchantUser> findAllByMerchantId(UUID merchantId);

    boolean existsByMerchantIdAndUserId(UUID merchantId, UUID userId);
}
