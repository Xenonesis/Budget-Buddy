# Go Serverless Functions - Code Examples

Complete code examples for building Go serverless functions.

## Table of Contents

1. [Basic Examples](#basic-examples)
2. [Authentication](#authentication)
3. [Database Operations](#database-operations)
4. [Error Handling](#error-handling)
5. [Advanced Patterns](#advanced-patterns)

---

## Basic Examples

### Simple GET Endpoint

```go
package handler

import (
	"net/http"
	"./lib"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	// Apply CORS
	lib.ApplyCORS(w)

	// Handle preflight
	if lib.HandleCORSPreflight(w, r) {
		return
	}

	// Only allow GET
	if r.Method != "GET" {
		lib.ErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed, nil)
		return
	}

	data := map[string]interface{}{
		"message": "Hello from Go!",
		"status":  "success",
	}

	lib.SuccessResponse(w, data, http.StatusOK)
}
```

### POST with JSON Body

```go
package handler

import (
	"net/http"
	"./lib"
)

type CreateItemInput struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Amount      float64 `json:"amount"`
}

func Handler(w http.ResponseWriter, r *http.Request) {
	lib.ApplyCORS(w)

	if r.Method != "POST" {
		lib.ErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed, nil)
		return
	}

	var input CreateItemInput
	if err := lib.ParseJSONBody(r, &input); err != nil {
		lib.ErrorResponse(w, "Invalid JSON", http.StatusBadRequest, map[string]string{
			"error": err.Error(),
		})
		return
	}

	// Validate
	if input.Name == "" {
		lib.ErrorResponse(w, "Name is required", http.StatusBadRequest, nil)
		return
	}

	// Process...
	result := map[string]interface{}{
		"id":          "item-123",
		"name":        input.Name,
		"description": input.Description,
		"amount":      input.Amount,
	}

	lib.SuccessResponse(w, result, http.StatusCreated)
}
```

### Query Parameters

```go
package handler

import (
	"net/http"
	"strconv"
	"./lib"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	lib.ApplyCORS(w)

	// Get query parameters
	limitStr := lib.GetQueryParam(r, "limit", "10")
	offsetStr := lib.GetQueryParam(r, "offset", "0")
	sortBy := lib.GetQueryParam(r, "sort", "date")

	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)

	data := map[string]interface{}{
		"limit":  limit,
		"offset": offset,
		"sortBy": sortBy,
		"items":  []string{"item1", "item2"},
	}

	lib.SuccessResponse(w, data, http.StatusOK)
}
```

---

## Authentication

### Protected Endpoint

```go
package handler

import (
	"net/http"
	"./lib"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	config := lib.Config{
		RequireAuth:    true,  // Require authentication
		AllowedMethods: []string{"GET", "POST"},
		EnableCORS:     true,
	}

	handler := lib.CreateHandler(protectedHandler, config)
	handler(w, r)
}

func protectedHandler(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	user, ok := lib.GetUserFromContext(r)
	if !ok {
		lib.ErrorResponse(w, "User not found", http.StatusUnauthorized, nil)
		return
	}

	data := map[string]interface{}{
		"message": "You are authenticated!",
		"user_id": user.ID,
		"email":   user.Email,
	}

	lib.SuccessResponse(w, data, http.StatusOK)
}
```

### Manual Authentication

```go
package handler

import (
	"net/http"
	"./lib"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	lib.ApplyCORS(w)

	// Manually authenticate
	user, err := lib.AuthenticateRequest(r)
	if err != nil {
		lib.ErrorResponse(w, "Unauthorized", http.StatusUnauthorized, map[string]string{
			"error": err.Error(),
		})
		return
	}

	// Set user in context
	r = lib.SetUserContext(r, user)

	// Continue with authenticated user
	data := map[string]interface{}{
		"user_id": user.ID,
	}

	lib.SuccessResponse(w, data, http.StatusOK)
}
```

---

## Database Operations

### Query with Filters

```go
package handler

import (
	"net/http"
	"./lib"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	config := lib.Config{
		RequireAuth: true,
		EnableCORS:  true,
	}

	handler := lib.CreateHandler(queryHandler, config)
	handler(w, r)
}

func queryHandler(w http.ResponseWriter, r *http.Request) {
	user, _ := lib.GetUserFromContext(r)

	// Get filters
	category := lib.GetQueryParam(r, "category", "")
	typeFilter := lib.GetQueryParam(r, "type", "")

	// TODO: Query Supabase
	// supabase := getSupabaseClient()
	// query := supabase.From("transactions").Select("*").Eq("user_id", user.ID)

	// Mock data
	transactions := []map[string]interface{}{
		{
			"id":       "trans-1",
			"user_id":  user.ID,
			"category": category,
			"type":     typeFilter,
			"amount":   100.0,
		},
	}

	lib.SuccessResponse(w, map[string]interface{}{
		"transactions": transactions,
		"count":        len(transactions),
	}, http.StatusOK)
}
```

### Create with Validation

```go
package handler

import (
	"net/http"
	"time"
	"./lib"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	config := lib.Config{
		RequireAuth:    true,
		AllowedMethods: []string{"POST"},
		EnableCORS:     true,
	}

	handler := lib.CreateHandler(createHandler, config)
	handler(w, r)
}

func createHandler(w http.ResponseWriter, r *http.Request) {
	user, _ := lib.GetUserFromContext(r)

	var input lib.CreateTransactionInput
	if err := lib.ParseJSONBody(r, &input); err != nil {
		lib.ErrorResponse(w, "Invalid JSON", http.StatusBadRequest, nil)
		return
	}

	// Validate
	if input.Amount <= 0 {
		lib.ErrorResponse(w, "Amount must be positive", http.StatusBadRequest, nil)
		return
	}

	if input.Type != "income" && input.Type != "expense" {
		lib.ErrorResponse(w, "Type must be 'income' or 'expense'", http.StatusBadRequest, nil)
		return
	}

	// TODO: Insert into database
	// supabase := getSupabaseClient()
	// result := supabase.From("transactions").Insert(...)

	transaction := map[string]interface{}{
		"id":          "trans-new",
		"user_id":     user.ID,
		"amount":      input.Amount,
		"category":    input.Category,
		"type":        input.Type,
		"created_at":  time.Now().UTC().Format(time.RFC3339),
	}

	lib.SuccessResponse(w, map[string]interface{}{
		"transaction": transaction,
	}, http.StatusCreated)
}
```

---

## Error Handling

### Comprehensive Error Handling

```go
package handler

import (
	"net/http"
	"./lib"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if err := recover(); err != nil {
			lib.ErrorResponse(w, "Internal server error", http.StatusInternalServerError, map[string]interface{}{
				"panic": err,
			})
		}
	}()

	lib.ApplyCORS(w)

	// Your logic here
	if err := processRequest(r); err != nil {
		handleError(w, err)
		return
	}

	lib.SuccessResponse(w, map[string]string{
		"status": "success",
	}, http.StatusOK)
}

func processRequest(r *http.Request) error {
	// Your processing logic
	return nil
}

func handleError(w http.ResponseWriter, err error) {
	// Custom error handling
	switch err.Error() {
	case "not found":
		lib.ErrorResponse(w, "Resource not found", http.StatusNotFound, nil)
	case "validation error":
		lib.ErrorResponse(w, "Validation failed", http.StatusBadRequest, nil)
	default:
		lib.ErrorResponse(w, "Internal error", http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}
}
```

---

## Advanced Patterns

### Middleware Pattern

```go
package handler

import (
	"net/http"
	"time"
	"./lib"
)

// Logging middleware
func loggingMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Log request
		clientIP := lib.GetClientIP(r)
		println("Request:", r.Method, r.URL.Path, "from", clientIP)

		// Call next handler
		next(w, r)

		// Log response time
		duration := time.Since(start)
		println("Response time:", duration)
	}
}

// Rate limiting middleware
func rateLimitMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		clientIP := lib.GetClientIP(r)

		// TODO: Check rate limit
		// if exceeded {
		//     lib.ErrorResponse(w, "Rate limit exceeded", http.StatusTooManyRequests, nil)
		//     return
		// }

		next(w, r)
	}
}

// Handler with middleware chain
func Handler(w http.ResponseWriter, r *http.Request) {
	handler := loggingMiddleware(rateLimitMiddleware(mainHandler))
	handler(w, r)
}

func mainHandler(w http.ResponseWriter, r *http.Request) {
	lib.ApplyCORS(w)
	lib.SuccessResponse(w, map[string]string{
		"message": "Success with middleware!",
	}, http.StatusOK)
}
```

### Concurrent Processing

```go
package handler

import (
	"net/http"
	"sync"
	"./lib"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	lib.ApplyCORS(w)

	// Use goroutines for concurrent processing
	var wg sync.WaitGroup
	results := make(chan map[string]interface{}, 3)

	// Fetch data concurrently
	wg.Add(3)

	go func() {
		defer wg.Done()
		results <- fetchTransactions()
	}()

	go func() {
		defer wg.Done()
		results <- fetchBudgets()
	}()

	go func() {
		defer wg.Done()
		results <- fetchAnalytics()
	}()

	// Wait for all goroutines
	go func() {
		wg.Wait()
		close(results)
	}()

	// Collect results
	data := make(map[string]interface{})
	for result := range results {
		for k, v := range result {
			data[k] = v
		}
	}

	lib.SuccessResponse(w, data, http.StatusOK)
}

func fetchTransactions() map[string]interface{} {
	// Simulate fetch
	return map[string]interface{}{
		"transactions": []string{"t1", "t2"},
	}
}

func fetchBudgets() map[string]interface{} {
	return map[string]interface{}{
		"budgets": []string{"b1", "b2"},
	}
}

func fetchAnalytics() map[string]interface{} {
	return map[string]interface{}{
		"analytics": map[string]float64{"total": 1000.0},
	}
}
```

### Batch Operations

```go
package handler

import (
	"net/http"
	"./lib"
)

type BatchRequest struct {
	Operations []Operation `json:"operations"`
}

type Operation struct {
	Type string                 `json:"type"`
	Data map[string]interface{} `json:"data"`
}

func Handler(w http.ResponseWriter, r *http.Request) {
	config := lib.Config{
		RequireAuth:    true,
		AllowedMethods: []string{"POST"},
		EnableCORS:     true,
	}

	handler := lib.CreateHandler(batchHandler, config)
	handler(w, r)
}

func batchHandler(w http.ResponseWriter, r *http.Request) {
	user, _ := lib.GetUserFromContext(r)

	var batch BatchRequest
	if err := lib.ParseJSONBody(r, &batch); err != nil {
		lib.ErrorResponse(w, "Invalid JSON", http.StatusBadRequest, nil)
		return
	}

	results := make([]map[string]interface{}, 0)

	for _, op := range batch.Operations {
		result := processOperation(op, user)
		results = append(results, result)
	}

	lib.SuccessResponse(w, map[string]interface{}{
		"results": results,
		"count":   len(results),
	}, http.StatusOK)
}

func processOperation(op Operation, user *lib.User) map[string]interface{} {
	// Process each operation
	return map[string]interface{}{
		"type":    op.Type,
		"status":  "success",
		"user_id": user.ID,
	}
}
```

### Pagination Helper

```go
package handler

import (
	"net/http"
	"strconv"
	"./lib"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	config := lib.Config{
		RequireAuth: true,
		EnableCORS:  true,
	}

	handler := lib.CreateHandler(paginatedHandler, config)
	handler(w, r)
}

func paginatedHandler(w http.ResponseWriter, r *http.Request) {
	user, _ := lib.GetUserFromContext(r)

	// Get pagination params
	limit, offset := getPaginationParams(r)

	// TODO: Query database with pagination
	// total := getTotalCount(user.ID)
	// items := getItems(user.ID, limit, offset)

	// Mock data
	total := 100
	items := []map[string]interface{}{
		{"id": "1", "name": "Item 1"},
		{"id": "2", "name": "Item 2"},
	}

	response := lib.PaginatedResponse{
		Items:   items,
		Total:   total,
		Limit:   limit,
		Offset:  offset,
		HasMore: offset + limit < total,
	}

	lib.SuccessResponse(w, response, http.StatusOK)
}

func getPaginationParams(r *http.Request) (int, int) {
	limitStr := lib.GetQueryParam(r, "limit", "50")
	offsetStr := lib.GetQueryParam(r, "offset", "0")

	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)

	// Validate
	if limit < 1 {
		limit = 50
	}
	if limit > 100 {
		limit = 100
	}
	if offset < 0 {
		offset = 0
	}

	return limit, offset
}
```

---

## Testing Examples

### Unit Test

```go
package handler

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHandler(t *testing.T) {
	req, err := http.NewRequest("GET", "/api/go/test", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(Handler)

	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	expected := `{"success":true`
	if !contains(rr.Body.String(), expected) {
		t.Errorf("handler returned unexpected body: got %v want substring %v",
			rr.Body.String(), expected)
	}
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && s[:len(substr)] == substr
}
```

---

These examples cover most common use cases for Go serverless functions. Adapt them to your specific
needs!
