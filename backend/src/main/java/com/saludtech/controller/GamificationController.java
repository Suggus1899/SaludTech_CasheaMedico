package com.saludtech.controller;

import com.saludtech.model.User;
import com.saludtech.model.UserGamificationHistory;
import com.saludtech.repository.UserGamificationHistoryRepository;
import com.saludtech.repository.UserRepository;
import com.saludtech.service.GamificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final GamificationService gamificationService;
    private final UserGamificationHistoryRepository historyRepository;
    private final UserRepository userRepository;

    @GetMapping("/history/{userId}")
    @PreAuthorize("hasRole('PATIENT') and principal.id == #userId")
    public ResponseEntity<List<UserGamificationHistory>> getHistory(@PathVariable UUID userId) {
        return ResponseEntity.ok(historyRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @SuppressWarnings("null")
    @GetMapping("/points/{userId}")
    @PreAuthorize("hasRole('PATIENT') and principal.id == #userId")
    public ResponseEntity<Map<String, Object>> getPoints(@PathVariable UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return ResponseEntity.ok(Map.of(
                "level", user.getLevel(),
                "points", user.getPoints()
        ));
    }

    @SuppressWarnings("null")
    @PostMapping("/checkup/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> triggerPreventiveCheckup(@PathVariable UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        gamificationService.awardPointsForPreventiveCheckup(user);
        return ResponseEntity.ok(Map.of("message", "Points awarded for preventive checkup"));
    }
}
