# Build Go Serverless Functions (PowerShell)
# This script builds all Go functions for deployment

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 Building Go Serverless Functions..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Check if Go is installed
try {
    $goVersion = go version
    Write-Host "✅ Go detected: $goVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Go is not installed" -ForegroundColor Red
    Write-Host "Please install Go from https://golang.org/dl/" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Set up Go environment
$env:GO111MODULE = "on"
$env:GOOS = "linux"
$env:GOARCH = "amd64"
$env:CGO_ENABLED = "0"

Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
Set-Location api/go

if (Test-Path "go.mod") {
    go mod download
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    go mod init github.com/budget-buddy/api
    go mod tidy
    Write-Host "✅ Go module initialized" -ForegroundColor Green
}
Write-Host ""

# Build each function
Write-Host "🔨 Building functions..." -ForegroundColor Cyan

$functions = @(
    "index",
    "health",
    "transactions",
    "budgets",
    "analytics",
    "users"
)

$buildDir = "../../.vercel/output/functions"
New-Item -ItemType Directory -Path $buildDir -Force | Out-Null

foreach ($func in $functions) {
    Write-Host "  Building $func.go..." -ForegroundColor Yellow
    
    go build -o "$buildDir/$func" "$func.go"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ $func built successfully" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $func build failed" -ForegroundColor Red
        Set-Location ../..
        exit 1
    }
}

Set-Location ../..

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "✅ All Go functions built successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Output: .vercel/output/functions/" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Ready to deploy with: vercel --prod" -ForegroundColor Cyan
