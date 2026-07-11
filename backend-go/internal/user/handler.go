package user

import (
	"encoding/json"
	"net/http"

	"github.com/saludtech/backend-go/internal/database"
)

type UserHandler struct {
	DB database.Querier
}

func (h *UserHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	// TODO: Leer del token y buscar en BD
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "success",
		"data": map[string]string{
			"name": "Paciente Demo",
		},
	})
}
