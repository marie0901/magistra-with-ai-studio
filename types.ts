
export type Theme = 'light' | 'dark';

export type FragmentStatus = 'completed' | 'current' | 'pending';

export interface Fragment {
  id: number;
  text: string;
  status: FragmentStatus;
  score?: number;
  isSimplified?: boolean;
}

export interface VocabularyItem {
  original: string;
  translation: string;
  context: string;
  addedFrom: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface StickyNoteData {
  id: number;
  title: string;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  minimized: boolean;
  lastPosition?: { x: number; y: number };
  lastSize?: { width: number; height: number };
}

export interface WindowState {
  id: 'book' | 'learning' | 'ai';
  position: { x: number; y: number };
  size: { width: number | string; height: number | string };
  zIndex: number;
  minimized: boolean;
  isMaximized: boolean;
  isCollapsed: boolean;
  lastPosition?: { x: number; y: number };
  lastSize?: { width: number | string; height: number | string };
}

export type LayoutSchema = 'default' | 'focus' | 'reading' | 'compact';