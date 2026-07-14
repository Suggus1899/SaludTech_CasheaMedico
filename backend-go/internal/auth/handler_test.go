package auth

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/saludtech/backend-go/internal/config"
	"github.com/saludtech/backend-go/internal/database"
)

func TestGenerateVerificationToken(t *testing.T) {
	token1 := generateVerificationToken()
	token2 := generateVerificationToken()

	if token1 == token2 {
		t.Fatal("Two consecutive tokens should be different")
	}
	if len(token1) != 64 {
		t.Errorf("Token length = %d, want 64 (32 bytes hex-encoded)", len(token1))
	}
	// Verify it's valid hex
	for _, c := range token1 {
		if !strings.ContainsRune("0123456789abcdef", c) {
			t.Errorf("Token contains non-hex character: %c", c)
		}
	}
}

func TestToUserResponse(t *testing.T) {
	userID := pgtype.UUID{}
	_ = userID.Scan("123e4567-e89b-12d3-a456-426614174000")

	user := database.User{
		ID:           userID,
		Phone:        "+584121234567",
		Email:        pgtype.Text{String: "test@example.com", Valid: true},
		FullName:     "John Doe",
		NationalID:   pgtype.Text{String: "V12345678", Valid: true},
		Level:        3,
		Points:       150,
		IsActive:     true,
	}

	resp := toUserResponse(user)

	if resp.ID != "123e4567-e89b-12d3-a456-426614174000" {
		t.Errorf("ID = %s, want 123e4567-e89b-12d3-a456-426614174000", resp.ID)
	}
	if resp.FirstName != "John" {
		t.Errorf("FirstName = %s, want John", resp.FirstName)
	}
	if resp.LastName != "Doe" {
		t.Errorf("LastName = %s, want Doe", resp.LastName)
	}
	if resp.Email != "test@example.com" {
		t.Errorf("Email = %s, want test@example.com", resp.Email)
	}
	if resp.Phone != "+584121234567" {
		t.Errorf("Phone = %s, want +584121234567", resp.Phone)
	}
	if resp.IdentityDocument != "V12345678" {
		t.Errorf("IdentityDocument = %s, want V12345678", resp.IdentityDocument)
	}
	if resp.Level != 3 {
		t.Errorf("Level = %d, want 3", resp.Level)
	}
	if resp.Points != 150 {
		t.Errorf("Points = %d, want 150", resp.Points)
	}
	if !resp.Active {
		t.Error("Active = false, want true")
	}
	if resp.KYCStatus != "APPROVED" {
		t.Errorf("KYCStatus = %s, want APPROVED", resp.KYCStatus)
	}
}

func TestToUserResponse_SingleName(t *testing.T) {
	userID := pgtype.UUID{}
	_ = userID.Scan("123e4567-e89b-12d3-a456-426614174000")

	user := database.User{
		ID:       userID,
		Phone:    "+584121234567",
		FullName: "Madonna",
	}

	resp := toUserResponse(user)
	if resp.FirstName != "Madonna" {
		t.Errorf("FirstName = %s, want Madonna", resp.FirstName)
	}
	if resp.LastName != "" {
		t.Errorf("LastName = %s, want empty", resp.LastName)
	}
}

func TestToUserResponse_NoEmail(t *testing.T) {
	userID := pgtype.UUID{}
	_ = userID.Scan("123e4567-e89b-12d3-a456-426614174000")

	user := database.User{
		ID:       userID,
		Phone:    "+584121234567",
		FullName: "Test User",
		Email:    pgtype.Text{Valid: false},
	}

	resp := toUserResponse(user)
	if resp.Email != "" {
		t.Errorf("Email = %s, want empty for invalid email", resp.Email)
	}
}

func TestSetAuthCookie(t *testing.T) {
	cfg := &config.Config{
		JWTSecret:          "test-secret-at-least-32-characters-long",
		JWTExpirationHours: 24,
	}

	token, _ := GenerateToken("user-123", "PATIENT", cfg)

	w := httptest.NewRecorder()
	r := httptest.NewRequest("GET", "/", nil)
	r.Header.Set("X-Forwarded-Proto", "https")

	setAuthCookie(w, r, token, 24*3600)

	cookies := w.Result().Cookies()
	if len(cookies) != 1 {
		t.Fatalf("Expected 1 cookie, got %d", len(cookies))
	}

	cookie := cookies[0]
	if cookie.Name != "jwt_token" {
		t.Errorf("Cookie name = %s, want jwt_token", cookie.Name)
	}
	if cookie.Value != token {
		t.Errorf("Cookie value doesn't match token")
	}
	if !cookie.HttpOnly {
		t.Error("Cookie should be HttpOnly")
	}
	if !cookie.Secure {
		t.Error("Cookie should be Secure in HTTPS")
	}
	if cookie.SameSite != http.SameSiteNoneMode {
		t.Errorf("SameSite = %v, want None for HTTPS", cookie.SameSite)
	}
	if cookie.MaxAge != 24*3600 {
		t.Errorf("MaxAge = %d, want %d", cookie.MaxAge, 24*3600)
	}
}

func TestSetAuthCookie_HTTP(t *testing.T) {
	cfg := &config.Config{
		JWTSecret:          "test-secret-at-least-32-characters-long",
		JWTExpirationHours: 24,
	}

	token, _ := GenerateToken("user-123", "PATIENT", cfg)

	w := httptest.NewRecorder()
	r := httptest.NewRequest("GET", "http://localhost:8081/", nil)

	setAuthCookie(w, r, token, 24*3600)

	cookies := w.Result().Cookies()
	if len(cookies) != 1 {
		t.Fatalf("Expected 1 cookie, got %d", len(cookies))
	}

	cookie := cookies[0]
	if cookie.SameSite != http.SameSiteLaxMode {
		t.Errorf("SameSite = %v, want Lax for HTTP", cookie.SameSite)
	}
}

func TestRegisterRequest_Decoding(t *testing.T) {
	body := `{"firstName":"John","lastName":"Doe","email":"john@test.com","phone":"+584121234567","password":"12345678"}`

	r := httptest.NewRequest("POST", "/api/v1/auth/register", strings.NewReader(body))
	r.Header.Set("Content-Type", "application/json")

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		t.Fatalf("Failed to decode: %v", err)
	}

	if req.FirstName != "John" {
		t.Errorf("FirstName = %s, want John", req.FirstName)
	}
	if req.Email != "john@test.com" {
		t.Errorf("Email = %s, want john@test.com", req.Email)
	}
	if req.Password != "12345678" {
		t.Errorf("Password = %s, want 12345678", req.Password)
	}
}
