
import React, { useState, useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon, ResetIcon, BackwardIcon } from './icons';
import { audioService } from '../services/audioService';

interface SessionReviewProps {
    translationText: string;
}

export const SessionReview: React.FC<SessionReviewProps> = ({ translationText }) => {
    const [audioState, setAudioState] = useState<'idle' | 'loading' | 'playing' | 'paused'>('idle');
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const audioTimeoutRef = useRef<number | null>(null);

    // Reset audio player if the text changes (e.g., new session review)
    useEffect(() => {
        setAudioState('idle');
        setAudioBuffer(null);
        if (audioTimeoutRef.current) {
            clearTimeout(audioTimeoutRef.current);
        }
        return () => {
            if (audioTimeoutRef.current) {
                clearTimeout(audioTimeoutRef.current);
            }
        };
    }, [translationText]);

    const handlePlayAudio = async () => {
        if (audioTimeoutRef.current) clearTimeout(audioTimeoutRef.current);

        if (audioState === 'playing') {
            setAudioState('paused');
            return;
        }

        if (audioBuffer) {
            audioService.playAudio(audioBuffer);
            setAudioState('playing');
        } else {
            setAudioState('loading');
            try {
                const buffer = await audioService.generateSpeech(translationText, 'es-ES');
                if (buffer) {
                    setAudioBuffer(buffer);
                    audioService.playAudio(buffer);
                    setAudioState('playing');
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
        
        if (audioTimeoutRef.current) clearTimeout(audioTimeoutRef.current);
        
        audioService.playAudio(audioBuffer);
        setAudioState('playing');
    };

    const handleBackwardAudio = () => {
        // Just a UI simulation
    };

    return (
        <div className="my-4 p-4 bg-green-100 dark:bg-green-900/50 rounded-lg text-left animate-slide-in-up">
            <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-semibold text-green-800 dark:text-green-300">SESSION TRANSLATION</p>
                {audioState === 'idle' ? (
                    <button 
                        onClick={handlePlayAudio}
                        className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    >
                        <PlayIcon className="w-4 h-4" />
                        Listen to Full Translation
                    </button>
                ) : audioState === 'loading' ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                        Loading...
                    </div>
                ) : audioState === 'paused' ? (
                    <div className="flex items-center gap-2">
                        <button title="Rewind 3s" onClick={handleBackwardAudio} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                            <BackwardIcon className="w-4 h-4" />
                        </button>
                        <button 
                            title="Resume"
                            onClick={handlePlayAudio}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        >
                            <PlayIcon className="w-5 h-5" />
                        </button>
                        <button title="Replay" onClick={handleReplayAudio} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                            <ResetIcon className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
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
                )}
            </div>
            <p className="text-sm text-green-900 dark:text-green-200 text-justify">
                {translationText}
            </p>
        </div>
    );
};
