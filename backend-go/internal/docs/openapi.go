package docs

import (
	"encoding/json"
	"net/http"
)

type OpenAPIInfo struct {
	Title       string `json:"title"`
	Version     string `json:"version"`
	Description string `json:"description"`
}

type OpenAPIServer struct {
	URL         string `json:"url"`
	Description string `json:"description"`
}

type OpenAPIParameter struct {
	Name        string `json:"name"`
	In          string `json:"in"`
	Required    bool   `json:"required"`
	Description string `json:"description"`
	Schema      map[string]interface{} `json:"schema"`
}

type OpenAPIRequestBody struct {
	Description string                   `json:"description"`
	Required    bool                     `json:"required"`
	Content     map[string]OpenAPIMedia  `json:"content"`
}

type OpenAPIMedia struct {
	Schema map[string]interface{} `json:"schema"`
}

type OpenAPIResponse struct {
	Description string                  `json:"description"`
	Content     map[string]OpenAPIMedia `json:"content,omitempty"`
}

type OpenAPIOperation struct {
	Summary     string                      `json:"summary"`
	Description string                      `json:"description"`
	OperationID string                      `json:"operationId"`
	Tags        []string                    `json:"tags"`
	Parameters  []OpenAPIParameter          `json:"parameters,omitempty"`
	RequestBody *OpenAPIRequestBody        `json:"requestBody,omitempty"`
	Responses   map[string]OpenAPIResponse `json:"responses"`
	Security    []map[string][]string      `json:"security,omitempty"`
}

type OpenAPIPathItem struct {
	Summary string                      `json:"summary,omitempty"`
	Get     *OpenAPIOperation           `json:"get,omitempty"`
	Post    *OpenAPIOperation           `json:"post,omitempty"`
	Put     *OpenAPIOperation           `json:"put,omitempty"`
	Delete  *OpenAPIOperation           `json:"delete,omitempty"`
}

type OpenAPISpec struct {
	OpenAPI    string                       `json:"openapi"`
	Info       OpenAPIInfo                  `json:"info"`
	Servers    []OpenAPIServer              `json:"servers"`
	Paths      map[string]OpenAPIPathItem   `json:"paths"`
	Components map[string]interface{}       `json:"components"`
}

func ref(name string) map[string]interface{} {
	return map[string]interface{}{"$ref": "#/components/schemas/" + name}
}

func jsonMedia(schema map[string]interface{}) OpenAPIMedia {
	return OpenAPIMedia{Schema: schema}
}

func jsonResponse(desc string, schema map[string]interface{}) OpenAPIResponse {
	return OpenAPIResponse{
		Description: desc,
		Content:     map[string]OpenAPIMedia{"application/json": jsonMedia(schema)},
	}
}

