package config

import (
	"log"

	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	Port        int    `envconfig:"PORT" default:"8081"`
	DatabaseURL string `envconfig:"DATABASE_URL" required:"true"`
	JWTSecret   string `envconfig:"SALUDTECH_JWT_SECRET" required:"true"`
	QRSecret    string `envconfig:"SALUDTECH_QR_SECRET" required:"true"`

	// DolarVZLA API key (required for USDT endpoints; BCV CDN is free)
	DolarVZLAKey string `envconfig:"DOLARVZLA_KEY"`

	// fakePayment API key (test payment gateway)
	FakePayKey string `envconfig:"FAKEPAY_API_KEY"`

	// Resend API key for transactional emails
	ResendAPIKey string `envconfig:"RESEND_API_KEY"`

	// From email address for outgoing emails
	EmailFrom string `envconfig:"EMAIL_FROM" default:"onboarding@resend.dev"`

	// Frontend URL for email links (verification, CTAs)
	FrontendURL string `envconfig:"FRONTEND_URL" default:"https://salud-tech-cashea-medico-web-patien.vercel.app"`

	// Comma-separated list of allowed CORS origins
	CORSAllowedOrigins string `envconfig:"CORS_ALLOWED_ORIGINS" default:"http://localhost:3000,http://localhost:3001,http://localhost:3002"`

	// ─── Business rules (previously hardcoded) ────────────────────
	JWTExpirationHours     int     `envconfig:"JWT_EXPIRATION_HOURS" default:"24"`
	ReactivationFeeUSD     float64 `envconfig:"REACTIVATION_FEE_USD" default:"4.00"`
	PaymentPointsReward    int     `envconfig:"PAYMENT_POINTS_REWARD" default:"10"`
	InstallmentIntervalDays int    `envconfig:"INSTALLMENT_INTERVAL_DAYS" default:"14"`
	DefaultCreditLimitMain float64 `envconfig:"DEFAULT_CREDIT_LIMIT_MAIN" default:"500"`
	DefaultCreditLimitDaily float64 `envconfig:"DEFAULT_CREDIT_LIMIT_DAILY" default:"200"`

	// Cron schedule for the installment scanner (mora detection).
	// Use @daily for production, @every 1m for testing.
	ScannerCronSchedule string `envconfig:"SCANNER_CRON_SCHEDULE" default:"@daily"`

	// Encryption key for PII columns (pgcrypto pgp_sym_encrypt).
	// Required in production when PII encryption is enabled.
	// Generate with: openssl rand -base64 32
	DBEncryptionKey string `envconfig:"DB_ENCRYPTION_KEY"`
}

func Load() *Config {
	_ = godotenv.Load("../.env")

	var cfg Config
	err := envconfig.Process("", &cfg)
	if err != nil {
		log.Fatalf("Error loading config: %v", err)
	}

	return &cfg
}
