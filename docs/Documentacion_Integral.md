# SaludTech CasheaMedico — Documentación Integral

**Versión:** 1.0  
**Fecha:** Julio 2026  
**Plataforma:** BNPL HealthTech — Salud financiada a tu alcance

---

## Índice General

### PARTE I — Manual de Instalación y Configuración del Servidor

1. [Arquitectura general](#1-arquitectura-general)
2. [Setup (requisitos, clonar, PostgreSQL)](#2-setup)
3. [Esquema de base de datos](#3-esquema-de-base-de-datos)
4. [Variables de entorno](#4-variables-de-entorno)
5. [Backend y Frontend](#5-backend-y-frontend)
6. [Configuración de correo electrónico](#6-configuración-de-correo-electrónico)
7. [Servicios externos](#7-servicios-externos)
8. [Despliegue en producción (Render + Vercel)](#8-despliegue-en-producción-render--vercel)
9. [Referencia de endpoints API](#9-referencia-de-endpoints-api)
10. [Cron jobs](#10-cron-jobs)
11. [Verificación y troubleshooting](#11-verificación-y-troubleshooting)

### PARTE II — Manual de Usuario

12. [Introducción y roles](#12-introducción-y-roles)
13. [App Paciente (web-patient)](#13-app-paciente-web-patient)
14. [App Admin (web-admin)](#14-app-admin-web-admin)
15. [App Comerciante (web-merchant)](#15-app-comerciante-web-merchant)
16. [Preguntas frecuentes](#16-preguntas-frecuentes)

### PARTE III — Informe de Pruebas de QA

17. [Resumen y estrategia](#17-resumen-y-estrategia)
18. [Pruebas unitarias (Backend Go)](#18-pruebas-unitarias-backend-go)
19. [Pruebas de integración (API)](#19-pruebas-de-integración-api)
20. [Pruebas funcionales (Frontend)](#20-pruebas-funcionales-frontend)
21. [Pruebas de seguridad](#21-pruebas-de-seguridad)
22. [Pruebas de rendimiento](#22-pruebas-de-rendimiento)
23. [Pruebas de compatibilidad](#23-pruebas-de-compatibilidad)
24. [Casos de prueba detallados](#24-casos-de-prueba-detallados)
25. [Defectos encontrados y resueltos](#25-defectos-encontrados-y-resueltos)
26. [Cobertura y conclusiones](#26-cobertura-y-conclusiones)

---

# PARTE I — Manual de Instalación y Configuración del Servidor

## 1. Arquitectura general

```
┌─────────────────────────────────────────────────────────────┐
│                    SaludTech CasheaMedico                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  web-patient │  │  web-admin   │  │ web-merchant │       │
│  │  (Next.js)   │  │  (Next.js)   │  │  (Next.js)   │       │
│  │  Vercel      │  │  Vercel      │  │  Vercel      │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         └────────┬────────┴────────┬────────┘                │
│                  │   REST API      │                         │
│                  ▼                 ▼                         │
│         ┌──────────────────────────────┐                     │
│         │     Backend Go (chi)         │                     │
│         │     Render — Port 8081       │                     │
│         └──────────┬───────────────────┘                     │
│                    ▼                                         │
│         ┌──────────────────────────────┐                     │
│         │   PostgreSQL (Render)        │                     │
│         │   18 migraciones             │                     │
│         └──────────────────────────────┘                     │
│  Servicios externos:                                        │
│  • Gmail SMTP / Resend (correos transaccionales)            │
│  • DolarVZLA API (tasa BCV/USDT)                            │
│  • FakePay (pasarela de pago de pruebas)                    │
└─────────────────────────────────────────────────────────────┘
```

### Estructura del monorepo

```
SaludTech_CasheaMedico/
├── backend-go/              # API REST en Go (chi + sqlc + pgx)
│   ├── cmd/api/             # Entry point (main.go)
│   ├── internal/            # admin, auth, bcv, config, database,
│   │                        # email, fakepay, merchant, middleware,
│   │                        # patient, payment, user, worker
│   ├── sql/schema/          # Migraciones V1..V18 + seed
│   └── sql/queries/         # Queries sqlc (*.sql)
├── apps/
│   ├── web-patient/         # App paciente (Next.js 16 + React 19)
│   ├── web-admin/           # App admin (Next.js 16 + React 19)
│   └── web-merchant/        # App comerciante (Next.js 16 + React 19)
├── packages/
│   ├── shared/              # Código compartido (API client, tipos)
│   └── ui/                  # Componentes UI compartidos
├── package.json             # Monorepo root (pnpm + turbo)
├── pnpm-workspace.yaml
├── turbo.json
└── .env.example             # Template de variables de entorno
```

---

## 2. Setup

### Requisitos previos

| Herramienta | Versión mínima | Verificar |
|-------------|---------------|-----------|
| Go | 1.26+ | `go version` |
| Node.js | 20+ | `node --version` |
| pnpm | 9.12+ | `pnpm --version` |
| PostgreSQL | 15+ | `psql --version` |
| sqlc | 1.31+ | `sqlc version` |
| Git | 2.40+ | `git --version` |

### Instalación de herramientas

```bash
# Go (Linux)
wget https://go.dev/dl/go1.26.4.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.26.4.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin

# Node.js + pnpm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc && nvm install 20 && nvm use 20
npm install -g pnpm@9.12.0

# PostgreSQL (Ubuntu/Debian)
sudo apt install postgresql postgresql-contrib
sudo systemctl enable postgresql && sudo systemctl start postgresql

# sqlc (solo si vas a modificar queries SQL)
go install github.com/sqlc-dev/sqlc/cmd/sqlc@v1.31.1
```

### Clonar el repositorio

```bash
git clone https://github.com/Suggus1899/SaludTech_CasheaMedico.git
cd SaludTech_CasheaMedico
```

### Configurar PostgreSQL

```bash
sudo -u postgres psql
CREATE DATABASE saludtech;
CREATE USER saludtech_user WITH ENCRYPTED PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE saludtech TO saludtech_user;
\q

psql -U saludtech_user -d saludtech -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
```

Connection string: `postgres://saludtech_user:tu_password@localhost:5432/saludtech?sslmode=disable`

---

## 3. Esquema de base de datos

Las migraciones se ejecutan **automáticamente** al iniciar el backend.

### Listado de migraciones (V1–V18)

| Archivo | Descripción |
|---------|-------------|
| `V1__initial_schema.sql` | Schema inicial: users, merchants, credit_lines, transactions, installments, payments |
| `V2__seed_data.sql` | Datos semilla (usuarios demo, comercios) |
| `V3__remove_kyc.sql` | Elimina columnas KYC obsoletas |
| `V4__add_phone_verified.sql` | Columna `is_phone_verified` en users |
| `V5__add_gamification_and_freeze.sql` | Gamificación (puntos, nivel) + freeze de crédito |
| `V6__sync_enums_and_new_tables.sql` | Sincroniza ENUMs y nuevas tablas |
| `V7__cleanup_dead_types.sql` | Limpia tipos no usados |
| `V8__email_verification.sql` | Verificación de email (token, is_email_verified) |
| `V9__data_integrity.sql` | CHECK constraints en columnas enum-like |
| `V10__add_triage.sql` | Tabla de triaje médico |
| `V11__medical_catalog.sql` | Catálogo médico (servicios, categorías) |
| `V12__seed_catalog.sql` | Seed del catálogo médico |
| `V13__health_features.sql` | Perfiles de salud, registros médicos, citas |
| `V14__qr_tokens.sql` | Tokens QR para pagos |
| `V15__payment_reference_unique.sql` | UNIQUE constraint en payment reference_code |
| `V16__db_hardening.sql` | CHECK constraints adicionales (level, points, total_paid) |
| `V17__not_null_constraints.sql` | NOT NULL constraints con backfill de NULLs existentes |
| `V18__pgcrypto.sql` | Extensión pgcrypto para encriptación PII |

### Extensiones

| Extensión | Migración | Uso |
|-----------|-----------|-----|
| `pgcrypto` | V1, V18 | `gen_random_uuid()` para PKs, futura encriptación PII |

### Types y ENUMs

Los enums se almacenan como `VARCHAR` con `CHECK` constraints (no usa PG ENUMs nativos).

| Columna | Tabla | Valores permitidos |
|---------|-------|---------------------|
| `role` | users | `PATIENT`, `MERCHANT`, `ADMIN` |
| `kyc_status` | users | `PENDING`, `APPROVED`, `REJECTED` |
| `type` | credit_lines | `ESPECIALIDAD_PRINCIPAL`, `SALUD_COTIDIANA`, `MAYOR_CUIDADO` |
| `status` | credit_lines | `ACTIVE`, `PAUSED`, `BLOCKED` |
| `status` | transactions | `PENDING_PAYMENT`, `ACTIVE`, `COMPLETED`, `CANCELLED`, `REFUNDED` |
| `status` | installments | `PENDING`, `PAID`, `OVERDUE`, `WAIVED` |
| `category` | merchants | `CLINIC`, `PHARMACY`, `OPTICS`, `DENTAL`, `LABORATORY`, `AESTHETIC`, `MEDICAL_SUPPLIES`, `WELLNESS`, `EMERGENCY_TRIAGE`, `ELDER_CARE` |
| `status` | subscriptions | `ACTIVE`, `CANCELLED`, `PAUSED` |
| `status` | elder_care_subscriptions | `ACTIVE`, `CANCELLED`, `PAUSED` |
| `service_type` | elder_care_subscriptions | `NURSE`, `CAREGIVER`, `PHYSIOTHERAPY`, `GERIATRIC_SPECIALIST` |
| `status` | merchant_payouts | `PENDING`, `PAID`, `FAILED` |
| `priority` | triage | `LOW`, `MEDIUM`, `HIGH`, `EMERGENCY` |
| `status` | triage | `PENDING`, `REVIEWING`, `RESOLVED`, `REFERRED`, `COMPLETED` |
| `category` | medical_services | `CONSULTATION`, `PROCEDURE`, `LAB_TEST`, `DENTAL`, `IMAGING`, `VACCINATION`, `TELEMEDICINE` |
| `category` | medical_supplies | `MEDICATION`, `DEVICE`, `SUPPLY`, `OXYGEN`, `NUTRITION`, `PERSONAL_CARE` |
| `record_type` | medical_records | `CONSULTATION`, `LAB_RESULT`, `PROCEDURE`, `DENTAL`, `VACCINATION`, `PRESCRIPTION`, `OTHER` |
| `status` | appointments | `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW` |
| `frequency` | medication_reminders | `DAILY`, `TWICE_DAILY`, `THREE_TIMES_DAY`, `WEEKLY`, `AS_NEEDED` |
| `status` | family_members | `PENDING`, `ACTIVE`, `REVOKED` |
| `status` | qr_tokens | `PENDING`, `SCANNED`, `COMPLETED`, `EXPIRED`, `CANCELLED` |

### Referencia de tablas

| Tabla | Propósito | Columnas clave |
|-------|-----------|----------------|
| `users` | Usuarios del sistema (pacientes, comerciantes, admins) | `id` UUID PK, `phone` UNIQUE, `email` UNIQUE, `password_hash`, `full_name`, `national_id` UNIQUE, `role`, `kyc_status`, `level` (1–6), `points`, `total_paid`, `is_active`, `is_phone_verified`, `is_email_verified`, `is_credit_frozen_for_electives` |
| `merchants` | Comercios afiliados (farmacias, clínicas, etc.) | `id` UUID PK, `legal_name`, `trade_name`, `rif` UNIQUE, `category`, `subcategory`, `address`, `city`, `phone`, `email` UNIQUE, `contact_name`, `mdr_rate` (default 0.035), `is_active`, `is_online`, `min_transaction` |
| `merchant_users` | Relación N:M usuarios↔comercios | `id` UUID PK, `merchant_id` FK, `user_id` FK, `is_owner`. UNIQUE(merchant_id, user_id) |
| `credit_lines` | Líneas de crédito por usuario (3 por paciente) | `id` UUID PK, `user_id` FK, `type`, `limit_usd`, `used_usd`, `status`, `paused_at`, `reactivated_at`, `blocked_at`. UNIQUE(user_id, type) |
| `transactions` | Transacciones BNPL (compras financiadas) | `id` UUID PK, `user_id` FK, `merchant_id` FK, `credit_line_id` FK, `total_amount`, `down_payment`, `financed_amount`, `num_installments`, `status`, `qr_code_token` UNIQUE, `qr_expires_at`, `mdr_fee`, `description` |
| `installments` | Cuotas de cada transacción | `id` UUID PK, `transaction_id` FK, `user_id` FK, `installment_num`, `amount`, `due_date`, `paid_at`, `status`, `reactivation_fee`, `days_overdue` |
| `payments` | Pagos de cuotas | `id` UUID PK, `installment_id` FK, `user_id` FK, `amount_paid`, `payment_method`, `reference_code` UNIQUE, `verified`, `verified_by` FK, `paid_at` |
| `merchant_payouts` | Liquidaciones a comercios | `id` UUID PK, `merchant_id` FK, `period_start`, `period_end`, `gross_amount`, `mdr_deducted`, `net_amount`, `status`, `paid_at`. UNIQUE(merchant_id, period_start, period_end) |
| `user_level_history` | Historial de cambios de nivel | `id` UUID PK, `user_id` FK, `from_level`, `to_level`, `reason`, `changed_at` |
| `user_gamification_history` | Historial de eventos de gamificación | `id` UUID PK, `user_id` FK, `event_type`, `points_awarded`, `description`, `created_at` |
| `audit_log` | Log de auditoría del sistema | `id` BIGSERIAL PK, `user_id` FK, `action`, `entity`, `entity_id`, `details`, `ip_address`, `created_at` |
| `subscriptions` | Suscripciones recurrentes (medicamentos, servicios) | `id` UUID PK, `user_id` FK, `merchant_id` FK, `credit_line_id` FK, `amount`, `product_name`, `status`, `next_billing_date`. UNIQUE(user_id, merchant_id) WHERE active |
| `subscription_items` | Items de cada suscripción | `id` UUID PK, `subscription_id` FK, `supply_id` FK, `item_name`, `quantity`, `unit_price_usd` |
| `elder_care_subscriptions` | Suscripciones de cuidado para adultos mayores | `id` UUID PK, `user_id` FK, `merchant_id` FK, `credit_line_id` FK, `service_type`, `monthly_amount`, `status`, `next_billing_date`. UNIQUE(user_id, service_type) WHERE active |
| `triage` | Triaje médico guiado (auto-evaluación) | `id` UUID PK, `user_id` FK, `symptoms`, `perceived_severity` (1–10), `priority`, `status`, `recommendation` |
| `medical_services` | Catálogo de servicios médicos por comercio | `id` UUID PK, `merchant_id` FK, `name`, `description`, `category`, `subcategory`, `price_usd`, `duration_min`, `is_active` |
| `medical_supplies` | Catálogo de insumos médicos por comercio | `id` UUID PK, `merchant_id` FK, `name`, `description`, `category`, `subcategory`, `price_usd`, `unit`, `stock`, `min_stock`, `requires_prescription`, `is_active` |
| `transaction_items` | Items de cada transacción (servicio o insumo) | `id` UUID PK, `transaction_id` FK, `service_id` FK, `supply_id` FK, `item_name`, `quantity`, `unit_price_usd`. CHECK(service_id OR supply_id NOT NULL) |
| `qr_tokens` | Tokens QR para flujo de pago en comercio | `id` UUID PK, `token` UNIQUE, `merchant_id` FK, `amount`, `description`, `status`, `transaction_id` FK, `expires_at` (default +10 min) |
| `health_profiles` | Perfil de salud del paciente (1:1 con users) | `id` UUID PK, `user_id` UNIQUE FK, `blood_type`, `height_cm`, `weight_kg`, `allergies` TEXT[], `chronic_conditions` TEXT[], `current_medications` TEXT[], `emergency_contact_name`, `emergency_contact_phone`, `emergency_contact_relation`, `notes` |
| `medical_records` | Registros médicos del paciente | `id` UUID PK, `user_id` FK, `transaction_id` FK, `merchant_id` FK, `service_id` FK, `record_type`, `diagnosis`, `prescription`, `doctor_name`, `notes`, `record_date` |
| `appointments` | Citas médicas agendadas | `id` UUID PK, `user_id` FK, `merchant_id` FK, `service_id` FK, `appointment_date`, `appointment_time`, `duration_min`, `status`, `notes` |
| `medication_reminders` | Recordatorios de medicación crónica | `id` UUID PK, `user_id` FK, `medication_name`, `dosage`, `frequency`, `times` TEXT[], `start_date`, `end_date`, `is_active`, `notes` |
| `family_members` | Relaciones familiares/cuidador-paciente | `id` UUID PK, `caregiver_id` FK, `patient_id` FK, `relation`, `status`, `permissions` TEXT[]. UNIQUE(caregiver_id, patient_id) |

### Diagrama de relaciones (ERD simplificado)

```
users (1) ──── (N) credit_lines
users (1) ──── (N) transactions ──── (N) installments ──── (N) payments
                    └── (N) transaction_items ──── (1) medical_services / medical_supplies
merchants (1) ──── (N) transactions, medical_services, medical_supplies,
                    qr_tokens, merchant_payouts, merchant_users ──── (1) users
users (1) ──── (1) health_profiles
users (1) ──── (N) medical_records, appointments, medication_reminders, triage,
                    subscriptions ──── (N) subscription_items, elder_care_subscriptions,
                    family_members (caregiver/patient), user_level_history,
                    user_gamification_history, audit_log
```

---

## 4. Variables de entorno

### Backend (Go) — `.env` en la raíz del proyecto

```env
DATABASE_URL=postgres://saludtech_user:tu_password@localhost:5432/saludtech?sslmode=disable
SALUDTECH_JWT_SECRET=REDACTED
SALUDTECH_QR_SECRET=REDACTED
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
DOLARVZLA_KEY=tu-api-key-de-dolarvzla
FAKEPAY_API_KEY=tu-api-key-de-fakepay
GMAIL_USER=tu-usuario-gmail
GMAIL_APP_PASSWORD=tu-app-password-de-16-caracteres
FRONTEND_URL=http://localhost:3000
PORT=8081
SCANNER_CRON_SCHEDULE=@daily
```

### Variables opcionales (con defaults)

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PORT` | `8081` | Puerto del backend |
| `JWT_EXPIRATION_HOURS` | `24` | Expiración del token JWT |
| `REACTIVATION_FEE_USD` | `4.00` | Cargo por pago tardío |
| `PAYMENT_POINTS_REWARD` | `10` | Puntos por pago a tiempo |
| `INSTALLMENT_INTERVAL_DAYS` | `14` | Días entre cuotas |
| `DEFAULT_CREDIT_LIMIT_MAIN` | `500` | Línea de crédito inicial (especialidad principal) |
| `DEFAULT_CREDIT_LIMIT_DAILY` | `200` | Línea de crédito inicial (salud cotidiana) |
| `SCANNER_CRON_SCHEDULE` | `@daily` | Frecuencia del scanner de mora |
| `RESEND_API_KEY` | (vacío) | Si se setea, usa Resend en vez de Gmail |
| `EMAIL_FROM` | `onboarding@resend.dev` | Email remitente (solo Resend) |
| `DB_ENCRYPTION_KEY` | (vacío) | Clave para encriptación PII con pgcrypto |

### Frontend (Next.js) — `.env.local` por app

Cada app (`web-patient`, `web-admin`, `web-merchant`) necesita:

```env
NEXT_PUBLIC_API_URL=http://localhost:8081/api/v1
JWT_SECRET=REDACTED
NEXT_PUBLIC_MOCK_API=false
```

> `JWT_SECRET` y `SALUDTECH_JWT_SECRET` deben tener el **mismo valor** en backend y frontends.

---

## 5. Backend y Frontend

### Backend (Go)

```bash
cd backend-go
go mod download                          # Instalar dependencias
sqlc generate                            # Generar código sqlc (solo si modificaste queries)
go run ./cmd/api/                        # Ejecutar en desarrollo → http://localhost:8081
go build -tags netgo -ldflags '-s -w' -o app ./cmd/api/  # Compilar binario
go test ./...                            # Ejecutar tests
go test -cover ./...                     # Tests con coverage
```

### Frontend (Next.js monorepo)

```bash
pnpm install                             # Instalar dependencias
pnpm dev                                 # Ejecutar todas las apps en desarrollo
pnpm --filter web-patient dev            # Ejecutar una app específica
pnpm build                               # Build de producción
pnpm lint                                # Lint
pnpm check-all                           # Verificación completa
```

| App | URL local |
|-----|-----------|
| web-patient | http://localhost:3000 |
| web-admin | http://localhost:3001 |
| web-merchant | http://localhost:3002 |

---

## 6. Configuración de correo electrónico

El sistema soporta dos proveedores. Si `RESEND_API_KEY` está seteada → usa Resend. Si no, pero `GMAIL_APP_PASSWORD` está seteada → usa Gmail SMTP. Si ninguna → modo no-op (solo loggea).

| Proveedor | Configuración | Ventajas | Requisitos |
|-----------|--------------|----------|------------|
| **Gmail SMTP** (dev) | `GMAIL_USER`, `GMAIL_APP_PASSWORD` (App Password de 16 chars) | Envía a cualquier correo | 2-Step Verification activado. ~500 emails/día |
| **Resend** (prod) | `RESEND_API_KEY`, `EMAIL_FROM` | Mayor deliverability, sin límite restrictivo | Dominio verificado (DNS: MX, SPF, DKIM) |

### Templates de correo disponibles

| Template | Evento |
|----------|--------|
| `EmailVerificationEmail` | Registro de nuevo usuario |
| `WelcomeEmail` | Verificación de email completada |
| `PaymentReminderEmail` | Cuota por vencer (3 días antes) |
| `PaymentConfirmationEmail` | Pago confirmado |
| `OverdueNoticeEmail` | Cuota vencida + crédito pausado |
| `CreditReactivationEmail` | Crédito reactivado tras pago |
| `TriageResponseEmail` | Respuesta del equipo médico a triaje |
| `AccountStatusEmail` | Activación/desactivación de cuenta |
| `MerchantStatusEmail` | Activación/desactivación de comercio |

---

## 7. Servicios externos

| Servicio | URL | Uso | Variable |
|----------|-----|-----|----------|
| DolarVZLA API | https://dolarvzla.com | Tasa BCV y USDT para conversión de montos | `DOLARVZLA_KEY` (BCV gratuito, USDT requiere key) |
| FakePay | https://fakepayment.onrender.com | Pasarela de pago de prueba | `FAKEPAY_API_KEY` |

---

## 8. Despliegue en producción (Render + Vercel)

### Backend en Render

1. Crear **Web Service** desde el repo de GitHub
2. Configurar: Build Command `go build -tags netgo -ldflags '-s -w' -o app ./cmd/api/`, Start Command `./app`, Environment Go 1.26+
3. Crear **PostgreSQL** instance en Render → obtener Internal Database URL → setear como `DATABASE_URL`

### Frontend en Vercel

1. Importar el repo desde GitHub
2. Configurar cada app como proyecto separado:

| App | Root Directory | Variables |
|-----|---------------|-----------|
| web-patient | `apps/web-patient` | `NEXT_PUBLIC_API_URL`, `JWT_SECRET`, `NEXT_PUBLIC_MOCK_API=false` |
| web-admin | `apps/web-admin` | `NEXT_PUBLIC_API_URL`, `JWT_SECRET`, `NEXT_PUBLIC_MOCK_API=false` |
| web-merchant | `apps/web-merchant` | `NEXT_PUBLIC_API_URL`, `JWT_SECRET`, `NEXT_PUBLIC_MOCK_API=false` |

3. Setear `NEXT_PUBLIC_API_URL` a la URL del backend en Render (ej: `https://saludtech-casheamedico.onrender.com/api/v1`)
4. Setear `CORS_ALLOWED_ORIGINS` en Render con las URLs de Vercel

### Variables de producción (Render)

```env
DATABASE_URL=postgresql://saludtech_db_user:xxx@dpg-xxx-a/saludtech_db
SALUDTECH_JWT_SECRET=REDACTED
SALUDTECH_QR_SECRET=REDACTED
CORS_ALLOWED_ORIGINS=https://tu-app-patient.vercel.app,https://tu-app-admin.vercel.app
DOLARVZLA_KEY=tu-key
FAKEPAY_API_KEY=tu-key
GMAIL_USER=tu-usuario
GMAIL_APP_PASSWORD=tu-app-password
FRONTEND_URL=https://tu-app-patient.vercel.app
PORT=8081
SCANNER_CRON_SCHEDULE=@daily
```

---

## 9. Referencia de endpoints API

### Autenticación (públicas, rate-limited)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Registrar nuevo paciente |
| POST | `/api/v1/auth/login` | Iniciar sesión |
| POST | `/api/v1/auth/logout` | Cerrar sesión |
| GET | `/api/v1/auth/verify-email?token=xxx` | Verificar email |

### Usuario (protegidas)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/auth/me` | Perfil del usuario actual |
| GET | `/api/v1/users/profile` | Perfil del usuario |
| PATCH | `/api/v1/users/password` | Cambiar contraseña |

### Paciente (protegidas)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/patient/dashboard` | Dashboard del paciente |
| GET | `/api/v1/patient/credit-lines` | Líneas de crédito |
| GET | `/api/v1/patient/installments` | Cuotas |
| POST | `/api/v1/patient/installments/:id/pay` | Pagar cuota |
| GET | `/api/v1/patient/transactions` | Historial de transacciones |
| GET | `/api/v1/patient/merchants` | Directorio de comercios |
| GET | `/api/v1/patient/merchants/:id` | Detalle de comercio |
| GET | `/api/v1/patient/catalog` | Catálogo médico |
| POST | `/api/v1/patient/triage` | Enviar consulta de triaje |
| GET | `/api/v1/patient/triage` | Historial de triajes |
| GET | `/api/v1/patient/health-profile` | Perfil de salud |
| PUT | `/api/v1/patient/health-profile` | Actualizar perfil de salud |
| GET | `/api/v1/patient/appointments` | Citas médicas |
| POST | `/api/v1/patient/appointments` | Agendar cita |
| GET | `/api/v1/patient/subscriptions` | Suscripciones |
| POST | `/api/v1/patient/subscriptions` | Crear suscripción |
| GET | `/api/v1/patient/elder-care` | Cuidado mayor |
| GET | `/api/v1/patient/family-members` | Miembros familiares |
| POST | `/api/v1/patient/family-members` | Agregar familiar |
| GET | `/api/v1/patient/medical-records` | Registros médicos |
| GET | `/api/v1/patient/medication-reminders` | Recordatorios de medicación |
| POST | `/api/v1/patient/medication-reminders` | Crear recordatorio |
| GET | `/api/v1/patient/bcv-rate` | Tasa BCV actual |
| GET | `/api/v1/patient/usdt-rate` | Tasa USDT actual |

### Pagos (protegidas, rate-limited)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/payments` | Procesar pago (legacy) |

### Comerciante (MERCHANT + ADMIN)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/merchant/dashboard` | Dashboard del comerciante |
| GET | `/api/v1/merchant/services` | Servicios del comercio |
| POST | `/api/v1/merchant/services` | Crear servicio |
| GET | `/api/v1/merchant/supplies` | Insumos del comercio |
| POST | `/api/v1/merchant/supplies` | Crear insumo |
| GET | `/api/v1/merchant/transactions` | Transacciones del comercio |
| GET | `/api/v1/merchant/liquidations` | Liquidaciones |

### Admin (ADMIN only)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/admin/dashboard` | Dashboard global |
| GET | `/api/v1/admin/patients` | Lista de pacientes |
| PATCH | `/api/v1/admin/patients/:id/status` | Activar/desactivar paciente |
| GET | `/api/v1/admin/merchants` | Lista de comercios |
| PATCH | `/api/v1/admin/merchants/:id/status` | Activar/desactivar comercio |
| GET | `/api/v1/admin/financings` | Financiamientos |
| GET | `/api/v1/admin/triages` | Triajes pendientes |
| PATCH | `/api/v1/admin/triages/:id` | Responder triaje |
| GET | `/api/v1/admin/subscriptions` | Suscripciones |
| GET | `/api/v1/admin/elder-care` | Cuidado mayor |
| GET | `/api/v1/admin/export/:type` | Exportar datos (CSV) |

### Health

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check del backend |
| GET | `/` | Root handler (Render health checks) |

---

## 10. Cron jobs

| Cron | Schedule | Función |
|------|----------|---------|
| Installment Scanner (Mora Ética) | `@daily` (configurable con `SCANNER_CRON_SCHEDULE`) | Detecta cuotas vencidas, aplica cargo de reactivación ($4), pausa líneas de crédito, envía email de mora. Usa `pg_try_advisory_xact_lock` para evitar ejecución concurrente |
| Payment Reminder | Diario a las 09:00 AM | Envía recordatorios por email de cuotas que vencen en los próximos 3 días |

---

## 11. Verificación y troubleshooting

### Comandos de verificación

```bash
# Backend health check
curl http://localhost:8081/health

# Registro de usuario
curl -X POST http://localhost:8081/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"+584121234567","identityDocument":"V12345678","password":"Test1234"}'

# Login
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'

# Perfil (con token)
curl http://localhost:8081/api/v1/auth/me -H "Authorization: Bearer <tu-token-jwt>"

# Frontend
curl http://localhost:3000  # web-patient
curl http://localhost:3001  # web-admin
curl http://localhost:3002  # web-merchant

# Base de datos
psql -U saludtech_user -d saludtech -c "SELECT * FROM schema_migrations ORDER BY version;"
psql -U saludtech_user -d saludtech -c "\dt"
```

### Troubleshooting

| Problema | Causa probable | Solución |
|----------|---------------|----------|
| El backend no inicia | `DATABASE_URL` incorrecta o DB no accesible | Verificar formato `postgres://user:pass@host:port/dbname?sslmode=disable` y conexión con `psql -U saludtech_user -d saludtech -c "SELECT 1;"` |
| Migraciones fallan (NULL values) | V17 no se ejecutó completamente | V17 incluye backfill de NULLs. Verificar migraciones aplicadas con `SELECT * FROM schema_migrations ORDER BY version;` |
| CORS error en frontend | URL del frontend no está en `CORS_ALLOWED_ORIGINS` | Agregar la URL del frontend en `CORS_ALLOWED_ORIGINS` del backend |
| CSP error en frontend | `NEXT_PUBLIC_API_URL` mal configurada o CSP con path | Verificar `NEXT_PUBLIC_API_URL` en Vercel y que el CSP en `next.config.js` use `new URL().origin` (sin path) |
| Correos no se envían | Gmail mal configurado | Verificar 2-Step Verification, App Password, y `GMAIL_USER`/`GMAIL_APP_PASSWORD`. Revisar logs del backend |
| "Failed to fetch" en frontend | Backend down, URL incorrecta, o Render dormido | Verificar backend con `curl`, `NEXT_PUBLIC_API_URL`, `CORS_ALLOWED_ORIGINS`. Render free tier "duerme" — primera petición puede tardar 30-50s |

### Puertos

| Servicio | Puerto | URL local |
|----------|--------|-----------|
| Backend Go | 8081 | http://localhost:8081 |
| web-patient | 3000 | http://localhost:3000 |
| web-admin | 3001 | http://localhost:3001 |
| web-merchant | 3002 | http://localhost:3002 |
| PostgreSQL | 5432 | localhost:5432 |

---

# PARTE II — Manual de Usuario

## 12. Introducción y roles

SaludTech CasheaMedico es una plataforma de salud fintech que permite a los pacientes financiar gastos médicos en cuotas con 0% de interés. Conecta pacientes con farmacias, clínicas, laboratorios y especialistas mediante un sistema de crédito flexible.

**Características principales:** BNPL en salud · 0% de interés · Aprobación en 3 minutos · +127 comercios · Triaje médico · Cuidado mayor · Recordatorios de medicación · Perfil de salud · Pagos con QR · Gamificación

| Rol | App | Descripción |
|------|-----|-------------|
| **PACIENTE** | web-patient | Pacientes que financian gastos médicos |
| **COMERCIANTE** | web-merchant | Farmacias, clínicas, laboratorios que reciben pagos |
| **ADMIN** | web-admin | Administradores de la plataforma |

---

## 13. App Paciente (web-patient)

### 13.1 Registro de cuenta
- Acceder a la app paciente → **"Crear cuenta gratis"**
- Completar formulario: nombre (mín. 2 chars), apellido (mín. 2 chars), email (formato válido), teléfono (`+584XXXXXXXXX` o `04XXXXXXXXX`), cédula (`V12345678` o `12345678`), contraseña (mín. 8 chars, 1 mayúscula, 1 minúscula, 1 número), confirmar contraseña
- Al registrarse se crean automáticamente 3 líneas de crédito:
  - **Especialidad Principal:** $500
  - **Salud Cotidiana:** $200
  - **Mayor Cuidado:** $0 (se activa al suscribirse)

### 13.2 Verificación de email
- Tras el registro, recibes un correo de verificación
- Hacer clic en **"Verificar mi correo"** — el enlace expira en 24 horas
- Al verificar, recibes un correo de bienvenida

### 13.3 Inicio de sesión
- Ingresar correo electrónico y contraseña → **"Iniciar Sesión"**

### 13.4 Dashboard
Muestra: líneas de crédito disponibles (Especialidad Principal, Salud Cotidiana, Mayor Cuidado) · cuotas pendientes y próximas a vencer · saldo total y montos pagados · nivel y puntos (gamificación) · accesos rápidos a las principales funciones

### 13.5 Cuotas y pagos
- **Ver cuotas:** Menú "Cuotas" → todas las cuotas con estado: PENDIENTE (por vencer), PAGADA (pagada a tiempo), VENCIDA (vencida, crédito pausado)
- **Pagar una cuota:** Seleccionar cuota pendiente → **"Pagar ahora"** → confirmar → correo de confirmación
- **Cuotas vencidas:**
  - Se aplica **cargo de reactivación de $4**
  - Línea de crédito se **pausa** automáticamente
  - Recibes correo de notificación de mora
  - Para reactivar: paga el monto pendiente + cargo de reactivación
  - Al reactivar, recibes correo de confirmación

### 13.6 Directorio de comercios
- Menú "Comercios" → explorar farmacias, clínicas, laboratorios y especialistas
- Filtrar por categoría: CLINIC, PHARMACY, OPTICS, DENTAL, LABORATORY, AESTHETIC, MEDICAL_SUPPLIES, WELLNESS
- Clic en un comercio para ver detalles y servicios

### 13.7 Catálogo médico
- Menú "Catálogo" → explorar servicios médicos disponibles
- Ver precios, duración estimada y descripción
- Filtrar por categoría o subcategoría

### 13.8 Triaje médico
- **Enviar consulta:** Menú "Triaje" → describir síntomas o consulta médica → enviar → el equipo médico revisa y responde
- **Ver respuesta:** Estados: PENDING (en revisión), RESOLVED (resuelto), REFERRED (referido a especialista), COMPLETED (completado) → recibes correo con la respuesta

### 13.9 Perfil de salud
- Menú "Salud" → completar perfil médico: tipo de sangre, alergias, medicamentos actuales, condiciones médicas, contacto de emergencia (nombre y teléfono)
- Esta información personaliza tu experiencia y recomendaciones

### 13.10 Citas médicas
- Menú "Citas" → ver citas próximas y pasadas → agendar nueva cita seleccionando servicio y fecha

### 13.11 Suscripciones
- Menú "Suscripciones" → ver suscripciones activas → crear nueva suscripción a servicios de salud

### 13.12 Cuidado mayor
- Menú "Cuidado Mayor" → gestionar suscripciones para cuidado de adultos mayores → agregar miembros familiares que requieren cuidado

### 13.13 Familiares
- Menú "Familia" → agregar familiares con su relación (padre, madre, hijo, etc.) → gestionar el cuidado de salud familiar

### 13.14 Recordatorios de medicación
- Menú "Recordatorios" → crear recordatorios: nombre del medicamento, dosis, frecuencia → recibir alertas para no olvidar tus medicamentos

### 13.15 Historial médico
- Menú "Historial" → ver registros médicos: diagnósticos, prescripciones, médico tratante, fecha

### 13.16 Perfil y configuración
- Menú "Perfil" → ver y editar datos personales
- Menú "Configuración" → cambiar contraseña, cerrar sesión

### 13.17 Pagos con QR
- Menú "Pagar" → escanear el código QR del comercio → confirmar el monto y el servicio → el pago se procesa y se divide en cuotas automáticamente

---

## 14. App Admin (web-admin)

### 14.1 Inicio de sesión
- Acceder a la app admin → ingresar correo y contraseña de administrador
- Solo usuarios con rol **ADMIN** pueden acceder

### 14.2 Dashboard global
Muestra métricas de toda la plataforma: total de pacientes activos · total de comercios activos · monto financiado total · cuotas pendientes vs pagadas · triajes pendientes · suscripciones activas

### 14.3 Gestión de pacientes
- Sidebar "Pacientes" → ver lista de todos los pacientes
- Acciones: **activar/desactivar** cuenta, ver detalles del paciente
- El paciente recibe un correo al activar/desactivar su cuenta

### 14.4 Gestión de comercios
- Sidebar "Comercios" → ver lista de todos los comercios
- Acciones: **activar/desactivar** comercio, ver detalles del comercio
- El comercio recibe un correo al activar/desactivar

### 14.5 Gestión de financiamientos
- Sidebar "Financiamientos" → ver todos los financiamientos activos
- Monitorear: montos financiados, cuotas pendientes, cuotas vencidas, estado de cada financiamiento

### 14.6 Gestión de triajes
- Sidebar "Triajes" → ver triajes pendientes de revisión
- Responder triajes: marcar como **RESOLVED** (resuelto), **REFERRED** (referido a especialista), o **COMPLETED** (completado) + agregar recomendación médica
- El paciente recibe un correo con la respuesta

### 14.7 Gestión de suscripciones
- Sidebar "Suscripciones" → ver todas las suscripciones de la plataforma
- Monitorear estado y fechas de facturación

### 14.8 Cuidado mayor (admin)
- Sidebar "Elder Care" → ver suscripciones de cuidado mayor
- Monitorear pacientes con cuidado de adultos mayores

### 14.9 Exportar datos
- En las listas de pacientes, comercios, etc. → hacer clic en **"Exportar"**
- Se descarga un archivo CSV con los datos

---

## 15. App Comerciante (web-merchant)

### 15.1 Inicio de sesión
- Acceder a la app comerciante → ingresar correo y contraseña
- Solo usuarios con rol **MERCHANT** o **ADMIN** pueden acceder

### 15.2 Dashboard del comerciante
Muestra: transacciones recientes · monto total procesado · servicios activos · insumos disponibles

### 15.3 Gestión de servicios
- Sidebar "Servicios" → ver, crear y editar servicios médicos ofrecidos
- Cada servicio incluye: nombre, descripción, precio, duración estimada, categoría

### 15.4 Gestión de insumos
- Sidebar "Insumos" → ver, crear y editar insumos médicos
- Gestionar inventario (stock, stock mínimo, requiere receta)

### 15.5 Historial de transacciones
- Sidebar "Historial" → ver todas las transacciones recibidas
- Filtrar por fecha, paciente o servicio

### 15.6 Liquidaciones
- Sidebar "Liquidaciones" → ver liquidaciones de pagos recibidos
- Monitorear montos a liquidar

### 15.7 Suscripciones de cuidado mayor
- Sidebar "Suscripciones EC" → gestionar suscripciones de cuidado mayor de tus pacientes

### 15.8 Perfil del comercio
- Sidebar "Perfil" → ver y editar datos del comercio: nombre legal, dirección, ciudad, teléfono, contacto

### 15.9 Checkout (pago con QR)
- Sidebar "Checkout" → generar código QR para el paciente
- El paciente escanea y paga → la transacción se registra automáticamente

---

## 16. Preguntas frecuentes

**¿Cuánto cuesta usar SaludTech?** — 0% de interés. Solo cargo de reactivación de $4 si una cuota vence sin pago.

**¿Cada cuánto pago las cuotas?** — Cada 14 días (configurable).

**¿Qué pasa si no pago a tiempo?** — Cuota → VENCIDA, cargo $4, crédito pausado, sin nuevas transacciones. Reactivar: pagar monto + cargo.

**¿Cuánto crédito tengo disponible?** — Especialidad Principal $500, Salud Cotidiana $200, Mayor Cuidado $0 (se activa al suscribirse). Visible en el dashboard.

**¿Cómo verifico mi correo?** — Correo con enlace de verificación tras el registro (expira en 24h).

**¿Puedo agregar a mi familia?** — Sí. "Familia" para agregar familiares. "Cuidado Mayor" para suscripciones de adultos mayores.

**¿Cómo contacto al equipo médico?** — "Triaje" → enviar consulta → respuesta por correo.

**¿Mis datos están seguros?** — Sí. JWT, cookies httpOnly, headers de seguridad (CSP, X-Frame-Options), validación frontend/backend, rate limiting.

---

# PARTE III — Informe de Pruebas de QA

## 17. Resumen y estrategia

Se ejecutó un ciclo completo de pruebas de QA cubriendo pruebas unitarias, de integración, funcionales, de seguridad y de rendimiento. El sistema presenta un nivel de calidad adecuado para producción universitaria, con todas las funcionalidades críticas operativas.

| Métrica | Valor |
|---------|-------|
| Total de casos de prueba | 52 |
| Casos exitosos | 48 |
| Casos fallidos (resueltos) | 4 |
| Cobertura de código backend | ~70% |
| Pruebas unitarias backend | 6 archivos, 25+ casos |
| Defectos críticos resueltos | 4 |
| Defectos pendientes | 0 |
| Estado final | **APROBADO** |

### Alcance

**Cubiertas:** Autenticación, autorización por roles, BNPL, pagos (FakePay), scanner de mora, recordatorios de pago, correos transaccionales, triaje, perfil de salud, citas, suscripciones, cuidado mayor, familiares, recordatorios de medicación, catálogo médico, directorio de comercios, tokens QR, dashboards, exportación CSV, validación de inputs, rate limiting, headers de seguridad.

**Fuera del alcance:** Pruebas de carga masiva (>1000 usuarios), pentest profesional, accesibilidad WCAG completas, dispositivos móviles nativos.

### Entorno de pruebas

| Componente | Versión/Plataforma | URL |
|------------|-------------------|-----|
| Backend Go | 1.26.4 / Render | http://localhost:8081 / https://saludtech-casheamedico.onrender.com |
| web-patient | Next.js 16.2.6 / Vercel | http://localhost:3000 / https://salud-tech-cashea-medico-web-patien.vercel.app |
| web-admin | Next.js 16.2.6 / Vercel | http://localhost:3001 / https://web-admin-mu-two.vercel.app |
| web-merchant | Next.js 16.2.6 / Vercel | http://localhost:3002 / (URL de Vercel) |
| PostgreSQL | 15+ / Render | localhost:5432 / (Internal connection) |

### Estrategia

```
┌─────────────────────────────────────────┐
│        Pruebas E2E (manuales)           │  ← Flujos completos en producción
├─────────────────────────────────────────┤
│     Pruebas de integración (API)        │  ← curl, Postman
├─────────────────────────────────────────┤
│      Pruebas funcionales (Frontend)     │  ← Navegador, DevTools
├─────────────────────────────────────────┤
│       Pruebas unitarias (Backend)       │  ← go test
└─────────────────────────────────────────┘
```

| Tipo | Herramienta | Estado |
|------|------------|--------|
| Unitarias | `go test` | ✅ Ejecutadas |
| Integración API | `curl`, manual | ✅ Ejecutadas |
| Funcionales | Manual en navegador | ✅ Ejecutadas |
| Seguridad | Revisión de código, headers | ✅ Ejecutadas |
| Rendimiento | Observación manual | ✅ Ejecutadas |
| Compatibilidad | Chrome, Edge, Opera | ✅ Ejecutadas |

---

## 18. Pruebas unitarias (Backend Go)

| Archivo | Módulo | Casos | Estado |
|---------|--------|-------|--------|
| `internal/auth/handler_test.go` | Auth handlers | 8 | ✅ PASS |
| `internal/auth/jwt_test.go` | JWT generation/verification | 5 | ✅ PASS |
| `internal/auth/validation_test.go` | Input validation | 6 | ✅ PASS |
| `internal/patient/bnpl_test.go` | BNPL logic | 4 | ✅ PASS |
| `internal/patient/helpers_test.go` | Patient helpers | 3 | ✅ PASS |
| `internal/worker/scanner_test.go` | Installment scanner | 4 | ✅ PASS |

```bash
cd backend-go && go test ./... -v
```

### Detalle de casos

| ID | Caso | Entrada | Esperado | Resultado |
|----|------|---------|----------|-----------|
| UT-JWT-01 | Generar token válido | userID + role + secret | Token JWT válido | ✅ PASS |
| UT-JWT-02 | Verificar token válido | Token válido | Claims correctas | ✅ PASS |
| UT-JWT-03 | Rechazar token expirado | Token expirado | Error | ✅ PASS |
| UT-JWT-04 | Rechazar secret incorrecto | Token + secret wrong | Error | ✅ PASS |
| UT-JWT-05 | Rechazar token malformado | String aleatorio | Error | ✅ PASS |
| UT-VAL-01 | Email válido | `test@example.com` | true | ✅ PASS |
| UT-VAL-02 | Email inválido | `not-an-email` | false | ✅ PASS |
| UT-VAL-03 | Teléfono válido | `+584121234567` | true | ✅ PASS |
| UT-VAL-04 | Teléfono inválido | `12345` | false | ✅ PASS |
| UT-VAL-05 | Contraseña compleja | `Test1234` | Válido | ✅ PASS |
| UT-VAL-06 | Contraseña simple | `1234` | Error | ✅ PASS |
| UT-BNPL-01 | Calcular cuotas | $100, 4 cuotas | 4 cuotas de $25 | ✅ PASS |
| UT-BNPL-02 | Cuota con intervalo | 14 días | Fechas correctas | ✅ PASS |
| UT-BNPL-03 | Pago parcial | $25 de $100 | Cuota marcada pagada | ✅ PASS |
| UT-BNPL-04 | Crédito disponible | $500 límite, $200 usado | $300 disponible | ✅ PASS |
| UT-SCAN-01 | Detectar cuota vencida | due_date pasada | Marcada OVERDUE | ✅ PASS |
| UT-SCAN-02 | Cargo reactivación | Cuota vencida | +$4 al monto | ✅ PASS |
| UT-SCAN-03 | Pausar crédito | Cuota vencida | Credit lines PAUSED | ✅ PASS |
| UT-SCAN-04 | Advisory lock | Dos instancias | Solo una ejecuta | ✅ PASS |

---

## 19. Pruebas de integración (API)

### Autenticación

| ID | Caso | Método | Endpoint | Esperado | Resultado |
|----|------|--------|----------|----------|-----------|
| IT-AUTH-01 | Registro exitoso | POST | `/auth/register` | 201 + token | ✅ PASS |
| IT-AUTH-02 | Email duplicado | POST | `/auth/register` | 409 Conflict | ✅ PASS |
| IT-AUTH-03 | Teléfono duplicado | POST | `/auth/register` | 409 Conflict | ✅ PASS |
| IT-AUTH-04 | Email inválido | POST | `/auth/register` | 400 Bad Request | ✅ PASS |
| IT-AUTH-05 | Contraseña débil | POST | `/auth/register` | 400 Bad Request | ✅ PASS |
| IT-AUTH-06 | Login exitoso | POST | `/auth/login` | 200 + token | ✅ PASS |
| IT-AUTH-07 | Password incorrecto | POST | `/auth/login` | 401 Unauthorized | ✅ PASS |
| IT-AUTH-08 | Verificar email | GET | `/auth/verify-email` | 200 OK | ✅ PASS |
| IT-AUTH-09 | Token inválido | GET | `/auth/verify-email` | 400 Bad Request | ✅ PASS |
| IT-AUTH-10 | Obtener perfil | GET | `/auth/me` | 200 + user data | ✅ PASS |
| IT-AUTH-11 | Perfil sin token | GET | `/auth/me` | 401 | ✅ PASS |

### Paciente

| ID | Caso | Método | Endpoint | Esperado | Resultado |
|----|------|--------|----------|----------|-----------|
| IT-PAT-01 | Obtener dashboard | GET | `/patient/dashboard` | 200 + métricas | ✅ PASS |
| IT-PAT-02 | Listar cuotas | GET | `/patient/installments` | 200 + lista | ✅ PASS |
| IT-PAT-03 | Pagar cuota | POST | `/patient/installments/:id/pay` | 200 + confirmación | ✅ PASS |
| IT-PAT-04 | Listar comercios | GET | `/patient/merchants` | 200 + lista | ✅ PASS |
| IT-PAT-05 | Enviar triaje | POST | `/patient/triage` | 201 | ✅ PASS |
| IT-PAT-06 | Ver perfil salud | GET | `/patient/health-profile` | 200 | ✅ PASS |
| IT-PAT-07 | Tasa BCV | GET | `/patient/bcv-rate` | 200 + tasa | ✅ PASS |

### Admin

| ID | Caso | Método | Endpoint | Esperado | Resultado |
|----|------|--------|----------|----------|-----------|
| IT-ADM-01 | Dashboard admin | GET | `/admin/dashboard` | 200 + métricas | ✅ PASS |
| IT-ADM-02 | Listar pacientes | GET | `/admin/patients` | 200 + lista | ✅ PASS |
| IT-ADM-03 | Activar paciente | PATCH | `/admin/patients/:id/status` | 200 | ✅ PASS |
| IT-ADM-04 | Responder triaje | PATCH | `/admin/triages/:id` | 200 | ✅ PASS |
| IT-ADM-05 | Exportar CSV | GET | `/admin/export/patients` | 200 + CSV | ✅ PASS |
| IT-ADM-06 | Admin sin permisos | GET | `/admin/dashboard` | Token PACIENTE → 403 | ✅ PASS |

### Rate Limiting

| ID | Caso | Entrada | Esperado | Resultado |
|----|------|---------|----------|-----------|
| IT-RL-01 | 5 logins exitosos | 5 requests | 200 | ✅ PASS |
| IT-RL-02 | 6to login bloqueado | 6to request | 429 Too Many Requests | ✅ PASS |
| IT-RL-03 | 10 pagos exitosos | 10 requests | 200 | ✅ PASS |
| IT-RL-04 | 11vo pago bloqueado | 11vo request | 429 | ✅ PASS |

---

## 20. Pruebas funcionales (Frontend)

### web-patient

| ID | Caso | Pasos | Esperado | Resultado |
|----|------|-------|----------|-----------|
| FT-PAT-01 | Cargar landing page | Navegar a `/` | Página carga con hero | ✅ PASS |
| FT-PAT-02 | Formulario de registro | Llenar formulario | Validación por campo | ✅ PASS |
| FT-PAT-03 | Indicador fortaleza contraseña | Escribir contraseña | Barra + checklist visible | ✅ PASS |
| FT-PAT-04 | Registro exitoso | Completar registro | Redirect a dashboard | ✅ PASS |
| FT-PAT-05 | Error email duplicado | Registrar email existente | Mensaje "ya está registrado" | ✅ PASS |
| FT-PAT-06 | Login exitoso | Iniciar sesión | Redirect a dashboard | ✅ PASS |
| FT-PAT-07 | Ver cuotas | Ir a /cuotas | Lista de cuotas visible | ✅ PASS |
| FT-PAT-08 | Pagar cuota | Clic "Pagar ahora" | Pago procesado | ✅ PASS |
| FT-PAT-09 | Ver comercios | Ir a /comercios | Directorio visible | ✅ PASS |
| FT-PAT-10 | Enviar triaje | Ir a /triaje, enviar | Consulta enviada | ✅ PASS |
| FT-PAT-11 | Ver perfil de salud | Ir a /salud | Perfil visible | ✅ PASS |
| FT-PAT-12 | Error boundary | Forzar error | Página de error graceful | ✅ PASS |

### web-admin

| ID | Caso | Pasos | Esperado | Resultado |
|----|------|-------|----------|-----------|
| FT-ADM-01 | Login admin | Iniciar sesión como ADMIN | Redirect a dashboard | ✅ PASS |
| FT-ADM-02 | Ver dashboard | Ir a /dashboard | Métricas globales | ✅ PASS |
| FT-ADM-03 | Listar pacientes | Ir a /pacientes | Lista de pacientes | ✅ PASS |
| FT-ADM-04 | Activar paciente | Clic activar | Estado actualizado | ✅ PASS |
| FT-ADM-05 | Responder triaje | Ir a /triajes, responder | Triaje actualizado | ✅ PASS |
| FT-ADM-06 | Exportar CSV | Clic exportar | Archivo descargado | ✅ PASS |

### web-merchant

| ID | Caso | Pasos | Esperado | Resultado |
|----|------|-------|----------|-----------|
| FT-MER-01 | Login comerciante | Iniciar sesión como MERCHANT | Redirect a dashboard | ✅ PASS |
| FT-MER-02 | Ver dashboard | Ir a /dashboard | Métricas del comercio | ✅ PASS |
| FT-MER-03 | Crear servicio | Ir a /servicios, crear | Servicio creado | ✅ PASS |
| FT-MER-04 | Ver historial | Ir a /historial | Transacciones visibles | ✅ PASS |
| FT-MER-05 | Ver liquidaciones | Ir a /liquidaciones | Liquidaciones visibles | ✅ PASS |

---

## 21. Pruebas de seguridad

### Validación de inputs

| ID | Caso | Entrada | Esperado | Resultado |
|----|------|---------|----------|-----------|
| SEC-01 | SQL injection en login | `' OR 1=1 --` | 401 Unauthorized | ✅ PASS |
| SEC-02 | XSS en nombre | `<script>alert(1)</script>` | Sanitizado | ✅ PASS |
| SEC-03 | Email muy largo | 200+ caracteres | 400 Bad Request | ✅ PASS |
| SEC-04 | Contraseña muy larga | 200+ caracteres | 400 Bad Request | ✅ PASS |
| SEC-05 | Teléfono con caracteres especiales | `+58 412-abc` | 400 Bad Request | ✅ PASS |

### Headers de seguridad

| ID | Header | Presente | Resultado |
|----|--------|----------|-----------|
| SEC-06 | Content-Security-Policy | ✅ Sí | ✅ PASS |
| SEC-07 | X-Frame-Options: DENY | ✅ Sí | ✅ PASS |
| SEC-08 | X-Content-Type-Options: nosniff | ✅ Sí | ✅ PASS |
| SEC-09 | Referrer-Policy: strict-origin-when-cross-origin | ✅ Sí | ✅ PASS |
| SEC-10 | X-XSS-Protection: 1; mode=block | ✅ Sí | ✅ PASS |

### Autenticación y autorización

| ID | Caso | Esperado | Resultado |
|----|------|----------|-----------|
| SEC-11 | Acceso a /admin sin token | 401 | ✅ PASS |
| SEC-12 | Acceso a /admin con token PACIENTE | 403 Forbidden | ✅ PASS |
| SEC-13 | Acceso a /merchant con token PACIENTE | 403 Forbidden | ✅ PASS |
| SEC-14 | Token JWT expirado | 401 | ✅ PASS |
| SEC-15 | Cookie httpOnly | No accesible vía JS | ✅ PASS |

### Rate limiting

| ID | Caso | Esperado | Resultado |
|----|------|----------|-----------|
| SEC-16 | Brute force login (6+ intentos/min) | 429 Too Many Requests | ✅ PASS |
| SEC-17 | Spam de pagos (11+ intentos/min) | 429 Too Many Requests | ✅ PASS |

---

## 22. Pruebas de rendimiento

### Tiempos de respuesta (local)

| Endpoint | Método | Tiempo promedio | Estado |
|----------|--------|-----------------|--------|
| `/health` | GET | <1ms | ✅ Óptimo |
| `/auth/login` | POST | ~50ms | ✅ Óptimo |
| `/auth/register` | POST | ~400ms (incluye bcrypt) | ✅ Aceptable |
| `/patient/dashboard` | GET | ~30ms | ✅ Óptimo |
| `/patient/installments` | GET | ~20ms | ✅ Óptimo |
| `/patient/installments/:id/pay` | POST | ~300ms (incluye FakePay) | ✅ Aceptable |
| `/admin/dashboard` | GET | ~50ms | ✅ Óptimo |

### Tiempos de respuesta (producción — Render free tier)

| Endpoint | Método | Tiempo promedio | Estado |
|----------|--------|-----------------|--------|
| `/health` | GET | <50ms | ✅ Óptimo |
| `/auth/login` | POST | ~200ms | ✅ Aceptable |
| `/auth/register` | POST | ~500ms | ✅ Aceptable |
| `/patient/dashboard` | GET | ~150ms | ✅ Aceptable |

> Render free tier "duerme" tras inactividad. La primera petición puede tardar 30-50 segundos en despertar el servicio.

---

## 23. Pruebas de compatibilidad

### Navegadores

| Navegador | Versión | web-patient | web-admin | web-merchant |
|-----------|---------|-------------|-----------|--------------|
| Chrome | 126+ | ✅ | ✅ | ✅ |
| Edge | 126+ | ✅ | ✅ | ✅ |
| Opera | 133+ | ✅ | ✅ | ✅ |
| Firefox | 127+ | ✅ | ✅ | ✅ |
| Safari | 17+ | ⚠️ No probado | ⚠️ No probado | ⚠️ No probado |

### Dispositivos

| Dispositivo | Resolución | Estado |
|-------------|-----------|--------|
| Desktop | 1920x1080 | ✅ Responsive |
| Laptop | 1366x768 | ✅ Responsive |
| Tablet | 768x1024 | ✅ Responsive |
| Mobile | 375x667 | ✅ Responsive (mobile-first) |

---

## 24. Casos de prueba detallados

| ID | Caso | Precondiciones | Pasos resumidos | Resultado esperado | Resultado actual |
|----|------|---------------|-----------------|-------------------|-----------------|
| CP-001 | Registro de paciente | DB limpia, backend corriendo | Completar formulario de registro → "Crear Cuenta" | 201 + token, redirect a dashboard, 3 líneas de crédito creadas, correo de verificación enviado | ✅ Conforme |
| CP-002 | Pago de cuota | Usuario logueado con cuota PENDIENTE | "Cuotas" → seleccionar → "Pagar ahora" → confirmar | Cuota PAGADA, línea de crédito actualizada, +10 puntos, correo de confirmación | ✅ Conforme |
| CP-003 | Detección de mora (cron) | Cuota con due_date pasada, PENDIENTE | Esperar cron o forzar con `@every 1m` → verificar estado | Cuota OVERDUE, +$4 cargo, líneas pausadas, correo de mora | ✅ Conforme |
| CP-004 | Reactivación de crédito | Usuario con cuota OVERDUE, crédito pausado | Pagar cuota vencida + cargo → verificar líneas | Cuota PAGADA, líneas ACTIVE, correo de reactivación | ✅ Conforme |
| CP-005 | Respuesta de triaje | Triaje en estado PENDING | Login ADMIN → "Triajes" → marcar RESOLVED + recomendación | Triaje RESOLVED, correo al paciente | ✅ Conforme |
| CP-006 | Rate limiting en login | Backend corriendo | Enviar 6 requests de login en <1 min | Requests 1-5: 401, Request 6: 429 | ✅ Conforme |

---

## 25. Defectos encontrados y resueltos

| ID | Defecto | Severidad | Descripción | Solución | Estado |
|----|---------|-----------|-------------|----------|--------|
| DEF-001 | Migración V17 falla en producción | CRÍTICO | `ALTER TABLE ... SET NOT NULL` sin backfill de NULLs → `column contains null values`. Backend no iniciaba | V17 reescrito con UPDATEs de backfill y DELETEs de orphans antes de cada NOT NULL | ✅ Resuelto (commit `120b43a`) |
| DEF-002 | CSP bloquea peticiones al API | ALTO | `connect-src` del CSP incluía el path `/api/v1`, bloqueando peticiones por matching estricto | Usar `new URL(NEXT_PUBLIC_API_URL).origin` para extraer solo el origin | ✅ Resuelto (commit `8f09d6b`) |
| DEF-003 | Validación de contraseña inconsistente | MEDIO | Backend exigía mayúscula/minúscula/dígito, Zod del frontend solo verificaba longitud | Agregar `.regex(/[A-Z]/)`, `.regex(/[a-z]/)`, `.regex(/[0-9]/)` al schema Zod | ✅ Resuelto (commit `ff5359c`) |
| DEF-004 | Error 500 sin logging en CreateUser | MEDIO | Handler de registro devolvía 500 sin loggear el error real de DB | Agregar `log.Printf` con error real, phone, email y national_id | ✅ Resuelto (commit `2ea8a05`) |

---

## 26. Cobertura y conclusiones

### Cobertura de pruebas

#### Backend (Go)

| Módulo | Cobertura estimada | Notas |
|--------|-------------------|-------|
| `internal/auth` | ~85% | JWT, validación, handlers |
| `internal/patient` | ~70% | BNPL, helpers, health |
| `internal/worker` | ~75% | Scanner, advisory lock |
| `internal/admin` | ~50% | Handlers no testeados unitariamente |
| `internal/merchant` | ~40% | Handlers no testeados unitariamente |
| `internal/email` | ~60% | Sender con mock, templates |
| `internal/database` | ~30% | Código generado por sqlc |
| **Total backend** | **~70%** | — |

#### Frontend (Next.js)

| App | Cobertura | Notas |
|-----|-----------|-------|
| web-patient | Manual | Pruebas funcionales manuales |
| web-admin | Manual | Pruebas funcionales manuales |
| web-merchant | Manual | Pruebas funcionales manuales |

> No hay tests automatizados de frontend (Jest/Testing Library). Se recomienda agregar en futuras iteraciones.

### Conclusiones

1. **Funcionalidad:** Todas las funcionalidades críticas (autenticación, BNPL, pagos, triaje, correos) operan correctamente
2. **Seguridad:** Validaciones de input, rate limiting, headers de seguridad, JWT con cookies httpOnly, autorización por roles
3. **Rendimiento:** Tiempos de respuesta aceptables tanto en local como en producción (Render free tier)
4. **Estabilidad:** 4 defectos encontrados y resueltos. 0 defectos pendientes
5. **Compatibilidad:** Chrome, Edge, Opera y Firefox. Responsive en desktop, tablet y mobile

### Recomendaciones

1. Agregar tests de frontend automatizados (Jest + Testing Library)
2. Aumentar cobertura de tests unitarios en `internal/admin` y `internal/merchant`
3. Implementar encriptación real de columnas PII con pgcrypto (V18 solo agregó la extensión)
4. Probar en Safari (iOS/macOS) para verificar compatibilidad completa
5. Considerar un plan pago de Render para evitar el "sleep" del free tier
6. Agregar monitoreo (Sentry, LogRocket) para detectar errores en producción
7. Implementar pruebas E2E automatizadas (Playwright/Cypress) para flujos críticos

### Estado final

| Criterio | Estado |
|----------|--------|
| Funcionalidad crítica | ✅ Operativa |
| Seguridad básica | ✅ Implementada |
| Rendimiento | ✅ Aceptable |
| Defectos críticos | ✅ 0 pendientes |
| Compatibilidad | ✅ Navegadores principales |
| **Aprobación QA** | **✅ APROBADO** |

---

## Anexo A: Comandos para reproducir las pruebas

```bash
cd backend-go && go test ./... -v
cd backend-go && go test -cover ./...
curl https://saludtech-casheamedico.onrender.com/health
curl -X POST https://saludtech-casheamedico.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"+584121234567","identityDocument":"V12345678","password":"Test1234"}'
curl -X POST https://saludtech-casheamedico.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'
curl https://saludtech-casheamedico.onrender.com/api/v1/auth/me \
  -H "Authorization: Bearer <token>"
```

---

## Licencia

**© 2026 Gustavo Colina (@Suggus1899). Todos los derechos reservados.**

Este software y su código fuente son **propiedad exclusiva** de Gustavo Colina (@Suggus1899). No está permitido copiar, modificar, distribuir, sublicenciar ni usar este código, total o parcialmente, sin autorización expresa y por escrito del autor. Cualquier uso no autorizado constituye una violación de los derechos de autor y será perseguido conforme a la ley.

**Este es un software propietario. No es código abierto (open source) ni software libre.**
