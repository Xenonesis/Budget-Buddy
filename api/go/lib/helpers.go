package lib

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"time"
)

// Response represents a standard API response
type Response struct {
	Success   bool        `json:"success"`
	Data      interface{} `json:"data,omitempty"`
	Error     string      `json:"error,omitempty"`
	Details   interface{} `json:"details,omitempty"`
	Timestamp string      `json:"timestamp"`
}

// User represents an authenticated user
type User struct {
	ID    string `json:"id"`
	Email string `json:"email,omitempty"`
}

// Config represents handler configuration
type Config struct {
	RequireAuth bool
	AllowedMethods []string
	EnableCORS bool
}

// SuccessResponse sends a success response
func SuccessResponse(w http.ResponseWriter, data interface{}, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(Response{
		Success:   true,
		Data:      data,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	})
}

// ErrorResponse sends an error response
func ErrorResponse(w http.ResponseWriter, message string, status int, details interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(Response{
		Success:   false,
		Error:     message,
		Details:   details,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	})
}

// ApplyCORS applies CORS headers to response
func ApplyCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
}

// HandleCORSPreflight handles OPTIONS preflight requests
func HandleCORSPreflight(w http.ResponseWriter, r *http.Request) bool {
	if r.Method == "OPTIONS" {
		ApplyCORS(w)
		w.WriteHeader(http.StatusOK)
		return true
	}
	return false
}

// ValidateMethod checks if the HTTP method is allowed
func ValidateMethod(w http.ResponseWriter, r *http.Request, allowed []string) bool {
	for _, method := range allowed {
		if r.Method == method {
			return true
		}
	}
	ErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed, map[string]interface{}{
		"allowed": allowed,
	})
	return false
}

// ParseJSONBody parses JSON request body
func ParseJSONBody(r *http.Request, v interface{}) error {
	decoder := json.NewDecoder(r.Body)
	return decoder.Decode(v)
}

// GetClientIP extracts client IP from request
func GetClientIP(r *http.Request) string {
	// Check X-Forwarded-For header
	forwarded := r.Header.Get("X-Forwarded-For")
	if forwarded != "" {
		ips := strings.Split(forwarded, ",")
		return strings.TrimSpace(ips[0])
	}

	// Check X-Real-IP header
	realIP := r.Header.Get("X-Real-IP")
	if realIP != "" {
		return realIP
	}

	// Fall back to RemoteAddr
	return r.RemoteAddr
}

// GetQueryParam gets a query parameter with a default value
func GetQueryParam(r *http.Request, key, defaultValue string) string {
	value := r.URL.Query().Get(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// GetEnv gets an environment variable with a default value
func GetEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// AuthenticateRequest validates authentication token
func AuthenticateRequest(r *http.Request) (*User, error) {
	// Get token from Authorization header
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return nil, &AuthError{Message: "Missing authorization header"}
	}

	// Extract token (Bearer <token>)
	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return nil, &AuthError{Message: "Invalid authorization header format"}
	}

	token := parts[1]
	
	// TODO: Validate token with Supabase
	// For now, return a mock user for demonstration
	_ = token
	
	return &User{
		ID:    "user-id",
		Email: "user@example.com",
	}, nil
}

// AuthError represents an authentication error
type AuthError struct {
	Message string
}

func (e *AuthError) Error() string {
	return e.Message
}

// ContextKey type for context keys
type ContextKey string

const (
	// UserContextKey is the context key for user
	UserContextKey ContextKey = "user"
)

// SetUserContext sets user in request context
func SetUserContext(r *http.Request, user *User) *http.Request {
	ctx := context.WithValue(r.Context(), UserContextKey, user)
	return r.WithContext(ctx)
}

// GetUserFromContext retrieves user from request context
func GetUserFromContext(r *http.Request) (*User, bool) {
	user, ok := r.Context().Value(UserContextKey).(*User)
	return user, ok
}

// CreateHandler creates a wrapped handler with middleware
func CreateHandler(handler http.HandlerFunc, config Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Apply CORS
		if config.EnableCORS {
			ApplyCORS(w)
			if HandleCORSPreflight(w, r) {
				return
			}
		}

		// Validate method
		if len(config.AllowedMethods) > 0 {
			if !ValidateMethod(w, r, config.AllowedMethods) {
				return
			}
		}

		// Authenticate if required
		if config.RequireAuth {
			user, err := AuthenticateRequest(r)
			if err != nil {
				ErrorResponse(w, "Unauthorized", http.StatusUnauthorized, nil)
				return
			}
			r = SetUserContext(r, user)
		}

		// Call handler
		handler(w, r)
	}
}
