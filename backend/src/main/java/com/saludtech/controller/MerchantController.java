package com.saludtech.controller;

import com.saludtech.model.Merchant;
import com.saludtech.repository.MerchantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/merchants")
@RequiredArgsConstructor
public class MerchantController {

    private final MerchantRepository merchantRepository;

    @GetMapping
    public ResponseEntity<List<Merchant>> getAllMerchants() {
        // Simplified for testing, normally this would be paginated and filtered
        return ResponseEntity.ok(merchantRepository.findAll());
    }
}
