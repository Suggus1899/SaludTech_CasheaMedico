package com.saludtech.dto;

import com.saludtech.model.enums.TriageStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TriageRespondRequest {
    private String doctorNotes;
    private TriageStatus status; // RESOLVED or REFERRED
    private UUID referredMerchantId; // optional — set when status=REFERRED
}
