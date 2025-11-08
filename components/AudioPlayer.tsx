import React, { useState, useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon, ResetIcon, BackwardIcon } from './icons';
import { audioService } from '../services/audioService';

interface AudioPlayerProps {
  text: string;
  language?: string;
  onStateChange?: (state: 'idle' | 'loading' | 'playing' | 'paused') => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ text, language = 'es-ES', onStateChange }) => {
  const [audioState, setAudioState] = useState<'idle' | 'loading' | 'playing' | 'paused'>('idle');
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    setAudioState('idle');
    setAudioProgress(0);
    setAudioBuffer(null);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  }, [text]);

  useEffect(() => {
    onStateChange?.(audioState);
  }, [audioState, onStateChange]);

  const startAudioProgress = (duration: number) => {
    setAudioProgress(0);
    const interval = 50;
    const increment = 100 / (duration / interval);
    
    progressIntervalRef.current = window.setInterval(() => {
      setAudioProgress(prev => {
        const next = prev + increment;
        if (next >= 100) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          setAudioState('idle');
          return 100;
        }
        return next;
      });
    }, interval);
  };

  const stopAudioProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  const handlePlayAudio = async () => {
    if (audioState === 'playing') {
      audioService.pauseAudio();
      setAudioState('paused');
      stopAudioProgress();
      return;
    }

    if (audioState === 'paused') {
      audioService.resumeAudio();
      setAudioState('playing');
      if (audioBuffer) {
        const remainingDuration = (audioBuffer.duration - (audioProgress / 100) * audioBuffer.duration) * 1000;
        startAudioProgress(remainingDuration);
      }
      return;
    }

    if (audioBuffer) {
      audioService.playAudio(audioBuffer);
      setAudioState('playing');
      const duration = audioBuffer.duration * 1000;
      startAudioProgress(duration);
    } else {
      setAudioState('loading');
      try {
        const buffer = await audioService.generateSpeech(text, language);
        if (buffer) {
          setAudioBuffer(buffer);
          audioService.playAudio(buffer);
          setAudioState('playing');
          const duration = buffer.duration * 1000;
          startAudioProgress(duration);
        } else {
          setAudioState('idle');
        }
      } catch (error) {
        console.error('Audio generation failed:', error);
        setAudioState('idle');
      }
    }
  };

  const handleReplayAudio = () => {
    if (!audioBuffer) return;
    
    stopAudioProgress();
    audioService.stopAudio();
    audioService.playAudio(audioBuffer);
    setAudioState('playing');
    setAudioProgress(0);
    
    const duration = audioBuffer.duration * 1000;
    startAudioProgress(duration);
  };

  const handleBackwardAudio = () => {
    if (audioBuffer) {
      audioService.rewindAudio(3);
      setAudioProgress(prev => Math.max(0, prev - 25));
    }
  };

  if (audioState === 'idle') {
    return (
      <button 
        onClick={handlePlayAudio}
        className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
      >
        <PlayIcon className="w-4 h-4" />
        Listen
      </button>
    );
  }

  if (audioState === 'loading') {
    return (
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button title="Rewind 3s" onClick={handleBackwardAudio} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          <BackwardIcon className="w-4 h-4" />
        </button>
        <button 
          title={audioState === 'playing' ? 'Pause' : 'Play'}
          onClick={handlePlayAudio}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          {audioState === 'playing' ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
        </button>
        <button title="Replay" onClick={handleReplayAudio} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          <ResetIcon className="w-4 h-4" />
        </button>
      </div>
      
      {audioState === 'playing' && (
        <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-1">
          <div 
            className="bg-green-600 dark:bg-green-400 h-1 rounded-full transition-all duration-100" 
            style={{ width: `${audioProgress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};