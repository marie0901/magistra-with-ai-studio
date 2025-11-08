
import React, { useState, useEffect, useCallback } from 'react';
import type { Theme, LayoutSchema, Fragment, ChatMessage, VocabularyItem, StickyNoteData, WindowState } from './types';
import { userProvidedText, mockChatHistory, mockVocabulary, initialStickyNotes, DEFAULT_SESSION_FRAGMENT_COUNT, mockCorrectTranslations } from './constants';
import { StorageService } from './services/storageService';
import { Header } from './components/Header';
import { BookViewWindow } from './components/BookViewWindow';
import { LearningSessionWindow } from './components/LearningSessionWindow';
import { AIAssistantWindow } from './components/AIAssistantWindow';
import { StickyNote } from './components/StickyNote';
import { Modal } from './components/Modal';
import { Confetti } from './components/Confetti';
import { SessionReview } from './components/SessionReview';
import { CheckCircleIcon, TrashIcon, BookTextIcon, GraduationCapIcon, SparklesIcon } from './components/icons';
import { WelcomeScreen } from './components/WelcomeScreen';
import { TextInputScreen } from './components/TextInputScreen';
import { PasteTextScreen } from './components/PasteTextScreen';
import { SettingsModal } from './components/SettingsModal';

const App: React.FC = () => {
    // Global State
    const [appState, setAppState] = useState<'welcome' | 'text_input' | 'paste_text' | 'learning'>('welcome');
    const [theme, setTheme] = useState<Theme>('light');
    const [layout, setLayout] = useState<LayoutSchema>('default');
    const [targetLanguage, setTargetLanguage] = useState('Spanish');

    // Data State
    const [bookText, setBookText] = useState<string>(userProvidedText);
    const [learningFragments, setLearningFragments] = useState<Fragment[]>([]);
    const [sessionOffset, setSessionOffset] = useState(0);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>(mockChatHistory);
    const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
    const [stickyNotes, setStickyNotes] = useState<StickyNoteData[]>(initialStickyNotes);
    const [customText, setCustomText] = useState<string>('');
    const [settings, setSettings] = useState({ voiceId: 'Kore', fragmentCount: DEFAULT_SESSION_FRAGMENT_COUNT });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Update audio service when voice changes
    useEffect(() => {
        import('./services/audioService').then(({ audioService }) => {
            audioService.setVoice(settings.voiceId);
        });
    }, [settings.voiceId]);

    // Position initial sticky notes correctly
    useEffect(() => {
        if (appState === 'learning') {
            const minimizedNotes = stickyNotes.filter(n => n.minimized).sort((a, b) => a.id - b.id);
            if (minimizedNotes.length > 0) {
                const sidebarWidth = 64;
                const mainContentPadding = 24;
                const minimizedNoteSize = 48;
                const startY = 280;
                const verticalGap = 12;
                const desiredScreenX = (sidebarWidth - minimizedNoteSize) / 2;
                const noteXInMain = desiredScreenX - sidebarWidth - mainContentPadding;

                const updatedNotes = stickyNotes.map(note => {
                    if (note.minimized) {
                        const index = minimizedNotes.findIndex(n => n.id === note.id);
                        return {
                            ...note,
                            position: {
                                x: noteXInMain,
                                y: startY + index * (minimizedNoteSize + verticalGap)
                            },
                            size: { width: minimizedNoteSize, height: minimizedNoteSize }
                        };
                    }
                    return note;
                });
                setStickyNotes(updatedNotes);
            }
        }
    }, [appState]);

    // UI State
    const [windows, setWindows] = useState<WindowState[]>([
        { id: 'book', position: { x: 0, y: 0 }, size: { width: 0, height: 0 }, zIndex: 10, minimized: false, isMaximized: false, isCollapsed: false },
        { id: 'learning', position: { x: 0, y: 0 }, size: { width: 0, height: 0 }, zIndex: 10, minimized: false, isMaximized: false, isCollapsed: false },
        { id: 'ai', position: { x: 0, y: 0 }, size: { width: 0, height: 0 }, zIndex: 10, minimized: false, isMaximized: false, isCollapsed: false },
    ]);
    const [windowZCounter, setWindowZCounter] = useState(10);
    const [noteZCounter, setNoteZCounter] = useState(202);
    const [currentFragmentId, setCurrentFragmentId] = useState<number | null>(null);
    const [isModeModalOpen, setIsModeModalOpen] = useState(false);
    const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
    const [completedSessionTranslation, setCompletedSessionTranslation] = useState<string | null>(null);
    const [noteToDeleteId, setNoteToDeleteId] = useState<number | null>(null);
    const [pendingSessionOffset, setPendingSessionOffset] = useState<number | null>(null);
    
    // Load saved progress on mount
    useEffect(() => {
        const savedProgress = StorageService.loadProgress();
        const savedVocabulary = StorageService.loadVocabulary();
        
        if (savedVocabulary.length > 0) {
            setVocabulary(savedVocabulary);
        } else {
            setVocabulary(mockVocabulary);
        }
        
        if (savedProgress) {
            setSessionOffset(savedProgress.sessionOffset || 0);
            setTargetLanguage(savedProgress.targetLanguage || 'Spanish');
            if (savedProgress.bookText) {
                setBookText(savedProgress.bookText);
                setCustomText(savedProgress.bookText);
            }
        }
    }, []);
    
    // Theme Management
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

    // Session Generation
    const generateLearningSession = useCallback((offset: number) => {
        const textToUse = customText || bookText;
        const sentences = textToUse.trim().split(/(?<=[.?!])\s+/);
        const sessionSentences = sentences.slice(offset, offset + settings.fragmentCount);

        if (sessionSentences.length === 0) {
            setLearningFragments([]);
            setCurrentFragmentId(null);
            return;
        }
        
        const newFragments: Fragment[] = sessionSentences.map((text, index) => ({
            id: offset + index,
            text: text.trim(),
            status: 'pending',
        }));
        
        setLearningFragments(newFragments);
        setCurrentFragmentId(null);
        
        // Save progress
        StorageService.saveProgress({
            sessionOffset: offset,
            learningFragments: newFragments,
            targetLanguage,
            bookText: textToUse
        });

    }, [customText, bookText, targetLanguage]);

    // Effect to handle session preparation and reliably open the modal
    useEffect(() => {
        if (pendingSessionOffset !== null) {
            generateLearningSession(pendingSessionOffset);
            setIsModeModalOpen(true);
            setPendingSessionOffset(null); // Reset trigger
        }
    }, [pendingSessionOffset, generateLearningSession]);

    const handleStartInitialSession = () => {
        setSessionOffset(0);
        setAppState('learning');
        setPendingSessionOffset(0);
    };


    // Layout Management
    const getLayoutConfig = useCallback((layoutSchema: LayoutSchema, width: number, height: number, allWindows: WindowState[]) => {
        const visibleWindows = allWindows.filter(w => !w.isCollapsed);
        if (visibleWindows.length === 0) return [];
    
        const isMobile = width < 768;
        const effectiveLayout = isMobile ? 'compact' : layoutSchema;
        
        const w = width - 112; 
        const h = height - 90;
        const gap = 16;
    
        switch(effectiveLayout) {
            case 'focus': {
                const isLearningVisible = visibleWindows.some(win => win.id === 'learning');
                const isAiVisible = visibleWindows.some(win => win.id === 'ai');
                const isBookVisible = visibleWindows.some(win => win.id === 'book');
                const configs: { id: WindowState['id'], pos: {x:number, y:number}, size: {w:number, h:number} }[] = [];

                if(isLearningVisible && isAiVisible) {
                    configs.push({ id: 'learning', pos: { x: 0, y: 0 }, size: { w: w * 0.7 - gap / 2, h: h } });
                    configs.push({ id: 'ai', pos: { x: w * 0.7 + gap / 2, y: 0 }, size: { w: w * 0.3 - gap / 2, h: h } });
                } else if(isLearningVisible) {
                    configs.push({ id: 'learning', pos: { x: 0, y: 0 }, size: { w: w, h: h } });
                } else if(isAiVisible) {
                    configs.push({ id: 'ai', pos: { x: 0, y: 0 }, size: { w: w, h: h } });
                }

                if(isBookVisible) configs.push({ id: 'book', pos: { x: 16, y: h - 210 }, size: { w: 350, h: 200 } });
                return configs;
            }
            case 'reading': {
                const isBookVisible = visibleWindows.some(win => win.id === 'book');
                const isLearningVisible = visibleWindows.some(win => win.id === 'learning');
                const isAiVisible = visibleWindows.some(win => win.id === 'ai');
                const configs: { id: WindowState['id'], pos: {x:number, y:number}, size: {w:number, h:number} }[] = [];
                
                const topH = isBookVisible ? h * 0.5 - gap / 2 : 0;
                const bottomY = isBookVisible ? h * 0.5 + gap / 2 : 0;
                const bottomH = isBookVisible ? h * 0.5 - gap / 2 : h;

                if (isBookVisible) configs.push({ id: 'book', pos: { x: 0, y: 0 }, size: { w: w, h: topH } });

                if (isLearningVisible && isAiVisible) {
                    configs.push({ id: 'learning', pos: { x: 0, y: bottomY }, size: { w: w * 0.5 - gap / 2, h: bottomH } });
                    configs.push({ id: 'ai', pos: { x: w * 0.5 + gap / 2, y: bottomY }, size: { w: w * 0.5 - gap / 2, h: bottomH } });
                } else if (isLearningVisible) {
                    configs.push({ id: 'learning', pos: { x: 0, y: bottomY }, size: { w: w, h: bottomH } });
                } else if (isAiVisible) {
                    configs.push({ id: 'ai', pos: { x: 0, y: bottomY }, size: { w: w, h: bottomH } });
                }
                return configs;
            }
            case 'compact': {
                const count = visibleWindows.length;
                const itemHeight = (h - (count - 1) * gap) / count;
                return visibleWindows.map((win, index) => ({
                    id: win.id,
                    pos: { x: 0, y: index * (itemHeight + gap) },
                    size: { w: w, h: itemHeight }
                }));
            }
            default: { // default layout
                const count = visibleWindows.length;
                const itemWidth = (w - (count - 1) * gap) / count;
                return visibleWindows.map((win, index) => ({
                    id: win.id,
                    pos: { x: index * (itemWidth + gap), y: 0 },
                    size: { w: itemWidth, h: h }
                }));
            }
        }
    }, []);

    const collapsedStateSignature = windows.map(w => w.isCollapsed).join(',');

    useEffect(() => {
        if (appState !== 'learning') return;

        const updateLayout = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const config = getLayoutConfig(layout, width, height, windows);
            
            setWindows(prev => {
                const newWindows = prev.map(w => {
                    const c = config.find(cfg => cfg.id === w.id);
                    if (c && !w.isCollapsed) {
                        return {
                            ...w,
                            position: c.pos,
                            size: {width: c.size.w, height: c.size.h},
                            isMaximized: false,
                        };
                    }
                    return w;
                });

                if (JSON.stringify(prev) !== JSON.stringify(newWindows)) {
                   return newWindows;
                }
                return prev;
            });
        };
        
        updateLayout();
        window.addEventListener('resize', updateLayout);
        return () => window.removeEventListener('resize', updateLayout);
    }, [appState, layout, getLayoutConfig, collapsedStateSignature]);
    
    const handleSetLayout = (newLayout: LayoutSchema) => {
        setLayout(newLayout);
        // Un-collapse all windows when layout changes for predictability
        setWindows(prev => prev.map(w => ({ ...w, isCollapsed: false })));
    };
    
    // Keyboard shortcuts for layout
    useEffect(() => {
        if (appState !== 'learning') return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey) {
                switch(e.key) {
                    case '1': e.preventDefault(); handleSetLayout('default'); break;
                    case '2': e.preventDefault(); handleSetLayout('focus'); break;
                    case '3': e.preventDefault(); handleSetLayout('reading'); break;
                    case '4': e.preventDefault(); handleSetLayout('compact'); break;
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [appState]);
    
    // Window and Note Management
    const bringToFront = (type: 'window' | 'note', id: WindowState['id'] | number) => {
        if (type === 'window') {
            const newZ = windowZCounter + 1;
            setWindowZCounter(newZ);
            setWindows(windows.map(w => w.id === id ? { ...w, zIndex: newZ } : w));
        } else {
            const newZ = noteZCounter + 1;
            setNoteZCounter(newZ);
            setStickyNotes(stickyNotes.map(n => n.id === id ? { ...n, zIndex: newZ } : n));
        }
    };
    
    const handleCollapseToggle = (id: WindowState['id']) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, isCollapsed: !w.isCollapsed, isMaximized: false } : w));
    };

    const handleMaximizeToggle = (id: WindowState['id']) => {
        setWindows(prevWindows => {
            const targetWindow = prevWindows.find(w => w.id === id);
            if (!targetWindow) return prevWindows;
    
            const isNowMaximized = !targetWindow.isMaximized;
            const newZ = windowZCounter + 1;
            setWindowZCounter(newZ);
    
            if (isNowMaximized) {
                const mainContentWidth = window.innerWidth - 112;
                const mainContentHeight = window.innerHeight - 90;
    
                return prevWindows.map(w => {
                    if (w.id === id) {
                        return {
                            ...w,
                            isMaximized: true,
                            lastPosition: w.position,
                            lastSize: w.size,
                            position: { x: 0, y: 0 },
                            size: { width: mainContentWidth, height: mainContentHeight },
                            zIndex: newZ,
                        };
                    }
                    return w;
                });
            } else {
                return prevWindows.map(w => w.id === id ? {
                    ...w,
                    isMaximized: false,
                    position: w.lastPosition || { x: 0, y: 0 },
                    size: w.lastSize || { width: 400, height: 400 },
                    zIndex: newZ,
                } : w);
            }
        });
    };
    
    const handleResetWindow = (id: WindowState['id']) => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        // Temporarily un-collapse all to get the default position in the layout
        const tempAllWindows = windows.map(w => ({ ...w, isCollapsed: false }));
        const config = getLayoutConfig(layout, width, height, tempAllWindows);
        const defaultConfig = config.find(c => c.id === id);
    
        if (defaultConfig) {
            setWindows(prevWindows => prevWindows.map(w => w.id === id ? {
                ...w,
                position: defaultConfig.pos,
                size: { width: defaultConfig.size.w, height: defaultConfig.size.h },
                isMaximized: false,
                isCollapsed: false,
            } : w));
        }
    };
    
    // Workflow Logic
    const startTranslationMode = () => {
        setIsModeModalOpen(false);
        setLearningFragments(prevFragments => {
            if (prevFragments.length > 0) {
                const firstFragmentId = prevFragments[0].id;
                setCurrentFragmentId(firstFragmentId);
                return prevFragments.map((fragment, index) =>
                    index === 0 ? { ...fragment, status: 'current' } : fragment
                );
            }
            return prevFragments;
        });
    };
    
    const handleNextFragment = async (score: number) => {
        if (currentFragmentId === null) return;

        // 1. Mark current fragment as completed
        let fragmentsAfterEvaluation = learningFragments.map(f =>
            f.id === currentFragmentId ? { ...f, status: 'completed' as const, score } : f
        );

        // 2. If score is low, simplify the next pending fragment
        const nextPendingIndex = fragmentsAfterEvaluation.findIndex(f => f.status === 'pending');
        if (score < 60 && nextPendingIndex !== -1) {
            const fragmentToSimplify = fragmentsAfterEvaluation[nextPendingIndex];
            const originalText = fragmentToSimplify.text;
            
            try {
                const { geminiService } = await import('./services/geminiService');
                const simplifiedText = await geminiService.simplifyText(originalText, 'beginner');
                
                fragmentsAfterEvaluation = fragmentsAfterEvaluation.map((f, index) =>
                    index === nextPendingIndex
                        ? { ...f, text: simplifiedText, isSimplified: true }
                        : f
                );
            } catch (error) {
                console.error('Text simplification failed:', error);
                // Fallback to basic simplification
                const sentences = originalText.split(/[.!?]+/);
                const simplifiedText = sentences.length > 1 
                    ? sentences[0].trim() + '.'
                    : originalText.length > 50 
                        ? originalText.substring(0, 50).trim() + '...'
                        : originalText;

                fragmentsAfterEvaluation = fragmentsAfterEvaluation.map((f, index) =>
                    index === nextPendingIndex
                        ? { ...f, text: simplifiedText, isSimplified: true }
                        : f
                );
            }
        }

        // 3. Find the next fragment to mark as current
        const newCurrentIndex = fragmentsAfterEvaluation.findIndex(f => f.status === 'pending');

        if (newCurrentIndex !== -1) {
            // 4. Set the new current fragment
            const newFragments = fragmentsAfterEvaluation.map((f, index) =>
                index === newCurrentIndex ? { ...f, status: 'current' as const } : f
            );
            setCurrentFragmentId(newFragments[newCurrentIndex].id);
            setLearningFragments(newFragments);
        } else {
            // 5. No more pending fragments, session is complete
            const firstFragmentId = learningFragments[0]?.id;
            if (firstFragmentId !== undefined) {
                const sessionTranslations = mockCorrectTranslations.slice(firstFragmentId, firstFragmentId + learningFragments.length);
                const fullTranslation = sessionTranslations.join(' ');
                setCompletedSessionTranslation(fullTranslation);
            }
            
            setLearningFragments(fragmentsAfterEvaluation); // Save final state of completed fragments
            setCurrentFragmentId(null);
            setIsCompletionModalOpen(true);
            
            // Save completion progress
            StorageService.saveProgress({
                sessionOffset,
                learningFragments: fragmentsAfterEvaluation,
                currentFragmentId: null
            });
        }
    };

    const handleNewSession = () => {
        setIsCompletionModalOpen(false);
        setCompletedSessionTranslation(null);
        const newOffset = sessionOffset + settings.fragmentCount;
        setSessionOffset(newOffset);
        setPendingSessionOffset(newOffset);
    };

    const handleStartSessionFromText = (selectedText: string) => {
        const textToUse = customText || bookText;
        const fullText = textToUse.trim();
        const firstSelectedSentence = selectedText.trim().split(/(?<=[.?!])\s+/)[0];
        const selectionStartIndex = fullText.indexOf(firstSelectedSentence);

        if (selectionStartIndex === -1) {
            console.error("Selected text not found in book.");
            return;
        }

        let sentenceStartIndex = selectionStartIndex;
        while (sentenceStartIndex > 0) {
            const char = fullText[sentenceStartIndex - 1];
            if ('.?!'.includes(char)) break;
            sentenceStartIndex--;
        }
        while (/\s/.test(fullText[sentenceStartIndex])) {
            sentenceStartIndex++;
        }

        const textUpToStart = fullText.substring(0, sentenceStartIndex);
        const sentencesBefore = textUpToStart.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 0);
        const newOffset = sentencesBefore.length;

        setSessionOffset(newOffset);
        setPendingSessionOffset(newOffset);
    };

    const handleVocabularyUpdate = (newWords: Array<{word: string; translation: string; context: string}>) => {
        const vocabItems = newWords.map(vw => ({
            original: vw.word,
            translation: vw.translation,
            context: vw.context,
            addedFrom: `Fragment ${currentFragmentIndex + 1}`
        }));
        setVocabulary(prev => {
            const existing = prev.map(v => v.original);
            const newItems = vocabItems.filter(item => !existing.includes(item.original));
            return [...prev, ...newItems];
        });
    };

    const handleDeleteVocabulary = async (word: string) => {
        setVocabulary(prev => prev.filter(item => item.original !== word));
        const { StorageService } = await import('./services/storageService');
        const updatedVocabulary = vocabulary.filter(item => item.original !== word);
        StorageService.saveVocabulary(updatedVocabulary);
    };

    const handleSendMessage = async (message: string) => {
        const newUserMessage: ChatMessage = { sender: 'user', text: message };
        setChatHistory(prev => [...prev, newUserMessage]);
        
        try {
            const { geminiService } = await import('./services/geminiService');
            const context = `User is learning ${targetLanguage}. Current session has ${learningFragments.length} fragments. Current vocabulary: ${vocabulary.length} words.`;
            
            const aiResponse = await geminiService.chatResponse(message, context);
            
            const responseMessage: ChatMessage = {
                sender: 'ai',
                text: aiResponse
            };
            setChatHistory(prev => [...prev, responseMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            let errorMessage = "I'm having trouble connecting right now, but I'm here to help with your language learning!";
            
            if (error instanceof Error) {
                if (error.message.includes('API_KEY')) {
                    errorMessage = "API key not configured. Please check your environment settings.";
                } else if (error.message.includes('rate limit')) {
                    errorMessage = "I'm getting too many requests right now. Please wait a moment and try again.";
                } else if (error.message.includes('network')) {
                    errorMessage = "Network connection issue. Please check your internet connection.";
                }
            }
            
            const fallbackResponse: ChatMessage = {
                sender: 'ai',
                text: errorMessage
            };
            setChatHistory(prev => [...prev, fallbackResponse]);
        }
    };

    // Sticky Note Handlers
    const handleCreateSticker = (content: string, title: string) => {
        const newZ = noteZCounter + 1;
        setNoteZCounter(newZ);
        const newNote: StickyNoteData = {
            id: Date.now(),
            title,
            content,
            position: { x: window.innerWidth * 0.5 - 125, y: 100 },
            size: { width: 250, height: 150 },
            zIndex: newZ,
            minimized: false,
        };
        setStickyNotes(prev => [...prev, newNote]);
    };
    
    const updateStickyNote = (id: number, data: Partial<StickyNoteData>) => {
        setStickyNotes(notes => notes.map(note => note.id === id ? { ...note, ...data } : note));
    };

    const handleDeleteRequest = (id: number) => {
        setNoteToDeleteId(id);
    };

    const confirmDeleteStickyNote = () => {
        if (noteToDeleteId === null) return;
        setStickyNotes(notes => notes.filter(note => note.id !== noteToDeleteId));
        setNoteToDeleteId(null);
    };

    const handleToggleMinimize = (id: number) => {
        const notes = [...stickyNotes];
        const targetNote = notes.find(n => n.id === id);
        if (!targetNote) {
            console.log(`🔧 App.tsx targetNote not found for id: ${id}`);
            return;
        }

        const isMinimizing = !targetNote.minimized;
        console.log(`🔧 App.tsx isMinimizing: ${isMinimizing}`);
        const newZ = noteZCounter + 1;
        setNoteZCounter(newZ);

        targetNote.minimized = isMinimizing;
        targetNote.zIndex = newZ;

        if (isMinimizing) {
            targetNote.lastPosition = targetNote.position;
            targetNote.lastSize = targetNote.size;
        } else {
            targetNote.position = targetNote.lastPosition || {x: 100, y: 100};
            targetNote.size = targetNote.lastSize || { width: 250, height: 150};
        }

        const minimizedNotes = notes.filter(n => n.minimized).sort((a, b) => a.id - b.id);
        
        const sidebarWidth = 64; // Corresponds to w-16
        const mainContentPadding = 24; // Corresponds to p-6 (1.5rem)
        const minimizedNoteSize = 48;
        const startY = 280; // Position below the 3 main window toggle icons
        const verticalGap = 12;

        // Calculate the desired X position relative to the screen's left edge (centered in the sidebar)
        const desiredScreenX = (sidebarWidth - minimizedNoteSize) / 2;

        // Since notes are rendered inside <main>, which is offset, calculate the note's
        // X position relative to <main>'s content area to achieve the desired screen position.
        const noteXInMain = desiredScreenX - sidebarWidth - mainContentPadding;

        minimizedNotes.forEach((note, index) => {
            note.position = { 
                x: noteXInMain,
                y: startY + index * (minimizedNoteSize + verticalGap) 
            };
            note.size = { width: minimizedNoteSize, height: minimizedNoteSize };
        });

        console.log(`🔧 App.tsx setting sticky notes, minimized notes count: ${notes.filter(n => n.minimized).length}`);
        setStickyNotes(notes);
    };

    const currentFragment = learningFragments.find(f => f.id === currentFragmentId);
    const currentFragmentIndex = learningFragments.findIndex(f => f.id === currentFragmentId);
    
    const getWindow = (id: WindowState['id']) => windows.find(w => w.id === id);
    const maximizedWindow = windows.find(w => w.isMaximized);

    const sidebarItems = [
        { id: 'book', icon: BookTextIcon, label: 'Book View' },
        { id: 'learning', icon: GraduationCapIcon, label: 'Learning Session' },
        { id: 'ai', icon: SparklesIcon, label: 'AI Assistant' },
    ];
    
    if (appState === 'welcome') {
        return <WelcomeScreen onContinue={() => setAppState('text_input')} />;
    }

    if (appState === 'text_input') {
        return <TextInputScreen 
            onStartWithSample={handleStartInitialSession} 
            onPasteText={() => setAppState('paste_text')}
            targetLanguage={targetLanguage}
            setTargetLanguage={setTargetLanguage}
        />;
    }

    if (appState === 'paste_text') {
        return <PasteTextScreen 
            onStartLearning={(text) => {
                if (text.trim()) {
                    setCustomText(text.trim());
                    setBookText(text.trim());
                }
                handleStartInitialSession();
            }}
            targetLanguage={targetLanguage}
            setTargetLanguage={setTargetLanguage}
        />;
    }

    return (
        <div className={`h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-50 flex flex-col transition-colors duration-300`}>
            <Header theme={theme} toggleTheme={toggleTheme} layout={layout} setLayout={handleSetLayout} onOpenSettings={() => setIsSettingsOpen(true)} />
            <div className="flex-grow flex relative">
                <div className="fixed top-0 left-0 h-full w-16 bg-slate-900/10 dark:bg-slate-800/20 backdrop-blur-sm z-[198] flex flex-col items-center pt-24 space-y-2">
                    {sidebarItems.map(item => {
                        const windowState = getWindow(item.id as WindowState['id']);
                        const isVisible = windowState && !windowState.isCollapsed;
                        return (
                            <button 
                                key={item.id}
                                title={item.label}
                                onClick={() => handleCollapseToggle(item.id as WindowState['id'])}
                                className={`p-3 rounded-lg transition-colors duration-200 ${isVisible ? 'bg-blue-600/20 text-blue-500 dark:bg-blue-500/30 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:bg-black/10 dark:hover:bg-white/10'}`}
                            >
                                <item.icon className="w-6 h-6"/>
                            </button>
                        )
                    })}
                </div>

                <div className="w-16 flex-shrink-0"></div>

                <main className="flex-grow p-6 relative">
                     {getWindow('book') && !getWindow('book')!.isCollapsed && (!maximizedWindow || maximizedWindow.id === 'book') && <BookViewWindow 
                        bookText={customText || bookText}
                        learningFragments={learningFragments}
                        currentFragmentId={currentFragmentId}
                        onStartNewSession={handleStartSessionFromText}
                        initialPosition={getWindow('book')!.position}
                        initialSize={getWindow('book')!.size}
                        zIndex={getWindow('book')!.zIndex}
                        onFocus={() => bringToFront('window', 'book')}
                        isMaximized={getWindow('book')!.isMaximized}
                        onMaximizeToggle={() => handleMaximizeToggle('book')}
                        onReset={() => handleResetWindow('book')}
                        onCollapse={() => handleCollapseToggle('book')}
                    />}
                    {getWindow('learning') && !getWindow('learning')!.isCollapsed && (!maximizedWindow || maximizedWindow.id === 'learning') && <LearningSessionWindow 
                        fragment={currentFragment}
                        fragmentIndex={currentFragmentIndex}
                        totalFragmentsInSession={learningFragments.length}
                        onNextFragment={handleNextFragment}
                        onVocabularyUpdate={handleVocabularyUpdate}
                        targetLanguage={targetLanguage}
                        initialPosition={getWindow('learning')!.position}
                        initialSize={getWindow('learning')!.size}
                        zIndex={getWindow('learning')!.zIndex}
                        onFocus={() => bringToFront('window', 'learning')}
                        isMaximized={getWindow('learning')!.isMaximized}
                        onMaximizeToggle={() => handleMaximizeToggle('learning')}
                        onReset={() => handleResetWindow('learning')}
                        onCollapse={() => handleCollapseToggle('learning')}
                    />}
                    {getWindow('ai') && !getWindow('ai')!.isCollapsed && (!maximizedWindow || maximizedWindow.id === 'ai') && <AIAssistantWindow 
                        chatHistory={chatHistory}
                        vocabulary={vocabulary}
                        onSendMessage={handleSendMessage}
                        onCreateSticker={handleCreateSticker}
                        onDeleteVocabulary={handleDeleteVocabulary}
                        initialPosition={getWindow('ai')!.position}
                        initialSize={getWindow('ai')!.size}
                        zIndex={getWindow('ai')!.zIndex}
                        onFocus={() => bringToFront('window', 'ai')}
                        isMaximized={getWindow('ai')!.isMaximized}
                        onMaximizeToggle={() => handleMaximizeToggle('ai')}
                        onReset={() => handleResetWindow('ai')}
                        onCollapse={() => handleCollapseToggle('ai')}
                    />}

                    {stickyNotes.map(note => (
                        <StickyNote 
                            key={note.id} 
                            note={note} 
                            onUpdate={updateStickyNote} 
                            onDeleteRequest={handleDeleteRequest}
                            onFocus={() => bringToFront('note', note.id)} 
                            onToggleMinimize={handleToggleMinimize}
                        />
                    ))}
                </main>
            </div>

            <Modal title="Select Learning Mode" isOpen={isModeModalOpen} onClose={() => setIsModeModalOpen(false)}>
                <div className="space-y-4">
                    <button onClick={startTranslationMode} className="w-full text-left p-4 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">Translate Mode</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Type translations and get instant feedback.</p>
                    </button>
                    <button className="w-full text-left p-4 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-not-allowed opacity-50">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">Listen & Read Mode</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Hear AI translations, then see the text. (Coming soon)</p>
                    </button>
                </div>
            </Modal>
            
            <Modal title="Session Complete!" isOpen={isCompletionModalOpen} onClose={() => setIsCompletionModalOpen(false)}>
                {isCompletionModalOpen && <Confetti />}
                <div className="text-center space-y-2">
                    <div className="flex justify-center">
                        <CheckCircleIcon className="w-20 h-20 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Congratulations!</h3>
                    <p className="text-slate-600 dark:text-slate-300">You've completed all fragments in this session. Keep up the great work!</p>
                    
                    {completedSessionTranslation && (
                        <SessionReview translationText={completedSessionTranslation} />
                    )}

                    <div className="flex gap-4 pt-2">
                        <button onClick={() => setIsCompletionModalOpen(false)} className="w-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-2 px-4 rounded-lg transition-colors">
                            Return to Text
                        </button>
                         <button onClick={handleNewSession} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            Start New Session
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal title="Confirm Deletion" isOpen={noteToDeleteId !== null} onClose={() => setNoteToDeleteId(null)}>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                            <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400"/>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-100">Delete Note</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300">Are you sure you want to delete this sticky note? This action cannot be undone.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button onClick={() => setNoteToDeleteId(null)} className="w-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-2 px-4 rounded-lg transition-colors">
                            Cancel
                        </button>
                         <button onClick={confirmDeleteStickyNote} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>

            <SettingsModal 
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={settings}
                onSave={setSettings}
            />

        </div>
    );
};

export default App;
