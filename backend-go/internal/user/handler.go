package user

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/saludtech/backend-go/internal/auth"
	"github.com/saludtech/backend-go/internal/database"
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
	})
}
