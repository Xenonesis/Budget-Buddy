# Serverless Functions Test Script (PowerShell)
# Tests all deployed serverless endpoints

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$AuthToken = ""
)

# Configuration
$ErrorActionPreference = "Stop"

Write-Host "Testing Serverless Functions" -ForegroundColor Yellow
Write-Host "Base URL: $BaseUrl"
Write-Host ""

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [bool]$RequiresAuth = $false,
        [string]$Data = ""
    )
    
    Write-Host -NoNewline "Testing: $Description... "
    
    $uri = "$BaseUrl$Endpoint"
    $headers = @{}
    
    if ($RequiresAuth -and $AuthToken) {
        $headers["Authorization"] = "Bearer $AuthToken"
    }
    
    try {
        if ($Data) {
            $headers["Content-Type"] = "application/json"
            $response = Invoke-WebRequest -Uri $uri -Method $Method -Headers $headers -Body $Data -UseBasicParsing
        } else {
            $response = Invoke-WebRequest -Uri $uri -Method $Method -Headers $headers -UseBasicParsing
        }
        
        $statusCode = $response.StatusCode
        
        if ($statusCode -ge 200 -and $statusCode -lt 300) {
            Write-Host "✓ ($statusCode)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "✗ ($statusCode)" -ForegroundColor Red
            return $false
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        Write-Host "✗ ($statusCode)" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Test Suite
Write-Host "=== Public Endpoints ===" -ForegroundColor Yellow
Test-Endpoint -Method "GET" -Endpoint "/api" -Description "API Root"
Test-Endpoint -Method "GET" -Endpoint "/api/health" -Description "Health Check"

Write-Host ""
Write-Host "=== Authenticated Endpoints ===" -ForegroundColor Yellow

if ([string]::IsNullOrEmpty($AuthToken)) {
    Write-Host "⚠ AUTH_TOKEN not provided. Skipping authenticated tests." -ForegroundColor Yellow
    Write-Host "Use -AuthToken parameter to run authenticated tests."
} else {
    Test-Endpoint -Method "GET" -Endpoint "/api/users" -Description "Get User Profile" -RequiresAuth $true
    Test-Endpoint -Method "GET" -Endpoint "/api/transactions?limit=5" -Description "Get Transactions" -RequiresAuth $true
    Test-Endpoint -Method "GET" -Endpoint "/api/budgets" -Description "Get Budgets" -RequiresAuth $true
    Test-Endpoint -Method "GET" -Endpoint "/api/analytics?type=summary" -Description "Get Analytics Summary" -RequiresAuth $true
}

Write-Host ""
Write-Host "=== CORS Tests ===" -ForegroundColor Yellow
Write-Host -NoNewline "Testing CORS headers... "

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/health" -Method OPTIONS -UseBasicParsing
    $corsHeaders = $response.Headers["Access-Control-Allow-Origin"]
    
    if ($corsHeaders) {
        Write-Host "✓" -ForegroundColor Green
    } else {
        Write-Host "✗" -ForegroundColor Red
    }
} catch {
    Write-Host "✗" -ForegroundColor Red
}

Write-Host ""
Write-Host "Testing Complete!" -ForegroundColor Green
