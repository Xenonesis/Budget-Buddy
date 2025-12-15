#!/bin/bash

# Build Go Serverless Functions
# This script builds all Go functions for deployment

set -e

echo "🚀 Building Go Serverless Functions..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed"
    echo "Please install Go from https://golang.org/dl/"
    exit 1
fi

GO_VERSION=$(go version)
echo "✅ Go detected: $GO_VERSION"
echo ""

# Set up Go environment
export GO111MODULE=on
export GOOS=linux
export GOARCH=amd64
export CGO_ENABLED=0

echo "📦 Installing dependencies..."
cd api/go
if [ -f "go.mod" ]; then
    go mod download
    echo "✅ Dependencies installed"
else
    go mod init github.com/budget-buddy/api
    go mod tidy
    echo "✅ Go module initialized"
fi
echo ""

# Build each function
echo "🔨 Building functions..."
FUNCTIONS=(
    "index"
    "health"
    "transactions"
    "budgets"
    "analytics"
    "users"
)

BUILD_DIR="../../.vercel/output/functions"
mkdir -p "$BUILD_DIR"

for func in "${FUNCTIONS[@]}"; do
    echo "  Building $func.go..."
    go build -o "$BUILD_DIR/$func" "$func.go"
    if [ $? -eq 0 ]; then
        echo "  ✅ $func built successfully"
    else
        echo "  ❌ $func build failed"
        exit 1
    fi
done

cd ../..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All Go functions built successfully!"
echo ""
echo "📁 Output: .vercel/output/functions/"
echo ""
echo "🚀 Ready to deploy with: vercel --prod"
