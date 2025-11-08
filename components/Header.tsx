import React, { useState, useEffect, useRef } from 'react';
import type { Theme, LayoutSchema } from '../types';
import { SunIcon, MoonIcon, UserIcon, LayoutDefaultIcon, LayoutFocusIcon, LayoutReadingIcon, LayoutCompactIcon, ChevronDownIcon, CogIcon } from './icons';

interface HeaderProps {
  theme: Theme;
  toggleTheme: () => void;
  layout: LayoutSchema;
  setLayout: (layout: LayoutSchema) => void;
  onOpenSettings?: () => void;
}

const layoutOptions: { id: LayoutSchema; name: string; icon: React.ReactNode }[] = [
    { id: 'default', name: 'Default (Ctrl+1)', icon: <LayoutDefaultIcon /> },
    { id: 'focus', name: 'Focus (Ctrl+2)', icon: <LayoutFocusIcon /> },
    { id: 'reading', name: 'Reading (Ctrl+3)', icon: <LayoutReadingIcon /> },
    { id: 'compact', name: 'Compact (Ctrl+4)', icon: <LayoutCompactIcon /> },
];

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, layout, setLayout, onOpenSettings }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLayout = layoutOptions.find(opt => opt.id === layout);

    return (
        <header className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 p-3 px-6 flex justify-between items-center sticky top-0 z-[300]">
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Magistra UI</h1>
            <div className="flex items-center gap-4">
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                    >
                        <span className="text-sm">{selectedLayout?.icon}</span>
                        <span className="hidden md:inline text-sm font-medium">{selectedLayout?.name.split(' (')[0]}</span>
                        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 animate-fade-in origin-top-right">
                            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 px-3 pt-3 pb-1">LAYOUT</p>
                            {layoutOptions.map(opt => (
                                <button 
                                    key={opt.id}
                                    onClick={() => { setLayout(opt.id); setIsDropdownOpen(false); }}
                                    className={`w-full text-left flex items-center gap-3 px-3 py-2 text-sm transition-colors ${layout === opt.id ? 'bg-blue-500 text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                >
                                    {opt.icon}
                                    {opt.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                {onOpenSettings && (
                    <button
                        onClick={onOpenSettings}
                        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title="Settings"
                    >
                        <CogIcon className="w-5 h-5" />
                    </button>
                )}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                </button>
                <button className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <UserIcon className="w-6 h-6" />
                </button>
            </div>
        </header>
    );
};