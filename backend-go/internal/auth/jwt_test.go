package auth

import (
	"testing"
	"time"

	"github.com/saludtech/backend-go/internal/config"
)

func testConfig() *config.Config {
	return &config.Config{
		JWTSecret:       "test-secret-key-at-least-32-characters-long-for-testing",
		JWTExpirationHours: 1,
	}
}

func TestGenerateAndValidateToken(t *testing.T) {
	cfg := testConfig()
	token, err := GenerateToken("user-123", "PATIENT", cfg)
	if err != nil {
		t.Fatalf("GenerateToken() error: %v", err)
	}
	if token == "" {
		t.Fatal("GenerateToken() returned empty token")
	}

	claims, err := ValidateToken(token, cfg)
	if err != nil {
		t.Fatalf("ValidateToken() error: %v", err)
	}
	if claims.UserID != "user-123" {
		t.Errorf("ValidateToken() UserID = %s, want user-123", claims.UserID)
	}
	if claims.Role != "PATIENT" {
		t.Errorf("ValidateToken() Role = %s, want PATIENT", claims.Role)
	}
}

func TestValidateToken_WrongSecret(t *testing.T) {
	cfg1 := testConfig()
	cfg2 := &config.Config{
		JWTSecret:          "different-secret-also-at-least-32-characters-long",
		JWTExpirationHours: 1,
	}

	token, _ := GenerateToken("user-123", "PATIENT", cfg1)
	_, err := ValidateToken(token, cfg2)
	if err == nil {
		t.Fatal("ValidateToken() with wrong secret should fail")
	}
}

func TestValidateToken_ExpiredToken(t *testing.T) {
	cfg := &config.Config{
		JWTSecret:          "test-secret-key-at-least-32-characters-long-for-testing",
		JWTExpirationHours: -1, // Already expired
	}

	token, err := GenerateToken("user-123", "PATIENT", cfg)
	if err != nil {
		t.Fatalf("GenerateToken() error: %v", err)
	}

	_, err = ValidateToken(token, &config.Config{
		JWTSecret:          "test-secret-key-at-least-32-characters-long-for-testing",
		JWTExpirationHours: 1,
	})
	if err == nil {
		t.Fatal("ValidateToken() with expired token should fail")
	}
}

func TestValidateToken_EmptyToken(t *testing.T) {
	cfg := testConfig()
	_, err := ValidateToken("", cfg)
	if err == nil {
		t.Fatal("ValidateToken() with empty token should fail")
	}
}

func TestGenerateToken_DifferentUsers(t *testing.T) {
	cfg := testConfig()
	token1, _ := GenerateToken("user-1", "PATIENT", cfg)
	token2, _ := GenerateToken("user-2", "ADMIN", cfg)

	if token1 == token2 {
		t.Fatal("Tokens for different users should be different")
	}

	claims1, _ := ValidateToken(token1, cfg)
	claims2, _ := ValidateToken(token2, cfg)

	if claims1.UserID == claims2.UserID {
		t.Fatal("Different tokens should have different UserIDs")
	}
	if claims1.Role == claims2.Role {
		t.Fatal("Different tokens should have different Roles")
	}
}

func TestValidateToken_TamperedToken(t *testing.T) {
	cfg := testConfig()
	token, _ := GenerateToken("user-123", "PATIENT", cfg)

	// Tamper with the token by flipping a character in the middle
	runes := []rune(token)
	mid := len(runes) / 2
	if runes[mid] == 'A' {
		runes[mid] = 'B'
	} else {
		runes[mid] = 'A'
	}
	tampered := string(runes)

	_, err := ValidateToken(tampered, cfg)
	if err == nil {
		t.Fatal("ValidateToken() with tampered token should fail")
	}
}

func TestTokenExpirationTime(t *testing.T) {
	cfg := &config.Config{
		JWTSecret:          "test-secret-key-at-least-32-characters-long-for-testing",
		JWTExpirationHours: 24,
	}

	token, _ := GenerateToken("user-123", "PATIENT", cfg)
	claims, err := ValidateToken(token, cfg)
	if err != nil {
		t.Fatalf("ValidateToken() error: %v", err)
	}

	if claims.ExpiresAt == nil {
		t.Fatal("ExpiresAt should not be nil")
	}

	// Expiration should be ~24 hours from now
	expectedExpiry := time.Now().Add(24 * time.Hour)
	diff := claims.ExpiresAt.Time.Sub(expectedExpiry)
	if diff.Abs() > time.Minute {
		t.Errorf("ExpiresAt is %v off from expected", diff)
	}
}
