package handler

import (
	"net/http"
	
	"github.com/budget-buddy/api/lib"
)

// Handler handles budget CRUD operations
func Handler(w http.ResponseWriter, r *http.Request) {
	config := lib.Config{
		RequireAuth:    true,
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
		EnableCORS:     true,
	}

	handler := lib.CreateHandler(budgetHandler, config)
	handler(w, r)
}

func budgetHandler(w http.ResponseWriter, r *http.Request) {
	user, ok := lib.GetUserFromContext(r)
	if !ok {
		lib.ErrorResponse(w, "Unauthorized", http.StatusUnauthorized, nil)
		return
	}

	switch r.Method {
	case "GET":
		handleGetBudgets(w, r, user)
	case "POST":
		handleCreateBudget(w, r, user)
	case "PUT":
		handleUpdateBudget(w, r, user)
	case "DELETE":
		handleDeleteBudget(w, r, user)
	default:
		lib.ErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed, nil)
	}
}

func handleGetBudgets(w http.ResponseWriter, r *http.Request, user *lib.User) {
	period := lib.GetQueryParam(r, "period", "monthly")

	// TODO: Query database
	budgets := []map[string]interface{}{
		{
			"id":              "budget-1",
			"user_id":         user.ID,
			"category":        "Groceries",
			"amount":          500.0,
			"period":          period,
			"alert_threshold": 80,
			"created_at":      "2024-01-01T00:00:00Z",
		},
	}

	lib.SuccessResponse(w, map[string]interface{}{
		"budgets": budgets,
	}, http.StatusOK)
}

func handleCreateBudget(w http.ResponseWriter, r *http.Request, user *lib.User) {
	var input lib.CreateBudgetInput
	if err := lib.ParseJSONBody(r, &input); err != nil {
		lib.ErrorResponse(w, "Invalid JSON body", http.StatusBadRequest, nil)
		return
	}

	// Validate input
	if input.Category == "" {
		lib.ErrorResponse(w, "Category is required", http.StatusBadRequest, nil)
		return
	}

	if input.Amount <= 0 {
		lib.ErrorResponse(w, "Amount must be positive", http.StatusBadRequest, nil)
		return
	}

	if input.Period != "weekly" && input.Period != "monthly" && input.Period != "yearly" {
		lib.ErrorResponse(w, "Period must be 'weekly', 'monthly', or 'yearly'", http.StatusBadRequest, nil)
		return
	}

	// TODO: Insert into database
	budget := map[string]interface{}{
		"id":              "budget-new",
		"user_id":         user.ID,
		"category":        input.Category,
		"amount":          input.Amount,
		"period":          input.Period,
		"alert_threshold": input.AlertThreshold,
		"created_at":      "2024-01-15T10:00:00Z",
	}

	lib.SuccessResponse(w, map[string]interface{}{
		"budget": budget,
	}, http.StatusCreated)
}

func handleUpdateBudget(w http.ResponseWriter, r *http.Request, user *lib.User) {
	id := lib.GetQueryParam(r, "id", "")
	if id == "" {
		lib.ErrorResponse(w, "Budget ID required", http.StatusBadRequest, nil)
		return
	}

	var input map[string]interface{}
	if err := lib.ParseJSONBody(r, &input); err != nil {
		lib.ErrorResponse(w, "Invalid JSON body", http.StatusBadRequest, nil)
		return
	}

	// TODO: Update in database
	budget := map[string]interface{}{
		"id":      id,
		"user_id": user.ID,
		"updated": true,
	}

	lib.SuccessResponse(w, map[string]interface{}{
		"budget": budget,
	}, http.StatusOK)
}

func handleDeleteBudget(w http.ResponseWriter, r *http.Request, user *lib.User) {
	id := lib.GetQueryParam(r, "id", "")
	if id == "" {
		lib.ErrorResponse(w, "Budget ID required", http.StatusBadRequest, nil)
		return
	}

	// TODO: Delete from database

	lib.SuccessResponse(w, map[string]interface{}{
		"message": "Budget deleted successfully",
		"id":      id,
	}, http.StatusOK)
}

