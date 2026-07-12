# Plan: Catálogo de Servicios e Insumos Médicos — SaludTech

## Modelo de Negocio (Cashea de la Medicina)

SaludTech = BNPL para salud en Venezuela. El paciente:

1. **Explora** comercios aliados (clínicas, laboratorios, farmacias, ópticas, dentales)
2. **Selecciona** un servicio o insumo del catálogo del comercio
3. **Financia** con su línea de crédito (down payment + cuotas cada 15 días)
4. **Paga** las cuotas mensualmente con tarjeta (fakePayment API)

Líneas de crédito por tipo:
- `ESPECIALIDAD_PRINCIPAL` → consultas, procedimientos, exámenes
- `SALUD_COTIDIANA` → medicinas, insumos, farmacia
- `MAYOR_CUIDADO` → servicios para adultos mayores (enfermería, cuidado domiciliario)

---

## Fase 1: Schema — Tablas del Catálogo (Migración V11)

### Tabla `medical_services`

Servicios que ofrecen los merchants (consultas, procedimientos, exámenes).

```sql
CREATE TABLE medical_services (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id     UUID NOT NULL REFERENCES merchants(id),
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    category        VARCHAR(50) NOT NULL,        -- CONSULTATION, PROCEDURE, LAB_TEST, DENTAL, IMAGING, VACCINATION
    subcategory     VARCHAR(100),                -- Cardiología, Dermatología, Limpieza dental, etc.
    price_usd       NUMERIC(10,2) NOT NULL,
    duration_min    SMALLINT DEFAULT 30,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE medical_services ADD CONSTRAINT svc_category_check
    CHECK (category IN ('CONSULTATION','PROCEDURE','LAB_TEST','DENTAL','IMAGING','VACCINATION','TELEMEDICINE'));

CREATE INDEX idx_svc_merchant ON medical_services (merchant_id, is_active);
CREATE INDEX idx_svc_category ON medical_services (category, is_active);
```

### Tabla `medical_supplies`

Insumos y productos (medicinas, dispositivos, oxígeno, etc.).

```sql
CREATE TABLE medical_supplies (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id          UUID NOT NULL REFERENCES merchants(id),
    name                 VARCHAR(200) NOT NULL,
    description          TEXT,
    category             VARCHAR(50) NOT NULL,   -- MEDICATION, DEVICE, SUPPLY, OXYGEN, NUTRITION
    subcategory          VARCHAR(100),            -- Antihipertensivo, Analgésico, etc.
    price_usd            NUMERIC(10,2) NOT NULL,
    unit                 VARCHAR(50) DEFAULT 'unidad',
    stock                INTEGER NOT NULL DEFAULT 0,
    min_stock            INTEGER DEFAULT 10,
    requires_prescription BOOLEAN NOT NULL DEFAULT false,
    is_active            BOOLEAN NOT NULL DEFAULT true,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE medical_supplies ADD CONSTRAINT sup_category_check
    CHECK (category IN ('MEDICATION','DEVICE','SUPPLY','OXYGEN','NUTRITION','PERSONAL_CARE'));

CREATE INDEX idx_sup_merchant ON medical_supplies (merchant_id, is_active);
CREATE INDEX idx_sup_category ON medical_supplies (category, is_active);
```

### Tabla `transaction_items`

Conecta transacciones con items del catálogo (servicios o insumos).

```sql
CREATE TABLE transaction_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id  UUID NOT NULL REFERENCES transactions(id),
    service_id      UUID REFERENCES medical_services(id),
    supply_id       UUID REFERENCES medical_supplies(id),
    item_name       VARCHAR(200) NOT NULL,       -- snapshot del nombre al momento de la compra
    quantity        SMALLINT NOT NULL DEFAULT 1,
    unit_price_usd  NUMERIC(10,2) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE transaction_items ADD CONSTRAINT ti_one_item_check
    CHECK (service_id IS NOT NULL OR supply_id IS NOT NULL);

CREATE INDEX idx_ti_transaction ON transaction_items (transaction_id);
```

### Tabla `subscription_items` (para suscripciones de crónicos)

Items recurrentes en suscripciones de farmacia.

```sql
CREATE TABLE subscription_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    supply_id       UUID REFERENCES medical_supplies(id),
    item_name       VARCHAR(200) NOT NULL,
    quantity        SMALLINT NOT NULL DEFAULT 1,
    unit_price_usd  NUMERIC(10,2) NOT NULL
);

CREATE INDEX idx_si_subscription ON subscription_items (subscription_id);
```

