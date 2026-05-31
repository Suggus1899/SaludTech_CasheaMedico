package com.saludtech.mapper;

import com.saludtech.dto.InstallmentResponse;
import com.saludtech.model.Installment;
import org.springframework.stereotype.Component;

@Component
public class InstallmentMapper {

    public InstallmentResponse toDto(Installment entity) {
        if (entity == null) {
            return null;
        }
        InstallmentResponse dto = new InstallmentResponse();
        dto.setId(entity.getId());
        dto.setInstallmentNumber(entity.getInstallmentNum());
        dto.setAmount(entity.getAmount());
        dto.setPenaltyAmount(entity.getReactivationFee());
        dto.setDueDate(entity.getDueDate());
        dto.setStatus(entity.getStatus());
        dto.setPaidAt(entity.getPaidAt());
        return dto;
    }
}
