package fakepay

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

const (
	baseURL    = "https://fakepayment.onrender.com"
	timeout    = 30 * time.Second
)

// Client calls the fakePayment API to process test payments.
type Client struct {
	httpClient *http.Client
	apiKey     string
}

// NewClient creates a fakePayment API client.
func NewClient(apiKey string) *Client {
	return &Client{
		httpClient: &http.Client{Timeout: timeout},
		apiKey:     apiKey,
	}
}

// PaymentRequest is the body sent to POST /payments.
type PaymentRequest struct {
	Amount          string `json:"amount"`
	CardNumber      string `json:"card-number"`
	CVV             string `json:"cvv"`
	ExpirationMonth string `json:"expiration-month"`
	ExpirationYear  string `json:"expiration-year"`
	FullName        string `json:"full-name"`
	Currency        string `json:"currency"`
	Description     string `json:"description"`
	Reference       string `json:"reference"`
}

// PaymentData holds the transaction details returned by the API.
type PaymentData struct {
	TransactionID string `json:"transaction_id"`
	Amount        float64 `json:"amount"`
	Currency      string `json:"currency"`
	Description   string `json:"description"`
	Reference     string `json:"reference"`
	Date          string `json:"date"`
}

// PaymentResponse is the full response from POST /payments.
type PaymentResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    PaymentData `json:"data"`
}

// ErrorResponse is returned when the API rejects the payment.
type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Code    string `json:"code"`
}

// ProcessPayment sends a payment request to the fakePayment API.
// Returns the transaction data on success, or an error with the rejection code.
func (c *Client) ProcessPayment(ctx context.Context, req PaymentRequest) (*PaymentData, error) {
	if c.apiKey == "" {
		return nil, fmt.Errorf("fakePayment API key not configured")
	}

	body, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("marshal payment request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, baseURL+"/payments", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("build payment request: %w", err)
	}
	httpReq.Header.Set("Authorization", "Bearer "+c.apiKey)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("call fakePayment API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK || resp.StatusCode == http.StatusCreated {
		var result PaymentResponse
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			return nil, fmt.Errorf("decode payment response: %w", err)
		}
		if !result.Success {
			return nil, fmt.Errorf("payment rejected: %s", result.Message)
		}
		return &result.Data, nil
	}

	// Non-2xx: try to decode error
	var errResp ErrorResponse
	if err := json.NewDecoder(resp.Body).Decode(&errResp); err != nil {
		return nil, fmt.Errorf("fakePayment API returned %d", resp.StatusCode)
	}
	return nil, fmt.Errorf("payment %s: %s (code %s)", errResp.Message, errResp.Message, errResp.Code)
}

// GetTransaction retrieves a transaction by ID from the fakePayment API.
func (c *Client) GetTransaction(ctx context.Context, transactionID string) (*PaymentData, error) {
	if c.apiKey == "" {
		return nil, fmt.Errorf("fakePayment API key not configured")
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodGet, baseURL+"/payments/"+transactionID, nil)
	if err != nil {
		return nil, fmt.Errorf("build get request: %w", err)
	}
	httpReq.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("call fakePayment API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("fakePayment API returned %d", resp.StatusCode)
	}

	var result PaymentResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decode response: %w", err)
	}
	return &result.Data, nil
}