---

## Fase 2: Seed Data — Comercios, Catálogo y Usuarios

### 2.1 Comercios nuevos (10 total)

| Comercio | Categoría | Ciudad | Tipo catálogo |
|----------|-----------|--------|---------------|
| Clínica Santa María | CLINIC | Caracas | Servicios |
| Centro Médico La Paz | CLINIC | Maracay | Servicios |
| Laboratorio BioSalud | LABORATORY | Caracas | Servicios |
| Laboratorio Corposalud | LABORATORY | Valencia | Servicios |
| Farmacia Salud Total | PHARMACY | Valencia | Insumos |
| Farmatodo El Hatillo | PHARMACY | Caracas | Insumos |
| Óptica Visión Clara | OPTICS | Maracaibo | Ambos |
| Centro Dental Sonrisa | DENTAL | Barquisimeto | Servicios |
| CardioVital C.A. | CLINIC | Caracas | Servicios (cardiología) |
| CuidadoDomicilio | HOME_CARE | Caracas | Servicios (adultos mayores) |

### 2.2 Catálogo de servicios (ejemplos por comercio)

**Clínica Santa María (CLINIC):**
- Consulta Medicina General — $25 — 30 min
- Consulta Cardiología — $50 — 45 min
- Consulta Pediatría — $35 — 30 min
- Consulta Ginecología — $45 — 40 min
- Electrocardiograma — $30 — 20 min
- Ecografía abdominal — $60 — 30 min

**Laboratorio BioSalud (LABORATORY):**
- Hemograma completo — $15
- Perfil lipídico — $20
- Glicemia en ayunas — $10
- Examen de orina — $12
- Panel de función hepática — $25
- Prueba de embarazo — $8

**Centro Dental Sonrisa (DENTAL):**
- Consulta + limpieza dental — $40 — 60 min
- Extracción simple — $30 — 30 min
- Empaste (obturación) — $35 — 45 min
- Blanqueamiento dental — $80 — 90 min
- Endodoncia — $120 — 90 min

**Óptica Visión Clara (OPTICS):**
- Examen de la vista — $15 — 20 min
- Montura + lentes monofocales — $90 — servicio
- Lentes de contacto (par) — $60 — servicio
- Montura + lentes bifocales — $130 — servicio

**CuidadoDomicilio (HOME_CARE):**
- Visita de enfermería (4h) — $45 — servicio
- Cuidado de adulto mayor (8h) — $70 — servicio
- Fisioterapia domiciliaria — $40 — 60 min
- Administración de medicamentos — $15 — 30 min

**CardioVital C.A. (CLINIC):**
- Consulta cardiología — $55 — 45 min
- Holter 24h — $80 — servicio
- Prueba de esfuerzo — $90 — 60 min
- Ecocardiograma — $70 — 30 min

### 2.3 Catálogo de insumos (ejemplos por farmacia)

**Farmacia Salud Total (PHARMACY):**
- Losartán 50mg (caja 30) — $4.50 — MEDICATION — requiere receta
- Metformina 850mg (caja 60) — $5.20 — MEDICATION — requiere receta
- Atorvastatina 20mg (caja 30) — $6.80 — MEDICATION — requiere receta
- Ibuprofeno 400mg (caja 20) — $2.50 — MEDICATION
- Acetaminofén 500mg (caja 40) — $1.80 — MEDICATION
- Amoxicilina 500mg (caja 21) — $3.50 — MEDICATION — requiere receta
- Termómetro digital — $8.00 — DEVICE
- Tensiómetro digital — $35.00 — DEVICE
- Glucómetro + tiras — $28.00 — DEVICE
- Mascarillas (caja 50) — $3.00 — SUPPLY
- Guantes de látex (caja 100) — $4.50 — SUPPLY
- Alcohol 70% (1L) — $2.00 — SUPPLY
- Oxígeno portátil (recarga) — $15.00 — OXYGEN
- Sondas nasogástricas — $5.00 — SUPPLY
- Vendas elásticas (par) — $3.50 — SUPPLY

