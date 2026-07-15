<div align="center">

# 🏥 SaludTech

### BNPL HealthTech Platform — Salud financiada a tu alcance

Plataforma **Buy Now, Pay Later** de cero interés orientada exclusivamente al sector salud en Venezuela. Los pacientes financian servicios y productos médicos pagando una fracción inicial y el resto en cuotas cada 14 días.

</div>

<br>

<div align="center">

## 🛠️ Tech Stack

</div>

<table align="center">
<tr>
<th colspan="5" align="center" width="600"><sub><b>Frontend</b></sub></th>
</tr>
<tr>
<td align="center" width="120">
<a href="https://nextjs.org/" target="_blank"><img src="https://cdn.simpleicons.org/nextdotjs/000000" width="48" height="48" alt="Next.js" /></a>
<br><sub><b><a href="https://nextjs.org/" target="_blank">Next.js 16</a></b></sub>
<br><sub>App Router</sub>
</td>
<td align="center" width="120">
<a href="https://react.dev/" target="_blank"><img src="https://cdn.simpleicons.org/react/61DAFB" width="48" height="48" alt="React" /></a>
<br><sub><b><a href="https://react.dev/" target="_blank">React 19</a></b></sub>
<br><sub>Server Components</sub>
</td>
<td align="center" width="120">
<a href="https://www.typescriptlang.org/" target="_blank"><img src="https://cdn.simpleicons.org/typescript/3178C6" width="48" height="48" alt="TypeScript" /></a>
<br><sub><b><a href="https://www.typescriptlang.org/" target="_blank">TypeScript 5</a></b></sub>
<br><sub>Type-safe</sub>
</td>
<td align="center" width="120">
<a href="https://tailwindcss.com/" target="_blank"><img src="https://cdn.simpleicons.org/tailwindcss/06B6D4" width="48" height="48" alt="Tailwind CSS" /></a>
<br><sub><b><a href="https://tailwindcss.com/" target="_blank">Tailwind v4</a></b></sub>
<br><sub>Utility-first</sub>
</td>
<td align="center" width="120">
<a href="https://daisyui.com/" target="_blank"><img src="https://cdn.simpleicons.org/daisyui/7C3AED" width="48" height="48" alt="DaisyUI" /></a>
<br><sub><b><a href="https://daisyui.com/" target="_blank">DaisyUI v5</a></b></sub>
<br><sub>Component lib</sub>
</td>
</tr>
<tr>
<th colspan="5" align="center" width="600"><sub><b>Backend</b></sub></th>
</tr>
<tr>
<td align="center" width="120">
<a href="https://go.dev/" target="_blank"><img src="https://cdn.simpleicons.org/go/00ADD8" width="48" height="48" alt="Go" /></a>
<br><sub><b><a href="https://go.dev/" target="_blank">Go 1.26</a></b></sub>
<br><sub>Backend API</sub>
</td>
<td align="center" width="120">
<a href="https://github.com/go-chi/chi" target="_blank"><img src="https://cdn.simpleicons.org/chi/000000" width="48" height="48" alt="go-chi" /></a>
<br><sub><b><a href="https://github.com/go-chi/chi" target="_blank">go-chi v5</a></b></sub>
<br><sub>HTTP router</sub>
</td>
<td align="center" width="120">
<a href="https://www.postgresql.org/" target="_blank"><img src="https://cdn.simpleicons.org/postgresql/4169E1" width="48" height="48" alt="PostgreSQL" /></a>
<br><sub><b><a href="https://www.postgresql.org/" target="_blank">PostgreSQL 16</a></b></sub>
<br><sub>Primary DB</sub>
</td>
<td align="center" width="120">
<a href="https://jwt.io/" target="_blank"><img src="https://cdn.simpleicons.org/jsonwebtokens/000000" width="48" height="48" alt="JWT" /></a>
<br><sub><b><a href="https://jwt.io/" target="_blank">JWT</a></b></sub>
<br><sub>HS256 · 24h</sub>
</td>
<td align="center" width="120">
<a href="https://sqlc.dev/" target="_blank"><img src="https://cdn.simpleicons.org/sqlc/000000" width="48" height="48" alt="sqlc" /></a>
<br><sub><b><a href="https://sqlc.dev/" target="_blank">sqlc</a></b></sub>
<br><sub>Type-safe SQL</sub>
</td>
</tr>
<tr>
<th colspan="5" align="center" width="600"><sub><b>Tooling & Infra</b></sub></th>
</tr>
<tr>
<td align="center" width="120">
<a href="https://pnpm.io/" target="_blank"><img src="https://cdn.simpleicons.org/pnpm/F69220" width="48" height="48" alt="pnpm" /></a>
<br><sub><b><a href="https://pnpm.io/" target="_blank">pnpm 9</a></b></sub>
<br><sub>Workspaces</sub>
</td>
<td align="center" width="120">
<a href="https://turbo.build/repo" target="_blank"><img src="https://cdn.simpleicons.org/turborepo/EF4444" width="48" height="48" alt="Turborepo" /></a>
<br><sub><b><a href="https://turbo.build/repo" target="_blank">Turborepo</a></b></sub>
<br><sub>Build system</sub>
</td>
<td align="center" width="120">
<a href="https://www.docker.com/" target="_blank"><img src="https://cdn.simpleicons.org/docker/2496ED" width="48" height="48" alt="Docker" /></a>
<br><sub><b><a href="https://www.docker.com/" target="_blank">Docker</a></b></sub>
<br><sub>Containerization</sub>
</td>
<td align="center" width="120">
<a href="https://nginx.org/" target="_blank"><img src="https://cdn.simpleicons.org/nginx/009639" width="48" height="48" alt="nginx" /></a>
<br><sub><b><a href="https://nginx.org/" target="_blank">nginx</a></b></sub>
<br><sub>Reverse proxy</sub>
</td>
<td align="center" width="120">
<a href="https://vercel.com/" target="_blank"><img src="https://cdn.simpleicons.org/vercel/000000" width="48" height="48" alt="Vercel" /></a>
<br><sub><b><a href="https://vercel.com/" target="_blank">Vercel</a></b></sub>
<br><sub>Frontend deploy</sub>
</td>
</tr>
</table>

