package patient

import (
	"encoding/json"
	"net/http"
)

// ─── BCV / Exchange Rates ────────────────────────────────────────────────

func (h *PatientHandler) GetBCVRate(w http.ResponseWriter, r *http.Request) {
	if h.BCVClient == nil {
		http.Error(w, "BCV client not configured", http.StatusServiceUnavailable)
		return
	}

	rate, err := h.BCVClient.GetCurrentBCV(r.Context())
	if err != nil {
		http.Error(w, "Failed to fetch BCV rate: "+err.Error(), http.StatusBadGateway)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"current": map[string]interface{}{
			"usd":  rate.Current.USD,
			"eur":  rate.Current.EUR,
			"date": rate.Current.Date,
		},
		"previous": map[string]interface{}{
			"usd":  rate.Previous.USD,
			"eur":  rate.Previous.EUR,
			"date": rate.Previous.Date,
		},
		"changePercentage": map[string]interface{}{
			"usd": rate.ChangePercentage.USD,
			"eur": rate.ChangePercentage.EUR,
		},
	})
}

func (h *PatientHandler) GetUSDTRate(w http.ResponseWriter, r *http.Request) {
	if h.BCVClient == nil {
		http.Error(w, "BCV client not configured", http.StatusServiceUnavailable)
		return
	}

	rate, err := h.BCVClient.GetCurrentUSDT(r.Context())
	if err != nil {
		http.Error(w, "Failed to fetch USDT rate: "+err.Error(), http.StatusBadGateway)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"current": map[string]interface{}{
			"buy":     rate.Current.Buy,
			"sell":    rate.Current.Sell,
			"average": rate.Current.Average,
			"date":    rate.Current.Date,
		},
		"previous": map[string]interface{}{
			"buy":     rate.Previous.Buy,
			"sell":    rate.Previous.Sell,
			"average": rate.Previous.Average,
			"date":    rate.Previous.Date,
		},
		"changePercentage": map[string]interface{}{
			"buy":     rate.ChangePercentage.Buy,
			"sell":    rate.ChangePercentage.Sell,
			"average": rate.ChangePercentage.Average,
		},
	})
}

// getBCVRateCached fetches the BCV USD rate for VES conversion.
// Returns 0 if the client is not configured or the fetch fails.
func (h *PatientHandler) getBCVRateCached(r *http.Request) float64 {
	if h.BCVClient == nil {
		return 0
	}
	rate, err := h.BCVClient.GetCurrentBCV(r.Context())
	if err != nil || rate == nil {
		return 0
	}
	return rate.Current.USD
}
