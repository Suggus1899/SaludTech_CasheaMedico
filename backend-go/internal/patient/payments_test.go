package patient

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/saludtech/backend-go/internal/auth"
	"github.com/saludtech/backend-go/internal/database"
)

type mockQuerier struct {
	database.Querier
	getInstallmentFn func(ctx context.Context, arg database.GetInstallmentWithDetailsParams) (database.GetInstallmentWithDetailsRow, error)
}

func (m *mockQuerier) GetInstallmentWithDetails(ctx context.Context, arg database.GetInstallmentWithDetailsParams) (database.GetInstallmentWithDetailsRow, error) {
	if m.getInstallmentFn != nil {
		return m.getInstallmentFn(ctx, arg)
	}
	return database.GetInstallmentWithDetailsRow{}, errors.New("not found")
}

func newPaymentRequest(userID string, body string) *http.Request {
	r := httptest.NewRequest("POST", "/payments", strings.NewReader(body))
	r.Header.Set("Content-Type", "application/json")
	if userID != "" {
		ctx := context.WithValue(r.Context(), auth.UserIDKey, userID)
		r = r.WithContext(ctx)
	}
	return r
}

func TestIsUniqueViolation(t *testing.T) {
	tests := []struct {
		name string
		err  error
		want bool
	}{
		{"unique violation 23505", &pgconn.PgError{Code: "23505"}, true},
		{"foreign key violation 23503", &pgconn.PgError{Code: "23503"}, false},
		{"generic error", errors.New("some error"), false},
		{"nil error", nil, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := isUniqueViolation(tt.err)
			if got != tt.want {
				t.Errorf("isUniqueViolation() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestProcessPayment_Unauthorized(t *testing.T) {
	h := &PatientHandler{}
	r := newPaymentRequest("", `{"installmentId":"123e4567-e89b-12d3-a456-426614174000"}`)
	w := httptest.NewRecorder()

	h.ProcessPayment(w, r)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("status = %d, want %d", w.Code, http.StatusUnauthorized)
	}
}

func TestProcessPayment_InvalidPayload(t *testing.T) {
	h := &PatientHandler{}
	r := newPaymentRequest("123e4567-e89b-12d3-a456-426614174000", "{invalid json")
	w := httptest.NewRecorder()

	h.ProcessPayment(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestProcessPayment_MissingInstallmentID(t *testing.T) {
	h := &PatientHandler{}
	r := newPaymentRequest("123e4567-e89b-12d3-a456-426614174000", `{"method":"CARD"}`)
	w := httptest.NewRecorder()

	h.ProcessPayment(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestProcessPayment_InvalidUserID(t *testing.T) {
	h := &PatientHandler{}
	r := newPaymentRequest("not-a-uuid", `{"installmentId":"123e4567-e89b-12d3-a456-426614174000"}`)
	w := httptest.NewRecorder()

	h.ProcessPayment(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestProcessPayment_InvalidInstallmentID(t *testing.T) {
	h := &PatientHandler{}
	r := newPaymentRequest("123e4567-e89b-12d3-a456-426614174000", `{"installmentId":"not-a-uuid"}`)
	w := httptest.NewRecorder()

	h.ProcessPayment(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestProcessPayment_InstallmentNotFound(t *testing.T) {
	mockDB := &mockQuerier{
		getInstallmentFn: func(ctx context.Context, arg database.GetInstallmentWithDetailsParams) (database.GetInstallmentWithDetailsRow, error) {
			return database.GetInstallmentWithDetailsRow{}, errors.New("no rows in result set")
		},
	}
	h := &PatientHandler{DB: mockDB}
	r := newPaymentRequest("123e4567-e89b-12d3-a456-426614174000", `{"installmentId":"123e4567-e89b-12d3-a456-426614174000"}`)
	w := httptest.NewRecorder()

	h.ProcessPayment(w, r)

	if w.Code != http.StatusNotFound {
		t.Errorf("status = %d, want %d", w.Code, http.StatusNotFound)
	}
}

func TestProcessPayment_AlreadyPaid(t *testing.T) {
	mockDB := &mockQuerier{
		getInstallmentFn: func(ctx context.Context, arg database.GetInstallmentWithDetailsParams) (database.GetInstallmentWithDetailsRow, error) {
			return database.GetInstallmentWithDetailsRow{
				InstallmentID:  arg.ID,
				Status:         "PAID",
				Amount:         mustScanNum("100.00"),
				InstallmentNum: 1,
			}, nil
		},
	}
	h := &PatientHandler{DB: mockDB}
	r := newPaymentRequest("123e4567-e89b-12d3-a456-426614174000", `{"installmentId":"123e4567-e89b-12d3-a456-426614174000"}`)
	w := httptest.NewRecorder()

	h.ProcessPayment(w, r)

	if w.Code != http.StatusConflict {
		t.Errorf("status = %d, want %d", w.Code, http.StatusConflict)
	}

	var body map[string]interface{}
	if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if body["status"] != "ALREADY_PAID" {
		t.Errorf("status field = %v, want ALREADY_PAID", body["status"])
	}
}

func TestProcessPayment_WrongUserOwnership(t *testing.T) {
	ownerID := pgtype.UUID{}
	_ = ownerID.Scan("11111111-1111-1111-1111-111111111111")

	mockDB := &mockQuerier{
		getInstallmentFn: func(ctx context.Context, arg database.GetInstallmentWithDetailsParams) (database.GetInstallmentWithDetailsRow, error) {
			if arg.UserID != ownerID {
				return database.GetInstallmentWithDetailsRow{}, errors.New("no rows in result set")
			}
			return database.GetInstallmentWithDetailsRow{
				InstallmentID:  arg.ID,
				Status:         "PENDING",
				Amount:         mustScanNum("100.00"),
				InstallmentNum: 1,
			}, nil
		},
	}
	h := &PatientHandler{DB: mockDB}

	t.Run("non-owner gets 404", func(t *testing.T) {
		r := newPaymentRequest("22222222-2222-2222-2222-222222222222", `{"installmentId":"123e4567-e89b-12d3-a456-426614174000"}`)
		w := httptest.NewRecorder()
		h.ProcessPayment(w, r)
		if w.Code != http.StatusNotFound {
			t.Errorf("non-owner should get 404, got %d", w.Code)
		}
	})
}

func TestPaymentRequest_Decoding(t *testing.T) {
	body := `{"installmentId":"123e4567-e89b-12d3-a456-426614174000","method":"CARD","phone":"+584121234567","email":"test@test.com","reference":"ref-123","cardNumber":"4111111111111111","cvv":"123","expirationMonth":"12","expirationYear":"2026","fullName":"John Doe"}`

	r := httptest.NewRequest("POST", "/payments", strings.NewReader(body))
	r.Header.Set("Content-Type", "application/json")

	var req PaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		t.Fatalf("failed to decode: %v", err)
	}

	tests := []struct {
		name string
		got  string
		want string
	}{
		{"InstallmentID", req.InstallmentID, "123e4567-e89b-12d3-a456-426614174000"},
		{"Method", req.Method, "CARD"},
		{"Phone", req.Phone, "+584121234567"},
		{"Email", req.Email, "test@test.com"},
		{"Reference", req.Reference, "ref-123"},
		{"CardNumber", req.CardNumber, "4111111111111111"},
		{"CVV", req.CVV, "123"},
		{"ExpirationMonth", req.ExpirationMonth, "12"},
		{"ExpirationYear", req.ExpirationYear, "2026"},
		{"FullName", req.FullName, "John Doe"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.got != tt.want {
				t.Errorf("%s = %s, want %s", tt.name, tt.got, tt.want)
			}
		})
	}
}
