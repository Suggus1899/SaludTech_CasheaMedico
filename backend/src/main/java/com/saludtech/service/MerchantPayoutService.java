package com.saludtech.service;

import com.saludtech.dto.PayoutResponse;
import com.saludtech.model.Transaction;
import com.saludtech.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MerchantPayoutService {

    private final TransactionRepository transactionRepository;

    public List<PayoutResponse> getPayoutsForMerchant(UUID merchantId) {
        // In a real system, payouts would be a persistent entity.
        // For now, we dynamically calculate them based on historical transactions.
        List<Transaction> transactions = transactionRepository.findAllByMerchantId(merchantId);
        
        List<PayoutResponse> payouts = new ArrayList<>();
        
        if (transactions.isEmpty()) {
            return payouts;
        }

        // Dummy logic to aggregate last month's payout
        BigDecimal totalGross = BigDecimal.ZERO;
        for (Transaction tx : transactions) {
            if (tx.getStatus() == com.saludtech.model.enums.TransactionStatus.ACTIVE || 
                tx.getStatus() == com.saludtech.model.enums.TransactionStatus.COMPLETED) {
                totalGross = totalGross.add(tx.getTotalAmount());
            }
        }
        
        if (totalGross.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal mdrRate = new BigDecimal("0.035"); // 3.5%
            BigDecimal mdrDeducted = totalGross.multiply(mdrRate).setScale(2, RoundingMode.HALF_UP);
            BigDecimal netAmount = totalGross.subtract(mdrDeducted);
            
            Instant now = Instant.now();
            Instant startOfMonth = now.truncatedTo(ChronoUnit.DAYS).minus(30, ChronoUnit.DAYS);
            
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneId.systemDefault());

            payouts.add(PayoutResponse.builder()
                    .id("PO-" + merchantId.toString().substring(0, 8).toUpperCase())
                    .periodStart(formatter.format(startOfMonth))
                    .periodEnd(formatter.format(now))
                    .grossAmount(totalGross)
                    .mdrDeducted(mdrDeducted)
                    .netAmount(netAmount)
                    .status("PENDING")
                    .paidAt(null)
                    .build());
        }

        return payouts;
    }
}
