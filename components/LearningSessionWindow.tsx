import React, { useState, useEffect, useRef } from 'react';
import type { Fragment } from '../types';
import { DraggableWindow } from './DraggableWindow';
import { SparklesIcon, CheckCircleIcon } from './icons';
import { AudioPlayer } from './AudioPlayer';

interface LearningSessionWindowProps {
  fragment: Fragment | undefined;
  fragmentIndex: number;
  totalFragmentsInSession: number;
  onNextFragment: (score: number) => Promise<void>;
  onVocabularyUpdate: (newWords: Array<{word: string; translation: string; context: string}>) => void;
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

export const LearningSessionWindow: React.FC<LearningSessionWindowProps> = ({ fragment, fragmentIndex, totalFragmentsInSession, onNextFragment, onVocabularyUpdate, targetLanguage, isMaximized, onMaximizeToggle, onReset, onCollapse, ...windowProps }) => {
    const [translation, setTranslation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessingNext, setIsProcessingNext] = useState(false);
    const [evaluation, setEvaluation] = useState<{ score: number; feedback: string; correct: string; vocabularyWords?: Array<{word: string; translation: string; context: string}> } | null>(null);


    useEffect(() => {
        setTranslation('');
        setEvaluation(null);
        setIsProcessingNext(false);
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
    
    const handleCheck = async () => {
        setIsLoading(true);
        try {
            const { geminiService } = await import('../services/geminiService');
            const result = await geminiService.evaluateTranslation(
                fragment.text,
                translation,
                targetLanguage
            );
            
            setEvaluation({
                score: result.score,
                feedback: result.feedback,
                correct: result.corrections || translation,
                vocabularyWords: result.vocabularyWords
            });
            
            // Vocabulary words are now shown for user to optionally add
            // No automatic addition to dictionary
        } catch (error) {
            console.error('Translation evaluation failed:', error);
            let errorFeedback = "Unable to evaluate translation right now. Keep practicing!";
            
            if (error instanceof Error) {
                if (error.message.includes('API_KEY')) {
                    errorFeedback = "API key not configured. Using offline evaluation.";
                } else if (error.message.includes('rate limit')) {
                    errorFeedback = "Too many requests. Please wait a moment before trying again.";
                }
            }
            
            // Fallback evaluation based on length and basic checks
            const hasBasicStructure = translation.length > fragment.text.length * 0.5;
            const score = hasBasicStructure ? 65 : 45;
            
            setEvaluation({
                score,
                feedback: errorFeedback,
                correct: translation
            });
        }
        setIsLoading(false);
    };
    
    const handleNext = async () => {
        if (evaluation) {
            setIsProcessingNext(true);
            try {
                await onNextFragment(evaluation.score);
            } finally {
                setIsProcessingNext(false);
            }
        }
    }



    const handleAddVocabulary = async (vw: {word: string; translation: string; context: string}) => {
        const { StorageService } = await import('../services/storageService');
        const vocabItem = {
            original: vw.word,
            translation: vw.translation,
            context: vw.context,
            addedFrom: `Fragment ${fragmentIndex + 1}`
        };
        StorageService.addVocabularyWords([vocabItem]);
        onVocabularyUpdate([vw]);
    };

    const handleAddAllVocabulary = async (words: Array<{word: string; translation: string; context: string}>) => {
        const { StorageService } = await import('../services/storageService');
        const vocabItems = words.map(vw => ({
            original: vw.word,
            translation: vw.translation,
            context: vw.context,
            addedFrom: `Fragment ${fragmentIndex + 1}`
        }));
        StorageService.addVocabularyWords(vocabItems);
        onVocabularyUpdate(words);
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
                        
                        <AudioPlayer text={evaluation.correct} language="es-ES" />
                    </div>

                    
                    <p className="text-green-900 dark:text-green-200">{evaluation.correct}</p>
                </div>
                 {evaluation.vocabularyWords && evaluation.vocabularyWords.length > 0 && (
                    <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">NEW VOCABULARY</p>
                            <button 
                                onClick={() => handleAddAllVocabulary(evaluation.vocabularyWords!)}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                                Add All
                            </button>
                        </div>
                        <div className="space-y-1">
                            {evaluation.vocabularyWords.map((vw, idx) => (
                                <div key={idx} className="group flex items-center justify-between text-xs text-blue-700 dark:text-blue-300">
                                    <div>
                                        <span className="font-semibold">{vw.word}</span> → {vw.translation}
                                        {vw.context && <span className="text-blue-600 dark:text-blue-400 ml-1">({vw.context})</span>}
                                    </div>
                                    <button 
                                        onClick={() => handleAddVocabulary(vw)}
                                        className="opacity-0 group-hover:opacity-100 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 ml-2 transition-opacity"
                                    >
                                        Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                 )}
            </div>
        )}

        <div className="pt-2">
          {evaluation ? (
             <button onClick={handleNext} disabled={isProcessingNext} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed">
                {isProcessingNext ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon /> Next Fragment
                  </>
                )}
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