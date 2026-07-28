---
name: saludtech-verify
description: Verify SaludTech changes — build backend (Go), build affected Next.js apps, smoke-test API endpoints, and check for regressions before commit. Trigger after implementing changes in backend-go/ or apps/, before committing, or when the user asks to "verify", "build", "test", or "check" the project.
---

# SaludTech Verify

Run the appropriate verification for changes made in the SaludTech CasheaMedico monorepo before considering a task complete.

## Step 1 — Identify affected scope

Inspect `git status` and `git diff --name-only HEAD` to determine which areas changed:

- `backend-go/**` → run Go verification
- `apps/web-patient/**` → build web-patient
- `apps/web-admin/**` → build web-admin
- `apps/web-merchant/**` → build web-merchant
- `apps/web-landing/**` → build web-landing
- `packages/**` → build all apps that depend on the changed package
- `backend-go/sql/schema/V*.sql` → migrations run automatically on backend startup; still run `go build ./...`

## Step 2 — Backend verification (Go)

Run from `backend-go/`:

```powershell
cd backend-go
go build ./...
go vet ./...
go test ./...
```

- If `go build` fails → STOP, report the error, do not commit.
- If `go vet` reports issues → fix before continuing.
- If `go test` fails → STOP, report failing tests with output.

## Step 3 — Frontend verification (Next.js)

For each affected app, run from the repo root:

```powershell
pnpm --filter web-patient build
pnpm --filter web-admin build
pnpm --filter web-merchant build
pnpm --filter web-landing build
```

Only build apps whose source changed. If `packages/shared` or `packages/ui` changed, build all three app apps (patient, admin, merchant) that consume them.

- If a build fails → STOP, report the error with the app name and compiler output.
- Do NOT run `pnpm build` at the root unless all apps are affected (it builds everything and is slow).

## Step 4 — API smoke test (only if backend endpoints changed)

If handlers in `backend-go/internal/*/handler.go` or routes in `backend-go/cmd/api/main.go` changed, and the backend is running locally on `http://localhost:8081`:

```powershell
Invoke-RestMethod -Uri "http://localhost:8081/api/v1/health" -Method GET
```

- If the backend is not running, skip this step and note it in the report.
- If a endpoint returns 5xx → STOP and report.

## Step 5 — Report

Summarize in a concise block:

- Scope affected (backend / which apps / packages)
- Build result per target (pass/fail)
- Test result (pass/fail/count)
- Smoke test result (pass/fail/skipped + reason)
- Any warnings from `go vet` or TypeScript

If everything passes, the change is verified. Do NOT auto-commit or auto-push unless the `post-change` workflow is explicitly invoked by the user.

## Rules

- Never skip `go build` after Go changes.
- Never skip the affected app build after frontend changes.
- Never commit a failing build. Stop and report.
- Migrations in `backend-go/sql/schema/` are applied by `database.EnsureMigrations` on backend start — do not apply them manually unless explicitly asked.
