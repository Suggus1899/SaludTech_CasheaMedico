package com.saludtech.service;

import com.saludtech.dto.TriageRequestDto;
import com.saludtech.dto.TriageRespondRequest;
import com.saludtech.dto.TriageResponseDto;
import com.saludtech.exception.BusinessLogicException;
import com.saludtech.exception.ResourceNotFoundException;
import com.saludtech.model.Merchant;
import com.saludtech.model.TriageRequest;
import com.saludtech.model.User;
import com.saludtech.model.enums.MerchantCategory;
import com.saludtech.model.enums.TriageStatus;
import com.saludtech.repository.MerchantRepository;
import com.saludtech.repository.TriageRepository;
import com.saludtech.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TriageService {

    private final TriageRepository triageRepository;
    private final UserRepository userRepository;
    private final MerchantRepository merchantRepository;

    // Urgency level ordering for sorting
    private static final Map<String, Integer> URGENCY_ORDER = Map.of(
            "EMERGENCY", 4,
            "HIGH", 3,
            "MEDIUM", 2,
            "LOW", 1
    );

    @Transactional
    public TriageResponseDto submitTriage(UUID userId, TriageRequestDto requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TriageRequest triage = new TriageRequest();
        triage.setUser(user);
        triage.setSymptoms(requestDto.getSymptoms());
        triage.setPerceivedSeverity(requestDto.getPerceivedSeverity());
        triage.setStatus(TriageStatus.PENDING);

        // ── Automatic rules engine ─────────────────────────────────────
        applyAutomaticRules(triage, requestDto.getSymptoms(), requestDto.getPerceivedSeverity());

        // Build AI summary with specialty info
        triage.setAiSummary(String.format(
                "Análisis automático: Severidad percibida %d/10. Urgencia: %s. Especialidad sugerida: %s.",
                requestDto.getPerceivedSeverity(), triage.getUrgencyLevel(), triage.getSpecialtyRecommended()
        ));

        TriageRequest saved = triageRepository.save(triage);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TriageResponseDto> getUserTriages(UUID userId) {
        return triageRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TriageResponseDto getTriageById(UUID userId, UUID triageId) {
        TriageRequest triage = triageRepository.findById(triageId)
                .orElseThrow(() -> new ResourceNotFoundException("Triage not found"));
        if (!triage.getUser().getId().equals(userId)) {
            throw new BusinessLogicException("Access denied");
        }
        return mapToResponse(triage);
    }

    // ── Admin methods ─────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TriageResponseDto> getPendingTriages() {
        return triageRepository.findAllByStatus(TriageStatus.PENDING).stream()
                .sorted(Comparator.comparingInt(
                        t -> -URGENCY_ORDER.getOrDefault(t.getUrgencyLevel(), 1)))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TriageResponseDto respondToTriage(UUID triageId, TriageRespondRequest request) {
        TriageRequest triage = triageRepository.findById(triageId)
                .orElseThrow(() -> new ResourceNotFoundException("Triage not found"));

        if (request.getDoctorNotes() == null || request.getDoctorNotes().isBlank()) {
            throw new BusinessLogicException("Doctor notes are required");
        }
        if (request.getStatus() == null) {
            throw new BusinessLogicException("Response status is required (RESOLVED or REFERRED)");
        }

        triage.setDoctorNotes(request.getDoctorNotes());
        triage.setStatus(request.getStatus());
        triage.setDoctorResponseAt(Instant.now());

        if (request.getReferredMerchantId() != null) {
            Merchant merchant = merchantRepository.findById(request.getReferredMerchantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Merchant not found"));
            triage.setReferredMerchant(merchant);
        }

        return mapToResponse(triageRepository.save(triage));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRecommendedMerchants(UUID triageId) {
        TriageRequest triage = triageRepository.findById(triageId)
                .orElseThrow(() -> new ResourceNotFoundException("Triage not found"));

        String specialty = triage.getSpecialtyRecommended();
        if (specialty == null) {
            return List.of();
        }

        // Map specialty → MerchantCategory
        MerchantCategory targetCategory = specialtyToCategory(specialty);

        return merchantRepository.findAll().stream()
                .filter(m -> m.isActive() && m.getCategory() == targetCategory)
                .map(m -> Map.<String, Object>of(
                        "id", m.getId(),
                        "tradeName", m.getTradeName(),
                        "city", m.getCity() != null ? m.getCity() : "",
                        "category", m.getCategory().name(),
                        "subcategory", m.getSubcategory() != null ? m.getSubcategory() : "",
                        "phone", m.getPhone() != null ? m.getPhone() : ""
                ))
                .collect(Collectors.toList());
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private void applyAutomaticRules(TriageRequest triage, String symptoms, int severity) {
        String s = symptoms.toLowerCase();

        if (severity >= 8) {
            triage.setUrgencyLevel("EMERGENCY");
            triage.setSpecialtyRecommended("EMERGENCY_MEDICINE");
        } else if ((s.contains("pecho") || s.contains("corazón") || s.contains("corazon") || s.contains("presión") || s.contains("presion")) && severity >= 6) {
            triage.setUrgencyLevel("HIGH");
            triage.setSpecialtyRecommended("CARDIOLOGY");
        } else if ((s.contains("fiebre") || s.contains("temperatura")) && severity >= 6) {
            triage.setUrgencyLevel("HIGH");
            triage.setSpecialtyRecommended("INTERNAL_MEDICINE");
        } else if (s.contains("diente") || s.contains("muela") || s.contains("dental") || s.contains("dientes")) {
            triage.setUrgencyLevel("LOW");
            triage.setSpecialtyRecommended("DENTISTRY");
        } else if (s.contains("visión") || s.contains("vision") || s.contains("ojo") || s.contains("vista")) {
            triage.setUrgencyLevel("LOW");
            triage.setSpecialtyRecommended("OPHTHALMOLOGY");
        } else {
            triage.setUrgencyLevel("LOW");
            triage.setSpecialtyRecommended("GENERAL_PRACTICE");
        }
    }

    private MerchantCategory specialtyToCategory(String specialty) {
        return switch (specialty) {
            case "DENTISTRY" -> MerchantCategory.DENTAL;
            case "OPHTHALMOLOGY" -> MerchantCategory.OPTICS;
            case "EMERGENCY_MEDICINE" -> MerchantCategory.EMERGENCY_TRIAGE;
            case "CARDIOLOGY", "INTERNAL_MEDICINE" -> MerchantCategory.CLINIC;
            default -> MerchantCategory.CLINIC;
        };
    }

    private TriageResponseDto mapToResponse(TriageRequest triage) {
        return TriageResponseDto.builder()
                .id(triage.getId())
                .symptoms(triage.getSymptoms())
                .perceivedSeverity(triage.getPerceivedSeverity())
                .status(triage.getStatus())
                .aiSummary(triage.getAiSummary())
                .doctorNotes(triage.getDoctorNotes())
                .specialtyRecommended(triage.getSpecialtyRecommended())
                .urgencyLevel(triage.getUrgencyLevel())
                .doctorResponseAt(triage.getDoctorResponseAt())
                .referredMerchantId(triage.getReferredMerchant() != null ? triage.getReferredMerchant().getId() : null)
                .referredMerchantName(triage.getReferredMerchant() != null ? triage.getReferredMerchant().getTradeName() : null)
                .createdAt(triage.getCreatedAt())
                .build();
    }
}
