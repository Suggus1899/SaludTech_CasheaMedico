# SaludTech CasheaMedico — Manual de Instalación y Configuración del Servidor

**Versión:** 1.0  
**Fecha:** Julio 2026  
**Plataforma:** BNPL HealthTech — Compra ahora, paga después en salud

---

## Índice

1. [Arquitectura general](#1-arquitectura-general)
2. [Requisitos previos](#2-requisitos-previos)
3. [Clonar el repositorio](#3-clonar-el-repositorio)
4. [Configurar PostgreSQL](#4-configurar-postgresql)
5. [Esquema de base de datos (migraciones)](#5-esquema-de-base-de-datos-migraciones)
6. [Variables de entorno](#6-variables-de-entorno)
7. [Backend (Go)](#7-backend-go)
8. [Frontend (Next.js monorepo)](#8-frontend-nextjs-monorepo)
9. [Configuración de correo electrónico](#9-configuración-de-correo-electrónico)
10. [Servicios externos](#10-servicios-externos)
11. [Despliegue en producción (Render + Vercel)](#11-despliegue-en-producción-render--vercel)
12. [Referencia de endpoints API](#12-referencia-de-endpoints-api)
13. [Cron jobs](#13-cron-jobs)
14. [Comandos de verificación](#14-comandos-de-verificación)
15. [Solución de problemas](#15-solución-de-problemas)

---

## 1. Arquitectura general

```
┌─────────────────────────────────────────────────────────────┐
│                    SaludTech CasheaMedico                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  web-patient │  │  web-admin   │  │ web-merchant │       │
│  │  (Next.js)   │  │  (Next.js)   │  │  (Next.js)   │       │
│  │  Vercel      │  │  Vercel      │  │  Vercel      │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                 │                │
│         └────────┬────────┴────────┬────────┘                │
│                  │   REST API      │                         │
│                  ▼                 ▼                         │
│         ┌──────────────────────────────┐                     │
│         │     Backend Go (chi)         │                     │
│         │     Render                   │                     │
│         │     Port 8081                │                     │
│         └──────────┬───────────────────┘                     │
│                    │                                         │
│                    ▼                                         │
│         ┌──────────────────────────────┐                     │
│         │   PostgreSQL (Render)        │                     │
│         │   18 migraciones             │                     │
│         └──────────────────────────────┘                     │
│                                                              │
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
│   ├── internal/
│   │   ├── admin/           # Handlers admin (RBAC)
│   │   ├── auth/            # JWT auth, login, register, validación
│   │   ├── bcv/             # Cliente DolarVZLA (BCV + USDT)
│   │   ├── config/          # Carga de variables de entorno
│   │   ├── database/        # Código generado por sqlc
│   │   ├── email/           # Sender (Resend/Gmail SMTP) + templates
│   │   ├── fakepay/         # Cliente FakePay (pagos de prueba)
│   │   ├── merchant/        # Handlers merchant
│   │   ├── middleware/      # Rate limiting
│   │   ├── patient/         # Handlers patient + BNPL + health
│   │   ├── payment/         # Handler legacy de pagos
│   │   ├── user/            # Handlers user (profile, password)
│   │   └── worker/          # Cron jobs (scanner + reminders)
│   ├── sql/
│   │   ├── schema/          # Migraciones V1..V18 + seed
│   │   └── queries/         # Queries sqlc (*.sql)
│   ├── go.mod
│   └── go.sum
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
├── .env.example             # Template de variables de entorno
└── docs/                    # Documentación
```

---

## 2. Requisitos previos

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

# Windows: descargar instalador desde https://go.dev/dl/
```

**Node.js + pnpm**:
```bash
# Linux/Mac
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
npm install -g pnpm@9.12.0

# Windows: descargar Node.js desde https://nodejs.org/
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

## 3. Clonar el repositorio

```bash
git clone https://github.com/Suggus1899/SaludTech_CasheaMedico.git
cd SaludTech_CasheaMedico
```

---

## 4. Configurar PostgreSQL

### Crear base de datos y usuario

```bash
# Conectar como postgres
sudo -u postgres psql

# Crear base de datos y usuario
CREATE DATABASE saludtech;
CREATE USER saludtech_user WITH ENCRYPTED PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE saludtech TO saludtech_user;
\q
```

### Habilitar extensiones

```bash
psql -U saludtech_user -d saludtech -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
```

### Connection string

```
postgres://saludtech_user:tu_password@localhost:5432/saludtech?sslmode=disable
```

---

## 5. Esquema de base de datos (migraciones)

Las migraciones se ejecutan **automáticamente** al iniciar el backend. No necesitás correrlas manualmente.

### Listado de migraciones

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

### Ejecutar migraciones manualmente (opcional)

```bash
# Las migraciones se ejecutan automáticamente al iniciar el backend.
# Si querés correrlas manualmente:
cd backend-go
psql -U saludtech_user -d saludtech -f sql/schema/V1__initial_schema.sql
psql -U saludtech_user -d saludtech -f sql/schema/V2__seed_data.sql
# ... continuar con V3, V4, etc.
```

---

## 6. Variables de entorno

### Backend (Go)

Crear archivo `.env` en la raíz del proyecto:

```env
# ─── Base de datos ────────────────────────────────────────────
DATABASE_URL=postgres://saludtech_user:tu_password@localhost:5432/saludtech?sslmode=disable

# ─── JWT ──────────────────────────────────────────────────────
SALUDTECH_JWT_SECRET=REDACTED
SALUDTECH_QR_SECRET=REDACTED

# ─── CORS ─────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002

# ─── APIs externas ────────────────────────────────────────────
DOLARVZLA_KEY=tu-api-key-de-dolarvzla
FAKEPAY_API_KEY=tu-api-key-de-fakepay

# ─── Correo electrónico (Gmail SMTP) ──────────────────────────
GMAIL_USER=tu-usuario-gmail
GMAIL_APP_PASSWORD=tu-app-password-de-16-caracteres

# ─── URL del frontend (para links en correos) ─────────────────
FRONTEND_URL=http://localhost:3000

# ─── Puerto ───────────────────────────────────────────────────
PORT=8081

# ─── Cron schedule ────────────────────────────────────────────
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

### Frontend (Next.js)

Cada app necesita su propio `.env.local`:

**`apps/web-patient/.env.local`**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8081/api/v1
JWT_SECRET=REDACTED
NEXT_PUBLIC_MOCK_API=false
```

**`apps/web-admin/.env.local`**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8081/api/v1
JWT_SECRET=REDACTED
NEXT_PUBLIC_MOCK_API=false
```

**`apps/web-merchant/.env.local`**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8081/api/v1
JWT_SECRET=REDACTED
NEXT_PUBLIC_MOCK_API=false
```

> **Importante:** `JWT_SECRET` y `SALUDTECH_JWT_SECRET` deben tener el **mismo valor** en backend y frontends.

---

## 7. Backend (Go)

### Instalar dependencias

```bash
cd backend-go
go mod download
```

### Generar código sqlc (solo si modificaste queries)

```bash
cd backend-go
sqlc generate
```

### Ejecutar en desarrollo

```bash
cd backend-go
go run ./cmd/api/
```

El backend se inicia en `http://localhost:8081`.

### Compilar binario

```bash
cd backend-go
go build -tags netgo -ldflags '-s -w' -o app ./cmd/api/
./app
```

### Ejecutar tests

```bash
cd backend-go
go test ./...
```

### Tests con coverage

```bash
cd backend-go
go test -cover ./...
```

---

## 8. Frontend (Next.js monorepo)

### Instalar dependencias

```bash
# Desde la raíz del proyecto
pnpm install
```

### Ejecutar en desarrollo (todas las apps)

```bash
pnpm dev
```

Esto inicia:
- web-patient en `http://localhost:3000`
- web-admin en `http://localhost:3001`
- web-merchant en `http://localhost:3002`

### Ejecutar una app específica

```bash
# web-patient
pnpm --filter web-patient dev

# web-admin
pnpm --filter web-admin dev

# web-merchant
pnpm --filter web-merchant dev
```

### Build de producción

```bash
pnpm build
```

### Lint

```bash
pnpm lint
```

### Verificación completa

```bash
pnpm check-all
```

---

## 9. Configuración de correo electrónico

El sistema soporta dos proveedores de email:

### Opción A: Gmail SMTP (recomendado para desarrollo)

1. Activar **2-Step Verification** en https://myaccount.google.com/security
2. Crear **App Password** en https://myaccount.google.com/apppasswords
3. Configurar variables:
```env
GMAIL_USER=tu-usuario-gmail
GMAIL_APP_PASSWORD=tu-app-password-de-16-caracteres
```

**Ventajas:** Envía a cualquier correo, no requiere dominio verificado.  
**Límites:** ~500 emails/día.

### Opción B: Resend (recomendado para producción)

1. Crear cuenta en https://resend.com
2. Verificar dominio en Resend (agregar registros DNS: MX, SPF, DKIM)
3. Configurar variables:
```env
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=no-reply@tudominio.com
```

**Ventajas:** Mayor deliverability, sin límite diario restrictivo.  
**Requiere:** Dominio verificado.

### Prioridad de proveedores

Si `RESEND_API_KEY` está seteada → usa Resend.  
Si no, pero `GMAIL_APP_PASSWORD` está seteada → usa Gmail SMTP.  
Si ninguna está seteada → modo no-op (solo loggea, no envía).

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

## 10. Servicios externos

### DolarVZLA API

- **URL:** https://dolarvzla.com
- **Uso:** Obtener tasa BCV y USDT para conversión de montos
- **Variable:** `DOLARVZLA_KEY`
- **BCV CDN:** Gratuito (no requiere API key)
- **USDT endpoints:** Requieren API key

### FakePay

- **URL:** https://fakepayment.onrender.com
- **Uso:** Pasarela de pago de prueba para simular pagos
- **Variable:** `FAKEPAY_API_KEY`

---

## 11. Despliegue en producción (Render + Vercel)

### Backend en Render

1. Crear cuenta en https://render.com
2. Crear **Web Service** desde el repo de GitHub
3. Configurar:
   - **Build Command:** `go build -tags netgo -ldflags '-s -w' -o app ./cmd/api/`
   - **Start Command:** `./app`
   - **Environment:** Go 1.26+
4. Crear **PostgreSQL** en Render (addon)
5. Configurar variables de entorno (ver sección 6)

### Base de datos en Render

1. Crear **PostgreSQL** instance en Render
2. Obtener **Internal Database URL** (ej: `postgresql://user:pass@dpg-xxx-a/db`)
3. Setear como `DATABASE_URL` en el backend

### Frontend en Vercel

1. Crear cuenta en https://vercel.com
2. Importar el repo desde GitHub
3. Configurar cada app como proyecto separado:

**web-patient:**
- **Root Directory:** `apps/web-patient`
- **Build Command:** `next build`
- **Output Directory:** `.next`
- **Variables:** `NEXT_PUBLIC_API_URL`, `JWT_SECRET`, `NEXT_PUBLIC_MOCK_API=false`

**web-admin:**
- **Root Directory:** `apps/web-admin`
- **Build Command:** `next build`
- **Output Directory:** `.next`
- **Variables:** `NEXT_PUBLIC_API_URL`, `JWT_SECRET`, `NEXT_PUBLIC_MOCK_API=false`

**web-merchant:**
- **Root Directory:** `apps/web-merchant`
- **Build Command:** `next build`
- **Output Directory:** `.next`
- **Variables:** `NEXT_PUBLIC_API_URL`, `JWT_SECRET`, `NEXT_PUBLIC_MOCK_API=false`

4. Setear `NEXT_PUBLIC_API_URL` a la URL del backend en Render:
```
NEXT_PUBLIC_API_URL=https://saludtech-casheamedico.onrender.com/api/v1
```

5. Setear `CORS_ALLOWED_ORIGINS` en Render con las URLs de Vercel:
```
CORS_ALLOWED_ORIGINS=https://tu-app-patient.vercel.app,https://tu-app-admin.vercel.app
```

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

## 12. Referencia de endpoints API

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

## 13. Cron jobs

### Installment Scanner (Mora Ética)

- **Schedule:** `@daily` (configurable con `SCANNER_CRON_SCHEDULE`)
- **Función:** Detecta cuotas vencidas, aplica cargo de reactivación ($4), pausa líneas de crédito, envía email de mora
- **Advisory Lock:** Usa `pg_try_advisory_xact_lock` para evitar ejecución concurrente en múltiples instancias

### Payment Reminder

- **Schedule:** Diario a las 09:00 AM
- **Función:** Envía recordatorios por email de cuotas que vencen en los próximos 3 días

---

## 14. Comandos de verificación

### Backend

```bash
# Health check
curl http://localhost:8081/health
# Esperado: OK - Go Backend Running

# Registro de usuario
curl -X POST http://localhost:8081/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phone": "+584121234567",
    "identityDocument": "V12345678",
    "password": "Test1234"
  }'

# Login
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'

# Perfil (con token)
curl http://localhost:8081/api/v1/auth/me \
  -H "Authorization: Bearer <tu-token-jwt>"
```

### Frontend

```bash
# Verificar que las apps corren
curl http://localhost:3000  # web-patient
curl http://localhost:3001  # web-admin
curl http://localhost:3002  # web-merchant
```

### Base de datos

```bash
# Verificar migraciones aplicadas
psql -U saludtech_user -d saludtech -c "SELECT * FROM schema_migrations ORDER BY version;"

# Verificar tablas
psql -U saludtech_user -d saludtech -c "\dt"

# Verificar usuarios
psql -U saludtech_user -d saludtech -c "SELECT id, phone, email, role FROM users LIMIT 10;"
```

---

## 15. Solución de problemas

### El backend no inicia

```bash
# Verificar conexión a DB
psql -U saludtech_user -d saludtech -c "SELECT 1;"

# Verificar variables de entorno
cd backend-go && go run ./cmd/api/ 2>&1 | head -20

# Error común: DATABASE_URL incorrecta
# Verificar formato: postgres://user:pass@host:port/dbname?sslmode=disable
```

### Migraciones fallan

```bash
# Error: column contains NULL values
# Solución: V17 incluye backfill de NULLs. Si falla, verificar que V17 se ejecutó completamente.

# Verificar qué migraciones se aplicaron
psql -U saludtech_user -d saludtech -c "SELECT * FROM schema_migrations ORDER BY version;"
```

### CORS error en frontend

```
Access to fetch at 'https://backend...' from origin 'https://frontend...' 
has been blocked by CORS policy
```

**Solución:** Agregar la URL del frontend en `CORS_ALLOWED_ORIGINS` del backend.

### CSP error en frontend

```
Refused to connect because it violates the document's Content Security Policy
```

**Solución:** Verificar que `NEXT_PUBLIC_API_URL` esté configurada en Vercel y que el CSP en `next.config.js` use `new URL().origin` (sin path).

### Correos no se envían

```bash
# Verificar configuración de Gmail
# 1. 2-Step Verification activado
# 2. App Password generada
# 3. GMAIL_USER y GMAIL_APP_PASSWORD seteadas

# Verificar logs del backend
# Debe aparecer: "📧 Using Gmail SMTP for outgoing emails (user: xxx@gmail.com)"
```

### "Failed to fetch" en frontend

1. Verificar que el backend esté corriendo: `curl https://tu-backend.onrender.com/health`
2. Verificar `NEXT_PUBLIC_API_URL` en Vercel
3. Verificar `CORS_ALLOWED_ORIGINS` en Render
4. Hacer redeploy en Vercel después de cambiar variables `NEXT_PUBLIC_*`
5. Render free tier "duerme" — la primera petición puede tardar 30-50s

---

## Puertos

| Servicio | Puerto | URL local |
|----------|--------|-----------|
| Backend Go | 8081 | http://localhost:8081 |
| web-patient | 3000 | http://localhost:3000 |
| web-admin | 3001 | http://localhost:3001 |
| web-merchant | 3002 | http://localhost:3002 |
| PostgreSQL | 5432 | localhost:5432 |
