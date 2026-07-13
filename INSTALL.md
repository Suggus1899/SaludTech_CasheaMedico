# SaludTech — Manual de Instalación y Configuración del Servidor

## Índice

1. [Requisitos previos](#1-requisitos-previos)
2. [Clonar el repositorio](#2-clonar-el-repositorio)
3. [Configurar PostgreSQL](#3-configurar-postgresql)
4. [Esquema de base de datos](#4-esquema-de-base-de-datos)
5. [Variables de entorno](#5-variables-de-entorno)
6. [Backend (Go)](#6-backend-go)
7. [Frontend (Next.js monorepo)](#7-frontend-nextjs-monorepo)
8. [Servicios externos](#8-servicios-externos)
9. [Usuarios y roles](#9-usuarios-y-roles)
10. [Referencia de endpoints API](#10-referencia-de-endpoints-api)
11. [Cron job — Installment Scanner](#11-cron-job--installment-scanner)
12. [Verificación end-to-end](#12-verificación-end-to-end)
13. [Despliegue en producción](#13-despliegue-en-producción)
14. [Backup y restore](#14-backup-y-restore)
15. [Solución de problemas](#15-solución-de-problemas)
16. [Resumen de puertos](#16-resumen-de-puertos)

---

## 1. Requisitos previos

| Herramienta | Versión mínima | Verificar |
|-------------|---------------|-----------|
| Go | 1.26+ | `go version` |
| Node.js | 20+ | `node --version` |
| pnpm | 9.12+ | `pnpm --version` |
| PostgreSQL | 15+ | `psql --version` |
| sqlc | 1.31+ | `sqlc version` |
| Git | 2.40+ | `git --version` |
| curl | cualquier | `curl --version` |

### Instalación de herramientas

**Go** (https://go.dev/dl/):
```bash
# Linux
wget https://go.dev/dl/go1.26.4.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.26.4.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
```

**Node.js + pnpm**:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
npm install -g pnpm@9.12.0
```

**PostgreSQL**:
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Windows: descargar desde https://www.postgresql.org/download/windows/
```

**sqlc** (solo si vas a modificar queries SQL):
```bash
go install github.com/sqlc-dev/sqlc/cmd/sqlc@v1.31.1
```

---

## 2. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/SaludTech_CasheaMedico.git
cd SaludTech_CasheaMedico
```

### Estructura del monorepo

```
SaludTech_CasheaMedico/
├── backend-go/              # API REST en Go (chi + sqlc + pgx)
│   ├── cmd/api/             # Entry point (main.go)
│   ├── internal/
│   │   ├── admin/           # Handlers admin (RBAC)
│   │   ├── auth/            # JWT auth, login, register
│   │   ├── bcv/             # Cliente DolarVZLA (BCV + USDT)
│   │   ├── config/          # Carga de .env
│   │   ├── database/        # Código generado por sqlc
│   │   ├── fakepay/         # Cliente FakePay (pagos de prueba)
│   │   ├── merchant/        # Handlers merchant
│   │   ├── patient/         # Handlers patient + bnpl.go + health_handler.go
│   │   ├── payment/         # Handler legacy de pagos
│   │   ├── user/            # Handlers user (profile, password)
│   │   └── worker/          # Cron job (installment scanner)
│   ├── sql/
│   │   ├── schema/          # Migraciones V1..V14 + seed
│   │   └── queries/         # Queries sqlc (*.sql)
│   ├── go.mod
│   └── sqlc.yaml
├── apps/
│   ├── web-admin/           # Panel admin     (puerto 3001)
│   ├── web-merchant/        # Panel comercio  (puerto 3002)
│   ├── web-patient/         # App paciente    (puerto 3000)
│   └── web-landing/         # Landing page    (puerto 3003)
├── packages/
│   └── ui/                  # Componentes compartidos @saludtech/ui
├── .env                     # Variables del backend
├── .env.example             # Template de variables
├── turbo.json               # Config Turborepo
└── package.json             # Workspace pnpm
```

---

## 3. Configurar PostgreSQL

### 3.1 Crear la base de datos y usuario

```bash
sudo -u postgres psql
```

```sql
-- Crear usuario
CREATE USER saludtech_user WITH ENCRYPTED PASSWORD 'TU_PASSWORD';

-- Crear base de datos
CREATE DATABASE saludtech OWNER saludtech_user;

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE saludtech TO saludtech_user;

-- Conectar a la DB y dar permisos sobre el schema public
\c saludtech
GRANT ALL ON SCHEMA public TO saludtech_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO saludtech_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO saludtech_user;

\q
```

### 3.2 Verificar conexión

```bash
psql -h localhost -U saludtech_user -d saludtech -c "SELECT version();"
```

### 3.3 Migraciones (automáticas)

Las migraciones se ejecutan **automáticamente** al arrancar el backend. El proceso:

1. Crea tabla `schema_migrations` si no existe
2. Lee todos los archivos `V*.sql` de `sql/schema/`
3. Los ordena por número de versión (V1, V2, ... V14)
4. Ejecuta los que no estén registrados en `schema_migrations`
5. Cada migración corre dentro de una transacción

**No necesitas correr migraciones manualmente.** Si quieres hacerlo (solo para debugging):

```bash
cd backend-go
for f in sql/schema/V*.sql; do
  echo "Applying $f..."
  psql -h localhost -U saludtech_user -d saludtech -f "$f"
done
```

### 3.4 Archivos de migración

| Archivo | Descripción |
|---------|------------|
| `V1__initial_schema.sql` | Schema base: users, merchants, credit_lines, transactions, installments, payments, enums, triggers |
| `V2__seed_data.sql` | Admin user + 5 comercios seed |
| `V3__remove_kyc.sql` | Elimina tabla KYC |
| `V4__add_phone_verified.sql` | Campo `is_phone_verified` |
| `V5__add_gamification_and_freeze.sql` | Gamificación (points, level) + `is_credit_frozen_for_electives` |
| `V6__sync_enums_and_new_tables.sql` | Renombra tipos de líneas, crea `subscriptions` y `elder_care_subscriptions` |
| `V7__cleanup_dead_types.sql` | Limpia tipos obsoletos |
| `V9__data_integrity.sql` | Constraints CHECK, `blocked_at` en credit_lines |
| `V10__add_triage.sql` | Tabla `triage` |
| `V11__medical_catalog.sql` | Catálogo médico (`medical_services`, `medical_supplies`) |
| `V12__seed_catalog.sql` | Seed: 5 comercios nuevos + servicios + insumos |
| `V13__health_features.sql` | `health_profiles`, `medical_records`, `appointments`, `medication_reminders`, `family_members` |
| `V14__qr_tokens.sql` | Tabla `qr_tokens` para merchant |

### 3.5 Verificar tablas creadas

```sql
\dt
-- Debes ver ~20 tablas:
-- users, merchants, credit_lines, transactions, installments,
-- payments, subscriptions, elder_care_subscriptions, triage,
-- medical_services, medical_supplies, qr_tokens,
-- health_profiles, medical_records, appointments,
-- medication_reminders, family_members, schema_migrations
```

### 3.6 Reset completo (CUIDADO: borra todo)

```bash
psql -h localhost -U postgres -d saludtech -c "
  DROP SCHEMA public CASCADE;
  CREATE SCHEMA public;
  GRANT ALL ON SCHEMA public TO saludtech_user;
"
```

Al reiniciar el backend, todas las migraciones se re-aplican desde cero.

---

## 4. Esquema de base de datos

### Tablas principales y relaciones

```
users (PK: id)
├── credit_lines (FK: user_id)
│   └── transactions (FK: credit_line_id, user_id, merchant_id)
│       └── installments (FK: transaction_id, user_id)
│           └── payments (FK: installment_id, user_id)
├── subscriptions (FK: user_id, merchant_id, credit_line_id)
├── elder_care_subscriptions (FK: user_id, merchant_id, credit_line_id)
├── triage (FK: user_id)
├── health_profiles (FK: user_id)
├── medical_records (FK: user_id, transaction_id, merchant_id)
├── appointments (FK: user_id, merchant_id)
├── medication_reminders (FK: user_id)
└── family_members (FK: caregiver_id → users.id)

merchants (PK: id)
├── medical_services (FK: merchant_id)
├── medical_supplies (FK: merchant_id)
├── qr_tokens (FK: merchant_id)
└── transactions (FK: merchant_id)
```

### Enums (VARCHAR con CHECK constraints)

| Columna | Valores |
|---------|---------|
| `users.role` | `PATIENT`, `MERCHANT`, `ADMIN` |
| `credit_lines.status` | `ACTIVE`, `PAUSED`, `BLOCKED` |
| `credit_lines.type` | `ESPECIALIDAD_PRINCIPAL`, `SALUD_COTIDIANA`, `MAYOR_CUIDADO` |
| `transactions.status` | `PENDING_PAYMENT`, `ACTIVE`, `COMPLETED`, `CANCELLED`, `REFUNDED` |
| `installments.status` | `PENDING`, `PAID`, `OVERDUE`, `WAIVED` |
| `triage.priority` | `LOW`, `MEDIUM`, `HIGH`, `EMERGENCY` |
| `triage.status` | `PENDING`, `RESPONDED`, `CLOSED` |

---

## 5. Variables de entorno

### 5.1 Backend — archivo `.env` (raíz del repo)

```bash
cp .env.example .env
```

Editar `.env`:

```env
# Puerto del backend (default 8081)
PORT=8081

# PostgreSQL connection string
DATABASE_URL=postgres://saludtech_user:TU_PASSWORD@localhost:5432/saludtech?sslmode=disable

# JWT secret — generar con: openssl rand -hex 32
SALUDTECH_JWT_SECRET=REDACTED

# QR token signing secret
SALUDTECH_QR_SECRET=REDACTED

# CORS — comma-separated list of allowed origins
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003

# DolarVZLA API key (BCV CDN is free; USDT endpoints need a key)
DOLARVZLA_KEY=tu-api-key-de-dolarvzla

# FakePay test payment gateway
FAKEPAY_API_KEY=tu-api-key-de-fakepay
```

### 5.2 Frontend — `.env.local` por cada app

Cada app en `apps/` necesita su propio `.env.local`:

```bash
# apps/web-patient/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8081/api/v1

# apps/web-admin/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8081/api/v1

# apps/web-merchant/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8081/api/v1

# apps/web-landing/.env.local (no requiere API)
```

### 5.3 Generar secrets seguros

```bash
# JWT secret
openssl rand -hex 32

# QR secret
openssl rand -hex 32
```

### 5.4 Tabla de variables

| Variable | Requerida | Default | Descripción |
|----------|-----------|---------|-------------|
| `PORT` | No | `8081` | Puerto del backend |
| `DATABASE_URL` | **Sí** | — | URL de conexión PostgreSQL |
| `SALUDTECH_JWT_SECRET` | **Sí** | — | Secret para firmar JWT (min 32 chars) |
| `SALUDTECH_QR_SECRET` | **Sí** | — | Secret para firmar QR tokens |
| `CORS_ALLOWED_ORIGINS` | No | `http://localhost:3000,...` | Origins permitidos para CORS |
| `DOLARVZLA_KEY` | No | — | API key DolarVZLA (USDT; BCV es gratis) |
| `FAKEPAY_API_KEY` | No | — | API key FakePay (pagos de prueba) |

---

## 6. Backend (Go)

### 6.1 Instalar dependencias

```bash
cd backend-go
go mod download
```

### 6.2 Regenerar código sqlc (solo si modificaste queries)

Si cambias algo en `sql/queries/*.sql`, debes regenerar:

```bash
cd backend-go
sqlc generate
go build ./...
```

### 6.3 Compilar

```bash
cd backend-go
go build ./...
```

### 6.4 Ejecutar en desarrollo

```bash
cd backend-go
go run ./cmd/api/
```

Output esperado:

```
⏱️  Installment Scanner Cron Job started
🚀 SaludTech API running on http://localhost:8081
```

### 6.5 Build binario para producción

```bash
cd backend-go
CGO_ENABLED=0 go build -ldflags="-s -w" -o bin/saludtech-api ./cmd/api/
./bin/saludtech-api
```

### 6.6 Health check

```bash
curl http://localhost:8081/health
# {"status":"ok"}
```

---

## 7. Frontend (Next.js monorepo)

### 7.1 Instalar dependencias

```bash
# Desde la raíz del repo
pnpm install
```

### 7.2 Ejecutar todos los apps en desarrollo

```bash
pnpm dev
```

| App | URL | Puerto |
|-----|-----|--------|
| web-patient | http://localhost:3000 | 3000 |
| web-admin | http://localhost:3001 | 3001 |
| web-merchant | http://localhost:3002 | 3002 |
| web-landing | http://localhost:3003 | 3003 |

### 7.3 Ejecutar un solo app

```bash
cd apps/web-patient
pnpm dev
```

### 7.4 Build para producción

```bash
# Todos
pnpm build

# Uno solo
cd apps/web-admin
pnpm build
pnpm start
```

### 7.5 Lint

```bash
pnpm lint
```

---

## 8. Servicios externos

### 8.1 DolarVZLA (BCV + USDT)

- **BCV (gratis)**: El endpoint CDN `https://rates.dolarvzla.com/bcv/current.json` no requiere API key.
- **USDT (requiere key)**: Obtener API key en https://dolarvzla.com
- **Configuración**: Setear `DOLARVZLA_KEY` en `.env`
- **Endpoints**: `GET /api/v1/patient/bcv-rate` y `GET /api/v1/patient/usdt-rate`
- **Uso interno**: El backend consulta BCV en cada preview de transacción y pago para mostrar montos en VES.

### 8.2 FakePay (pagos de prueba)

- **URL**: https://fakepayment.onrender.com
- **Obtener key**: Registrarse en la plataforma
- **Configuración**: Setear `FAKEPAY_API_KEY` en `.env`
- **Tarjetas de prueba**:
  - Visa: `4111111111111111`
  - Mastercard: `5555555555554444`
  - Amex: `378282246310005`
  - Discover: `6011111111111117`
- **Nota**: FakePay en Render tiene cold start (~30s). Si el primer pago falla con EOF, reintenta.

---

## 9. Usuarios y roles

### 9.1 Usuario admin por defecto (seed)

La migración `V2__seed_data.sql` crea un usuario admin:

| Campo | Valor |
|-------|-------|
| Email | `admin@saludtech.com` |
| Password | `admin123` |
| Rol | `ADMIN` |
| Phone | `+584121234567` |

**Importante**: Cambiar esta contraseña inmediatamente después del primer login en producción.

### 9.2 Roles

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| `PATIENT` | Usuario paciente | `/api/v1/patient/*`, `/api/v1/users/*` |
| `MERCHANT` | Comercio | `/api/v1/merchant/*`, `/api/v1/users/*` |
| `ADMIN` | Administrador | `/api/v1/admin/*`, `/api/v1/merchant/*`, `/api/v1/users/*` |

### 9.3 Crear un usuario patient

Vía API:

```bash
curl -X POST http://localhost:8081/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Juan","lastName":"Pérez","email":"juan@test.com","phone":"+54123456789","identityDocument":"V-12345678","password":"Test1234!"}'
```

El registro automáticamente crea 3 líneas de crédito:
- ESPECIALIDAD_PRINCIPAL: $500
- SALUD_COTIDIANA: $200
- MAYOR_CUIDADO: $0 (inactiva hasta que admin la active)

### 9.4 Crear un usuario merchant

No hay registro público para merchants. El flujo es:

1. Registrar un usuario patient normal (ver 9.3)
2. Como admin, cambiar el rol a MERCHANT:

```bash
# Login como admin
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@saludtech.com","password":"admin123"}'

# Cambiar rol
curl -X PATCH http://localhost:8081/api/v1/admin/users/{USER_ID}/role \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"role":"MERCHANT"}'
```

3. Crear el merchant en la base de datos (no hay endpoint para esto aún):

```sql
INSERT INTO merchants (legal_name, trade_name, rif, category, address, city, phone, email, contact_name, mdr_rate, is_active)
VALUES ('Mi Farmacia C.A.', 'Mi Farmacia', 'J-99999999-9', 'PHARMACY', 'Av. Principal', 'Caracas', '+582125554444', 'mi@farmacia.com', 'Juan Pérez', 0.05, true);
```

4. Asociar el usuario al merchant:

```sql
-- El merchant handler usa GetMerchantByUserID, que busca por email
-- Asegúrate de que el email del merchant coincida con el del usuario
```

### 9.5 Comercios seed (V2 + V12)

La migración seed crea los siguientes comercios:

| Comercio | Categoría | Ciudad | Activo |
|----------|-----------|--------|--------|
| Clínica Santa María | CLINIC | Caracas | Sí |
| Farmacia Salud Total | PHARMACY | Valencia | Sí |
| Óptica Visión Clara | OPTICS | Maracaibo | Sí |
| Centro Dental Sonrisa | DENTAL | Barquisimeto | Sí |
| Laboratorio BioSalud | LABORATORY | Caracas | Sí |
| Centro Médico La Paz | CLINIC (GENERAL) | Maracay | Sí |
| Laboratorio Corposalud | LABORATORY (CLINICAL) | Valencia | Sí |
| Farmatodo El Hatillo | PHARMACY (RETAIL) | Caracas | Sí |
| CardioVital | CLINIC (CARDIOLOGY) | Caracas | Sí |
| CuidadoDomicilio | ELDER_CARE (HOME_CARE) | Caracas | Sí |

---

## 10. Referencia de endpoints API

Base URL: `http://localhost:8081/api/v1`

### Auth (público)

| Método | Path | Descripción |
|--------|------|-------------|
| POST | `/auth/login` | Login (email/phone + password) |
| POST | `/auth/register` | Registro patient (crea 3 líneas de crédito) |

### User (autenticado)

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/users/profile` | Perfil del usuario autenticado |
| PATCH | `/users/password` | Cambiar contraseña |

### Patient (autenticado)

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/patient/credit-lines` | Ver líneas de crédito |
| GET | `/patient/transactions/my/installments/pending` | Cuotas pendientes |
| POST | `/patient/transactions/preview` | Preview transacción (down payment + cuotas) |
| POST | `/patient/transactions` | Crear transacción |
| POST | `/patient/transactions/checkout` | Checkout multi-item |
| GET | `/patient/installments/{id}` | Detalle de cuota |
| POST | `/patient/payments` | Pagar cuota (FakePay) |
| GET | `/patient/subscriptions` | Listar suscripciones |
| POST | `/patient/subscriptions` | Crear suscripción |
| DELETE | `/patient/subscriptions/{id}` | Cancelar suscripción |
| GET | `/patient/elder-care/subscriptions` | Listar cuidado mayor |
| POST | `/patient/elder-care/subscriptions` | Crear cuidado mayor |
| DELETE | `/patient/elder-care/subscriptions/{id}` | Cancelar cuidado mayor |
| GET | `/patient/triage` | Listar triajes |
| POST | `/patient/triage` | Crear triaje |
| GET | `/patient/triage/{id}/recommended-merchants` | Comercios recomendados |
| GET | `/patient/bcv-rate` | Precio dólar BCV |
| GET | `/patient/usdt-rate` | Precio USDT |
| GET | `/patient/merchants` | Lista comercios |
| GET | `/patient/merchants/{id}/services` | Servicios del comercio |
| GET | `/patient/merchants/{id}/supplies` | Insumos del comercio |
| GET | `/patient/catalog/services` | Buscar servicios |
| GET | `/patient/catalog/supplies` | Buscar insumos |
| GET | `/patient/health-profile` | Perfil de salud |
| PUT | `/patient/health-profile` | Upsert perfil de salud |
| GET | `/patient/medical-records` | Historial médico |
| POST | `/patient/medical-records` | Crear registro médico |
| DELETE | `/patient/medical-records/{id}` | Eliminar registro médico |
| GET | `/patient/appointments` | Listar citas |
| POST | `/patient/appointments` | Crear cita |
| DELETE | `/patient/appointments/{id}` | Cancelar cita |
| GET | `/patient/medication-reminders` | Recordatorios |
| POST | `/patient/medication-reminders` | Crear recordatorio |
| DELETE | `/patient/medication-reminders/{id}` | Eliminar recordatorio |
| GET | `/patient/family-members` | Familiares |
| GET | `/patient/caregivers` | Cuidadores |
| POST | `/patient/family-members` | Invitar familiar |
| PATCH | `/patient/family-members/{id}` | Responder invitación |
| DELETE | `/patient/family-members/{id}` | Eliminar familiar |

### Merchant (MERCHANT + ADMIN)

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/merchant/profile` | Perfil del comercio |
| GET | `/merchant/dashboard` | Stats del dashboard |
| GET | `/merchant/transactions` | Transacciones del comercio |
| GET | `/merchant/payouts` | Liquidaciones |
| GET | `/merchant/services` | Listar servicios |
| POST | `/merchant/services` | Crear servicio |
| PUT | `/merchant/services/{id}` | Actualizar servicio |
| DELETE | `/merchant/services/{id}` | Eliminar servicio |
| GET | `/merchant/supplies` | Listar insumos |
| POST | `/merchant/supplies` | Crear insumo |
| PUT | `/merchant/supplies/{id}` | Actualizar insumo |
| DELETE | `/merchant/supplies/{id}` | Eliminar insumo |
| POST | `/merchant/qr/generate` | Generar QR token |
| GET | `/merchant/qr/{token}/status` | Estado del QR |
| GET | `/merchant/elder-care/subscriptions` | Suscripciones de cuidado mayor |

### Admin (ADMIN only)

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/admin/dashboard` | Stats globales |
| GET | `/admin/users` | Listar usuarios |
| GET | `/admin/users/{id}` | Detalle usuario |
| PATCH | `/admin/users/{id}/status` | Activar/desactivar usuario |
| PATCH | `/admin/users/{id}/role` | Cambiar rol |
| GET | `/admin/merchants` | Listar comercios |
| PATCH | `/admin/merchants/{id}/status` | Aprobar/desactivar comercio |
| GET | `/admin/credit-lines` | Listar líneas de crédito |
| PATCH | `/admin/credit-lines/{id}/limit` | Ajustar límite de crédito |
| GET | `/admin/triage/pending` | Triajes pendientes |
| PUT | `/admin/triage/{id}/respond` | Responder triaje |
| GET | `/admin/subscriptions/all` | Todas las suscripciones |
| GET | `/admin/elder-care` | Todas suscripciones cuidado mayor |

---

## 11. Cron job — Installment Scanner

El backend incluye un cron job que corre automáticamente al arrancar.

### Qué hace

1. **Horario**: `@daily` (todos los días a las 00:00)
2. Busca cuotas con `status = 'PENDING'` y `due_date < CURRENT_DATE - 2 días` (grace period de 2 días)
3. Las marca como `OVERDUE` + cargo de $4 (reactivation fee)
4. Pausa TODAS las líneas de crédito del usuario (excepto SALUD_COTIDIANA)
5. Usa `pg_try_advisory_xact_lock` para evitar que múltiples instancias corran simultáneamente

### Logs esperados

```
Running Installment Scanner...
Processed overdue installment <UUID> for user <UUID>
Installment Scanner completed successfully.
```

### Si necesitas ejecutarlo manualmente

No hay endpoint para dispararlo manualmente. Para testing, puedes simular mora en la DB:

```sql
-- Marcar una cuota como overdue
UPDATE installments
SET status = 'OVERDUE', reactivation_fee = 4.00, days_overdue = 5
WHERE id = '<INSTALLMENT_ID>';

-- Pausar líneas del usuario
UPDATE credit_lines
SET status = 'PAUSED', paused_at = NOW()
WHERE user_id = '<USER_ID>' AND type != 'SALUD_COTIDIANA';
```

Al pagar la última cuota OVERDUE, el endpoint `POST /patient/payments` reactiva las líneas automáticamente.

---

## 12. Verificación end-to-end

### 12.1 Login como admin

```bash
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@saludtech.com","password":"admin123"}'
```

### 12.2 Registrar un patient

```bash
curl -X POST http://localhost:8081/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@test.com","phone":"+54123456789","identityDocument":"V-12345678","password":"Test1234!"}'
```

### 12.3 Verificar líneas de crédito

```bash
TOKEN="<token_del_registro>"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8081/api/v1/patient/credit-lines
```

Debes ver 3 líneas: ESPECIALIDAD_PRINCIPAL ($500), SALUD_COTIDIANA ($200), MAYOR_CUIDADO ($0).

### 12.4 Verificar BCV

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8081/api/v1/patient/bcv-rate
```

### 12.5 Preview + crear transacción + pagar

```bash
# Preview
curl -X POST http://localhost:8081/api/v1/patient/transactions/preview \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"merchantId":"a1b2c3d4-1111-4111-8111-111111111101","amount":100,"requestedInstallments":3,"creditLineType":"ESPECIALIDAD_PRINCIPAL"}'

# Crear transacción
curl -X POST http://localhost:8081/api/v1/patient/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"merchantId":"a1b2c3d4-1111-4111-8111-111111111101","amount":100,"requestedInstallments":3,"creditLineType":"ESPECIALIDAD_PRINCIPAL"}'

# Ver cuotas pendientes
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8081/api/v1/patient/transactions/my/installments/pending

# Pagar primera cuota (con tarjeta de prueba)
curl -X POST http://localhost:8081/api/v1/patient/payments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"installmentId":"<INSTALLMENT_ID>","method":"CARD","cardNumber":"4111111111111111","cvv":"123","expirationMonth":"12","expirationYear":"2030","fullName":"Test User"}'
```

### 12.6 Verificar que el crédito se liberó

Después de pagar una cuota de $13.33, el `available` de la línea debe aumentar en $13.33.

---

## 13. Despliegue en producción

### 13.1 Preparar el servidor

```bash
# Crear usuario del sistema
sudo useradd -r -m -d /opt/saludtech -s /bin/bash saludtech

# Crear directorios
sudo mkdir -p /opt/saludtech/backend-go/bin
sudo mkdir -p /opt/saludtech/logs
sudo chown -R saludtech:saludtech /opt/saludtech
```

### 13.2 Build del backend

```bash
cd backend-go
CGO_ENABLED=0 go build -ldflags="-s -w" -o bin/saludtech-api ./cmd/api/
sudo cp bin/saludtech-api /opt/saludtech/backend-go/bin/
sudo cp -r sql /opt/saludtech/backend-go/
```

### 13.3 Archivo `.env` de producción

```bash
sudo nano /opt/saludtech/.env
```

```env
PORT=8081
DATABASE_URL=postgres://saludtech_user:PASSWORD_SEGURO@localhost:5432/saludtech?sslmode=require
SALUDTECH_JWT_SECRET=<openssl rand -hex 32>
SALUDTECH_QR_SECRET=<openssl rand -hex 32>
CORS_ALLOWED_ORIGINS=https://admin.saludtech.com,https://app.saludtech.com,https://comercios.saludtech.com
DOLARVZLA_KEY=tu-key-produccion
FAKEPAY_API_KEY=tu-key-fakepay
```

```bash
sudo chown saludtech:saludtech /opt/saludtech/.env
sudo chmod 600 /opt/saludtech/.env
```

### 13.4 Systemd service

```ini
# /etc/systemd/system/saludtech-api.service
[Unit]
Description=SaludTech API
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=saludtech
Group=saludtech
WorkingDirectory=/opt/saludtech/backend-go
EnvironmentFile=/opt/saludtech/.env
ExecStart=/opt/saludtech/backend-go/bin/saludtech-api
Restart=always
RestartSec=5
StandardOutput=append:/opt/saludtech/logs/api.log
StandardError=append:/opt/saludtech/logs/api-error.log

# Seguridad
NoNewPrivileges=true
ProtectSystem=strict
ReadWritePaths=/opt/saludtech
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable saludtech-api
sudo systemctl start saludtech-api
sudo systemctl status saludtech-api

# Ver logs
sudo journalctl -u saludtech-api -f
# o
tail -f /opt/saludtech/logs/api.log
```

### 13.5 Log rotation

```bash
sudo nano /etc/logrotate.d/saludtech
```

```
/opt/saludtech/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0644 saludtech saludtech
    postrotate
        systemctl reload saludtech-api
    endscript
}
```

### 13.6 Frontend (Vercel / Netlify / self-hosted)

```bash
# Build todos los apps
pnpm build

# O build individual
cd apps/web-patient && pnpm build
```

Setear `NEXT_PUBLIC_API_URL` al URL del backend en producción:

```
NEXT_PUBLIC_API_URL=https://api.saludtech.com/api/v1
```

### 13.7 Nginx reverse proxy

```nginx
# /etc/nginx/sites-available/saludtech-api
server {
    listen 80;
    server_name api.saludtech.com;

    location / {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/saludtech-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 13.8 SSL con Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.saludtech.com -d admin.saludtech.com -d app.saludtech.com -d comercios.saludtech.com
```

### 13.9 Firewall (UFW)

```bash
sudo ufw allow 22/tcp          # SSH
sudo ufw allow 80/tcp          # HTTP
sudo ufw allow 443/tcp         # HTTPS
sudo ufw enable
```

---

## 14. Backup y restore

### 14.1 Backup manual

```bash
# Backup completo
pg_dump -h localhost -U saludtech_user -d saludtech -F c -f /opt/backups/saludtech_$(date +%Y%m%d).dump

# Backup solo datos (sin schema)
pg_dump -h localhost -U saludtech_user -d saludtech --data-only -f /opt/backups/saludtech_data_$(date +%Y%m%d).sql
```

### 14.2 Backup automático (cron)

```bash
sudo nano /etc/cron.d/saludtech-backup
```

```
0 3 * * * saludtech pg_dump -h localhost -U saludtech_user -d saludtech -F c -f /opt/backups/saludtech_$(date +\%Y\%m\%d).dump && find /opt/backups -name "saludtech_*.dump" -mtime +30 -delete
```

### 14.3 Restore

```bash
# Restore completo
pg_restore -h localhost -U saludtech_user -d saludtech -c /opt/backups/saludtech_20260713.dump

# Restore desde SQL
psql -h localhost -U saludtech_user -d saludtech -f /opt/backups/saludtech_data_20260713.sql
```

---

## 15. Solución de problemas

### El backend no arranca: "Unable to connect to database"

```bash
sudo systemctl status postgresql
psql -h localhost -U saludtech_user -d saludtech -c "SELECT 1;"
cat /opt/saludtech/.env | grep DATABASE_URL
```

### "Migration error"

```bash
# Ver migraciones aplicadas
psql -h localhost -U saludtech_user -d saludtech -c "SELECT * FROM schema_migrations ORDER BY version;"

# Reset completo (CUIDADO)
psql -h localhost -U postgres -d saludtech -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO saludtech_user;"
```

### FakePay: "unexpected EOF"

FakePay en Render tiene cold start. Esperar 30s y reintentar.

### BCV: "Failed to fetch BCV rate"

```bash
curl https://rates.dolarvzla.com/bcv/current.json
```

Si responde, el problema es de red del servidor. Si no, DolarVZLA está caído (el backend sigue funcionando sin VES).

### USDT: "USDT API key not configured"

Setear `DOLARVZLA_KEY` en `.env`.

### Frontend: "Unauthorized" en todas las requests

Verificar `NEXT_PUBLIC_API_URL` y que el JWT no haya expirado.

### sqlc: "column not found" después de cambiar queries

```bash
cd backend-go
sqlc generate
go build ./...
```

### Puerto en uso

```bash
# Linux
sudo lsof -i :8081
sudo kill -9 <PID>

# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F
```

### "permission denied for schema public"

```sql
GRANT ALL ON SCHEMA public TO saludtech_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO saludtech_user;
```

---

## 16. Resumen de puertos

| Servicio | Puerto | URL |
|----------|--------|-----|
| Backend API | 8081 | http://localhost:8081 |
| web-patient | 3000 | http://localhost:3000 |
| web-admin | 3001 | http://localhost:3001 |
| web-merchant | 3002 | http://localhost:3002 |
| web-landing | 3003 | http://localhost:3003 |
| PostgreSQL | 5432 | localhost:5432 |
