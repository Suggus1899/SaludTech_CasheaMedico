package patient

import (
	"encoding/json"
	"math"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/saludtech/backend-go/internal/database"
)

// ─── Medical Catalog ─────────────────────────────────────────────────────

func (h *PatientHandler) GetMerchants(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")

	merchants, err := h.DB.GetMerchantsByCategory(r.Context(), category)
	if err != nil {
		http.Error(w, "Failed to fetch merchants", http.StatusInternalServerError)
		return
	}

	result := make([]map[string]interface{}, 0, len(merchants))
	for _, m := range merchants {
		city := ""
		if m.City.Valid {
			city = m.City.String
		}
		subcat := ""
		if m.Subcategory.Valid {
			subcat = m.Subcategory.String
		}
		result = append(result, map[string]interface{}{
			"id":          m.ID.String(),
			"tradeName":   m.TradeName,
			"category":    m.Category,
			"subcategory": subcat,
			"city":        city,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *PatientHandler) GetMerchantServices(w http.ResponseWriter, r *http.Request) {
	merchantID := chi.URLParam(r, "id")
	mid, err := parseUUID(merchantID)
	if err != nil {
		http.Error(w, "Invalid merchant ID", http.StatusBadRequest)
		return
	}

	services, err := h.DB.GetServicesByMerchant(r.Context(), mid)
	if err != nil {
		http.Error(w, "Failed to fetch services", http.StatusInternalServerError)
		return
	}

	bcvRate := h.getBCVRateCached(r)
	result := make([]map[string]interface{}, 0, len(services))
	for _, s := range services {
		price := formatNumeric(s.PriceUsd)
		entry := map[string]interface{}{
			"id":          s.ID.String(),
			"name":        s.Name,
			"description": s.Description.String,
			"category":    s.Category,
			"subcategory": s.Subcategory.String,
			"priceUsd":    price,
			"durationMin": s.DurationMin,
		}
		if bcvRate > 0 {
			entry["priceVES"] = math.Round(price*bcvRate*100) / 100
		}
		result = append(result, entry)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *PatientHandler) GetMerchantSupplies(w http.ResponseWriter, r *http.Request) {
	merchantID := chi.URLParam(r, "id")
	mid, err := parseUUID(merchantID)
	if err != nil {
		http.Error(w, "Invalid merchant ID", http.StatusBadRequest)
		return
	}

	supplies, err := h.DB.GetSuppliesByMerchant(r.Context(), mid)
	if err != nil {
		http.Error(w, "Failed to fetch supplies", http.StatusInternalServerError)
		return
	}

	bcvRate := h.getBCVRateCached(r)
	result := make([]map[string]interface{}, 0, len(supplies))
	for _, s := range supplies {
		price := formatNumeric(s.PriceUsd)
		entry := map[string]interface{}{
			"id":                   s.ID.String(),
			"name":                 s.Name,
			"description":          s.Description.String,
			"category":             s.Category,
			"subcategory":          s.Subcategory.String,
			"priceUsd":             price,
			"unit":                 s.Unit,
			"stock":                s.Stock,
			"requiresPrescription": s.RequiresPrescription,
		}
		if bcvRate > 0 {
			entry["priceVES"] = math.Round(price*bcvRate*100) / 100
		}
		result = append(result, entry)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *PatientHandler) SearchCatalogServices(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	search := r.URL.Query().Get("search")

	rows, err := h.DB.SearchServices(r.Context(), database.SearchServicesParams{
		Column1: category,
		Column2: search,
	})
	if err != nil {
		http.Error(w, "Search failed", http.StatusInternalServerError)
		return
	}

	bcvRate := h.getBCVRateCached(r)
	result := make([]map[string]interface{}, 0, len(rows))
	for _, s := range rows {
		price := formatNumeric(s.PriceUsd)
		city := ""
		if s.MerchantCity.Valid {
			city = s.MerchantCity.String
		}
		entry := map[string]interface{}{
			"id":           s.ID.String(),
			"name":         s.Name,
			"description":  s.Description.String,
			"category":     s.Category,
			"subcategory":  s.Subcategory.String,
			"priceUsd":     price,
			"durationMin":  s.DurationMin,
			"merchantName": s.MerchantName,
			"merchantCity": city,
			"merchantId":   s.MerchantID.String(),
		}
		if bcvRate > 0 {
			entry["priceVES"] = math.Round(price*bcvRate*100) / 100
		}
		result = append(result, entry)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *PatientHandler) SearchCatalogSupplies(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	search := r.URL.Query().Get("search")

	rows, err := h.DB.SearchSupplies(r.Context(), database.SearchSuppliesParams{
		Column1: category,
		Column2: search,
	})
	if err != nil {
		http.Error(w, "Search failed", http.StatusInternalServerError)
		return
	}

	bcvRate := h.getBCVRateCached(r)
	result := make([]map[string]interface{}, 0, len(rows))
	for _, s := range rows {
		price := formatNumeric(s.PriceUsd)
		city := ""
		if s.MerchantCity.Valid {
			city = s.MerchantCity.String
		}
		entry := map[string]interface{}{
			"id":                   s.ID.String(),
			"name":                 s.Name,
			"description":          s.Description.String,
			"category":             s.Category,
			"subcategory":          s.Subcategory.String,
			"priceUsd":             price,
			"unit":                 s.Unit,
			"requiresPrescription": s.RequiresPrescription,
			"merchantName":         s.MerchantName,
			"merchantCity":         city,
			"merchantId":           s.MerchantID.String(),
		}
		if bcvRate > 0 {
			entry["priceVES"] = math.Round(price*bcvRate*100) / 100
		}
		result = append(result, entry)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}
