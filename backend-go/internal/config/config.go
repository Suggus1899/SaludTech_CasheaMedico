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

	// Comma-separated list of allowed CORS origins
	CORSAllowedOrigins string `envconfig:"CORS_ALLOWED_ORIGINS" default:"http://localhost:3000,http://localhost:3001,http://localhost:3002"`
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
