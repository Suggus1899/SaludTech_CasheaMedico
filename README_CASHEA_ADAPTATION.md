# Adaptación de SaludTech: "El Cashea de la Medicina"

Este documento describe la reestructuración arquitectónica y de negocio implementada en la plataforma para adaptarla completamente al modelo *Buy Now, Pay Later* (BNPL) aplicado éticamente a la salud en Venezuela, emulando la exitosa mecánica de "Cashea".

## 1. Tipos de Financiamiento (Nuevas Líneas de Crédito)
Las líneas de crédito genéricas han sido reemplazadas por tres ecosistemas específicos de salud para segmentar el riesgo y plazos:

*   **`SALUD_COTIDIANA` (Micro-asistencia):**
    *   **Uso:** Farmacias para pacientes crónicos (hipertensión, diabetes), exámenes de laboratorio de rutina y telemedicina de triaje.
    *   **Mecánica:** Límite bajo, usualmente para pagar a **1 cuota a 15 días**.
*   **`ESPECIALIDAD_PRINCIPAL`:**
    *   **Uso:** Consultas (cardiología, ginecología), tratamientos odontológicos básicos (caries, limpiezas), ecosonogramas, lentes/ópticas.
    *   **Mecánica:** Financiamiento a corto plazo (**3 a 6 cuotas**).
*   **`MAYOR_CUIDADO`:**
    *   **Uso:** Cuidadores (enfermeras), equipos médicos duraderos (sillas de ruedas), cirugías electivas mayores.
    *   **Mecánica:** Financiamiento a mediano/largo plazo (**9 a 12 meses**).

*(Se han actualizado los modelos en Java `CreditLineType` y el servicio de aprovisionamiento `AuthService` para la creación automática de las líneas correctas al registrarse).*

## 2. Ética de Bloqueo y Manejo de Mora
A diferencia de plataformas retail donde se bloquea el 100% de la cuenta del usuario por un atraso, la salud exige un modelo ético:
*   Se ha implementado el campo `isCreditFrozenForElectives` en la entidad `User`.
*   Si el usuario cae en impago, **no podrá autorizar nuevos códigos QR para categorías electivas** (`OPTICS`, `AESTHETIC`, `WELLNESS`).
*   Se agregó la categoría de comercio `EMERGENCY_TRIAGE` al enum `MerchantCategory`. Las transacciones hacia esta categoría *siempre* se permitirán, independientemente de la mora, usando fondos o permitiendo la asistencia básica de vida.
*   En lugar de un interés porcentual de usura, la entidad `Installment` cuenta con un campo `reactivationFee` (Cargo Fijo de Reactivación), por ejemplo, una tarifa plana de $4 a $5 USD.

## 3. Modelo de Rentabilidad (MDR Fee / Take Rate)
El paciente paga **0% de interés**. La plataforma monetiza cobrando una tasa de descuento (MDR / Take Rate) a las clínicas, doctores y laboratorios, resolviendo el problema de las "agendas vacías".
*   Las entidades `Transaction` y `MerchantPayout` están diseñadas para deducir este `mdrFee` de la liquidación final que recibe el médico.

## 4. Gamificación Preventiva ("El Paciente Responsable")
El modelo incluye subir de niveles para reducir el pago inicial requerido (down payment) desde un 60% hasta un 20%. Para incentivar la salud preventiva, se ha creado el subsistema `UserGamificationHistory` y el enum `GamificationEvent`.

*Los usuarios no solo ganan puntos por pagar cuotas*, sino por acciones saludables:
*   `ON_TIME_PAYMENT`: +10 pts
*   `EARLY_PAYMENT`: +15 pts
*   `CHRONIC_MEDICATION_PURCHASE`: +15 pts (Comprar sus pastillas a tiempo)
*   `PREVENTIVE_CHECKUP_ANNUAL`: +50 pts (Prevenir es más barato que curar)
*   `LATE_PAYMENT_PENALTY`: Reseteo de nivel (Castigo por no pagar a los 28 días).

---
*Cambios aplicados a la base de código y mapeados en las migraciones de Flyway (V5).*
