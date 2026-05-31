# SaludTech — BNPL HealthTech Platform

> Plataforma BNPL (Buy Now, Pay Later) de cero interés orientada exclusivamente al sector salud en Venezuela.

Los pacientes financian servicios y productos médicos pagando una fracción inicial y el resto en cuotas cada 14 días.

## Stack

| Capa | Tecnología |
|------|------------|
| Mobile (Pacientes) | Flutter (Dart) — iOS + Android |
| Web Admin Backoffice | Next.js 14 + TypeScript + TailwindCSS + shadcn/ui |
| Web Merchant Dashboard | Next.js 14 + TypeScript + TailwindCSS + shadcn/ui |
| Backend API | Java 17 + Spring Boot 3.4.5 |
| ORM | Spring Data JPA + Hibernate |
| Base de datos | PostgreSQL 16 |
| Caché / Sesiones | Redis 7 |
| Auth | JWT (access + refresh tokens) + Spring Security |
| KYC / OCR | AWS Rekognition (cédula venezolana) |
| QR | qr_code_dart (Flutter) + qrcode.react (Web) |
| Cron Jobs | Spring @Scheduled (daily installment scanner) |
| Notificaciones | Firebase Cloud Messaging |
| Contenerización | Docker + Docker Compose |

## Estructura del Monorepo

```
saludtech/
├── backend/          ← Spring Boot API
├── web-admin/        ← Next.js Admin Backoffice
├── web-merchant/     ← Next.js Merchant Dashboard
├── mobile/           ← Flutter Patient App
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerrequisitos
- Java 17+
- Node.js 18+
- Flutter SDK 3.3+
- Docker + Docker Compose

### 1. Levantar infraestructura
```bash
cp .env.example .env
# Editar .env con tus valores
docker compose up -d postgres redis
```

### 2. Backend
```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### 3. Web Admin
```bash
cd web-admin
npm install
npm run dev
```

### 4. Web Merchant
```bash
cd web-merchant
npm install
npm run dev
```

### 5. Mobile
```bash
cd mobile
flutter pub get
flutter run
```

## API Endpoints

| Grupo | Prefijo | Rol |
|-------|---------|-----|
| Paciente | `/api/v1/patient/**` | PATIENT |
| Merchant | `/api/v1/merchant/**` | MERCHANT |
| Admin | `/api/v1/admin/**` | ADMIN |

## Niveles de Usuario (1-6)

| Nivel | Pago Inicial Mín. | Máx. Cuotas | Requisito |
|-------|-------------------|-------------|----------|
| 1 | 60% | 3 | Nuevo usuario |
| 2 | 50% | 3 | $120 pagados o 5 cuotas |
| 3 | 40% | 6 | $400 pagados o 10 cuotas |
| 4 | 40% | 9 | $800 pagados o 20 cuotas |
| 5 | 40% | 12 | $2000 pagados o 40 cuotas |
| 6 | 40% | 12 | $4000 pagados o 80 cuotas |

## Línea Salud Diaria
- 1/3 de la Línea Principal
- Máximo 1 cuota
- Para farmacias e insumos crónicos

## Mora
- Cargo de reactivación: $4 por cuota en mora
- 2 días de gracia después del vencimiento
- Pausa automática de línea de crédito
- Degradación de nivel después de 14+ días
- Reset a nivel 1 después de 28+ días

## Licencia
Propietario — Todos los derechos reservados.
