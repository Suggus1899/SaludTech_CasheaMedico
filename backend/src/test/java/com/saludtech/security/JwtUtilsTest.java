package com.saludtech.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilsTest {

    private JwtUtils jwtUtils;

    @SuppressWarnings("null")
    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        // A 256-bit secret key is required for HS256 (32 characters minimum)
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", "test-secret-key-must-be-very-long-to-be-secure-256-bit-minimum-change-me");
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 3600000);
    }

    @Test
    void testGenerateAndValidateToken() {
        String email = "test@saludtech.com";
        String token = jwtUtils.generateJwtToken(email);

        assertThat(token).isNotNull().isNotEmpty();
        assertThat(jwtUtils.validateJwtToken(token)).isTrue();
        assertThat(jwtUtils.getUserNameFromJwtToken(token)).isEqualTo(email);
    }

    @Test
    void testInvalidToken() {
        assertThat(jwtUtils.validateJwtToken("invalid-token")).isFalse();
    }
}
