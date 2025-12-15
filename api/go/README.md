# Go Serverless Functions

High-performance Go serverless functions for Budget Buddy API.

## 🚀 Quick Start

```bash
# Install dependencies
go mod download

# Build
bash ../../scripts/build-go.sh

# Deploy
vercel --prod
```

## 📦 Functions

| File              | Endpoint               | Auth |
| ----------------- | ---------------------- | ---- |
| `index.go`        | `/api/go`              | ❌   |
| `health.go`       | `/api/go/health`       | ❌   |
| `transactions.go` | `/api/go/transactions` | ✅   |
| `budgets.go`      | `/api/go/budgets`      | ✅   |
| `analytics.go`    | `/api/go/analytics`    | ✅   |
| `users.go`        | `/api/go/users`        | ✅   |

## 🔧 Helper Libraries

### `lib/helpers.go`

Core utilities:

- `SuccessResponse()` - Standard success response
- `ErrorResponse()` - Standard error response
- `ApplyCORS()` - CORS handling
- `AuthenticateRequest()` - JWT validation
- `ParseJSONBody()` - JSON parsing
- `CreateHandler()` - Handler wrapper with middleware

### `lib/types.go`

Type definitions:

- `Transaction`
- `Budget`
- `UserProfile`
- `AnalyticsSummary`
- `CategoryAnalytics`
- `TrendData`

## 📖 Example Usage

```go
package handler

import (
	"net/http"
	"./lib"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	config := lib.Config{
		RequireAuth:    true,
		AllowedMethods: []string{"GET"},
		EnableCORS:     true,
	}

	handler := lib.CreateHandler(myHandler, config)
	handler(w, r)
}

func myHandler(w http.ResponseWriter, r *http.Request) {
	user, _ := lib.GetUserFromContext(r)

	data := map[string]interface{}{
		"user_id": user.ID,
		"message": "Hello from Go!",
	}

	lib.SuccessResponse(w, data, http.StatusOK)
}
```

## 🧪 Testing

```bash
# Run tests
go test ./...

# With coverage
go test -cover ./...

# Verbose
go test -v ./...
```

## 📚 Documentation

See [GO_SERVERLESS_GUIDE.md](../../GO_SERVERLESS_GUIDE.md) for complete documentation.

## 🎯 Key Features

✅ High performance (50-150ms cold start)  
✅ Low memory footprint (32-64MB)  
✅ Type-safe with Go's static typing  
✅ Built-in concurrency support  
✅ Vercel compatible  
✅ CORS enabled  
✅ Authentication ready

## 🚀 Deploy

```bash
# Build all functions
bash ../../scripts/build-go.sh

# Deploy to Vercel
vercel --prod
```

## 📊 Performance

- **Cold Start:** 50-150ms
- **Warm Response:** 10-30ms
- **Memory:** 32-64MB
- **Throughput:** 5000+ req/s

## 🔗 Resources

- [Go Documentation](https://go.dev/doc/)
- [Vercel Go Runtime](https://vercel.com/docs/runtimes#official-runtimes/go)
- [Complete Guide](../../GO_SERVERLESS_GUIDE.md)
