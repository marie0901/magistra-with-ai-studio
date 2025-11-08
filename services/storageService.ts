import type { Fragment, VocabularyItem, StickyNoteData } from '../types';

interface ProgressData {
  sessionOffset: number;
  learningFragments: Fragment[];
  currentFragmentId: number | null;
  vocabulary: VocabularyItem[];
  stickyNotes: StickyNoteData[];
  targetLanguage: string;
  bookText: string;
  lastUpdated: number;
}

export class StorageService {
  private static readonly PROGRESS_KEY = 'magistra_progress';
  private static readonly VOCABULARY_KEY = 'magistra_vocabulary';

  static saveProgress(data: Partial<ProgressData>): void {
    try {
      const existing = this.loadProgress();
      const updated = {
        ...existing,
        ...data,
        lastUpdated: Date.now()
      };
      localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  static loadProgress(): ProgressData | null {
    try {
      const stored = localStorage.getItem(this.PROGRESS_KEY);
      if (!stored) return null;
      
      const data = JSON.parse(stored);
      // Check if data is recent (within 7 days)
      if (Date.now() - data.lastUpdated > 7 * 24 * 60 * 60 * 1000) {
        this.clearProgress();
        return null;
      }
      return data;
    } catch (error) {
      console.error('Failed to load progress:', error);
      return null;
    }
  }

  static clearProgress(): void {
    try {
      localStorage.removeItem(this.PROGRESS_KEY);
    } catch (error) {
      console.error('Failed to clear progress:', error);
    }
  }

  static addVocabularyWords(words: VocabularyItem[]): void {
    try {
      const existing = this.loadVocabulary();
      const combined = [...existing];
      
      words.forEach(newWord => {
        if (!combined.find(w => w.original === newWord.original)) {
          combined.push(newWord);
        }
      });
      
      localStorage.setItem(this.VOCABULARY_KEY, JSON.stringify(combined));
    } catch (error) {
      console.error('Failed to add vocabulary:', error);
    }
  }

  static loadVocabulary(): VocabularyItem[] {
    try {
      const stored = localStorage.getItem(this.VOCABULARY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load vocabulary:', error);
      return [];
    }
  }

  static saveVocabulary(vocabulary: VocabularyItem[]): void {
    try {
      localStorage.setItem(this.VOCABULARY_KEY, JSON.stringify(vocabulary));
    } catch (error) {
      console.error('Failed to save vocabulary:', error);
    }
  }

  static clearVocabulary(): void {
    try {
      localStorage.removeItem(this.VOCABULARY_KEY);
    } catch (error) {
      console.error('Failed to clear vocabulary:', error);
    }
  }
}