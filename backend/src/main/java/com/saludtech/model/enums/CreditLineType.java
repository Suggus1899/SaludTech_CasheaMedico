package com.saludtech.model.enums;

public enum CreditLineType {
    SALUD_COTIDIANA,       // Micro-asistencia: farmacias, exámenes de rutina, telemedicina (1 cuota a 15 días)
    ESPECIALIDAD_PRINCIPAL, // Consultas, odontología, ecosonogramas, lentes (3 a 6 cuotas)
    MAYOR_CUIDADO           // Cuidadores, cirugías electivas, sillas de ruedas (9 a 12 meses)
}
