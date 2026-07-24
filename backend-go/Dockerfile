# ─── Build stage ──────────────────────────────────────────────────────────────
FROM golang:1.26-alpine AS builder

WORKDIR /app

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/server ./cmd/api

# ─── Runtime stage ────────────────────────────────────────────────────────────
FROM alpine:3.21

RUN apk add --no-cache ca-certificates tzdata wget

RUN addgroup -g 10001 -S appgroup && adduser -u 10001 -S appuser -G appgroup

WORKDIR /app

# Copy binary
COPY --from=builder /bin/server /app/server

# Copy migration files (EnsureMigrations reads sql/schema/ at runtime)
COPY --from=builder /app/sql/schema /app/sql/schema

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost:8081/health || exit 1

CMD ["/app/server"]
