package handler

import (
	"net/http"
	"strconv"
	
	"github.com/budget-buddy/api/lib"
)

// Handler handles transaction CRUD operations
func Handler(w http.ResponseWriter, r *http.Request) {
	config := lib.Config{
		RequireAuth:    true,
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
		EnableCORS:     true,
	}

	handler := lib.CreateHandler(transactionHandler, config)
	handler(w, r)
}

func transactionHandler(w http.ResponseWriter, r *http.Request) {
	user, ok := lib.GetUserFromContext(r)
	if !ok {
		lib.ErrorResponse(w, "Unauthorized", http.StatusUnauthorized, nil)
		return
	}

	switch r.Method {
	case "GET":
		handleGetTransactions(w, r, user)
	case "POST":
		handleCreateTransaction(w, r, user)
	case "PUT":
		handleUpdateTransaction(w, r, user)
	case "DELETE":
		handleDeleteTransaction(w, r, user)
	default:
		lib.ErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed, nil)
	}
}

func handleGetTransactions(w http.ResponseWriter, r *http.Request, user *lib.User) {
	// Parse query parameters
	limitStr := lib.GetQueryParam(r, "limit", "50")
	offsetStr := lib.GetQueryParam(r, "offset", "0")
	transactionType := lib.GetQueryParam(r, "type", "")
	category := lib.GetQueryParam(r, "category", "")

	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)

	// TODO: Query database
	// For now, return mock data
	transactions := []map[string]interface{}{
		{
			"id":          "trans-1",
			"user_id":     user.ID,
			"amount":      100.50,
			"category":    "Groceries",
			"type":        "expense",
			"description": "Weekly shopping",
			"date":        "2024-01-15T10:00:00Z",
		},
	}

	// Apply filters
	var filtered []map[string]interface{}
	for _, t := range transactions {
		if transactionType != "" && t["type"] != transactionType {
			continue
		}
		if category != "" && t["category"] != category {
			continue
		}
		filtered = append(filtered, t)
	}

	// Calculate summary
	summary := map[string]interface{}{
		"totalIncome":   0.0,
		"totalExpenses": 100.50,
		"count":         len(filtered),
	}

	response := map[string]interface{}{
		"transactions": filtered,
		"summary":      summary,
		"pagination": map[string]interface{}{
			"total":   len(filtered),
			"limit":   limit,
			"offset":  offset,
			"hasMore": false,
		},
	}

	lib.SuccessResponse(w, response, http.StatusOK)
}

func handleCreateTransaction(w http.ResponseWriter, r *http.Request, user *lib.User) {
	var input lib.CreateTransactionInput
	if err := lib.ParseJSONBody(r, &input); err != nil {
		lib.ErrorResponse(w, "Invalid JSON body", http.StatusBadRequest, map[string]string{
			"error": err.Error(),
		})
		return
	}

	// Validate input
	if input.Amount <= 0 {
		lib.ErrorResponse(w, "Amount must be positive", http.StatusBadRequest, nil)
		return
	}

	if input.Category == "" {
		lib.ErrorResponse(w, "Category is required", http.StatusBadRequest, nil)
		return
	}

	if input.Type != "income" && input.Type != "expense" {
		lib.ErrorResponse(w, "Type must be 'income' or 'expense'", http.StatusBadRequest, nil)
		return
	}

	// TODO: Insert into database
	transaction := map[string]interface{}{
		"id":             "trans-new",
		"user_id":        user.ID,
		"amount":         input.Amount,
		"category":       input.Category,
		"type":           input.Type,
		"description":    input.Description,
		"date":           input.Date,
		"merchant":       input.Merchant,
		"payment_method": input.PaymentMethod,
		"created_at":     "2024-01-15T10:00:00Z",
	}

	lib.SuccessResponse(w, map[string]interface{}{
		"transaction": transaction,
	}, http.StatusCreated)
}

func handleUpdateTransaction(w http.ResponseWriter, r *http.Request, user *lib.User) {
	id := lib.GetQueryParam(r, "id", "")
	if id == "" {
		lib.ErrorResponse(w, "Transaction ID required", http.StatusBadRequest, nil)
		return
	}

	var input map[string]interface{}
	if err := lib.ParseJSONBody(r, &input); err != nil {
		lib.ErrorResponse(w, "Invalid JSON body", http.StatusBadRequest, nil)
		return
	}

	// TODO: Update in database
	transaction := map[string]interface{}{
		"id":      id,
		"user_id": user.ID,
		"updated": true,
	}

	lib.SuccessResponse(w, map[string]interface{}{
		"transaction": transaction,
	}, http.StatusOK)
}

func handleDeleteTransaction(w http.ResponseWriter, r *http.Request, user *lib.User) {
	id := lib.GetQueryParam(r, "id", "")
	if id == "" {
		lib.ErrorResponse(w, "Transaction ID required", http.StatusBadRequest, nil)
		return
	}

	// TODO: Delete from database

	lib.SuccessResponse(w, map[string]interface{}{
		"message": "Transaction deleted successfully",
		"id":      id,
	}, http.StatusOK)
}

