package com.saludtech.model.enums;

public enum MerchantCategory {
    CLINIC,
    PHARMACY,
    OPTICS,
    DENTAL,
    LABORATORY,
    AESTHETIC,
    MEDICAL_SUPPLIES,
    WELLNESS,
    SPECIALIST,
    EMERGENCY_TRIAGE, // Categoría exceptuada del bloqueo de crédito por mora
    ELDER_CARE        // Enfermeras, cuidadores, fisioterapeutas — usa línea MAYOR_CUIDADO
}
