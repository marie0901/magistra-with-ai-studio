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

2. Start development server:
   ```bash
   npm run dev
   ```

3. Run tests:
   ```bash
   npm run test:headed
   ```

## Architecture

- **Frontend**: React 19 + TypeScript + Vite
- **Testing**: Playwright with video recording
- **Styling**: Tailwind CSS with custom animations
- **State**: React hooks with complex window management

## Current Status

- ✅ Complete UI/UX implementation
- ✅ Professional onboarding flow
- ✅ Multi-window management system
- ✅ Comprehensive test suite
- ❌ Backend integration (mocked)
- ❌ Real AI services (mocked)

## Development

The application currently uses mock data and simulated AI responses. Ready for backend integration to replace mock services with real APIs.

## License

Private project - All rights reserved