package com.saludtech.repository;

import com.saludtech.model.MerchantPayout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MerchantPayoutRepository extends JpaRepository<MerchantPayout, UUID> {

    List<MerchantPayout> findAllByMerchantId(UUID merchantId);

    List<MerchantPayout> findAllByStatus(String status);

    List<MerchantPayout> findAllByMerchantIdAndStatus(UUID merchantId, String status);
}
