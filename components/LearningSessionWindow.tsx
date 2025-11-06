import React, { useState, useEffect, useRef } from 'react';
import type { Fragment } from '../types';
import { DraggableWindow } from './DraggableWindow';
import { SparklesIcon, CheckCircleIcon, PlayIcon, PauseIcon, ResetIcon, BackwardIcon } from './icons';

interface LearningSessionWindowProps {
  fragment: Fragment | undefined;
  fragmentIndex: number;
  totalFragmentsInSession: number;
  onNextFragment: (score: number) => void;
  targetLanguage: string;
  initialPosition: { x: number; y: number };
  initialSize: { width: number | string; height: number | string };
  zIndex: number;
  onFocus: () => void;
  isMaximized: boolean;
  onMaximizeToggle: () => void;
  onReset: () => void;
  onCollapse: () => void;
}

export const LearningSessionWindow: React.FC<LearningSessionWindowProps> = ({ fragment, fragmentIndex, totalFragmentsInSession, onNextFragment, targetLanguage, isMaximized, onMaximizeToggle, onReset, onCollapse, ...windowProps }) => {
    const [translation, setTranslation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [evaluation, setEvaluation] = useState<{ score: number; feedback: string; correct: string } | null>(null);
    const [audioState, setAudioState] = useState<'idle' | 'playing' | 'paused'>('idle');
    const audioTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        setTranslation('');
        setEvaluation(null);
        setAudioState('idle');
        if (audioTimeoutRef.current) {
            clearTimeout(audioTimeoutRef.current);
        }
    }, [fragment]);
    
    if (!fragment) {
        return (
            <DraggableWindow title="Learning Session" {...windowProps} isMaximized={isMaximized} onMaximizeToggle={onMaximizeToggle} onReset={onReset} onCollapse={onCollapse}>
                <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400 p-4">
                    Select a fragment from the Book View to begin.
                </div>
            </DraggableWindow>
        );
    }
    
    const progress = totalFragmentsInSession > 0 ? ((fragmentIndex + 1) / totalFragmentsInSession) * 100 : 0;
    
    const handleCheck = () => {
        setIsLoading(true);
        setTimeout(() => {
            const score = Math.floor(Math.random() * 71) + 30; // Random score between 30 and 100
            setEvaluation({
                score,
                feedback: score < 60 
                    ? "This translation could be improved. Let's try a simpler sentence next." 
                    : "Good attempt! 'Weathered' could be better translated as 'resistido' rather than 'soportado'",
                correct: "Sus muros de piedra habían resistido innumerables tormentas a lo largo de los siglos."
            });
            setIsLoading(false);
        }, 1500);
    };
    
    const handleNext = () => {
        if (evaluation) {
            onNextFragment(evaluation.score);
        }
    }

    const handlePlayAudio = () => {
        if (audioTimeoutRef.current) {
            clearTimeout(audioTimeoutRef.current);
        }

        if (audioState === 'playing') {
            setAudioState('paused');
        } else {
            setAudioState('playing');
            // Simulate audio playback finishing after 5 seconds
            audioTimeoutRef.current = window.setTimeout(() => {
                setAudioState('idle');
            }, 5000);
        }
    };

    const handleReplayAudio = () => {
        if (audioTimeoutRef.current) {
            clearTimeout(audioTimeoutRef.current);
        }
        setAudioState('playing');
        // Simulate audio playback finishing after 5 seconds
        audioTimeoutRef.current = window.setTimeout(() => {
            setAudioState('idle');
        }, 5000);
    };

    const handleBackwardAudio = () => {
        // Just a UI simulation
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'bg-green-400 text-green-900';
        if (score >= 60) return 'bg-yellow-400 text-yellow-900';
        return 'bg-red-400 text-red-900';
    }

  return (
    <DraggableWindow title="Learning Session" {...windowProps} isMaximized={isMaximized} onMaximizeToggle={onMaximizeToggle} onReset={onReset} onCollapse={onCollapse}>
      <div className="flex flex-col h-full p-4 space-y-4">
        <div>
            <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Progress</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Fragment {fragmentIndex + 1} of {totalFragmentsInSession}</p>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
        <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">ORIGINAL TEXT</p>
            {fragment.isSimplified && (
                <div className="mb-2 p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-md text-sm flex items-center gap-2 animate-fade-in">
                    <SparklesIcon className="w-5 h-5 flex-shrink-0" />
                    <span>This text was simplified to help you.</span>
                </div>
            )}
            <p className="text-slate-800 dark:text-slate-200">{fragment.text}</p>
        </div>
        <div className="flex-grow flex flex-col">
            <label htmlFor="translation-input" className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">TRANSLATE TO: {targetLanguage.toUpperCase()}</label>
            <textarea
                id="translation-input"
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                placeholder="Type your translation here..."
                className="w-full flex-grow p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                disabled={!!evaluation}
            />
        </div>
        
        {evaluation && (
            <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg animate-slide-in-up">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Evaluation</h3>
                    <span className={`px-3 py-1 text-sm font-bold rounded-full ${getScoreColor(evaluation.score)}`}>{evaluation.score}/100</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{evaluation.feedback}</p>
                <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-semibold text-green-800 dark:text-green-300">CORRECT TRANSLATION</p>
                        
                        {audioState === 'idle' ? (
                            <button 
                                onClick={handlePlayAudio}
                                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                            >
                                <PlayIcon className="w-4 h-4" />
                                Listen
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
                    <p className="text-green-900 dark:text-green-200">{evaluation.correct}</p>
                </div>
                 <button className="text-xs mt-2 text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                    <SparklesIcon/> Add 'resistido' to Vocabulary
                </button>
            </div>
        )}

        <div className="pt-2">
          {evaluation ? (
             <button onClick={handleNext} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                <CheckCircleIcon /> Next Fragment
             </button>
          ) : (
             <button onClick={handleCheck} disabled={!translation || isLoading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed">
               {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Checking...
                </>
               ) : "Check Translation" }
             </button>
          )}
        </div>
      </div>
    </DraggableWindow>
  );
};