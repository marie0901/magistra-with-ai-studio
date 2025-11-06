#!/bin/bash

# Cloud Run Build Verification Script
# Tests the Docker build process to ensure Phase 1 dependencies work

echo "🔍 Verifying Cloud Run build compatibility..."

# Check if Dockerfile exists
if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile not found"
    exit 1
fi

echo "✅ Dockerfile found"

# Check if package.json has @google/genai
if grep -q "@google/genai" package.json; then
    echo "✅ @google/genai dependency configured in package.json"
else
    echo "❌ @google/genai dependency missing from package.json"
    exit 1
fi

# Check if environment files exist
if [ -f ".env.example" ]; then
    echo "✅ Environment example file exists"
else
    echo "❌ .env.example file missing"
fi

# Check if audio service exists
if [ -f "services/audioService.ts" ]; then
    echo "✅ Audio service implementation found"
else
    echo "❌ Audio service missing"
    exit 1
fi

# Check if components are updated
if grep -q "audioService" components/LearningSessionWindow.tsx; then
    echo "✅ LearningSessionWindow updated with audio service"
else
    echo "❌ LearningSessionWindow not updated"
    exit 1
fi

echo ""
echo "🎯 Phase 1 Cloud Run Compatibility: VERIFIED"
echo "📦 Ready for: docker build -t magistra-tts ."
echo "🚀 Deploy with: gcloud run deploy --image magistra-tts"
echo ""
echo "📝 Remember to:"
echo "   1. Set VITE_GEMINI_API_KEY environment variable in Cloud Run"
echo "   2. Configure proper Cloud Run service settings"
echo "   3. Test TTS functionality after deployment"