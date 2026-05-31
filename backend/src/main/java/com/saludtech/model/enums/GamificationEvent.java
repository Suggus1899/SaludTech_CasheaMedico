package com.saludtech.model.enums;

public enum GamificationEvent {
    ON_TIME_PAYMENT,             // Pago a tiempo (+10 pts)
    EARLY_PAYMENT,               // Pago adelantado (+15 pts)
    PREVENTIVE_CHECKUP_ANNUAL,   // Chequeo anual preventivo completado (+50 pts)
    CHRONIC_MEDICATION_PURCHASE, // Compra de medicamento para enfermedad crónica a tiempo (+15 pts)
    LATE_PAYMENT_PENALTY         // Retraso de más de 28 días (Reset de puntos a 0)
}
