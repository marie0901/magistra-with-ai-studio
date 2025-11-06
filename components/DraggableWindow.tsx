
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MaximizeIcon, RestoreIcon, ResetIcon, CloseIcon } from './icons';

interface DraggableWindowProps {
  title: string;
  children: React.ReactNode;
  initialPosition: { x: number; y: number };
  initialSize: { width: number | string; height: number | string };
  zIndex: number;
  onFocus: () => void;
  icon?: React.ReactNode;
  className?: string;
  isResizable?: boolean;
  isMaximized?: boolean;
  onMaximizeToggle?: () => void;
  onReset?: () => void;
  onCollapse?: () => void;
}

export const DraggableWindow: React.FC<DraggableWindowProps> = ({
  title,
  children,
  initialPosition,
  initialSize,
  zIndex,
  onFocus,
  icon,
  className,
  isResizable = true,
  isMaximized = false,
  onMaximizeToggle,
  onReset,
  onCollapse,
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);

  const windowRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ isDragging: false, isResizing: false, initialMouseX: 0, initialMouseY: 0, initialX: 0, initialY: 0, initialWidth: 0, initialHeight: 0 });
  
  // Update position if initial prop changes (e.g., layout switch)
  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  useEffect(() => {
    setSize(initialSize);
  }, [initialSize]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragRef.current.isDragging) {
      const dx = e.clientX - dragRef.current.initialMouseX;
      const dy = e.clientY - dragRef.current.initialMouseY;
      setPosition({
        x: dragRef.current.initialX + dx,
        y: dragRef.current.initialY + dy,
      });
    }
    if (dragRef.current.isResizing) {
      const dw = e.clientX - dragRef.current.initialMouseX;
      const dh = e.clientY - dragRef.current.initialMouseY;
      setSize({
        width: dragRef.current.initialWidth + dw,
        height: dragRef.current.initialHeight + dh,
      });
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    dragRef.current.isDragging = false;
    dragRef.current.isResizing = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = '';
  }, [handleMouseMove]);

  const handleDragMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    e.preventDefault();
    onFocus();
    dragRef.current = {
      ...dragRef.current,
      isDragging: true,
      initialMouseX: e.clientX,
      initialMouseY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none';
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    onFocus();
    if (typeof size.width !== 'number' || typeof size.height !== 'number') return;
    dragRef.current = {
      ...dragRef.current,
      isResizing: true,
      initialMouseX: e.clientX,
      initialMouseY: e.clientY,
      initialWidth: size.width,
      initialHeight: size.height,
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none';
  };
  
  const style: React.CSSProperties = typeof size.width === 'string' ? {
      width: size.width,
      height: size.height,
      transform: `translate(${position.x}px, ${position.y}px)`,
      zIndex: zIndex,
  } : {
      width: `${size.width}px`,
      height: `${size.height}px`,
      transform: `translate(${position.x}px, ${position.y}px)`,
      zIndex: zIndex,
  };

  return (
    <div
      ref={windowRef}
      className={`absolute flex flex-col bg-white dark:bg-slate-800 shadow-2xl dark:shadow-black/50 border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-500 ease-in-out ${isMaximized ? 'rounded-none' : 'rounded-lg'} ${className}`}
      style={style}
      onMouseDown={onFocus}
    >
      <header
        className="flex items-center justify-between p-2 pl-3 bg-slate-50 dark:bg-slate-900/50 cursor-grab active:cursor-grabbing border-b border-slate-200 dark:border-slate-700"
        onMouseDown={handleDragMouseDown}
        onDoubleClick={onMaximizeToggle}
      >
        <div className="flex items-center gap-2">
            {icon}
            <h2 className="font-semibold text-sm text-slate-700 dark:text-slate-200 select-none">{title}</h2>
        </div>
        <div className="flex items-center gap-1">
            {onReset && (
                <button onClick={onReset} title="Reset to default position" className="p-1.5 rounded-full hover:bg-black/10 text-slate-500 dark:text-slate-400 dark:hover:bg-white/10 transition-colors">
                    <ResetIcon />
                </button>
            )}
            {onMaximizeToggle && (
                <button onClick={onMaximizeToggle} title={isMaximized ? "Restore" : "Maximize"} className="p-1.5 rounded-full hover:bg-black/10 text-slate-500 dark:text-slate-400 dark:hover:bg-white/10 transition-colors">
                    {isMaximized ? <RestoreIcon /> : <MaximizeIcon />}
                </button>
            )}
             {onCollapse && (
                <button onClick={onCollapse} title="Collapse" className="p-1.5 rounded-full hover:bg-black/10 text-slate-500 dark:text-slate-400 dark:hover:bg-white/10 transition-colors">
                    <CloseIcon className="w-4 h-4" />
                </button>
            )}
        </div>
      </header>
      <div className="flex-grow p-1 overflow-auto">
        {children}
      </div>
      {isResizable && !isMaximized && (
         <div 
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" 
          onMouseDown={handleResizeMouseDown}
        >
            <div className="w-2 h-2 border-r-2 border-b-2 border-slate-400 dark:border-slate-600 absolute bottom-1 right-1"></div>
        </div>
      )}
    </div>
  );
};