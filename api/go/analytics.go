package handler

import (
	"net/http"
	
	"github.com/budget-buddy/api/lib"
)

// Handler handles analytics requests
func Handler(w http.ResponseWriter, r *http.Request) {
	config := lib.Config{
		RequireAuth:    true,
		AllowedMethods: []string{"GET"},
		EnableCORS:     true,
	}

	handler := lib.CreateHandler(analyticsHandler, config)
	handler(w, r)
}

func analyticsHandler(w http.ResponseWriter, r *http.Request) {
	user, ok := lib.GetUserFromContext(r)
	if !ok {
		lib.ErrorResponse(w, "Unauthorized", http.StatusUnauthorized, nil)
		return
	}

	analyticsType := lib.GetQueryParam(r, "type", "summary")
	startDate := lib.GetQueryParam(r, "start_date", "")
	endDate := lib.GetQueryParam(r, "end_date", "")

	_ = startDate
	_ = endDate

	switch analyticsType {
	case "summary":
		handleSummaryAnalytics(w, user)
	case "category":
		handleCategoryAnalytics(w, user)
	case "trend":
		handleTrendAnalytics(w, user)
	default:
		lib.ErrorResponse(w, "Invalid analytics type", http.StatusBadRequest, map[string]interface{}{
			"allowed": []string{"summary", "category", "trend"},
		})
	}
}

func handleSummaryAnalytics(w http.ResponseWriter, user *lib.User) {
	// TODO: Query database and calculate
	summary := lib.AnalyticsSummary{
		TotalIncome:      5000.0,
		TotalExpenses:    3000.0,
		NetSavings:       2000.0,
		SavingsRate:      40.0,
		TransactionCount: 150,
	}

	lib.SuccessResponse(w, map[string]interface{}{
		"summary": summary,
	}, http.StatusOK)
}

func handleCategoryAnalytics(w http.ResponseWriter, user *lib.User) {
	// TODO: Query database and aggregate
	categories := []lib.CategoryAnalytics{
		{
			Category:     "Groceries",
			Income:       0,
			Expenses:     500.0,
			Transactions: 12,
		},
		{
			Category:     "Salary",
			Income:       5000.0,
			Expenses:     0,
			Transactions: 1,
		},
	}

	lib.SuccessResponse(w, map[string]interface{}{
		"categories": categories,
	}, http.StatusOK)
}

func handleTrendAnalytics(w http.ResponseWriter, user *lib.User) {
	// TODO: Query database and aggregate by month
	trend := []lib.TrendData{
		{
			Month:    "2024-01",
			Income:   5000.0,
			Expenses: 3000.0,
			Net:      2000.0,
		},
		{
			Month:    "2024-02",
			Income:   5200.0,
			Expenses: 2800.0,
			Net:      2400.0,
		},
	}

	lib.SuccessResponse(w, map[string]interface{}{
		"trend": trend,
	}, http.StatusOK)
}

