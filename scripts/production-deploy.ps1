# Budget Buddy Production Deployment Script (PowerShell)
# This script ensures all production requirements are met before deployment

param(
    [switch]$SkipBuild,
    [switch]$SkipTests,
    [switch]$Verbose
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "🚀 Budget Buddy Production Deployment Script" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Function to print colored output
function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Check if required environment variables are set
function Test-EnvironmentVariables {
    Write-Host "Checking environment variables..."
    
    $requiredVars = @(
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
        "NEXTAUTH_SECRET",
        "NEXTAUTH_URL"
    )
    
    $missingVars = @()
    
    foreach ($var in $requiredVars) {
        if (-not (Get-ChildItem Env: | Where-Object Name -eq $var)) {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Error "Missing required environment variables:"
        foreach ($var in $missingVars) {
            Write-Host "  - $var" -ForegroundColor Red
        }
        exit 1
    }
    
    Write-Success "All required environment variables are set"
}

# Check if at least one AI provider is configured
function Test-AIProviders {
    Write-Host "Checking AI provider configuration..."
    
    $aiVars = @(
        "OPENAI_API_KEY",
        "GOOGLE_AI_API_KEY",
        "ANTHROPIC_API_KEY",
        "GROQ_API_KEY",
        "MISTRAL_API_KEY"
    )
    
    $aiConfigured = $false
    
    foreach ($var in $aiVars) {
        if (Get-ChildItem Env: | Where-Object Name -eq $var) {
            $aiConfigured = $true
            break
        }
    }
    
    if (-not $aiConfigured) {
        Write-Warning "No AI providers configured - AI features will be limited"
    } else {
        Write-Success "AI provider configuration found"
    }
}

# Run type checking
function Invoke-TypeCheck {
    if ($SkipTests) {
        Write-Warning "Skipping type checking"
        return
    }
    
    Write-Host "Running TypeScript type checking..."
    try {
        npm run type-check
        Write-Success "TypeScript type checking passed"
    } catch {
        Write-Error "TypeScript type checking failed"
        exit 1
    }
}

# Run linting
function Invoke-Linting {
    if ($SkipTests) {
        Write-Warning "Skipping linting"
        return
    }
    
    Write-Host "Running ESLint..."
    try {
        npm run lint
        Write-Success "Linting passed"
    } catch {
        Write-Error "Linting failed"
        exit 1
    }
}

# Clean and build
function Invoke-Build {
    if ($SkipBuild) {
        Write-Warning "Skipping build"
        return
    }
    
    Write-Host "Building application..."
    try {
        npm run production-build
        Write-Success "Build completed successfully"
    } catch {
        Write-Error "Build failed"
        exit 1
    }
}

# Check build output
function Test-BuildOutput {
    if ($SkipBuild) {
        Write-Warning "Skipping build output check"
        return
    }
    
    Write-Host "Checking build output..."
    
    if (-not (Test-Path ".next")) {
        Write-Error "Build output directory (.next) not found"
        exit 1
    }
    
    # Check for critical files
    $criticalFiles = @(
        ".next\static",
        ".next\server",
        ".next\BUILD_ID"
    )
    
    foreach ($file in $criticalFiles) {
        if (-not (Test-Path $file)) {
            Write-Error "Critical build file missing: $file"
            exit 1
        }
    }
    
    Write-Success "Build output verification passed"
}

# Database connection check
function Test-Database {
    Write-Host "Checking database connection..."
    
    $supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
    if ($supabaseUrl) {
        try {
            $response = Invoke-WebRequest -Uri $supabaseUrl -Method Head -TimeoutSec 10
            Write-Success "Database connection verified"
        } catch {
            Write-Warning "Could not verify database connection"
        }
    } else {
        Write-Warning "Supabase URL not found in environment variables"
    }
}

# Security check
function Test-Security {
    Write-Host "Running security checks..."
    
    # Check for sensitive data in build output
    if (Test-Path ".next") {
        $sensitiveFiles = Get-ChildItem -Path ".next" -Recurse -File | 
                         Where-Object { $_.Name -notlike "*.map" } |
                         ForEach-Object { 
                             if ((Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue) -match "sk-") {
                                 $_.FullName
                             }
                         }
        
        if ($sensitiveFiles) {
            Write-Error "Potential API keys found in build output"
            exit 1
        }
        
        # Check for development URLs
        $devUrls = Get-ChildItem -Path ".next" -Recurse -File | 
                  Where-Object { $_.Name -notlike "*.map" } |
                  ForEach-Object { 
                      if ((Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue) -match "localhost") {
                          $_.FullName
                      }
                  }
        
        if ($devUrls) {
            Write-Warning "Development URLs found in build output"
        }
    }
    
    Write-Success "Security checks passed"
}

# Performance check
function Test-Performance {
    Write-Host "Running performance checks..."
    
    if (Test-Path ".next") {
        # Check bundle size
        $buildSize = (Get-ChildItem -Path ".next" -Recurse | Measure-Object -Property Length -Sum).Sum
        $buildSizeMB = [math]::Round($buildSize / 1MB, 2)
        Write-Success "Build size: $buildSizeMB MB"
        
        # Check for large files
        $largeFiles = Get-ChildItem -Path ".next" -Recurse -File | Where-Object { $_.Length -gt 1MB }
        if ($largeFiles.Count -gt 10) {
            Write-Warning "Found $($largeFiles.Count) files larger than 1MB"
        }
    }
    
    Write-Success "Performance checks completed"
}

# Main deployment process
function Start-Deployment {
    Write-Host "Starting production deployment checks..."
    Write-Host ""
    
    try {
        # Pre-deployment checks
        Test-EnvironmentVariables
        Test-AIProviders
        
        # Code quality checks
        Invoke-TypeCheck
        Invoke-Linting
        
        # Build process
        Invoke-Build
        Test-BuildOutput
        
        # Infrastructure checks
        Test-Database
        
        # Security and performance
        Test-Security
        Test-Performance
        
        Write-Host ""
        Write-Host "=============================================" -ForegroundColor Green
        Write-Success "All production deployment checks passed!"
        Write-Host ""
        Write-Host "Your Budget Buddy application is ready for production deployment." -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Deploy to your hosting platform (Vercel, Netlify, etc.)"
        Write-Host "2. Configure your domain and SSL certificate"
        Write-Host "3. Set up monitoring and alerting"
        Write-Host "4. Run post-deployment verification tests"
        Write-Host ""
        Write-Host "🎉 Happy deploying!" -ForegroundColor Green
        
    } catch {
        Write-Error "Deployment checks failed: $($_.Exception.Message)"
        exit 1
    }
}

# Run the main function
Start-Deployment