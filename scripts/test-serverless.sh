#!/bin/bash

# Serverless Functions Test Script
# Tests all deployed serverless endpoints

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
AUTH_TOKEN="${AUTH_TOKEN:-}"

echo -e "${YELLOW}Testing Serverless Functions${NC}"
echo "Base URL: $BASE_URL"
echo ""

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local auth=$4
    local data=$5
    
    echo -n "Testing: $description... "
    
    local curl_cmd="curl -s -w '\n%{http_code}' -X $method"
    
    if [ "$auth" = "true" ] && [ ! -z "$AUTH_TOKEN" ]; then
        curl_cmd="$curl_cmd -H 'Authorization: Bearer $AUTH_TOKEN'"
    fi
    
    if [ ! -z "$data" ]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json' -d '$data'"
    fi
    
    curl_cmd="$curl_cmd $BASE_URL$endpoint"
    
    response=$(eval $curl_cmd)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ ($http_code)${NC}"
        return 0
    else
        echo -e "${RED}✗ ($http_code)${NC}"
        echo "Response: $body"
        return 1
    fi
}

# Test Suite
echo -e "${YELLOW}=== Public Endpoints ===${NC}"
test_endpoint "GET" "/api" "API Root" "false"
test_endpoint "GET" "/api/health" "Health Check" "false"

echo ""
echo -e "${YELLOW}=== Authenticated Endpoints ===${NC}"

if [ -z "$AUTH_TOKEN" ]; then
    echo -e "${YELLOW}⚠ AUTH_TOKEN not set. Skipping authenticated tests.${NC}"
    echo "Set AUTH_TOKEN environment variable to run authenticated tests."
else
    test_endpoint "GET" "/api/users" "Get User Profile" "true"
    test_endpoint "GET" "/api/transactions?limit=5" "Get Transactions" "true"
    test_endpoint "GET" "/api/budgets" "Get Budgets" "true"
    test_endpoint "GET" "/api/analytics?type=summary" "Get Analytics Summary" "true"
fi

echo ""
echo -e "${YELLOW}=== CORS Tests ===${NC}"
echo -n "Testing CORS headers... "
cors_headers=$(curl -s -I -X OPTIONS "$BASE_URL/api/health" | grep -i "access-control")
if [ ! -z "$cors_headers" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

echo ""
echo -e "${GREEN}Testing Complete!${NC}"
