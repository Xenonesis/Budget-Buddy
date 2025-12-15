package handler

import (
	"encoding/json"
	"net/http"
	"runtime"
	"time"
)

// HealthResponse represents the health check response
type HealthResponse struct {
	Success bool                   `json:"success"`
	Data    map[string]interface{} `json:"data"`
	Time    string                 `json:"timestamp"`
}

// Handler handles health check requests
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

	// Get memory stats
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	response := HealthResponse{
		Success: true,
		Data: map[string]interface{}{
			"status":      "healthy",
			"timestamp":   time.Now().UTC().Format(time.RFC3339),
			"version":     "1.0.0",
			"runtime":     "go",
			"go_version":  runtime.Version(),
			"environment": getEnv("NODE_ENV", "production"),
			"memory": map[string]uint64{
				"alloc":       m.Alloc,
				"totalAlloc":  m.TotalAlloc,
				"sys":         m.Sys,
				"numGC":       uint64(m.NumGC),
			},
		},
		Time: time.Now().UTC().Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// Helper functions
func errorResponse(w http.ResponseWriter, message string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"error":     message,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
}

func getEnv(key, fallback string) string {
	if value := runtime.GOOS; value != "" {
		return value
	}
	return fallback
}
