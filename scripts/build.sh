#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting Netlify build..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run linting
echo "🔍 Running linting..."
npm run lint

# Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Build completed successfully!" 