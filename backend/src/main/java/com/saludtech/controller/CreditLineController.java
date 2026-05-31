package com.saludtech.controller;

import com.saludtech.dto.CreditLineResponse;
import com.saludtech.model.CreditLine;
import com.saludtech.repository.CreditLineRepository;
import com.saludtech.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/patient/credit-lines")
@RequiredArgsConstructor
public class CreditLineController {

    private final CreditLineRepository creditLineRepository;

    @GetMapping
    public ResponseEntity<List<CreditLineResponse>> getMyCreditLines() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        List<CreditLine> lines = creditLineRepository.findAllByUserId(userDetails.getId());
        List<CreditLineResponse> response = lines.stream()
                .map(l -> CreditLineResponse.builder()
                        .id(l.getId())
                        .type(l.getType())
                        .limitUsd(l.getLimitUsd())
                        .usedUsd(l.getUsedUsd())
                        .availableUsd(l.getAvailable())
                        .status(l.getStatus())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}