**Farmatodo El Hatillo (PHARMACY):**
- Insulina glargina (caja 5) — $22.00 — MEDICATION — requiere receta
- Salbutamol inhalador — $9.50 — MEDICATION — requiere receta
- Omeprazol 20mg (caja 28) — $4.00 — MEDICATION
- Loratadina 10mg (caja 10) — $2.20 — MEDICATION
- Vitamina C 1g (caja 30) — $3.50 — NUTRITION
- Complejo B (caja 30) — $4.50 — NUTRITION
- Suero oral (1L) — $2.50 — SUPPLY
- Algodón (200g) — $1.50 — SUPPLY
- Nebulizador portátil — $42.00 — DEVICE
- Pulse oxímetro — $18.00 — DEVICE

### 2.4 Usuarios de prueba (15 nuevos pacientes)

| Nombre | Email | Teléfono | Nivel | Propósito |
|--------|-------|----------|-------|-----------|
| Carlos Rodríguez | carlos@test.com | +584141111111 | 1 | Usuario nuevo, sin historial |
| Ana Martínez | ana@test.com | +584141111112 | 2 | Usuario con 2 pagos previos |
| Luis Hernández | luis@test.com | +584141111113 | 1 | Paciente crónico (hipertensión) |
| Patricia Gómez | patricia@test.com | +584141111114 | 3 | Usuario premium, muchos pagos |
| José Torres | jose@test.com | +584141111115 | 1 | Solo cuidado mayor |
| Carmen Díaz | carmen@test.com | +584141111116 | 2 | Madre con hijos (pediatría) |
| Roberto Silva | roberto@test.com | +584141111117 | 1 | Adulto mayor, cuidado domiciliario |
| Elena Vega | elena@test.com | +584141111118 | 2 | Suscripción farmacia activa |
| Fernando Cruz | fernando@test.com | +584141111119 | 1 | Sin actividad |
| Daniela Ramos | daniela@test.com | +584141111120 | 2 | Laboratorios frecuentes |
| Miguel Ángel | miguel@test.com | +584141111121 | 1 | Dental |
| Sofía Castro | sofia@test.com | +584141111122 | 3 | Alta frecuencia, nivel máximo |
| Ricardo Mora | ricardo@test.com | +584141111123 | 1 | Óptica |
| Laura Pinto | laura@test.com | +584141111124 | 2 | Cardiología |
| Andrés Soto | andres@test.com | +584141111125 | 1 | Nuevo, primera compra |

Todos con password: `12345678`

---

## Fase 3: Backend — Queries y Endpoints

### 3.1 Queries sqlc (catalog.sql)

```sql
-- name: GetServicesByMerchant :many
SELECT * FROM medical_services WHERE merchant_id = $1 AND is_active = true ORDER BY category, name;

-- name: GetSuppliesByMerchant :many
SELECT * FROM medical_supplies WHERE merchant_id = $1 AND is_active = true ORDER BY category, name;

-- name: GetServiceByID :one
SELECT * FROM medical_services WHERE id = $1;

-- name: GetSupplyByID :one
SELECT * FROM medical_supplies WHERE id = $1;

-- name: SearchServices :many
SELECT s.*, m.trade_name AS merchant_name
FROM medical_services s
JOIN merchants m ON s.merchant_id = m.id
WHERE s.is_active = true AND m.is_active = true
AND ($1::text IS NULL OR s.category = $1)
AND ($2::text IS NULL OR s.name ILIKE '%' || $2 || '%')
ORDER BY s.price_usd ASC;

-- name: SearchSupplies :many
SELECT s.*, m.trade_name AS merchant_name
FROM medical_supplies s
JOIN merchants m ON s.merchant_id = m.id
WHERE s.is_active = true AND m.is_active = true
AND ($1::text IS NULL OR s.category = $1)
AND ($2::text IS NULL OR s.name ILIKE '%' || $2 || '%')
ORDER BY s.price_usd ASC;

-- name: CreateTransactionItem :one
INSERT INTO transaction_items (transaction_id, service_id, supply_id, item_name, quantity, unit_price_usd)
VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;

-- name: GetTransactionItems :many
SELECT * FROM transaction_items WHERE transaction_id = $1;

-- name: DecrementSupplyStock :exec
UPDATE medical_supplies SET stock = stock - $2 WHERE id = $1 AND stock >= $2;
```

