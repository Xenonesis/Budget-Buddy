# Budget Buddy Deployment Script for Vercel (PowerShell)
Write-Host "🚀 Starting Budget Buddy v15.50.00 deployment..." -ForegroundColor Green

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }
if (Test-Path "out") { Remove-Item -Recurse -Force "out" }
if (Test-Path "node_modules\.cache") { Remove-Item -Recurse -Force "node_modules\.cache" }

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm ci

# Build the application
Write-Host "🔨 Building application..." -ForegroundColor Yellow
npm run build

# Check if build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful! Ready for deployment." -ForegroundColor Green
} else {
    Write-Host "❌ Build failed! Please check the logs." -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Deployment preparation complete!" -ForegroundColor Green