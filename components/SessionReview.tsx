
import React, { useState, useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon, ResetIcon, BackwardIcon } from './icons';

interface SessionReviewProps {
    translationText: string;
}

export const SessionReview: React.FC<SessionReviewProps> = ({ translationText }) => {
    const [audioState, setAudioState] = useState<'idle' | 'playing' | 'paused'>('idle');
    const audioTimeoutRef = useRef<number | null>(null);

    // Reset audio player if the text changes (e.g., new session review)
    useEffect(() => {
        setAudioState('idle');
        if (audioTimeoutRef.current) {
            clearTimeout(audioTimeoutRef.current);
        }
        return () => {
            if (audioTimeoutRef.current) {
                clearTimeout(audioTimeoutRef.current);
            }
        };
    }, [translationText]);

    const handlePlayAudio = () => {
        if (audioTimeoutRef.current) clearTimeout(audioTimeoutRef.current);

        if (audioState === 'playing') {
            setAudioState('paused');
        } else {
            setAudioState('playing');
            // Simulate audio playback finishing after 10 seconds for longer text
            audioTimeoutRef.current = window.setTimeout(() => {
                setAudioState('idle');
            }, 10000);
        }
    };

    const handleReplayAudio = () => {
        if (audioTimeoutRef.current) clearTimeout(audioTimeoutRef.current);
        setAudioState('playing');
        audioTimeoutRef.current = window.setTimeout(() => {
            setAudioState('idle');
        }, 10000);
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