<br>

## 📐 Arquitectura

```
                    ┌─────────────────────────────────────────────────┐
                    │                   nginx (port 80)                │
                    │              saludtech.local / api / admin       │
                    └──────┬──────────────────┬────────────────────────┘
                           │                  │
            ┌──────────────▼──────────┐  ┌────▼──────────────────────┐
            │  Backend Go (port 8081) │  │  Next.js Apps             │
            │  go-chi · sqlc · pgx    │  │  ├── web-patient (PWA)    │
            │  JWT · Cron            │  │  ├── web-admin            │
            └──────────┬──────────────┘  │  ├── web-merchant         │
                       │                  │  └── web-landing          │
            ┌──────────▼──────────┐       └───────────────────────────┘
            │  PostgreSQL 16      │
            └─────────────────────┘
```

## 📱 Aplicaciones

| App | Descripción | Puerto | Rol |
|-----|-------------|--------|-----|
| **web-patient** | PWA instalable para pacientes — login, dashboard, cuotas, pagar (QR), suscripciones, triaje, cuidado mayor, perfil/gamificación | 3000 | PATIENT |
| **web-admin** | Backoffice administrativo — gestión de usuarios, merchants, transacciones, payouts | 3001 | ADMIN |
| **web-merchant** | Dashboard del comercio — QR dinámico, transacciones, payouts, suscripciones | 3002 | MERCHANT |
| **web-landing** | Landing page pública — marketing y captación de usuarios | 3003 | PUBLIC |

## 📦 Estructura del Monorepo

