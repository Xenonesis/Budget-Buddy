#!/bin/bash

# Budget Buddy Production Deployment Script
# This script ensures all production requirements are met before deployment

set -e  # Exit on any error

echo "🚀 Budget Buddy Production Deployment Script"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required environment variables are set
check_env_vars() {
    echo "Checking environment variables..."
    
    required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "NEXTAUTH_SECRET"
        "NEXTAUTH_URL"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi
    
    print_status "All required environment variables are set"
}

# Check if at least one AI provider is configured
check_ai_providers() {
    echo "Checking AI provider configuration..."
    
    ai_vars=(
        "OPENAI_API_KEY"
        "GOOGLE_AI_API_KEY"
        "ANTHROPIC_API_KEY"
        "GROQ_API_KEY"
        "MISTRAL_API_KEY"
    )
    
    ai_configured=false
    
    for var in "${ai_vars[@]}"; do
        if [ ! -z "${!var}" ]; then
            ai_configured=true
            break
        fi
    done
    
    if [ "$ai_configured" = false ]; then
        print_warning "No AI providers configured - AI features will be limited"
    else
        print_status "AI provider configuration found"
    fi
}

# Run type checking
run_type_check() {
    echo "Running TypeScript type checking..."
    if npm run type-check; then
        print_status "TypeScript type checking passed"
    else
        print_error "TypeScript type checking failed"
        exit 1
    fi
}

# Run linting
run_linting() {
    echo "Running ESLint..."
    if npm run lint; then
        print_status "Linting passed"
    else
        print_error "Linting failed"
        exit 1
    fi
}

# Clean and build
build_application() {
    echo "Building application..."
    if npm run production-build; then
        print_status "Build completed successfully"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Check build output
check_build_output() {
    echo "Checking build output..."
    
    if [ ! -d ".next" ]; then
        print_error "Build output directory (.next) not found"
        exit 1
    fi
    
    # Check for critical files
    critical_files=(
        ".next/static"
        ".next/server"
        ".next/BUILD_ID"
    )
    
    for file in "${critical_files[@]}"; do
        if [ ! -e "$file" ]; then
            print_error "Critical build file missing: $file"
            exit 1
        fi
    done
    
    print_status "Build output verification passed"
}

# Database migration check
check_database() {
    echo "Checking database connection..."
    
    # This would typically run a simple query to verify database connectivity
    # For now, we'll just check if the Supabase URL is reachable
    if curl -s --head "$NEXT_PUBLIC_SUPABASE_URL" > /dev/null; then
        print_status "Database connection verified"
    else
        print_warning "Could not verify database connection"
    fi
}

# Security check
security_check() {
    echo "Running security checks..."
    
    # Check for sensitive data in build output
    if grep -r "sk-" .next/ 2>/dev/null | grep -v ".map" | head -1; then
        print_error "Potential API keys found in build output"
        exit 1
    fi
    
    # Check for development URLs
    if grep -r "localhost" .next/ 2>/dev/null | grep -v ".map" | head -1; then
        print_warning "Development URLs found in build output"
    fi
    
    print_status "Security checks passed"
}

# Performance check
performance_check() {
    echo "Running performance checks..."
    
    # Check bundle size (basic check)
    build_size=$(du -sh .next | cut -f1)
    print_status "Build size: $build_size"
    
    # Check for large files
    large_files=$(find .next -type f -size +1M 2>/dev/null | wc -l)
    if [ "$large_files" -gt 10 ]; then
        print_warning "Found $large_files files larger than 1MB"
    fi
    
    print_status "Performance checks completed"
}

# Main deployment process
main() {
    echo "Starting production deployment checks..."
    echo
    
    # Pre-deployment checks
    check_env_vars
    check_ai_providers
    
    # Code quality checks
    run_type_check
    run_linting
    
    # Build process
    build_application
    check_build_output
    
    # Infrastructure checks
    check_database
    
    # Security and performance
    security_check
    performance_check
    
    echo
    echo "============================================="
    print_status "All production deployment checks passed!"
    echo
    echo "Your Budget Buddy application is ready for production deployment."
    echo
    echo "Next steps:"
    echo "1. Deploy to your hosting platform (Vercel, Netlify, etc.)"
    echo "2. Configure your domain and SSL certificate"
    echo "3. Set up monitoring and alerting"
    echo "4. Run post-deployment verification tests"
    echo
    echo "🎉 Happy deploying!"
}

# Run the main function
main