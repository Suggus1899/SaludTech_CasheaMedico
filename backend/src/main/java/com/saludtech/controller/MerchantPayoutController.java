package com.saludtech.controller;

import com.saludtech.model.MerchantPayout;
import com.saludtech.repository.MerchantPayoutRepository;
import com.saludtech.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/merchant/payouts")
@RequiredArgsConstructor
public class MerchantPayoutController {

    private final MerchantPayoutRepository merchantPayoutRepository;

    @GetMapping
    public ResponseEntity<List<MerchantPayout>> getMyPayouts(
            @RequestParam(required = false) UUID merchantId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        UUID resolvedMerchantId = merchantId != null ? merchantId : userDetails.getId();
        List<MerchantPayout> payouts = merchantPayoutRepository.findAllByMerchantId(resolvedMerchantId);
        return ResponseEntity.ok(payouts);
    }
}
