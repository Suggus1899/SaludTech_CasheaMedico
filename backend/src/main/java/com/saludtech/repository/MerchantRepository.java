package com.saludtech.repository;

import com.saludtech.model.Merchant;
import com.saludtech.model.enums.MerchantCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MerchantRepository extends JpaRepository<Merchant, UUID> {

    Optional<Merchant> findByRif(String rif);

    Optional<Merchant> findByEmail(String email);

    List<Merchant> findAllByIsActive(boolean isActive);

    List<Merchant> findAllByCategory(MerchantCategory category);

    long countByIsActive(boolean isActive);
}
