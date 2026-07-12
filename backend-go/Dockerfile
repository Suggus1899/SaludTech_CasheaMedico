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

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

# Copy binary
COPY --from=builder /bin/server /app/server

# Copy migration files (EnsureMigrations reads sql/schema/ at runtime)
COPY --from=builder /app/sql/schema /app/sql/schema

EXPOSE 8081

CMD ["/app/server"]
