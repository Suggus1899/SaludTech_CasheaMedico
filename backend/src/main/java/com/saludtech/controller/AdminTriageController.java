package com.saludtech.controller;

import com.saludtech.dto.TriageRespondRequest;
import com.saludtech.dto.TriageResponseDto;
import com.saludtech.service.TriageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/triage")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminTriageController {

    private final TriageService triageService;

    /**
     * Lists all PENDING triages ordered by urgency (EMERGENCY first).
     */
    @GetMapping("/pending")
    public ResponseEntity<List<TriageResponseDto>> getPendingTriages() {
        return ResponseEntity.ok(triageService.getPendingTriages());
    }

    /**
     * Admin doctor writes notes and resolves/refers a triage request.
     */
    @PutMapping("/{id}/respond")
    public ResponseEntity<TriageResponseDto> respondToTriage(
            @PathVariable UUID id,
            @RequestBody TriageRespondRequest request) {
        return ResponseEntity.ok(triageService.respondToTriage(id, request));
    }
}
