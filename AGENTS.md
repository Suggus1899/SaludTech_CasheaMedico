# SaludTech CasheaMedico — Project Guide

## Stack
- **Backend**: Go 1.26, chi router, pgx/v5, pgxpool, bcrypt, JWT
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, DaisyUI, next-intl
- **Monorepo**: pnpm workspaces — `apps/web-patient`, `apps/web-admin`, `apps/web-merchant`, `apps/web-landing`, `packages/shared`, `packages/ui`
- **DB**: PostgreSQL (Render), pgcrypto extension
- **Deploy**: Render (backend), Vercel (frontend)

## Build & Test Commands
```bash
# Backend
cd backend-go && go build ./...
cd backend-go && go test ./...

# Frontend (per app)
cd apps/web-patient && pnpm exec next build
cd apps/web-admin && pnpm exec next build
cd apps/web-merchant && pnpm exec next build

# Install deps
pnpm install
```

## Architecture
- Backend: `cmd/api/main.go` → chi router → middleware stack → handlers
- Frontend: App Router with `(app)` route group for authenticated pages
- Shared: `packages/shared` (api, session, useFetchData, QueryProvider), `packages/ui` (Logo, Sidebar)
- Migrations: `backend-go/sql/schema/V*.sql` applied by `database.EnsureMigrations`

## Middleware Stack (main.go)
1. CORS (credentials: true, X-CSRF-Token header)
2. RequestID → RealIP → LoggingMiddleware (slog) → SentryMiddleware → Recoverer → Timeout
3. CSRFMiddleware (exempts /auth/login, /auth/register, /auth/logout + Bearer auth)
4. auth.Middleware (JWT from cookie or Bearer) → auth.RevocationMiddleware (jti)
5. appmw.AuditMiddleware (logs POST/PUT/PATCH/DELETE)

## Key Patterns
- **JWT**: httpOnly cookie (`jwt_token`) set by backend on Render domain + non-httpOnly cookie on Vercel domain (set by frontend `setSession`) for Next.js middleware (`proxy.ts`)
- **CSRF**: double-submit cookie, exempts public auth endpoints and Bearer auth
- **PII encryption**: pgcrypto `pgp_sym_encrypt`, GUC `app.encryption_key` set via `SET LOCAL` in migration tx. `current_setting(..., true)` for missing_ok
- **React Query**: `QueryProvider` in all 3 app layouts, `useFetchData` delegates to `useQueryData`
- **Bank logos**: `apps/web-patient/public/banks/` — PNG from bancos-venezuela-codigos repo, SVG from Simple Icons (Stripe, PayPal), placeholder for Zinli
- **Bank selector**: mobile = native `<select>` with code + name, desktop = grid with logos

## Environment Variables
- `DATABASE_URL` (required)
- `SALUDTECH_JWT_SECRET` (required)
- `SALUDTECH_QR_SECRET` (required)
- `DB_ENCRYPTION_KEY` (optional — PII encryption, generate with `openssl rand -base64 32`)
- `SENTRY_DSN` (optional)
- `LOG_LEVEL` (default INFO)
- `APP_ENV` (default development)
- `CORS_ALLOWED_ORIGINS` (comma-separated)
- `JWT_SECRET` (frontend — for proxy.ts JWT verification)

## Bank Codes (Venezuela)
0102 BDV, 0134 Banesco, 0105 Mercantil, 0108 Provincial, 0191 BNC, 0114 Bancaribe, 0163 Tesoro, 0128 Caroní, 0171 Bancamiga, 0174 Bangente, 0156 100% Banco

## Known Issues
- Zinli logo is a placeholder SVG (no official logo found)
- V21 migration backfills encrypted columns only if `DB_ENCRYPTION_KEY` is set
- Cross-origin cookies: backend sets httpOnly on Render, frontend sets non-httpOnly on Vercel