```
saludtech/
├── backend-go/              ← Go API (go-chi + sqlc + pgx)
│   ├── cmd/api/             ← Entry point + router
│   ├── internal/
│   │   ├── auth/            ← JWT login + register
│   │   ├── config/          ← envconfig + godotenv
│   │   ├── credit/          ← BNPL transaction creation
│   │   ├── database/        ← sqlc generated code
│   │   ├── merchant/        ← Merchant payouts
│   │   ├── payment/         ← Installment payment processing
│   │   ├── patient/         ← Patient handler (checkout, triage, health)
│   │   ├── user/            ← User profile
│   │   └── worker/          ← Cron installment scanner
│   └── sql/                 ← sqlc queries + migrations (V1-V18)
│
├── apps/
│   ├── web-patient/         ← Next.js 16 PWA (paciente)
│   │   └── src/
│   │       ├── app/         ← App Router pages
│   │       ├── components/  ← ServiceWorkerRegister + shared
│   │       ├── hooks/       ← useFetchData
│   │       ├── lib/         ← api client, utils, QR parser
│   │       └── types/       ← TypeScript domain types
│   ├── web-admin/           ← Next.js (admin backoffice)
│   ├── web-merchant/        ← Next.js (merchant dashboard)
│   └── web-landing/         ← Next.js (landing page)
│
├── packages/
│   ├── ui/                  ← @saludtech/ui shared components
│   └── config/              ← Shared config (reserved)
│
├── .github/workflows/       ← CI (Web Apps + Go Backend)
├── nginx.conf               ← Reverse proxy config
├── pnpm-workspace.yaml      ← Workspace definition
└── turbo.json               ← Turborepo pipeline
```

## 🚀 Quick Start

### Prerrequisitos

