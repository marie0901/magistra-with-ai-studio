import { GoogleGenAI, Modality } from '@google/genai';

// Audio Decoding Utilities
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export class AudioService {
  private audioContext: AudioContext;
  private audioBufferCache: Map<string, AudioBuffer> = new Map();
  private currentSource: AudioBufferSourceNode | null = null;
  private isPaused: boolean = false;
  private pausedAt: number = 0;
  private startedAt: number = 0;
  private voiceId: string = 'Kore';

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ 
      sampleRate: 24000 
    });
  }

  setVoice(voiceId: string): void {
    this.voiceId = voiceId;
  }

  async generateSpeech(text: string, language: string = 'en-US'): Promise<AudioBuffer | null> {
    // Check cache first
    const cacheKey = `${text}-${language}`;
    if (this.audioBufferCache.has(cacheKey)) {
      return this.audioBufferCache.get(cacheKey)!;
    }

    // Check if Gemini API key is available
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Gemini API key not available, falling back to browser TTS');
      this.fallbackTTS(text, language);
      return null;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: this.voiceId || 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const decodedBytes = decode(base64Audio);
        const buffer = await decodeAudioData(decodedBytes, this.audioContext, 24000, 1);
        
        // Cache the buffer
        this.audioBufferCache.set(cacheKey, buffer);
        return buffer;
      }
    } catch (error) {
      console.error("Gemini TTS failed:", error);
      this.fallbackTTS(text, language);
      return null;
    }

    return null;
  }

  playAudio(buffer: AudioBuffer): void {
    try {
      this.stopAudio(); // Stop any current playback
      
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      
      this.currentSource = this.audioContext.createBufferSource();
      this.currentSource.buffer = buffer;
      this.currentSource.connect(this.audioContext.destination);
      
      const offset = this.isPaused ? this.pausedAt : 0;
      this.currentSource.start(0, offset);
      this.startedAt = this.audioContext.currentTime - offset;
      this.isPaused = false;
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  }

  pauseAudio(): void {
    if (this.currentSource) {
      this.pausedAt = this.audioContext.currentTime - this.startedAt;
      this.currentSource.stop();
      this.currentSource = null;
      this.isPaused = true;
    }
  }

  stopAudio(): void {
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource = null;
    }
    this.isPaused = false;
    this.pausedAt = 0;
    this.startedAt = 0;
  }

  rewindAudio(seconds: number): void {
    if (this.isPaused) {
      this.pausedAt = Math.max(0, this.pausedAt - seconds);
    } else if (this.currentSource) {
      const currentTime = this.audioContext.currentTime - this.startedAt;
      this.pausedAt = Math.max(0, currentTime - seconds);
      this.pauseAudio();
    }
  }

  fallbackTTS(text: string, language: string = 'en-US'): void {
    if (typeof window.speechSynthesis !== 'undefined') {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('Speech synthesis not supported in this browser');
    }
  }

  clearCache(): void {
    this.audioBufferCache.clear();
  }

  isPlaying(): boolean {
    return this.currentSource !== null && !this.isPaused;
  }
}

// Export singleton instance
export const audioService = new AudioService();