package auth

import "testing"

func TestValidateEmail(t *testing.T) {
	tests := []struct {
		name  string
		email string
		want  bool
	}{
		{"valid email", "user@example.com", true},
		{"valid with dots", "john.doe@company.co.uk", true},
		{"valid with plus", "user+tag@gmail.com", true},
		{"valid with numbers", "user123@test.org", true},
		{"empty string", "", false},
		{"no @", "userexample.com", false},
		{"no domain", "user@", false},
		{"no TLD", "user@example", false},
		{"spaces", "user @example.com", false},
		{"double @", "user@@example.com", false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := validateEmail(tt.email)
			if got != tt.want {
				t.Errorf("validateEmail(%q) = %v, want %v", tt.email, got, tt.want)
			}
		})
	}
}

func TestValidatePhone(t *testing.T) {
	tests := []struct {
		name  string
		phone string
		want  bool
	}{
		{"valid +58 412", "+584121234567", true},
		{"valid +58 414", "+584141234567", true},
		{"valid +58 416", "+584161234567", true},
		{"valid +58 424", "+584241234567", true},
		{"valid +58 426", "+584261234567", true},
		{"valid 0412", "04121234567", true},
		{"valid 0424", "04241234567", true},
		{"empty", "", false},
		{"invalid prefix 411", "+584111234567", false},
		{"too short", "+58412", false},
		{"too long", "+5841212345678", false},
		{"no prefix 10 digits", "4121234567", true},
		{"landline", "+582121234567", false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := validatePhone(tt.phone)
			if got != tt.want {
				t.Errorf("validatePhone(%q) = %v, want %v", tt.phone, got, tt.want)
			}
		})
	}
}

func TestValidateNationalID(t *testing.T) {
	tests := []struct {
		name string
		id   string
		want bool
	}{
		{"valid V", "V12345678", true},
		{"valid E", "E12345678", true},
		{"valid without prefix", "12345678", true},
		{"valid 6 digits", "V123456", true},
		{"valid 9 digits", "V123456789", true},
		{"empty (optional)", "", true},
		{"too short", "V123", false},
		{"too long", "V1234567890", false},
		{"invalid prefix", "X12345678", false},
		{"letters in digits", "V12A4567", false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := validateNationalID(tt.id)
			if got != tt.want {
				t.Errorf("validateNationalID(%q) = %v, want %v", tt.id, got, tt.want)
			}
		})
	}
}

func TestValidatePasswordComplexity(t *testing.T) {
	tests := []struct {
		name     string
		password string
		wantErr  bool
	}{
		{"valid password", "Password1", false},
		{"valid with special", "P@ssw0rd!", false},
		{"valid long", "MySecurePass2024", false},
		{"too short", "Pass1", true},
		{"no uppercase", "password1", true},
		{"no lowercase", "PASSWORD1", true},
		{"no digit", "Password", true},
		{"empty", "", true},
		{"exactly 8 valid", "Pass1234", false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			msg := validatePasswordComplexity(tt.password)
			if tt.wantErr && msg == "" {
				t.Errorf("validatePasswordComplexity(%q) expected error, got none", tt.password)
			}
			if !tt.wantErr && msg != "" {
				t.Errorf("validatePasswordComplexity(%q) expected no error, got: %s", tt.password, msg)
			}
		})
	}
}