func BuildSpec() OpenAPISpec {
	securityCookie := []map[string][]string{{"cookieAuth": {}}}

	spec := OpenAPISpec{
		OpenAPI: "3.0.3",
		Info: OpenAPIInfo{
			Title:       "SaludTech BNPL API",
			Version:     "1.0.0",
			Description: "Buy Now Pay Later (BNPL) HealthTech platform API for credit lines, installments, payments, and health profiles.",
		},
		Servers: []OpenAPIServer{
			{URL: "/api/v1", Description: "API v1 base path"},
		},
		Paths: map[string]OpenAPIPathItem{},
		Components: map[string]interface{}{
			"securitySchemes": map[string]interface{}{
				"cookieAuth": map[string]interface{}{
					"type":        "apiKey",
					"in":          "cookie",
					"name":        "jwt_token",
					"description": "JWT stored in httpOnly cookie",
				},
				"bearerAuth": map[string]interface{}{
					"type":        "http",
					"scheme":      "bearer",
					"bearerFormat": "JWT",
					"description": "Bearer token (backward compatibility)",
				},
			},
			"schemas": map[string]interface{}{
				"Error": map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"error": map[string]interface{}{"type": "string"},
					},
				},
				"RegisterRequest": map[string]interface{}{
					"type": "object",
					"required": []string{"phone", "password", "firstName", "lastName"},
					"properties": map[string]interface{}{
						"phone":      map[string]interface{}{"type": "string", "example": "+584121234567"},
						"password":   map[string]interface{}{"type": "string", "format": "password"},
						"firstName":  map[string]interface{}{"type": "string"},
						"lastName":   map[string]interface{}{"type": "string"},
						"email":      map[string]interface{}{"type": "string", "format": "email"},
						"nationalId": map[string]interface{}{"type": "string"},
					},
				},
				"LoginRequest": map[string]interface{}{
					"type": "object",
					"required": []string{"phone", "password"},
					"properties": map[string]interface{}{
						"phone":    map[string]interface{}{"type": "string"},
						"password": map[string]interface{}{"type": "string", "format": "password"},
					},
				},
				"AuthResponse": map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"token": map[string]interface{}{"type": "string"},
						"user":  ref("User"),
					},
				},
				"User": map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"id":        map[string]interface{}{"type": "string", "format": "uuid"},
						"firstName": map[string]interface{}{"type": "string"},
						"lastName":  map[string]interface{}{"type": "string"},
						"role":      map[string]interface{}{"type": "string", "enum": []string{"PATIENT", "MERCHANT", "ADMIN"}},
						"level":     map[string]interface{}{"type": "integer", "minimum": 1, "maximum": 6},
						"phone":     map[string]interface{}{"type": "string"},
						"email":     map[string]interface{}{"type": "string", "format": "email"},
					},
				},
				"CreditLine": map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"id":       map[string]interface{}{"type": "string", "format": "uuid"},
						"type":     map[string]interface{}{"type": "string", "enum": []string{"ESPECIALIDAD_PRINCIPAL", "SALUD_COTIDIANA", "MAYOR_CUIDADO"}},
						"limitUsd": map[string]interface{}{"type": "number", "format": "float"},
						"usedUsd":  map[string]interface{}{"type": "number", "format": "float"},
						"status":   map[string]interface{}{"type": "string", "enum": []string{"ACTIVE", "PAUSED", "BLOCKED"}},
					},
				},
				"Installment": map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"id":             map[string]interface{}{"type": "string", "format": "uuid"},
						"installmentNum": map[string]interface{}{"type": "integer"},
						"amount":         map[string]interface{}{"type": "number", "format": "float"},
						"dueDate":        map[string]interface{}{"type": "string", "format": "date"},
						"status":         map[string]interface{}{"type": "string", "enum": []string{"PENDING", "PAID", "OVERDUE"}},
					},
				},
				"PaymentRequest": map[string]interface{}{
					"type": "object",
					"required": []string{"installmentId", "method"},
					"properties": map[string]interface{}{
						"installmentId":    map[string]interface{}{"type": "string", "format": "uuid"},
						"method":           map[string]interface{}{"type": "string", "enum": []string{"CARD", "MOBILE", "BANK", "CASH"}},
						"reference":        map[string]interface{}{"type": "string"},
						"cardNumber":       map[string]interface{}{"type": "string"},
						"cvv":              map[string]interface{}{"type": "string"},
						"expirationMonth":  map[string]interface{}{"type": "string"},
						"expirationYear":   map[string]interface{}{"type": "string"},
						"fullName":         map[string]interface{}{"type": "string"},
					},
				},
				"PaymentResponse": map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"status":               map[string]interface{}{"type": "string", "enum": []string{"PAID", "REJECTED", "ALREADY_PAID"}},
						"message":              map[string]interface{}{"type": "string"},
						"amount":               map[string]interface{}{"type": "number"},
						"amountVES":            map[string]interface{}{"type": "number"},
						"bcvRate":              map[string]interface{}{"type": "number"},
						"gatewayTransactionId": map[string]interface{}{"type": "string"},
						"creditReactivated":    map[string]interface{}{"type": "boolean"},
					},
				},
				"HealthProfile": map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"bloodType":                map[string]interface{}{"type": "string", "enum": []string{"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"}},
						"heightCm":                 map[string]interface{}{"type": "integer"},
						"weightKg":                 map[string]interface{}{"type": "number"},
						"allergies":                map[string]interface{}{"type": "array", "items": map[string]interface{}{"type": "string"}},
						"chronicConditions":        map[string]interface{}{"type": "array", "items": map[string]interface{}{"type": "string"}},
						"currentMedications":       map[string]interface{}{"type": "array", "items": map[string]interface{}{"type": "string"}},
						"emergencyContactName":     map[string]interface{}{"type": "string"},
						"emergencyContactPhone":    map[string]interface{}{"type": "string"},
						"emergencyContactRelation": map[string]interface{}{"type": "string"},
						"notes":                    map[string]interface{}{"type": "string"},
					},
				},
			},
		},
	}

	spec.Paths["/auth/register"] = OpenAPIPathItem{
		Post: &OpenAPIOperation{
			Summary:     "Register a new patient user",
			OperationID: "register",
			Tags:        []string{"Auth"},
			RequestBody: &OpenAPIRequestBody{
				Description: "User registration data",
				Required:    true,
				Content:     map[string]OpenAPIMedia{"application/json": jsonMedia(ref("RegisterRequest"))},
			},
			Responses: map[string]OpenAPIResponse{
				"201": jsonResponse("User created with default credit lines", ref("AuthResponse")),
				"400": jsonResponse("Invalid input", ref("Error")),
				"409": jsonResponse("User already exists", ref("Error")),
			},
		},
	}

	spec.Paths["/auth/login"] = OpenAPIPathItem{
		Post: &OpenAPIOperation{
			Summary:     "Login with phone and password",
			OperationID: "login",
			Tags:        []string{"Auth"},
			RequestBody: &OpenAPIRequestBody{
				Description: "Login credentials",
				Required:    true,
				Content:     map[string]OpenAPIMedia{"application/json": jsonMedia(ref("LoginRequest"))},
			},
			Responses: map[string]OpenAPIResponse{
				"200": jsonResponse("Login successful, JWT set in httpOnly cookie", ref("AuthResponse")),
				"401": jsonResponse("Invalid credentials", ref("Error")),
			},
		},
	}

	spec.Paths["/auth/me"] = OpenAPIPathItem{
		Get: &OpenAPIOperation{
			Summary:     "Get current authenticated user profile",
			OperationID: "getMe",
			Tags:        []string{"Auth"},
			Security:    securityCookie,
			Responses: map[string]OpenAPIResponse{
				"200": jsonResponse("Current user profile", ref("User")),
				"401": jsonResponse("Unauthorized", ref("Error")),
			},
		},
	}

	spec.Paths["/patient/credit-lines"] = OpenAPIPathItem{
		Get: &OpenAPIOperation{
			Summary:     "Get the authenticated patient's credit lines",
			OperationID: "getCreditLines",
			Tags:        []string{"Patient"},
			Security:    securityCookie,
			Responses: map[string]OpenAPIResponse{
				"200": jsonResponse("List of credit lines", map[string]interface{}{
					"type": "array",
					"items": ref("CreditLine"),
				}),
				"401": jsonResponse("Unauthorized", ref("Error")),
			},
		},
	}

	spec.Paths["/patient/transactions/my/installments/pending"] = OpenAPIPathItem{
		Get: &OpenAPIOperation{
			Summary:     "Get the authenticated patient's pending installments",
			OperationID: "getPendingInstallments",
			Tags:        []string{"Patient"},
			Security:    securityCookie,
			Responses: map[string]OpenAPIResponse{
				"200": jsonResponse("List of pending installments with details", map[string]interface{}{
					"type":  "array",
					"items": ref("Installment"),
				}),
				"401": jsonResponse("Unauthorized", ref("Error")),
			},
		},
	}

	spec.Paths["/patient/payments"] = OpenAPIPathItem{
		Post: &OpenAPIOperation{
			Summary:     "Process a payment for an installment",
			OperationID: "processPayment",
			Tags:        []string{"Patient"},
			Security:    securityCookie,
			RequestBody: &OpenAPIRequestBody{
				Description: "Payment details",
				Required:    true,
				Content:     map[string]OpenAPIMedia{"application/json": jsonMedia(ref("PaymentRequest"))},
			},
			Responses: map[string]OpenAPIResponse{
				"200": jsonResponse("Payment processed successfully", ref("PaymentResponse")),
				"402": jsonResponse("Payment rejected by gateway", ref("PaymentResponse")),
				"404": jsonResponse("Installment not found", ref("Error")),
				"409": jsonResponse("Installment already paid", ref("Error")),
			},
		},
	}

	spec.Paths["/patient/health-profile"] = OpenAPIPathItem{
		Get: &OpenAPIOperation{
			Summary:     "Get the authenticated patient's health profile",
			OperationID: "getHealthProfile",
			Tags:        []string{"Health"},
			Security:    securityCookie,
			Responses: map[string]OpenAPIResponse{
				"200": jsonResponse("Health profile (or empty if not set)", ref("HealthProfile")),
				"401": jsonResponse("Unauthorized", ref("Error")),
			},
		},
		Put: &OpenAPIOperation{
			Summary:     "Create or update the authenticated patient's health profile",
			OperationID: "upsertHealthProfile",
			Tags:        []string{"Health"},
			Security:    securityCookie,
			RequestBody: &OpenAPIRequestBody{
				Description: "Health profile data",
				Required:    true,
				Content:     map[string]OpenAPIMedia{"application/json": jsonMedia(ref("HealthProfile"))},
			},
			Responses: map[string]OpenAPIResponse{
				"200": jsonResponse("Health profile saved", ref("HealthProfile")),
				"400": jsonResponse("Validation error", ref("Error")),
				"401": jsonResponse("Unauthorized", ref("Error")),
			},
		},
	}

	return spec
}

func SpecHandler() http.HandlerFunc {
	spec := BuildSpec()
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(spec)
	}
}

const swaggerUITemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SaludTech API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css">
  <style>
    body { margin: 0; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: "/api/v1/docs",
        dom_id: "#swagger-ui",
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
        layout: "BaseLayout",
      });
    };
  </script>
</body>
</html>`

func SwaggerUIHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Write([]byte(swaggerUITemplate))
	}
}
