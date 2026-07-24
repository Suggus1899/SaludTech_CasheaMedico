package user

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/saludtech/backend-go/internal/auth"
	"github.com/saludtech/backend-go/internal/database"
	"golang.org/x/crypto/bcrypt"
)

type UserHandler struct {
	DB database.Querier
}

func (h *UserHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserID(r.Context())
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var uuid pgtype.UUID
	if err := uuid.Scan(userID); err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	user, err := h.DB.GetUserByID(context.Background(), uuid)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

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
	profilePhotoUrl := ""
	if user.ProfilePhotoUrl.Valid {
		profilePhotoUrl = user.ProfilePhotoUrl.String
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":               user.ID.String(),
		"firstName":        firstName,
		"lastName":         lastName,
		"fullName":         user.FullName,
		"email":            email,
		"phone":            user.Phone,
		"identityDocument": nationalID,
		"level":            user.Level,
		"points":           user.Points,
		"totalPaid":        user.TotalPaid,
		"isActive":         user.IsActive,
		"kycStatus":        "APPROVED",
		"profilePhotoUrl":  profilePhotoUrl,
	})
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"currentPassword"`
	NewPassword     string `json:"newPassword"`
}

func (h *UserHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserID(r.Context())
	if userID == "" {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var uuid pgtype.UUID
	if err := uuid.Scan(userID); err != nil {
		http.Error(w, `{"error":"Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	var req ChangePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.CurrentPassword == "" || req.NewPassword == "" {
		http.Error(w, `{"error":"Current and new passwords are required"}`, http.StatusBadRequest)
		return
	}

	if msg := auth.ValidatePasswordComplexity(req.NewPassword); msg != "" {
		http.Error(w, `{"error":"`+msg+`"}`, http.StatusBadRequest)
		return
	}

	user, err := h.DB.GetUserByID(context.Background(), uuid)
	if err != nil {
		http.Error(w, `{"error":"User not found"}`, http.StatusNotFound)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.CurrentPassword)); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Current password is incorrect"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, `{"error":"Failed to hash password"}`, http.StatusInternalServerError)
		return
	}

	if err := h.DB.UpdateUserPassword(context.Background(), database.UpdateUserPasswordParams{
		ID:           uuid,
		PasswordHash: string(hashedPassword),
	}); err != nil {
		http.Error(w, `{"error":"Failed to update password"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Password updated successfully"})
}

type UpdateProfilePhotoRequest struct {
	ProfilePhotoUrl string `json:"profilePhotoUrl"`
}

func (h *UserHandler) UpdateProfilePhoto(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserID(r.Context())
	if userID == "" {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var uuid pgtype.UUID
	if err := uuid.Scan(userID); err != nil {
		http.Error(w, `{"error":"Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	var req UpdateProfilePhotoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.ProfilePhotoUrl == "" {
		http.Error(w, `{"error":"profilePhotoUrl is required"}`, http.StatusBadRequest)
		return
	}

	photoText := pgtype.Text{String: req.ProfilePhotoUrl, Valid: true}

	user, err := h.DB.UpdateUserProfilePhoto(context.Background(), database.UpdateUserProfilePhotoParams{
		ID:              uuid,
		ProfilePhotoUrl: photoText,
	})
	if err != nil {
		http.Error(w, `{"error":"Failed to update profile photo"}`, http.StatusInternalServerError)
		return
	}

	profilePhotoUrl := ""
	if user.ProfilePhotoUrl.Valid {
		profilePhotoUrl = user.ProfilePhotoUrl.String
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":              user.ID.String(),
		"profilePhotoUrl": profilePhotoUrl,
	})
}