### 3.2 Endpoints nuevos (patient handler)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/patient/merchants` | Lista comercios activos por categoría |
| GET | `/patient/merchants/{id}/services` | Catálogo de servicios del comercio |
| GET | `/patient/merchants/{id}/supplies` | Catálogo de insumos del comercio |
| GET | `/patient/catalog/services?category=&search=` | Buscar servicios globalmente |
| GET | `/patient/catalog/supplies?category=&search=` | Buscar insumos globalmente |
| POST | `/patient/transactions/checkout` | Comprar item del catálogo (servicio o insumo) |

### 3.3 Flujo `POST /patient/transactions/checkout`

```json
// Request
{
  "merchantId": "uuid",
  "items": [
    { "type": "SERVICE", "id": "uuid", "quantity": 1 },
    { "type": "SUPPLY", "id": "uuid", "quantity": 2 }
  ],
  "requestedInstallments": 3,
  "creditLineType": "ESPECIALIDAD_PRINCIPAL"
}

// Response
{
  "transactionId": "uuid",
  "status": "APPROVED",
  "totalAmount": 95.00,
  "downPayment": 38.00,
  "financedAmount": 57.00,
  "installments": [...],
  "items": [...],
  "amountVES": 68527.83,
  "bcvRate": 721.35
}
```

Lógica:
1. Validar que todos los items existen y están activos
2. Calcular total = sum(precio * cantidad)
3. Validar crédito disponible en la línea seleccionada
4. Crear transacción + installments + transaction_items
5. Decrementar stock de insumos
6. Actualizar línea de crédito
7. Retornar con VES equivalente

---

## Fase 4: Frontend — Páginas Nuevas

### 4.1 `/comercios` — Directorio de comercios

- Grid de comercios agrupados por categoría
- Filtros: CLINIC, LABORATORY, PHARMACY, DENTAL, OPTICS, HOME_CARE
- Cada card muestra: nombre, categoría, ciudad, botón "Ver catálogo"

### 4.2 `/comercios/[id]` — Catálogo del comercio

- Tabs: "Servicios" | "Insumos"
- Lista de items con: nombre, descripción, precio (USD + VES), botón "Financiar"
- Al hacer click en "Financiar" → modal con preview de cuotas
- Confirmar → llama a `/patient/transactions/checkout`

### 4.3 `/catalogo` — Búsqueda global

- Buscador de servicios e insumos
- Filtros por categoría
- Resultados muestran: item, comercio, precio, botón "Financiar"

### 4.4 Modificación `/pagar`

- Mantener escáner QR para pago en comercio físico
- Añadir botón "Explorar catálogo" que lleva a `/comercios`

---

## Fase 5: Flujo de Pruebas Completo

### 5.1 Setup
1. Ejecutar migración V11
2. Ejecutar seed data (comercios, catálogo, usuarios)
3. Verificar que cada usuario tiene 3 líneas de crédito

### 5.2 Pruebas por escenario

**Escenario A: Compra de servicio (consulta)**
1. Login como carlos@test.com
2. Ir a /comercios → Clínica Santa María
3. Seleccionar "Consulta Cardiología" $50
4. Financiar a 3 cuotas
5. Verificar: down payment $20 (40%), 3 cuotas de $10 cada 15 días
6. Verificar línea ESPECIALIDAD_PRINCIPAL: usado $30, disponible $470

**Escenario B: Compra de insumos (medicinas)**
1. Login como luis@test.com (crónico)
2. Ir a /comercios → Farmacia Salud Total
3. Seleccionar Losartán $4.50 x 2 + Metformina $5.20 x 1 = $14.20
4. Financiar a 3 cuotas usando SALUD_COTIDIANA
5. Verificar: down payment $5.68, 3 cuotas de $2.84
6. Verificar stock decrementado

**Escenario C: Suscripción de farmacia (crónico)**
1. Login como elena@test.com
2. Ir a /suscripciones → Crear suscripción
3. Seleccionar medicinas recurrentes (Insulina + Metformina)
4. Confirmar suscripción mensual $27.20
5. Verificar next_billing_date = +30 días

**Escenario D: Cuidado de adulto mayor**
1. Login como roberto@test.com
2. Ir a /cuidado-mayor
3. Seleccionar CuidadoDomicilio → "Cuidado de adulto mayor (8h)" $70
4. Financiar con línea MAYOR_CUIDADO
5. Verificar suscripción creada

