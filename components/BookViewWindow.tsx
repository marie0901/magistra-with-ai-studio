
import React, { useMemo, useEffect, useRef, useState } from 'react';
import type { Fragment } from '../types';
import { DraggableWindow } from './DraggableWindow';
import { SparklesIcon } from './icons';
import { userProvidedText } from '../constants';

interface BookViewWindowProps {
  bookText: string;
  learningFragments: Fragment[];
  currentFragmentId: number | null;
  onStartNewSession: (selectedText: string) => void;
  initialPosition: { x: number; y: number };
  initialSize: { width: number | string; height: number | string };
  zIndex: number;
  onFocus: () => void;
  isMaximized: boolean;
  onMaximizeToggle: () => void;
  onReset: () => void;
  onCollapse: () => void;
}

const getFragmentSpanClasses = (status: Fragment['status'], isCurrent: boolean): string => {
  let baseClasses = 'px-1.5 py-0.5 rounded transition-colors duration-300 shadow-sm dark:shadow-none';
  if (isCurrent) {
    return `${baseClasses} bg-blue-200 dark:bg-blue-800/80 ring-2 ring-blue-500`;
  }
  switch (status) {
    case 'completed':
      return `${baseClasses} bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-800/70`;
    case 'current':
      return `${baseClasses} bg-blue-100 dark:bg-blue-900/50`;
    case 'pending':
      return `${baseClasses} bg-slate-200/70 dark:bg-slate-700/50 hover:bg-slate-300 dark:hover:bg-slate-600`;
    default:
      return '';
  }
};

export const BookViewWindow: React.FC<BookViewWindowProps> = ({ bookText, learningFragments, currentFragmentId, onStartNewSession, isMaximized, onMaximizeToggle, onReset, onCollapse, ...windowProps }) => {
    const currentFragmentRef = useRef<HTMLSpanElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [popup, setPopup] = useState<{ x: number, y: number, text: string } | null>(null);

    useEffect(() => {
        currentFragmentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [currentFragmentId]);

    useEffect(() => {
        const contentEl = contentRef.current;
        if (!contentEl) return;

        const handleMouseUp = () => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
                setPopup(null);
                return;
            }
            
            const selectedText = selection.toString().trim();

            if (selectedText) {
                const range = selection.getRangeAt(0);
                const containerRect = contentEl.getBoundingClientRect();
                const rangeRect = range.getBoundingClientRect();
                
                const x = rangeRect.left + rangeRect.width / 2 - containerRect.left + contentEl.scrollLeft;
                const y = rangeRect.top - containerRect.top - 10 + contentEl.scrollTop;

                setPopup({ x, y, text: selectedText });
            } else {
                setPopup(null);
            }
        };

        const handleMouseDown = (event: MouseEvent) => {
            if (popup && !(event.target as Element)?.closest('.session-popup')) {
                setPopup(null);
            }
        };

        contentEl.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mousedown', handleMouseDown);

        return () => {
            contentEl.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, [popup]);

    const { preSessionText, postSessionText } = useMemo(() => {
        if (learningFragments.length === 0 || !bookText) {
            return { preSessionText: bookText, postSessionText: '' };
        }

        // Use the actual book text to find session boundaries
        const originalSentences = bookText.trim().split(/(?<=[.?!])\s+/);
        
        const firstFragmentId = learningFragments[0].id;
        const lastFragmentId = learningFragments[learningFragments.length - 1].id;

        // Ensure IDs are within bounds of the original text sentences
        if (firstFragmentId >= originalSentences.length || lastFragmentId >= originalSentences.length) {
            return { preSessionText: bookText, postSessionText: '' };
        }

        const firstOriginalText = originalSentences[firstFragmentId];
        const lastOriginalText = originalSentences[lastFragmentId];

        const startIndex = bookText.indexOf(firstOriginalText);
        const lastFragmentIndex = bookText.indexOf(lastOriginalText, startIndex);

        if (startIndex === -1 || lastFragmentIndex === -1) {
             return { preSessionText: bookText, postSessionText: '' };
        }

        const endIndex = lastFragmentIndex + lastOriginalText.length;

        const pre = bookText.substring(0, startIndex);
        const post = bookText.substring(endIndex);

        return { preSessionText: pre, postSessionText: post };
    }, [bookText, learningFragments]);

    return (
        <DraggableWindow title="Book View" {...windowProps} isMaximized={isMaximized} onMaximizeToggle={onMaximizeToggle} onReset={onReset} onCollapse={onCollapse}>
            <div ref={contentRef} className="p-4 h-full overflow-y-auto text-slate-800 dark:text-slate-200 leading-relaxed text-justify relative select-text">
                 {popup && (
                    <button
                        className="session-popup absolute z-10 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-lg hover:bg-blue-700 transition-all animate-fade-in flex items-center gap-1.5"
                        style={{ top: `${popup.y}px`, left: `${popup.x}px`, transform: 'translate(-50%, -100%)' }}
                        onClick={() => {
                            onStartNewSession(popup.text);
                            setPopup(null);
                        }}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <SparklesIcon className="w-4 h-4" />
                        Start Session Here
                    </button>
                )}
                <p className="opacity-50 transition-opacity duration-300 non-session-text">
                    {preSessionText}
                </p>

                {learningFragments.length > 0 && (
                    <>
                        <div className="relative text-center my-4">
                            <hr className="border-slate-300 dark:border-slate-600"/>
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
                                CURRENT LEARNING SESSION
                            </span>
                        </div>

                        <div className="space-y-2">
                            {learningFragments.map(fragment => {
                                const isCurrent = fragment.id === currentFragmentId;
                                const classes = getFragmentSpanClasses(fragment.status, isCurrent);
                                return (
                                    <span
                                        key={fragment.id}
                                        ref={isCurrent ? currentFragmentRef : null}
                                        className={classes}
                                    >
                                        {fragment.isSimplified && (
                                            <span title="This text was simplified by AI.">
                                                <SparklesIcon className="inline-block w-3.5 h-3.5 mr-1 text-blue-500 dark:text-blue-400" />
                                            </span>
                                        )}
                                        {fragment.text}{' '}
                                    </span>
                                );
                            })}
                        </div>
                        
                        <div className="relative text-center mt-4 mb-2">
                            <hr className="border-slate-300 dark:border-slate-600"/>
                        </div>
                    </>
                )}

                <p className="opacity-50 transition-opacity duration-300 non-session-text">
                    {postSessionText}
                </p>
            </div>
        </DraggableWindow>
    );
};
