package bcv

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

const (
	bcvCDNBase    = "https://rates.dolarvzla.com"
	usdtAPIBase   = "https://api.dolarvzla.com"
	httpTimeout   = 10 * time.Second
)

// Client fetches BCV and USDT exchange rates from DolarVZLA.
type Client struct {
	httpClient *http.Client
	apiKey     string
}

// NewClient creates a DolarVZLA API client. apiKey is required for USDT endpoints
// (BCV CDN endpoints are free and need no key).
func NewClient(apiKey string) *Client {
	return &Client{
		httpClient: &http.Client{Timeout: httpTimeout},
		apiKey:     apiKey,
	}
}

// BCVRate represents a single BCV rate entry.
type BCVRate struct {
	USD  float64 `json:"usd"`
	EUR  float64 `json:"eur"`
	Date string  `json:"date"`
}

// BCVCurrentResponse is the shape of /bcv/current.json from the CDN.
type BCVCurrentResponse struct {
	Current          BCVRate  `json:"current"`
	Previous         BCVRate  `json:"previous"`
	ChangePercentage struct {
		USD float64 `json:"usd"`
		EUR float64 `json:"eur"`
	} `json:"changePercentage"`
}

// USDTRate represents a single USDT rate entry.
type USDTRate struct {
	Buy     float64 `json:"buy"`
	Sell    float64 `json:"sell"`
	Average float64 `json:"average"`
	Date    string  `json:"date"`
}

// USDTCurrentResponse is the shape of /public/usdt/exchange-rate.
type USDTCurrentResponse struct {
	Current          USDTRate `json:"current"`
	Previous         USDTRate `json:"previous"`
	ChangePercentage struct {
		Buy     float64 `json:"buy"`
		Sell    float64 `json:"sell"`
		Average float64 `json:"average"`
	} `json:"changePercentage"`
}

// GetCurrentBCV fetches the latest BCV rate from the CDN (no API key needed).
func (c *Client) GetCurrentBCV(ctx context.Context) (*BCVCurrentResponse, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, bcvCDNBase+"/bcv/current.json", nil)
	if err != nil {
		return nil, fmt.Errorf("build bcv request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("fetch bcv rate: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("bcv api returned %d", resp.StatusCode)
	}

	var result BCVCurrentResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decode bcv response: %w", err)
	}

	return &result, nil
}

// GetCurrentUSDT fetches the latest USDT rate from the API (requires API key).
func (c *Client) GetCurrentUSDT(ctx context.Context) (*USDTCurrentResponse, error) {
	if c.apiKey == "" {
		return nil, fmt.Errorf("USDT API key not configured")
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, usdtAPIBase+"/public/usdt/exchange-rate", nil)
	if err != nil {
		return nil, fmt.Errorf("build usdt request: %w", err)
	}
	req.Header.Set("x-dolarvzla-key", c.apiKey)
	req.Header.Set("Accept", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("fetch usdt rate: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("usdt api returned %d", resp.StatusCode)
	}

	var result USDTCurrentResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decode usdt response: %w", err)
	}

	return &result, nil
}
