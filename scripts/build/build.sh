#!/bin/bash

# Exit on any error
set -e

# Function to handle errors
handle_error() {
    echo "❌ Build failed at line $1"
    echo "💡 Check the error above and try again"
    exit 1
}

# Set error trap
trap 'handle_error $LINENO' ERR

echo "🚀 Starting Netlify build..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed or not in PATH"
    exit 1
fi

# Check Node.js version (require 18+)
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

# Check npm version (require 8+)
NPM_VERSION=$(npm --version | cut -d'.' -f1)
if [ "$NPM_VERSION" -lt 8 ]; then
    echo "❌ npm version 8+ is required. Current version: $(npm --version)"
    exit 1
fi

echo "📋 Node.js version: $(node --version)"
echo "📋 npm version: $(npm --version)"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in current directory"
    exit 1
fi

# Clear npm cache if needed
echo "🧹 Clearing npm cache..."
if ! npm cache clean --force; then
    echo "⚠️ Failed to clear npm cache, continuing..."
fi

# Install dependencies with legacy peer deps
echo "📦 Installing dependencies..."
if ! npm ci --legacy-peer-deps; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Run linting (skip if it fails)
echo "🔍 Running linting..."
if ! npm run lint; then
    echo "⚠️ Linting failed, continuing with build..."
fi

# Build the application
echo "🏗️ Building application..."
if ! npm run build; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully!" 