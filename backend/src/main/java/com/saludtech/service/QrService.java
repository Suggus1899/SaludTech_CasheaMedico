package com.saludtech.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class QrService {

    private final RedisTemplate<String, String> redisTemplate;

    @Value("${saludtech.qr.secret:default-secret-key-for-hmac-sha256-which-is-long-enough}")
    private String qrSecret;

    private static final String HMAC_ALGO = "HmacSHA256";
    private static final long QR_TTL_MINUTES = 15;

    /**
     * Generates a signed QR payload and stores the nonce in Redis.
     */
    public String generatePaymentToken(UUID merchantId, double amount) {
        String nonce = UUID.randomUUID().toString();
        long timestamp = System.currentTimeMillis();

        // Save nonce to Redis with TTL
        redisTemplate.opsForValue().set("qr_nonce:" + nonce, "VALID", QR_TTL_MINUTES, TimeUnit.MINUTES);

        // payload structure: merchantId:amount:nonce:timestamp
        String payload = merchantId.toString() + ":" + amount + ":" + nonce + ":" + timestamp;
        
        String signature = generateSignature(payload);
        
        String finalToken = payload + "|" + signature;
        return Base64.getEncoder().encodeToString(finalToken.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Validates the signed QR token and consumes the nonce to prevent replay attacks.
     */
    public boolean validateAndConsumeToken(String token, UUID expectedMerchantId, double expectedAmount) {
        try {
            String decoded = new String(Base64.getDecoder().decode(token), StandardCharsets.UTF_8);
            String[] tokenParts = decoded.split("\\|");
            if (tokenParts.length != 2) return false;

            String payload = tokenParts[0];
            String signature = tokenParts[1];

            // Verify signature
            String expectedSignature = generateSignature(payload);
            if (!expectedSignature.equals(signature)) {
                log.warn("Invalid QR signature detected");
                return false;
            }

            String[] parts = payload.split(":");
            if (parts.length != 4) return false;

            String merchantIdStr = parts[0];
            String amountStr = parts[1];
            String nonce = parts[2];
            long timestamp = Long.parseLong(parts[3]);

            // Validate data
            if (!merchantIdStr.equals(expectedMerchantId.toString())) return false;
            if (Double.parseDouble(amountStr) != expectedAmount) return false;

            // Validate time (15 mins)
            if (System.currentTimeMillis() - timestamp > QR_TTL_MINUTES * 60 * 1000) {
                log.warn("QR token expired by timestamp");
                return false;
            }

            // Check and consume nonce in Redis
            Boolean deleted = redisTemplate.delete("qr_nonce:" + nonce);
            if (Boolean.FALSE.equals(deleted)) {
                log.warn("Replay attack detected or QR already consumed: {}", nonce);
                return false;
            }

            return true;
        } catch (Exception e) {
            log.error("Failed to validate QR token", e);
            return false;
        }
    }

    private String generateSignature(String data) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGO);
            SecretKeySpec secretKeySpec = new SecretKeySpec(qrSecret.getBytes(StandardCharsets.UTF_8), HMAC_ALGO);
            mac.init(secretKeySpec);
            byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hmacBytes);
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate HMAC", e);
        }
    }
}
