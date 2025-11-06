import React, { useState } from 'react';
import { SparklesIcon } from './icons';
import { LanguageSelector } from './LanguageSelector';

interface PasteTextScreenProps {
  onStartLearning: (text: string) => void;
  targetLanguage: string;
  setTargetLanguage: (language: string) => void;
}

export const PasteTextScreen: React.FC<PasteTextScreenProps> = ({ onStartLearning, targetLanguage, setTargetLanguage }) => {
  const [pastedText, setPastedText] = useState('');

  const handleStart = () => {
    // For now, we ignore the pastedText and proceed with the sample.
    // In a real implementation, we would pass `pastedText` here.
    onStartLearning(pastedText); 
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-100 dark:bg-slate-900 animate-fade-in p-4">
      <div className="text-center p-8 max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">Paste Your Text</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
          Enter the text you want to learn from below. The AI will process it for your session.
        </p>
        
        <textarea
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder="Paste your story, article, or any text here..."
          className="w-full h-64 p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors mb-8 resize-none text-base"
        />

        <div className="flex flex-col items-center gap-6">
            <LanguageSelector selectedLanguage={targetLanguage} onLanguageChange={setTargetLanguage} />
            <button
              onClick={handleStart}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-3 text-lg mx-auto"
            >
              <SparklesIcon className="w-6 h-6" />
              Start Learning
            </button>
        </div>
      </div>
    </div>
  );
};