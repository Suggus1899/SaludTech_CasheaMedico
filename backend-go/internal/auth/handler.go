package auth

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/saludtech/backend-go/internal/config"
	"github.com/saludtech/backend-go/internal/database"
	"github.com/saludtech/backend-go/internal/email"
	"golang.org/x/crypto/bcrypt"
)

// setAuthCookie sets the JWT as an httpOnly, Secure cookie.
// In production (HTTPS), always uses SameSite=None so the cookie works
// cross-origin (Vercel frontend → Render backend).
// In development (HTTP), uses SameSite=Lax (None requires Secure).
func setAuthCookie(w http.ResponseWriter, r *http.Request, token string, maxAgeSeconds int) {
	isHTTPS := r.TLS != nil || r.Header.Get("X-Forwarded-Proto") == "https"

	cookie := &http.Cookie{
		Name:     "jwt_token",
		Value:    token,
		Path:     "/",
		MaxAge:   maxAgeSeconds,
		HttpOnly: true,
		Secure:   isHTTPS,
	}
	if isHTTPS {
		// Production: SameSite=None + Secure for cross-origin cookies
		cookie.SameSite = http.SameSiteNoneMode
	} else {
		// Development: Lax is sufficient for localhost
		cookie.SameSite = http.SameSiteLaxMode
	}
	http.SetCookie(w, cookie)
}

// clearAuthCookie expires the jwt_token cookie immediately.
func clearAuthCookie(w http.ResponseWriter, r *http.Request) {
	isHTTPS := r.TLS != nil || r.Header.Get("X-Forwarded-Proto") == "https"

	cookie := &http.Cookie{
		Name:     "jwt_token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   isHTTPS,
	}
	if isHTTPS {
		cookie.SameSite = http.SameSiteNoneMode
	} else {
		cookie.SameSite = http.SameSiteLaxMode
	}
	http.SetCookie(w, cookie)
}

type AuthHandler struct {
	DB     database.Querier
	Cfg    *config.Config
	Email  *email.Sender
}

type LoginRequest struct {
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	FirstName        string `json:"firstName"`
	LastName         string `json:"lastName"`
	Email            string `json:"email"`
	Phone            string `json:"phone"`
	IdentityDocument string `json:"identityDocument"`
	Password         string `json:"password"`
}

type UserResponse struct {
	ID               string `json:"id"`
	FirstName        string `json:"firstName"`
	LastName         string `json:"lastName"`
	Email            string `json:"email"`
	Phone            string `json:"phone"`
	IdentityDocument string `json:"identityDocument"`
	Level            int16  `json:"level"`
	Points           int32  `json:"points"`
	KYCStatus        string `json:"kycStatus"`
	Active           bool   `json:"active"`
}

func toUserResponse(user database.User) UserResponse {
	firstName := user.FullName
	lastName := ""
	if idx := strings.Index(user.FullName, " "); idx > 0 {
		firstName = user.FullName[:idx]
		lastName = user.FullName[idx+1:]
	}
	email := ""
	if user.Email.Valid {
		email = user.Email.String
	}
	nationalID := ""
	if user.NationalID.Valid {
		nationalID = user.NationalID.String
	}
	return UserResponse{
		ID:               user.ID.String(),
		FirstName:        firstName,
		LastName:         lastName,
		Email:            email,
		Phone:            user.Phone,
		IdentityDocument: nationalID,
		Level:            user.Level,
		Points:           user.Points,
		KYCStatus:        "APPROVED",
		Active:           user.IsActive,
	}
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if req.Email == "" && req.Phone == "" {
		http.Error(w, "Email or phone is required", http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	var user database.User
	var err error

	if req.Email != "" {
		emailText := pgtype.Text{String: req.Email, Valid: true}
		user, err = h.DB.GetUserByEmail(ctx, emailText)
	} else {
		user, err = h.DB.GetUserByPhone(ctx, req.Phone)
	}
	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	token, err := GenerateToken(user.ID.String(), string(user.Role), h.Cfg)
	if err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	setAuthCookie(w, r, token, h.Cfg.JWTExpirationHours*3600)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"access_token": token,
		"token":        token,
		"user":         toUserResponse(user),
	})
}

