package patient

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/saludtech/backend-go/internal/auth"
)

func newCheckoutRequest(userID string, body string) *http.Request {
	r := httptest.NewRequest("POST", "/transactions/checkout", strings.NewReader(body))
	r.Header.Set("Content-Type", "application/json")
	if userID != "" {
		ctx := context.WithValue(r.Context(), auth.UserIDKey, userID)
		r = r.WithContext(ctx)
	}
	return r
}

func TestGenerateCheckoutToken(t *testing.T) {
	token := generateCheckoutToken()

	if token == "" {
		t.Fatal("generateCheckoutToken() returned empty string")
	}
	if !strings.HasPrefix(token, "checkout_") {
		t.Errorf("generateCheckoutToken() = %s, want prefix 'checkout_'", token)
	}
	if len(token) <= len("checkout_") {
		t.Errorf("generateCheckoutToken() = %s, too short", token)
	}
}

func TestGenerateCheckoutToken_Uniqueness(t *testing.T) {
	tokens := make(map[string]bool, 100)
	for i := 0; i < 100; i++ {
		token := generateCheckoutToken()
		if tokens[token] {
			t.Fatalf("generateCheckoutToken() produced duplicate token: %s", token)
		}
		tokens[token] = true
	}
}

func TestCheckout_Unauthorized(t *testing.T) {
	h := &PatientHandler{}
	r := newCheckoutRequest("", `{"merchantId":"123e4567-e89b-12d3-a456-426614174000","items":[]}`)
	w := httptest.NewRecorder()

	h.Checkout(w, r)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("status = %d, want %d", w.Code, http.StatusUnauthorized)
	}
}

func TestCheckout_InvalidPayload(t *testing.T) {
	h := &PatientHandler{}
	r := newCheckoutRequest("123e4567-e89b-12d3-a456-426614174000", "{invalid json")
	w := httptest.NewRecorder()

	h.Checkout(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestCheckout_MissingMerchantID(t *testing.T) {
	h := &PatientHandler{}
	r := newCheckoutRequest("123e4567-e89b-12d3-a456-426614174000", `{"items":[{"type":"SERVICE","id":"123e4567-e89b-12d3-a456-426614174000","quantity":1}]}`)
	w := httptest.NewRecorder()

	h.Checkout(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestCheckout_EmptyItems(t *testing.T) {
	h := &PatientHandler{}
	r := newCheckoutRequest("123e4567-e89b-12d3-a456-426614174000", `{"merchantId":"123e4567-e89b-12d3-a456-426614174000","items":[]}`)
	w := httptest.NewRecorder()

	h.Checkout(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestCheckout_MissingBothMerchantAndItems(t *testing.T) {
	h := &PatientHandler{}
	r := newCheckoutRequest("123e4567-e89b-12d3-a456-426614174000", `{}`)
	w := httptest.NewRecorder()

	h.Checkout(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestCheckout_InvalidUserID(t *testing.T) {
	h := &PatientHandler{}
	r := newCheckoutRequest("not-a-uuid", `{"merchantId":"123e4567-e89b-12d3-a456-426614174000","items":[{"type":"SERVICE","id":"123e4567-e89b-12d3-a456-426614174000","quantity":1}]}`)
	w := httptest.NewRecorder()

	h.Checkout(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestCheckout_InvalidMerchantID(t *testing.T) {
	h := &PatientHandler{}
	r := newCheckoutRequest("123e4567-e89b-12d3-a456-426614174000", `{"merchantId":"not-a-uuid","items":[{"type":"SERVICE","id":"123e4567-e89b-12d3-a456-426614174000","quantity":1}]}`)
	w := httptest.NewRecorder()

	h.Checkout(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestCheckoutRequest_Decoding(t *testing.T) {
	body := `{"merchantId":"123e4567-e89b-12d3-a456-426614174000","items":[{"type":"SERVICE","id":"123e4567-e89b-12d3-a456-426614174000","quantity":2}],"requestedInstallments":6,"creditLineType":"MAYOR_CUIDADO"}`

	r := httptest.NewRequest("POST", "/transactions/checkout", strings.NewReader(body))
	r.Header.Set("Content-Type", "application/json")

	var req CheckoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		t.Fatalf("failed to decode: %v", err)
	}

	if req.MerchantID != "123e4567-e89b-12d3-a456-426614174000" {
		t.Errorf("MerchantID = %s, want 123e4567-e89b-12d3-a456-426614174000", req.MerchantID)
	}
	if len(req.Items) != 1 {
		t.Fatalf("Items length = %d, want 1", len(req.Items))
	}
	if req.Items[0].Type != "SERVICE" {
		t.Errorf("Items[0].Type = %s, want SERVICE", req.Items[0].Type)
	}
	if req.Items[0].ID != "123e4567-e89b-12d3-a456-426614174000" {
		t.Errorf("Items[0].ID = %s, want 123e4567-e89b-12d3-a456-426614174000", req.Items[0].ID)
	}
	if req.Items[0].Quantity != 2 {
		t.Errorf("Items[0].Quantity = %d, want 2", req.Items[0].Quantity)
	}
	if req.RequestedInstallments != 6 {
		t.Errorf("RequestedInstallments = %d, want 6", req.RequestedInstallments)
	}
	if req.CreditLineType != "MAYOR_CUIDADO" {
		t.Errorf("CreditLineType = %s, want MAYOR_CUIDADO", req.CreditLineType)
	}
}

func TestCheckoutRequest_DefaultCreditLineType(t *testing.T) {
	body := `{"merchantId":"123e4567-e89b-12d3-a456-426614174000","items":[{"type":"SERVICE","id":"123e4567-e89b-12d3-a456-426614174000","quantity":1}]}`

	r := httptest.NewRequest("POST", "/transactions/checkout", strings.NewReader(body))
	r.Header.Set("Content-Type", "application/json")

	var req CheckoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		t.Fatalf("failed to decode: %v", err)
	}

	if req.CreditLineType != "" {
		t.Errorf("CreditLineType = %s, want empty (defaults to ESPECIALIDAD_PRINCIPAL in handler)", req.CreditLineType)
	}
}
