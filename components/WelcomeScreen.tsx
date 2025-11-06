import React from 'react';
import { UserIcon, IncognitoIcon } from './icons';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-900 animate-fade-in">
      <div className="text-center p-8 max-w-md w-full">
        <h1 className="text-5xl font-bold text-slate-800 dark:text-white mb-4">Magistra</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-12">
          Your personal AI-powered language learning environment.
        </p>

        <div className="space-y-4">
          <button
            onClick={onContinue}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-3 text-lg"
          >
            <IncognitoIcon className="w-6 h-6" />
            Continue Incognito
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Note: In incognito mode, your progress will not be saved.
          </p>

          <div className="relative my-6">
            <hr className="border-slate-300 dark:border-slate-700" />
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-100 dark:bg-slate-900 px-2 text-xs text-slate-500">OR</span>
          </div>

          <button
            disabled
            className="w-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-3 text-lg relative"
          >
            <UserIcon className="w-6 h-6" />
            Login to save progress
            <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
              SOON
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
