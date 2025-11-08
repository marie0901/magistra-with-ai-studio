
import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { StickyNoteData } from '../types';
import { CloseIcon, MinimizeIcon } from './icons';
import { parseMarkdown } from '../utils/markdown';

interface StickyNoteProps {
    note: StickyNoteData;
    onUpdate: (id: number, data: Partial<StickyNoteData>) => void;
    onDeleteRequest: (id: number) => void;
    onFocus: (id: number) => void;
    onToggleMinimize: (id: number) => void;
}

export const StickyNote: React.FC<StickyNoteProps> = ({ note, onUpdate, onDeleteRequest, onFocus, onToggleMinimize }) => {
    console.log(`🔧 StickyNote component rendered for note ${note.id}, onToggleMinimize:`, typeof onToggleMinimize, onToggleMinimize);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingContent, setIsEditingContent] = useState(false);
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);

    useEffect(() => {
        setTitle(note.title);
    }, [note.title]);

    useEffect(() => {
        setContent(note.content);
    }, [note.content]);

    const noteRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef({ isDragging: false, isResizing: false, initialMouseX: 0, initialMouseY: 0, initialX: 0, initialY: 0, initialWidth: 0, initialHeight: 0 });

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (note.minimized) return;
        if (dragRef.current.isDragging) {
            const dx = e.clientX - dragRef.current.initialMouseX;
            const dy = e.clientY - dragRef.current.initialMouseY;
            onUpdate(note.id, { position: { x: dragRef.current.initialX + dx, y: dragRef.current.initialY + dy } });
        }
        if (dragRef.current.isResizing) {
            const dw = e.clientX - dragRef.current.initialMouseX;
            const dh = e.clientY - dragRef.current.initialMouseY;
            onUpdate(note.id, { size: { width: dragRef.current.initialWidth + dw, height: dragRef.current.initialHeight + dh } });
        }
    }, [note.id, onUpdate, note.minimized]);

    const handleMouseUp = useCallback(() => {
        dragRef.current.isDragging = false;
        dragRef.current.isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
    }, [handleMouseMove]);

    const handleDragMouseDown = (e: React.MouseEvent) => {
        if (note.minimized) return;
        e.preventDefault();
        onFocus(note.id);
        dragRef.current = {
            ...dragRef.current,
            isDragging: true,
            initialMouseX: e.clientX,
            initialMouseY: e.clientY,
            initialX: note.position.x,
            initialY: note.position.y,
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = 'none';
    };

    const handleResizeMouseDown = (e: React.MouseEvent) => {
        if (note.minimized) return;
        e.preventDefault();
        e.stopPropagation();
        onFocus(note.id);
        dragRef.current = {
            ...dragRef.current,
            isResizing: true,
            initialMouseX: e.clientX,
            initialMouseY: e.clientY,
            initialWidth: note.size.width,
            initialHeight: note.size.height,
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = 'none';
    };

    const handleTitleBlur = () => {
        setIsEditingTitle(false);
        onUpdate(note.id, { title });
    };

    const handleContentBlur = () => {
        setIsEditingContent(false);
        onUpdate(note.id, { content });
    };

    const handleNoteClick = () => {
        if (note.minimized) {
            onToggleMinimize(note.id);
        } else {
            onFocus(note.id);
        }
    }
    
    const truncatedContent = note.content.length > 150 ? note.content.substring(0, 150) + '...' : note.content;

    if (note.minimized) {
        return (
             <div
                ref={noteRef}
                className="absolute bg-yellow-300 dark:bg-yellow-700/80 shadow-lg rounded-md overflow-hidden transition-all duration-500 ease-in-out cursor-pointer group"
                style={{
                    transform: `translate(${note.position.x}px, ${note.position.y}px)`,
                    width: `${note.size.width}px`,
                    height: `${note.size.height}px`,
                    zIndex: 199,
                }}
                onClick={() => onToggleMinimize(note.id)}
                title={truncatedContent}
            >
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-yellow-800 dark:text-yellow-100 transition-opacity truncate px-1">{note.title}</span>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteRequest(note.id); }} 
                    className="absolute top-0 right-0 p-1 rounded-full text-yellow-800 dark:text-yellow-200 opacity-0 group-hover:opacity-100 hover:bg-black/20"
                >
                    <CloseIcon className="w-3 h-3" />
                </button>
            </div>
        )
    }

    return (
        <div
            ref={noteRef}
            className="absolute flex flex-col bg-yellow-200 dark:bg-yellow-700/80 shadow-lg dark:shadow-black/50 rounded-md overflow-hidden animate-fade-in transition-all duration-500 ease-in-out"
            style={{
                transform: `translate(${note.position.x}px, ${note.position.y}px)`,
                width: `${note.size.width}px`,
                height: `${note.size.height}px`,
                zIndex: note.zIndex,
            }}
            onMouseDown={handleNoteClick}
        >
            <header
                className="flex items-center justify-between p-1.5 bg-yellow-300 dark:bg-yellow-800/80 cursor-grab active:cursor-grabbing"
                onMouseDown={handleDragMouseDown}
            >
                {isEditingTitle ? (
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleTitleBlur}
                        onKeyPress={(e) => e.key === 'Enter' && handleTitleBlur()}
                        autoFocus
                        className="bg-transparent font-bold text-sm w-full outline-none text-yellow-900 dark:text-yellow-100"
                    />
                ) : (
                    <h3 onDoubleClick={() => setIsEditingTitle(true)} className="font-bold text-sm px-1 text-yellow-900 dark:text-yellow-100 select-none truncate">
                        {note.title}
                    </h3>
                )}
                <div className="flex items-center">
                    <button onClick={(e) => { 
                        console.log(`🔧 StickyNote minimize button clicked for note ${note.id}`);
                        console.log(`🔧 StickyNote onToggleMinimize callback:`, onToggleMinimize);
                        e.stopPropagation(); 
                        console.log(`🔧 StickyNote calling onToggleMinimize(${note.id})`);
                        onToggleMinimize(note.id);
                        console.log(`🔧 StickyNote onToggleMinimize call completed`);
                    }} onMouseDown={(e) => { console.log(`🔧 StickyNote minimize button mousedown for note ${note.id}`); e.stopPropagation(); }} className="p-1 rounded-full hover:bg-black/10 text-yellow-800 dark:text-yellow-200">
                        <MinimizeIcon className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteRequest(note.id); }} onMouseDown={(e) => e.stopPropagation()} className="p-1 rounded-full hover:bg-black/10 text-yellow-800 dark:text-yellow-200">
                        <CloseIcon className="w-4 h-4" />
                    </button>
                </div>
            </header>
            <div className="flex-grow p-2 text-sm text-yellow-900 dark:text-yellow-100" onDoubleClick={() => setIsEditingContent(true)}>
                {isEditingContent ? (
                     <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onBlur={handleContentBlur}
                        autoFocus
                        className="w-full h-full bg-transparent outline-none resize-none"
                    />
                ) : (
                    <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: parseMarkdown(note.content) }} />
                )}
            </div>
             <div 
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" 
                onMouseDown={handleResizeMouseDown}
            >
                <div className="w-2 h-2 border-r-2 border-b-2 border-yellow-500 dark:border-yellow-900 absolute bottom-1 right-1"></div>
            </div>
        </div>
    );
};
