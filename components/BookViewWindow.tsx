
import React, { useMemo, useEffect, useRef, useState } from 'react';
import type { Fragment } from '../types';
import { DraggableWindow } from './DraggableWindow';
import { SparklesIcon } from './icons';
import { userProvidedText } from '../constants';

interface BookViewWindowProps {
  bookText: string;
  learningFragments: Fragment[];
  currentFragmentId: number | null;
  onStartNewSession: (sentenceIndex: number) => void;
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
    const [popup, setPopup] = useState<{ x: number, y: number, sentenceId: number } | null>(null);

    useEffect(() => {
        currentFragmentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [currentFragmentId]);

    useEffect(() => {
        const contentEl = contentRef.current;
        if (!contentEl) return;

        const handleMouseUp = () => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
                return;
            }
            
            const selectedText = selection.toString().trim();
            if (!selectedText) {
                setPopup(null);
                return;
            }

            const range = selection.getRangeAt(0);
            let node = range.startContainer;
            
            let sentenceSpan: HTMLElement | null = null;
            if (node.nodeType === Node.TEXT_NODE) {
                node = node.parentNode!;
            }
            if (node instanceof HTMLElement) {
                sentenceSpan = node.closest('[data-sentence-id]');
            }
            
            const sentenceIdStr = sentenceSpan?.getAttribute('data-sentence-id');

            if (sentenceIdStr) {
                const sentenceId = parseInt(sentenceIdStr, 10);
                const containerRect = contentEl.getBoundingClientRect();
                const rangeRect = range.getBoundingClientRect();
                
                const x = rangeRect.left + rangeRect.width / 2 - containerRect.left + contentEl.scrollLeft;
                const y = rangeRect.top - containerRect.top - 10 + contentEl.scrollTop;

                setPopup({ x, y, sentenceId });
            } else {
                setPopup(null);
            }
        };

        const handleMouseDown = (event: MouseEvent) => {
            if (!(event.target as Element)?.closest('.session-popup')) {
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

    const renderedContent = useMemo(() => {
        if (!bookText) return null;

        const sentences = bookText.trim().split(/(?<=[.?!])\s+/);
        const fragmentsById = new Map(learningFragments.map(f => [f.id, f]));

        const allSentenceNodes = sentences.map((sentence, index) => {
            const fragment = fragmentsById.get(index);
            
            if (fragment) {
                const typedFragment = fragment as Fragment;
                const isCurrent = typedFragment.id === currentFragmentId;
                const classes = getFragmentSpanClasses(typedFragment.status, isCurrent);
                return (
                    <span key={index} ref={isCurrent ? currentFragmentRef : null} className={classes} data-sentence-id={index}>
                        {typedFragment.isSimplified && (
                            <span title="This text was simplified by AI.">
                                <SparklesIcon className="inline-block w-3.5 h-3.5 mr-1 text-blue-500 dark:text-blue-400" />
                            </span>
                        )}
                        {sentence}{' '}
                    </span>
                );
            } else {
                return (
                    <span key={index} data-sentence-id={index}>
                        {sentence}{' '}
                    </span>
                );
            }
        });

        if (learningFragments.length === 0) {
            return <p className="opacity-50 transition-opacity duration-300 non-session-text">{allSentenceNodes}</p>;
        }

        const firstFragmentId = learningFragments[0].id;
        const lastFragmentId = learningFragments[learningFragments.length - 1].id;

        const preSessionContent = allSentenceNodes.slice(0, firstFragmentId);
        const sessionContent = allSentenceNodes.slice(firstFragmentId, lastFragmentId + 1);
        const postSessionContent = allSentenceNodes.slice(lastFragmentId + 1);

        return (
            <>
                <p className="opacity-50 transition-opacity duration-300 non-session-text">{preSessionContent}</p>
                <div className="relative text-center my-4">
                    <hr className="border-slate-300 dark:border-slate-600"/>
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
                        CURRENT LEARNING SESSION
                    </span>
                </div>
                <div className="space-y-2">{sessionContent}</div>
                <div className="relative text-center mt-4 mb-2">
                    <hr className="border-slate-300 dark:border-slate-600"/>
                </div>
                <p className="opacity-50 transition-opacity duration-300 non-session-text">{postSessionContent}</p>
            </>
        );

    }, [bookText, learningFragments, currentFragmentId]);

    return (
        <DraggableWindow title="Book View" {...windowProps} isMaximized={isMaximized} onMaximizeToggle={onMaximizeToggle} onReset={onReset} onCollapse={onCollapse}>
            <div ref={contentRef} className="p-4 h-full overflow-y-auto text-slate-800 dark:text-slate-200 leading-relaxed text-justify relative select-text">
                 {popup && (
                    <button
                        className="session-popup absolute z-10 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-lg hover:bg-blue-700 transition-all animate-fade-in flex items-center gap-1.5"
                        style={{ top: `${popup.y}px`, left: `${popup.x}px`, transform: 'translate(-50%, -100%)' }}
                        onClick={() => {
                            onStartNewSession(popup.sentenceId);
                            setPopup(null);
                        }}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <SparklesIcon className="w-4 h-4" />
                        Start Session Here
                    </button>
                )}
                {renderedContent}
            </div>
        </DraggableWindow>
    );
};
