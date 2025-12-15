package handler

import (
	"encoding/json"
	"net/http"
	"time"
)

// IndexResponse represents the API index response
type IndexResponse struct {
	Message   string                 `json:"message"`
	Version   string                 `json:"version"`
	Runtime   string                 `json:"runtime"`
	Endpoints map[string]interface{} `json:"endpoints"`
	Timestamp string                 `json:"timestamp"`
}

// Handler handles the API index endpoint
func Handler(w http.ResponseWriter, r *http.Request) {
	// Enable CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	// Handle preflight
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Only allow GET
	if r.Method != "GET" {
		errorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	response := IndexResponse{
		Message: "Budget Buddy Serverless API (Go)",
		Version: "1.0.0",
		Runtime: "Go",
		Endpoints: map[string]interface{}{
			"health":       "/api/go/health",
			"transactions": "/api/go/transactions",
			"budgets":      "/api/go/budgets",
			"analytics":    "/api/go/analytics",
			"users":        "/api/go/users",
		},
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func errorResponse(w http.ResponseWriter, message string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"error":     message,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
}