// Logout clears the jwt_token cookie.
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	clearAuthCookie(w, r)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Logged out"})
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if req.Phone == "" || req.Password == "" || req.Email == "" {
		http.Error(w, "Phone, email and password are required", http.StatusBadRequest)
		return
	}

	if len(req.Password) < 8 {
		http.Error(w, "Password must be at least 8 characters", http.StatusBadRequest)
		return
	}

	ctx := r.Context()

	// Check if phone already exists
	existing, err := h.DB.GetUserByPhone(ctx, req.Phone)
	if err == nil && existing.ID.Valid {
		http.Error(w, "Phone already registered", http.StatusConflict)
		return
	}

	// Check if email already exists
	emailText := pgtype.Text{String: req.Email, Valid: true}
	existingEmail, err := h.DB.GetUserByEmail(ctx, emailText)
	if err == nil && existingEmail.ID.Valid {
		http.Error(w, "Email already registered", http.StatusConflict)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}

	fullName := strings.TrimSpace(req.FirstName + " " + req.LastName)
	nationalID := pgtype.Text{String: req.IdentityDocument, Valid: req.IdentityDocument != ""}

	// Generate email verification token
	verificationToken := generateVerificationToken()

	user, err := h.DB.CreateUser(ctx, database.CreateUserParams{
		Phone:                   req.Phone,
		Email:                   emailText,
		PasswordHash:            string(hashedPassword),
		FullName:                fullName,
		NationalID:              nationalID,
		Role:                    "PATIENT",
		EmailVerificationToken:  pgtype.Text{String: verificationToken, Valid: true},
	})
	if err != nil {
		http.Error(w, "Error creating user", http.StatusInternalServerError)
		return
	}

	// Send verification email
	if h.Email != nil && user.Email.Valid {
		verificationURL := fmt.Sprintf("%s/verificar?token=%s", h.Cfg.FrontendURL, verificationToken)
		html := email.EmailVerificationEmail(fullName, verificationURL)
		if err := h.Email.Send(user.Email.String, "Verifica tu correo - SaludTech", html); err != nil {
			log.Printf("Failed to send verification email to %s: %v", user.Email.String, err)
		}
	}

	token, err := GenerateToken(user.ID.String(), string(user.Role), h.Cfg)
	if err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	setAuthCookie(w, r, token, h.Cfg.JWTExpirationHours*3600)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"access_token": token,
		"token":        token,
		"user":         toUserResponse(user),
	})
}

// generateVerificationToken creates a cryptographically secure random token.
func generateVerificationToken() string {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		// Fallback — should never happen
		return hex.EncodeToString([]byte(fmt.Sprintf("%d", time.Now().UnixNano())))
	}
	return hex.EncodeToString(b)
}

// VerifyEmail handles GET /api/v1/auth/verify-email?token=xxx
// It validates the token, marks the user's email as verified, and sends a welcome email.
func (h *AuthHandler) VerifyEmail(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	if token == "" {
		http.Error(w, "Token is required", http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	tokenText := pgtype.Text{String: token, Valid: true}
	user, err := h.DB.GetUserByVerificationToken(ctx, tokenText)
	if err != nil || !user.ID.Valid {
		http.Error(w, "Invalid or expired verification token", http.StatusBadRequest)
		return
	}

	if err := h.DB.VerifyEmail(ctx, user.ID); err != nil {
		log.Printf("Failed to verify email for user %s: %v", user.ID, err)
		http.Error(w, "Error verifying email", http.StatusInternalServerError)
		return
	}

	// Send welcome email
	if h.Email != nil && user.Email.Valid {
		fullName := user.FullName
		creditLimit := 0.0
		// Try to get the main credit line limit
		lines, _ := h.DB.GetCreditLinesByUser(ctx, user.ID)
		for _, line := range lines {
			if line.Type == "ESPECIALIDAD_PRINCIPAL" {
				creditLimit = numericToFloat(line.LimitUsd)
				break
			}
		}
		html := email.WelcomeEmail(fullName, creditLimit)
		if err := h.Email.Send(user.Email.String, "Bienvenido a SaludTech", html); err != nil {
			log.Printf("Failed to send welcome email to %s: %v", user.Email.String, err)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Email verified successfully",
		"verified": true,
	})
}

func numericToFloat(n pgtype.Numeric) float64 {
	if !n.Valid {
		return 0
	}
	f, err := n.Float64Value()
	if err != nil {
		return 0
	}
	return f.Float64
}
