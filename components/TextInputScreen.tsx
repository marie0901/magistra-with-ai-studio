import React from 'react';
import { BookTextIcon, DocumentArrowUpIcon, ClipboardDocumentIcon } from './icons';
import { LanguageSelector } from './LanguageSelector';

interface TextInputScreenProps {
  onStartWithSample: () => void;
  onPasteText: () => void;
  targetLanguage: string;
  setTargetLanguage: (language: string) => void;
}

export const TextInputScreen: React.FC<TextInputScreenProps> = ({ onStartWithSample, onPasteText, targetLanguage, setTargetLanguage }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-900 animate-fade-in">
      <div className="text-center p-8 max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">Choose Your Text</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
          Select a source to begin your personalized learning session.
        </p>
        
        <div className="mb-12">
            <LanguageSelector selectedLanguage={targetLanguage} onLanguageChange={setTargetLanguage} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            onClick={onStartWithSample}
            className="group p-8 border-2 border-slate-300 dark:border-slate-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
          >
            <BookTextIcon className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Use Sample Text</h2>
            <p className="text-slate-500 dark:text-slate-400">
              Start immediately with a pre-loaded story about Elara the inventor.
            </p>
          </div>
          
          <div
            onClick={onPasteText}
            className="group p-8 border-2 border-slate-300 dark:border-slate-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
          >
            <ClipboardDocumentIcon className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Paste Your Text</h2>
            <p className="text-slate-500 dark:text-slate-400">
              Copy and paste any text you want to study into the editor.
            </p>
          </div>

          <div
            className="group p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl transition-all duration-300 cursor-not-allowed opacity-50 relative"
          >
            <DocumentArrowUpIcon className="w-16 h-16 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
            <h2 className="text-2xl font-bold text-slate-600 dark:text-slate-400 mb-2">Upload File</h2>
            <p className="text-slate-400 dark:text-slate-500">
              Import your own documents like .txt, .pdf, or .epub files.
            </p>
            <span className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
              COMING SOON
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};