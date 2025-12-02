#!/bin/bash

# SwampStudy Setup Script
# This script ensures all dependencies are installed and permissions are set correctly

set -e

echo "🚀 Setting up SwampStudy..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
npm --prefix server install

# Install client dependencies
echo "📦 Installing client dependencies..."
npm --prefix client install

# Fix permissions on vite executable (common issue on macOS)
if [ -f "client/node_modules/.bin/vite" ]; then
    echo "🔧 Fixing vite executable permissions..."
    chmod +x client/node_modules/.bin/vite
fi

# Fix permissions on other common executables
if [ -d "client/node_modules/.bin" ]; then
    echo "🔧 Fixing executable permissions in client/node_modules/.bin..."
    chmod +x client/node_modules/.bin/*
fi

if [ -d "server/node_modules/.bin" ]; then
    echo "🔧 Fixing executable permissions in server/node_modules/.bin..."
    chmod +x server/node_modules/.bin/*
fi

echo "✅ Setup complete! You can now run 'npm run dev' to start the development servers."