**Escenario E: Pago de cuota con tarjeta**
1. Login como ana@test.com (tiene cuotas pendientes)
2. Ir a /cuotas → seleccionar cuota
3. Ingresar tarjeta Visa 4111111111111111
4. Confirmar pago
5. Verificar: cuota PAID, puntos sumados, gatewayTransactionId

**Escenario F: Pago rechazado**
1. Mismo flujo pero con fullName="REJECTED"
2. Verificar error 402 y cuota sigue PENDING

**Escenario G: Búsqueda global**
1. Buscar "cardiología" en /catalogo
2. Verificar resultados de CardioVital + Clínica Santa María
3. Buscar "losartán" → verificar Farmacia Salud Total

---

## Fase 6: Tutoriales

### Tutorial 1: Cómo registrarse y obtener crédito

1. Descargar la app o ir al sitio web
2. Click en "Registrarse"
3. Completar: nombre, apellido, email, teléfono, cédula, contraseña
4. Al registrarse, recibes automáticamente 3 líneas de crédito:
   - Especialidad Principal: $500 (consultas, exámenes, procedimientos)
   - Salud Cotidiana: $200 (medicinas, insumos)
   - Cuidado Mayor: $0 (se activa al suscribir servicios para adultos mayores)
5. Tu nivel inicial es 1 (40% de inicial)

### Tutorial 2: Cómo financiar una consulta

1. Inicia sesión
2. Ve a "Comercios" en el menú
3. Filtra por "Clínicas" o busca por nombre
4. Selecciona la clínica
5. En la pestaña "Servicios", encuentra la consulta que necesitas
6. Click en "Financiar"
7. Revisa el resumen: monto total, inicial, cuotas
8. Selecciona número de cuotas (3, 6, 9, 12)
9. Confirma la compra
10. Tu línea de crédito se actualiza inmediatamente
11. Ve a "Cuotas" para ver tus próximas fechas de pago

### Tutorial 3: Cómo pagar una cuota

1. Ve a "Cuotas"
2. Selecciona la cuota a pagar
3. Verás el monto en USD y su equivalente en Bs. (tasa BCV del día)
4. Ingresa los datos de tu tarjeta:
   - Número de tarjeta
   - Nombre del titular
   - Fecha de vencimiento (mes/año)
   - CVV
5. Click en "Confirmar Pago"
6. Revisa el modal de confirmación
7. Click en "Sí, pagar"
8. ¡Listo! Tu cuota está pagada y ganaste 10 puntos

### Tutorial 4: Cómo suscribirse a medicinas (paciente crónico)

1. Ve a "Suscripciones"
2. Click en "Nueva suscripción"
3. Selecciona una farmacia aliada
4. Elige las medicinas que necesitas mensualmente
5. Selecciona la cantidad de cada una
6. Revisa el total mensual
7. Confirma la suscripción
8. Cada 30 días se renueva automáticamente
9. Puedes cancelar cuando quieras desde "Suscripciones"

### Tutorial 5: Cómo usar el triaje

1. Ve a "Triaje" en el menú
2. Describe tus síntomas en el campo de texto
3. Indica la severidad percibida (1-10)
4. Envía el triaje
5. El sistema asigna una prioridad automática:
   - 1-2: Baja
   - 3-4: Media
   - 5-7: Alta
   - 8-10: Emergencia
6. Verás comercios recomendados según tu ubicación
7. Puedes financiar una consulta directamente desde ahí

### Tutorial 6: Cómo contratar cuidado para adultos mayores

1. Ve a "Cuidado Mayor"
2. Selecciona el tipo de servicio:
   - Enfermería domiciliaria
   - Cuidado de adulto mayor
   - Fisioterapia
   - Administración de medicamentos
3. Selecciona el comercio (ej: CuidadoDomicilio)
4. Revisa el precio mensual
5. Confirma la suscripción
6. El servicio se activa y se factura mensualmente
7. Puedes cancelar desde "Cuidado Mayor"

---

## Orden de Implementación

1. **Migración V11** — crear tablas medical_services, medical_supplies, transaction_items, subscription_items
2. **Seed data** — insertar 10 comercios, ~60 servicios, ~30 insumos, 15 usuarios
3. **Queries sqlc** — catalog.sql con todas las queries
4. **Backend handlers** — endpoints de catálogo + checkout
5. **Frontend** — páginas /comercios, /comercios/[id], /catalogo
6. **Pruebas** — ejecutar los 7 escenarios
7. **Tutoriales** — verificar que cada tutorial funciona end-to-end
