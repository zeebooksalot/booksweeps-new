#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting Netlify build..."

# Check Node.js version
echo "📋 Node.js version: $(node --version)"
echo "📋 npm version: $(npm --version)"

# Clear npm cache if needed
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Install dependencies with legacy peer deps
echo "📦 Installing dependencies..."
npm ci --legacy-peer-deps

# Run linting (skip if it fails)
echo "🔍 Running linting..."
npm run lint || echo "⚠️ Linting failed, continuing with build..."

# Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Build completed successfully!" 