| Herramienta | Versión | Instalación |
|-------------|---------|-------------|
| Go | 1.26+ | [go.dev/dl](https://go.dev/dl/) |
| Node.js | 20+ | [nodejs.org](https://nodejs.org/) |
| pnpm | 9.12+ | `npm install -g pnpm` |
| PostgreSQL | 16+ | [postgresql.org](https://www.postgresql.org/download/) |

### 1. Base de datos

```bash
# Crear base de datos
createdb saludtech

# Las migraciones (V1-V18) se ejecutan automáticamente al iniciar el backend.
# Si querés correrlas manualmente:
psql -d saludtech -f backend-go/sql/schema/V1__initial_schema.sql
psql -d saludtech -f backend-go/sql/schema/V2__seed_data.sql
# ... continuar hasta V18__pgcrypto.sql
```

### 2. Variables de entorno

Ver sección [🔧 Variables de Entorno](#-variables-de-entorno) abajo.

### 3. Backend (Go)

```bash
cd backend-go
go run ./cmd/api
# ✅ Servidor en http://localhost:8081
# ✅ Migraciones se ejecutan automáticamente
```

### 4. Frontend (todas las apps)

```bash
# Instalar dependencias del monorepo
pnpm install

# Levantar todas las apps en paralelo
pnpm dev

# O levantar individualmente:
cd apps/web-patient  && pnpm dev   # → http://localhost:3000
cd apps/web-admin    && pnpm dev   # → http://localhost:3001
cd apps/web-merchant && pnpm dev   # → http://localhost:3002
cd apps/web-landing  && pnpm dev   # → http://localhost:3003
```

### 5. Build de producción

```bash
# Todas las apps
pnpm build

# Solo web-patient
cd apps/web-patient && pnpm build
```

## 📊 Reglas de Negocio

### Niveles de Usuario (1-6)

| Nivel | Pago Inicial Mín. | Máx. Cuotas | Requisito | Beneficios |
|-------|-------------------|-------------|-----------|------------|
| 1 | 60% | 3 | Nuevo usuario | Línea básica |
| 2 | 50% | 3 | $120 pagados o 5 cuotas | — |
| 3 | 40% | 6 | $400 pagados o 10 cuotas | — |
| 4 | 40% | 9 | $800 pagados o 20 cuotas | Cuidado Mayor desbloqueado |
| 5 | 40% | 12 | $2000 pagados o 40 cuotas | — |
| 6 | 40% | 12 | $4000 pagados o 80 cuotas | Línea máxima |

### Líneas de Crédito

| Tipo | Descripción | Requisito |
|------|-------------|-----------|
| `ESPECIALIDAD_PRINCIPAL` | Línea principal para especialidades médicas | Nivel 1+ |
| `SALUD_COTIDIANA` | Farmacia e insumos crónicos (1/3 de la principal) | Nivel 1+ |
| `MAYOR_CUIDADO` | Cuidado de adultos mayores (enfermería, caregiver) | Nivel 4+ |

### Mora

- Cargo de reactivación: **$4** por cuota en mora
- **2 días** de gracia después del vencimiento
- Pausa automática de línea de crédito
- Degradación de nivel después de **14+ días**
- Reset a nivel 1 después de **28+ días**
- Background worker (`robfig/cron/v3`) escanea diariamente

## 📲 Web Patient — Features

| Feature | Descripción |
|---------|-------------|
| **Auth** | Login + registro con sesión JWT (cookie + localStorage) |
| **Dashboard** | Líneas de crédito, próximos pagos, acciones rápidas |
| **Cuotas** | Lista de pendientes/en mora + detalle + pago con confirmación |
| **Pagar (QR)** | Scanner @zxing/browser + entrada manual + checkout con selector de cuotas (3/6/9/12) |
| **Suscripciones** | Farmacia mensual — activar/cancelar |
| **Cuidado Mayor** | Servicios para adultos mayores — validación de nivel 4+ |
| **Triaje** | Formulario de síntomas + historial + merchants recomendados |
| **Perfil de Salud** | Historial médico, alergias, condiciones crónicas, medicamentos, contacto de emergencia |
| **Citas Médicas** | Agendamiento con comercios afiliados |
| **Registros Médicos** | Diagnósticos, recetas, resultados de laboratorio |
| **Recordatorios** | Medicación crónica con horarios configurables |
| **Familiares** | Cuidador-paciente con permisos granulares |
| **Perfil** | Gamificación (nivel, puntos) + logout |
| **PWA** | Manifest + Service Worker + offline + install prompt + update toast |

## 🔧 Variables de Entorno

### Backend Go

| Variable | Requerida | Default | Descripción |
|----------|-----------|---------|-------------|
| `DATABASE_URL` | ✅ | — | Connection string PostgreSQL |
| `SALUDTECH_JWT_SECRET` | ✅ | — | Secret para firmar JWT |
| `PORT` | ❌ | `8081` | Puerto del servidor |
| `CORS_ALLOWED_ORIGINS` | ✅ prod | — | Origins permitidos (separados por coma) |

### Web Apps (Next.js)

| Variable | Requerida | Default | Descripción |
|----------|-----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | ✅ | — | URL base del backend Go |
| `JWT_SECRET` | ✅ prod | `fallback-dev-only-change-me` | Secret para verificar JWT en middleware |

### Ejemplo `.env`

```env
# Backend Go
DATABASE_URL=postgres://postgres:postgres@localhost:5432/saludtech
SALUDTECH_JWT_SECRET=tu-secreto-super-seguro-cambiar-en-produccion
PORT=8081

# Web Apps
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081/api/v1
JWT_SECRET=tu-secreto-super-seguro-cambiar-en-produccion
```

## 🧪 Testing & CI

```bash
# Lint todas las apps
pnpm lint

# Build todas las apps
pnpm build

# Test (apps que tienen tests)
pnpm test

# Todo en uno
pnpm check-all
```

### CI Pipeline (GitHub Actions)

| Job | Descripción |
|-----|-------------|
| **Web Apps (Next.js)** | Install → Build → Lint → Test (pnpm + Turborepo) |
| **Backend (Go)** | `go build ./...` → `go vet ./...` |

## 📜 Licencia

**© 2026 Gustavo Colina (@Suggus1899). Todos los derechos reservados.**

Este software y su código fuente son **propiedad exclusiva** de Gustavo Colina (@Suggus1899). 

- **No** está permitido copiar, modificar, distribuir, sublicenciar ni usar este código, total o parcialmente, sin autorización expresa y por escrito del autor.
- **No** está permitido usar este código con fines comerciales ni privados sin una licencia válida.
- Cualquier uso no autorizado constituye una violación de los derechos de autor y será perseguido conforme a la ley.

**Este es un software propietario. No es código abierto (open source) ni software libre.**

---

<div align="center">

<sub>Hecho con ❤️ para el sector salud de Venezuela</sub>

</div>
