package com.saludtech.repository;

import com.saludtech.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByPhone(String phone);

    Optional<User> findByEmail(String email);

    Optional<User> findByNationalId(String nationalId);

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);

    boolean existsByNationalId(String nationalId);

    long countByLevel(int level);
}
