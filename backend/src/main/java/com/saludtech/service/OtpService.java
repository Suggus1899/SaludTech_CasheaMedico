package com.saludtech.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private static final String OTP_PREFIX = "otp:";
    private static final int OTP_TTL_MINUTES = 10;

    private final StringRedisTemplate redisTemplate;
    private final RestTemplate restTemplate;

    @Value("${saludtech.otp.send-real:false}")
    private boolean sendReal;

    @Value("${saludtech.otp.whatsapp-bridge-url:http://localhost:3500}")
    private String whatsappBridgeUrl;

    public String generateAndStore(String phone) {
        String code = String.format("%06d", new SecureRandom().nextInt(1_000_000));
        redisTemplate.opsForValue().set(OTP_PREFIX + phone, code, Duration.ofMinutes(OTP_TTL_MINUTES));
        if (sendReal) {
            sendViaWhatsApp(phone, code);
        } else {
            log.info("[DEV] OTP for {}: {}", phone, code);
        }
        return code;
    }

    public boolean validate(String phone, String code) {
        String stored = redisTemplate.opsForValue().get(OTP_PREFIX + phone);
        if (stored != null && stored.equals(code)) {
            redisTemplate.delete(OTP_PREFIX + phone);
            return true;
        }
        return false;
    }

    private void sendViaWhatsApp(String phone, String code) {
        try {
            String url = whatsappBridgeUrl + "/send-otp";

            // Prepare request body
            Map<String, String> requestBody = Map.of("phone", phone, "code", code);

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);

            // Make the HTTP call
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(url, request,
                    (Class<Map<String, Object>>) (Class<?>) Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Boolean ok = (Boolean) response.getBody().get("ok");
                if (Boolean.TRUE.equals(ok)) {
                    log.info("OTP sent successfully via WhatsApp to {}", phone);
                } else {
                    String error = (String) response.getBody().get("error");
                    log.error("Failed to send OTP via WhatsApp to {}: {}", phone, error);
                }
            } else {
                log.error("WhatsApp bridge returned error status: {}", response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Error calling WhatsApp bridge for {}: {}", phone, e.getMessage());
            // Don't throw exception - dev-safe fallback, OTP generation continues
        }
    }
}
