#!/bin/bash

# Budget Buddy Deployment Script for Vercel
echo "🚀 Starting Budget Buddy v15.50.00 deployment..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf out
rm -rf node_modules/.cache

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful! Ready for deployment."
else
    echo "❌ Build failed! Please check the logs."
    exit 1
fi

echo "🎉 Deployment preparation complete!"