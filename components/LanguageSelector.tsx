import React from 'react';
import { LanguageIcon, ChevronDownIcon } from './icons';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

const languages = [
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French (mocked)' },
  { value: 'German', label: 'German (mocked)' },
  { value: 'Japanese', label: 'Japanese (mocked)' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onLanguageChange }) => {
  return (
    <div className="flex items-center gap-4 justify-center">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <LanguageIcon className="w-6 h-6" />
            <label htmlFor="language-select" className="font-semibold">
                Translate to:
            </label>
        </div>
        <div className="relative">
            <select
                id="language-select"
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg py-2 pl-4 pr-10 font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
                {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                        {lang.label}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <ChevronDownIcon className="w-5 h-5" />
            </div>
        </div>
    </div>
  );
};