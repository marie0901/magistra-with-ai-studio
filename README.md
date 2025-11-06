# Magistra Language Learning Platform

A sophisticated multi-window language learning interface built with React and TypeScript.

## Features

- **Multi-Window Interface**: Draggable windows (Book View, Learning Session, AI Assistant)
- **Adaptive Learning**: AI simplifies text when user struggles (score < 60%)
- **Professional Onboarding**: Welcome → Text Input → Learning flow
- **Interactive Translation**: Fragment-based learning with real-time feedback
- **AI Assistant**: Chat functionality and vocabulary management
- **Sticky Notes**: Draggable note-taking system
- **Responsive Design**: 4 layout modes with keyboard shortcuts
- **Dark/Light Themes**: Complete theme switching

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment (for TTS functionality):
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your Gemini API key
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Run tests:
   ```bash
   npm run test:headed
   ```

## Architecture

- **Frontend**: React 19 + TypeScript + Vite
- **Testing**: Playwright with video recording
- **Styling**: Tailwind CSS with custom animations
- **State**: React hooks with complex window management

## Current Status

### ✅ Phase 1 Complete: Environment & Text-to-Speech
- ✅ Complete UI/UX implementation
- ✅ Professional onboarding flow
- ✅ Multi-window management system
- ✅ Comprehensive test suite
- ✅ **Real Text-to-Speech** (Gemini TTS + browser fallback)
- ✅ **Environment configuration** with API key management
- ✅ **Audio service** with caching and error handling

### 🚧 In Progress: Core AI Integration
- ❌ Real chat functionality (mocked)
- ❌ Translation evaluation (mocked)
- ❌ Text simplification (mocked)

## Development

### Phase 1: Environment & TTS ✅
- Real text-to-speech using Google Gemini API
- Environment configuration with `.env.local`
- Audio service with caching and fallback
- Enhanced audio controls in Learning Session

### Next: Phase 2 - Core AI Integration
- Replace mock chat with real Gemini API
- Implement real translation evaluation
- Add text simplification service

See `setup.md` for detailed Phase 1 implementation notes.

## License

Private project - All rights reserved