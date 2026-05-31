package com.saludtech.mapper;

import com.saludtech.dto.TransactionResponse;
import com.saludtech.model.Transaction;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {

    public TransactionResponse toDto(Transaction entity) {
        if (entity == null) {
            return null;
        }
        TransactionResponse dto = new TransactionResponse();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser().getId());
        dto.setUserFullName(entity.getUser().getFullName());
        dto.setMerchantId(entity.getMerchant().getId());
        dto.setMerchantTradeName(entity.getMerchant().getTradeName());
        dto.setAmount(entity.getTotalAmount());
        dto.setDownPayment(entity.getDownPayment());
        dto.setRemainingBalance(entity.getFinancedAmount());
        dto.setNumberOfInstallments(entity.getNumInstallments());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());

        TransactionResponse.UserSummary userSummary = new TransactionResponse.UserSummary();
        userSummary.setId(entity.getUser().getId());
        userSummary.setFullName(entity.getUser().getFullName());
        dto.setUser(userSummary);

        TransactionResponse.MerchantSummary merchantSummary = new TransactionResponse.MerchantSummary();
        merchantSummary.setId(entity.getMerchant().getId());
        merchantSummary.setTradeName(entity.getMerchant().getTradeName());
        dto.setMerchant(merchantSummary);

        return dto;
    }
}
