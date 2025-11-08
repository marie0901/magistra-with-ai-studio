

import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, VocabularyItem } from '../types';
import { DraggableWindow } from './DraggableWindow';
import { SendIcon, SparklesIcon, TrashIcon, PencilIcon } from './icons';
import { parseMarkdown } from '../utils/markdown';

interface AIAssistantWindowProps {
  chatHistory: ChatMessage[];
  vocabulary: VocabularyItem[];
  onSendMessage: (message: string) => void;
  onCreateSticker: (content: string, title: string) => void;
  onDeleteVocabulary: (word: string) => void;
  initialPosition: { x: number; y: number };
  initialSize: { width: number | string; height: number | string };
  zIndex: number;
  onFocus: () => void;
  isMaximized: boolean;
  onMaximizeToggle: () => void;
  onReset: () => void;
  onCollapse: () => void;
}

type ActiveTab = 'chat' | 'vocabulary';

const ChatView: React.FC<{ chatHistory: ChatMessage[]; onSendMessage: (msg: string) => void; onCreateSticker: (content: string, title: string) => void; }> = ({ chatHistory, onSendMessage, onCreateSticker }) => {
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
        // Stop typing indicator when AI responds
        if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].sender === 'ai') {
            setIsTyping(false);
        }
    }, [chatHistory, isTyping]);

    const handleSend = () => {
        if (input.trim()) {
            onSendMessage(input.trim());
            setInput('');
            setIsTyping(true);
            // Remove artificial delay - real AI will handle timing
        }
    };

    return (
        <div className="flex flex-col h-full p-2">
            <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 group ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'user' ? (
                            <div className="bg-blue-600 text-white p-3 rounded-lg max-w-xs">{msg.text}</div>
                        ) : (
                            <>
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-slate-500"/></div>
                                <div className="relative bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 p-3 rounded-lg max-w-xs">
                                    <div dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }} />
                                    <button onClick={() => onCreateSticker(msg.text, "AI Insight")} className="absolute -top-2 -right-2 bg-yellow-300 text-yellow-800 text-xs font-bold p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg hover:scale-110">
                                        Make Sticker
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {isTyping && chatHistory[chatHistory.length - 1]?.sender === 'user' && (
                    <div className="flex items-end gap-2 justify-start">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-slate-500"/></div>
                        <div className="bg-slate-200 dark:bg-slate-700 p-3 rounded-lg">
                           <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse-faint [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse-faint [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse-faint"></span>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={endOfMessagesRef} />
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask a question..."
                    className="flex-grow bg-slate-100 dark:bg-slate-900/50 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 outline-none transition-colors border border-transparent"
                />
                <button onClick={handleSend} className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-slate-400" disabled={!input.trim()}>
                    <SendIcon />
                </button>
            </div>
        </div>
    );
};

const VocabularyView: React.FC<{ vocabulary: VocabularyItem[]; onDeleteVocabulary: (word: string) => void }> = ({ vocabulary, onDeleteVocabulary }) => {
    const handleExport = () => {
        const csvContent = vocabulary.map(item => 
            `"${item.original}","${item.translation}","${item.context}","${item.addedFrom}"`
        ).join('\n');
        const header = 'Original,Translation,Context,Added From\n';
        const blob = new Blob([header + csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `magistra-vocabulary-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col h-full p-2">
            <div className="flex-grow overflow-y-auto pr-2 space-y-2">
                {vocabulary.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400 text-sm">
                        Complete translation exercises to build your vocabulary
                    </div>
                ) : (
                    vocabulary.map((item, index) => (
                        <div key={index} className="p-3 bg-slate-100 dark:bg-slate-900/50 rounded-lg group">
                            <div className="flex justify-between items-start">
                                <div className="flex-grow">
                                    <p className="font-bold text-slate-800 dark:text-slate-100">{item.original} <span className="font-normal text-slate-500 dark:text-slate-400">→</span> {item.translation}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">"{item.context}"</p>
                                </div>
                                <button 
                                    onClick={() => onDeleteVocabulary(item.original)}
                                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all p-1 ml-2"
                                    title="Delete word"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-right text-xs text-slate-400 dark:text-slate-500 mt-1">Added from: {item.addedFrom}</p>
                        </div>
                    ))
                )}
            </div>
            {vocabulary.length > 0 && (
                <div className="pt-2">
                    <button 
                        onClick={handleExport}
                        className="w-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                        Export Vocabulary ({vocabulary.length} words)
                    </button>
                </div>
            )}
        </div>
    );
};

export const AIAssistantWindow: React.FC<AIAssistantWindowProps> = ({ chatHistory, vocabulary, onSendMessage, onCreateSticker, onDeleteVocabulary, isMaximized, onMaximizeToggle, onReset, onCollapse, ...windowProps }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');

  return (
    <DraggableWindow title="AI Assistant" {...windowProps} className="min-w-[350px]" isMaximized={isMaximized} onMaximizeToggle={onMaximizeToggle} onReset={onReset} onCollapse={onCollapse}>
        <div className="flex flex-col h-full">
            <div className="flex border-b border-slate-200 dark:border-slate-700 px-2">
                <button onClick={() => setActiveTab('chat')} className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'chat' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                    Chat
                </button>
                <button onClick={() => setActiveTab('vocabulary')} className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'vocabulary' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                    Vocabulary
                </button>
            </div>
            <div className="flex-grow overflow-hidden">
                {activeTab === 'chat' && <ChatView chatHistory={chatHistory} onSendMessage={onSendMessage} onCreateSticker={onCreateSticker} />}
                {activeTab === 'vocabulary' && <VocabularyView vocabulary={vocabulary} onDeleteVocabulary={onDeleteVocabulary} />}
            </div>
        </div>
    </DraggableWindow>
  );
};