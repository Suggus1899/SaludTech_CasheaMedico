package com.saludtech.dto;

import com.saludtech.model.enums.TriageStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TriageResponseDto {
    private UUID id;
    private String symptoms;
    private Integer perceivedSeverity;
    private TriageStatus status;
    private String aiSummary;
    private String doctorNotes;
    private String specialtyRecommended;
    private String urgencyLevel;
    private Instant doctorResponseAt;
    private UUID referredMerchantId;
    private String referredMerchantName;
    private Instant createdAt;
}

