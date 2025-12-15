package handler

import (
	"net/http"
	
	"github.com/budget-buddy/api/lib"
)

// Handler handles user profile operations
func Handler(w http.ResponseWriter, r *http.Request) {
	config := lib.Config{
		RequireAuth:    true,
		AllowedMethods: []string{"GET", "PUT", "DELETE"},
		EnableCORS:     true,
	}

	handler := lib.CreateHandler(userHandler, config)
	handler(w, r)
}

func userHandler(w http.ResponseWriter, r *http.Request) {
	user, ok := lib.GetUserFromContext(r)
	if !ok {
		lib.ErrorResponse(w, "Unauthorized", http.StatusUnauthorized, nil)
		return
	}

	switch r.Method {
	case "GET":
		handleGetProfile(w, user)
	case "PUT":
		handleUpdateProfile(w, r, user)
	case "DELETE":
		handleDeleteAccount(w, r, user)
	default:
		lib.ErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed, nil)
	}
}

func handleGetProfile(w http.ResponseWriter, user *lib.User) {
	// TODO: Query database
	profile := map[string]interface{}{
		"id":                  user.ID,
		"email":               user.Email,
		"full_name":           "John Doe",
		"preferred_currency":  "USD",
		"timezone":            "America/New_York",
		"preferred_language":  "en",
		"theme_preference":    "dark",
		"created_at":          "2024-01-01T00:00:00Z",
	}

	lib.SuccessResponse(w, map[string]interface{}{
		"profile": profile,
	}, http.StatusOK)
}

func handleUpdateProfile(w http.ResponseWriter, r *http.Request, user *lib.User) {
	var input lib.UpdateProfileInput
	if err := lib.ParseJSONBody(r, &input); err != nil {
		lib.ErrorResponse(w, "Invalid JSON body", http.StatusBadRequest, nil)
		return
	}

	// TODO: Update in database
	profile := map[string]interface{}{
		"id":      user.ID,
		"updated": true,
	}

	lib.SuccessResponse(w, map[string]interface{}{
		"profile": profile,
		"message": "Profile updated successfully",
	}, http.StatusOK)
}

func handleDeleteAccount(w http.ResponseWriter, r *http.Request, user *lib.User) {
	var input map[string]interface{}
	if err := lib.ParseJSONBody(r, &input); err != nil {
		lib.ErrorResponse(w, "Invalid JSON body", http.StatusBadRequest, nil)
		return
	}

	// Check confirmation
	confirm, ok := input["confirm"].(bool)
	if !ok || !confirm {
		lib.ErrorResponse(w, "Account deletion requires confirmation", http.StatusBadRequest, map[string]interface{}{
			"hint": "Set 'confirm': true in request body",
		})
		return
	}

	// TODO: Delete user data and account

	lib.SuccessResponse(w, map[string]interface{}{
		"message": "Account deleted successfully",
	}, http.StatusOK)
}

