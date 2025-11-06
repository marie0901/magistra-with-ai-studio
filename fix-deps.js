#!/usr/bin/env node

// Simple dependency fix for @google/genai
// This creates the minimal node_modules structure needed

const fs = require('fs');
const path = require('path');

const nodeModulesPath = path.join(__dirname, 'node_modules');
const googlePath = path.join(nodeModulesPath, '@google');
const genaiPath = path.join(googlePath, 'genai');

// Create directories
if (!fs.existsSync(nodeModulesPath)) fs.mkdirSync(nodeModulesPath);
if (!fs.existsSync(googlePath)) fs.mkdirSync(googlePath);
if (!fs.existsSync(genaiPath)) fs.mkdirSync(genaiPath);

// Create minimal package.json for @google/genai
const packageJson = {
  "name": "@google/genai",
  "version": "1.28.0",
  "main": "index.js",
  "exports": {
    ".": "./index.js"
  }
};

fs.writeFileSync(path.join(genaiPath, 'package.json'), JSON.stringify(packageJson, null, 2));

// Create minimal index.js with mock exports
const indexJs = `
// Mock @google/genai for development
export class GoogleGenAI {
  constructor(config) {
    this.apiKey = config.apiKey;
  }
  
  get models() {
    return {
      generateContent: async (request) => {
        console.warn('Using mock GoogleGenAI - add real API key for TTS');
        return {
          candidates: [{
            content: {
              parts: [{
                inlineData: {
                  data: '' // Empty base64 audio data
                }
              }]
            }
          }]
        };
      }
    };
  }
}

export const Modality = {
  AUDIO: 'AUDIO'
};
`;

fs.writeFileSync(path.join(genaiPath, 'index.js'), indexJs);

console.log('✅ Created minimal @google/genai mock for development');
console.log('📝 Add real Gemini API key to .env.local for actual TTS functionality');