package auth

import (
	"regexp"
)

var (
	emailRegex    = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	phoneRegex    = regexp.MustCompile(`^(\+58|0)?4(12|14|16|24|26)\d{7}$`)
	nationalIDRegex = regexp.MustCompile(`^(V|E|G|J|C)?\d{6,9}$`)
)

// validateEmail returns true if the email format is valid.
func validateEmail(email string) bool {
	return emailRegex.MatchString(email)
}

// validatePhone returns true if the phone format is valid (Venezuelan).
func validatePhone(phone string) bool {
	return phoneRegex.MatchString(phone)
}

// validateNationalID returns true if the national ID format is valid.
func validateNationalID(id string) bool {
	if id == "" {
		return true // optional field
	}
	return nationalIDRegex.MatchString(id)
}

// ValidatePasswordComplexity returns an error message if the password does not
// meet complexity requirements: min 8 chars, at least 1 uppercase, 1 lowercase,
// 1 digit. Returns empty string if valid.
func ValidatePasswordComplexity(password string) string {
	return validatePasswordComplexity(password)
}

// validatePasswordComplexity returns an error message if the password does not
// meet complexity requirements: min 8 chars, at least 1 uppercase, 1 lowercase,
// 1 digit. Returns empty string if valid.
func validatePasswordComplexity(password string) string {
	if len(password) < 8 {
		return "Password must be at least 8 characters"
	}
	if len(password) > 100 {
		return "Password must not exceed 100 characters"
	}
	hasUpper := false
	hasLower := false
	hasDigit := false
	for _, c := range password {
		switch {
		case c >= 'A' && c <= 'Z':
			hasUpper = true
		case c >= 'a' && c <= 'z':
			hasLower = true
		case c >= '0' && c <= '9':
			hasDigit = true
		}
	}
	if !hasUpper {
		return "Password must contain at least one uppercase letter"
	}
	if !hasLower {
		return "Password must contain at least one lowercase letter"
	}
	if !hasDigit {
		return "Password must contain at least one digit"
	}
	return ""
}
