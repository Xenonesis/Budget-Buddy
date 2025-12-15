package lib

import "time"

// Transaction represents a financial transaction
type Transaction struct {
	ID            string    `json:"id"`
	UserID        string    `json:"user_id"`
	Amount        float64   `json:"amount"`
	Category      string    `json:"category"`
	Type          string    `json:"type"` // income or expense
	Description   string    `json:"description,omitempty"`
	Date          time.Time `json:"date"`
	Merchant      string    `json:"merchant,omitempty"`
	PaymentMethod string    `json:"payment_method,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// CreateTransactionInput represents input for creating a transaction
type CreateTransactionInput struct {
	Amount        float64 `json:"amount"`
	Category      string  `json:"category"`
	Type          string  `json:"type"`
	Description   string  `json:"description,omitempty"`
	Date          string  `json:"date,omitempty"`
	Merchant      string  `json:"merchant,omitempty"`
	PaymentMethod string  `json:"payment_method,omitempty"`
}

// Budget represents a budget
type Budget struct {
	ID             string    `json:"id"`
	UserID         string    `json:"user_id"`
	Category       string    `json:"category"`
	Amount         float64   `json:"amount"`
	Period         string    `json:"period"` // weekly, monthly, yearly
	StartDate      time.Time `json:"start_date"`
	EndDate        time.Time `json:"end_date,omitempty"`
	AlertThreshold int       `json:"alert_threshold"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// CreateBudgetInput represents input for creating a budget
type CreateBudgetInput struct {
	Category       string  `json:"category"`
	Amount         float64 `json:"amount"`
	Period         string  `json:"period"`
	StartDate      string  `json:"start_date,omitempty"`
	EndDate        string  `json:"end_date,omitempty"`
	AlertThreshold int     `json:"alert_threshold,omitempty"`
}

// UserProfile represents a user profile
type UserProfile struct {
	ID                     string                 `json:"id"`
	Email                  string                 `json:"email,omitempty"`
	FullName               string                 `json:"full_name,omitempty"`
	PreferredCurrency      string                 `json:"preferred_currency,omitempty"`
	Timezone               string                 `json:"timezone,omitempty"`
	PreferredLanguage      string                 `json:"preferred_language,omitempty"`
	NotificationSettings   map[string]interface{} `json:"notification_settings,omitempty"`
	ThemePreference        string                 `json:"theme_preference,omitempty"`
	CreatedAt              time.Time              `json:"created_at"`
	UpdatedAt              time.Time              `json:"updated_at"`
}

// UpdateProfileInput represents input for updating profile
type UpdateProfileInput struct {
	FullName             string                 `json:"full_name,omitempty"`
	PreferredCurrency    string                 `json:"preferred_currency,omitempty"`
	Timezone             string                 `json:"timezone,omitempty"`
	PreferredLanguage    string                 `json:"preferred_language,omitempty"`
	NotificationSettings map[string]interface{} `json:"notification_settings,omitempty"`
	ThemePreference      string                 `json:"theme_preference,omitempty"`
}

// AnalyticsSummary represents financial analytics summary
type AnalyticsSummary struct {
	TotalIncome       float64 `json:"totalIncome"`
	TotalExpenses     float64 `json:"totalExpenses"`
	NetSavings        float64 `json:"netSavings"`
	SavingsRate       float64 `json:"savingsRate"`
	TransactionCount  int     `json:"transactionCount"`
}

// CategoryAnalytics represents category breakdown
type CategoryAnalytics struct {
	Category     string  `json:"category"`
	Income       float64 `json:"income"`
	Expenses     float64 `json:"expenses"`
	Transactions int     `json:"transactions"`
}

// TrendData represents trend analytics
type TrendData struct {
	Month    string  `json:"month"`
	Income   float64 `json:"income"`
	Expenses float64 `json:"expenses"`
	Net      float64 `json:"net"`
}

// PaginationParams represents pagination parameters
type PaginationParams struct {
	Limit  int `json:"limit"`
	Offset int `json:"offset"`
}

// PaginatedResponse represents a paginated response
type PaginatedResponse struct {
	Items   interface{} `json:"items"`
	Total   int         `json:"total"`
	Limit   int         `json:"limit"`
	Offset  int         `json:"offset"`
	HasMore bool        `json:"hasMore"`
}
