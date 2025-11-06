#!/bin/bash

# Phase 1 Dependency Installation Script
# Ensures @google/genai is properly installed for TTS functionality

echo "🚀 Installing Phase 1 dependencies..."

# Check if yarn is available, otherwise use npm
if command -v yarn &> /dev/null; then
    echo "📦 Using yarn for installation..."
    yarn install
else
    echo "📦 Using npm for installation..."
    npm install
fi

# Verify @google/genai installation
if [ -d "node_modules/@google/genai" ]; then
    echo "✅ @google/genai successfully installed"
else
    echo "❌ @google/genai installation failed"
    echo "🔧 Attempting manual installation..."
    
    if command -v yarn &> /dev/null; then
        yarn add @google/genai
    else
        npm install @google/genai
    fi
fi

echo "🎯 Phase 1 dependencies ready!"
echo "📝 Next: Copy .env.example to .env.local and add your Gemini API key"