import { GoogleGenAI, Type } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY;

if (!apiKey) {
  throw new Error('API_KEY environment variable not set');
}

const ai = new GoogleGenAI({ apiKey });

export class GeminiService {
  async evaluateTranslation(original: string, translation: string, targetLang: string): Promise<{
    score: number;
    feedback: string;
    corrections?: string;
    vocabularyWords?: Array<{word: string; translation: string; context: string}>;
  }> {
    try {
      const response = await ai.models.generateContent({
        model: 'models/gemini-2.5-pro',
        contents: `ORIGINAL TEXT: "${original}"
USER'S ${targetLang.toUpperCase()} TRANSLATION: "${translation}"`,
        config: {
          systemInstruction: `You are a professional ${targetLang} language assessment expert with 20+ years of experience. Your task is to rigorously evaluate translation quality.

EVALUATION CRITERIA:
- ACCURACY: Does the translation convey the exact meaning? (40 points)
- GRAMMAR: Correct verb conjugations, noun-adjective agreement, syntax? (30 points)  
- FLUENCY: Natural ${targetLang} expression and word choice? (20 points)
- COMPLETENESS: All elements translated without omissions? (10 points)

SCORING GUIDELINES:
- 90-100: Excellent - Minor stylistic improvements only
- 80-89: Good - Few grammatical errors, meaning clear
- 70-79: Adequate - Some errors but generally understandable
- 60-69: Poor - Multiple errors affecting comprehension
- 50-59: Very Poor - Significant errors, meaning unclear
- 0-49: Unacceptable - Major errors, wrong meaning, or nonsensical

Be STRICT but fair. Wrong translations should score below 50. Completely incorrect or nonsensical translations should score 0-20.

Provide specific feedback citing exact errors and corrections.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: {
                type: Type.NUMBER,
                description: 'Strict score from 0 to 100 based on accuracy, grammar, fluency, completeness'
              },
              feedback: {
                type: Type.STRING,
                description: 'Detailed analysis citing specific errors, corrections, and improvements needed'
              },
              corrections: {
                type: Type.STRING,
                description: 'Corrected translation if score < 90, otherwise empty string'
              },
              vocabularyWords: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING, description: 'Word from original text' },
                    translation: { type: Type.STRING, description: `Correct ${targetLang} translation` },
                    context: { type: Type.STRING, description: 'Usage context or grammar note' }
                  }
                },
                description: '2-3 challenging vocabulary words from the original text'
              }
            }
          }
        }
      });
      
      const result = JSON.parse(response.text.trim());
      return {
        score: result.score ?? 50,
        feedback: result.feedback || 'Good effort! Keep practicing.',
        corrections: result.corrections,
        vocabularyWords: result.vocabularyWords || []
      };
    } catch (error) {
      console.error('Translation evaluation failed:', error);
      return {
        score: 50,
        feedback: 'Unable to evaluate translation right now. Keep practicing!',
      };
    }
  }

  async chatResponse(message: string, context?: string): Promise<{text: string; stickerTitle: string}> {
    try {
      const response = await ai.models.generateContent({
        model: 'models/gemini-2.5-pro',
        contents: `USER'S QUESTION: "${message}"`,
        config: {
          systemInstruction: `You are a grammar-focused language assistant. Provide direct, concise answers without greetings, encouragement, or conversational elements.
- Answer only what is asked
- Focus on grammar, vocabulary, conjugations, and translations
- Use minimal words
- No "great question" or "keep practicing" comments
- Be factual and precise
- Format responses as tables when possible (verb conjugations, comparisons, rules)
- Use markdown table format: | Header | Header | \n |--------|--------| \n | Cell | Cell |
- Structure content to be useful as a reference sticker
${context ? `\nContext: ${context}` : ''}`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: {
                type: Type.STRING,
                description: 'Direct answer to the user question'
              },
              stickerTitle: {
                type: Type.STRING,
                description: 'Short 2-4 word title for creating a sticker from this response'
              }
            }
          }
        },
      });
      
      const result = JSON.parse(response.text.trim());
      return {
        text: result.text || "I'm here to help with your language learning journey!",
        stickerTitle: result.stickerTitle || 'Grammar Tip'
      };
    } catch (error) {
      console.error('Chat response failed:', error);
      return {
        text: "I'm having trouble responding right now, but I'm here to help with your language learning!",
        stickerTitle: 'Grammar Tip'
      };
    }
  }

  async simplifyText(text: string, targetLevel: string = 'beginner'): Promise<string> {
    try {
      const response = await ai.models.generateContent({
                    model: 'models/gemini-2.5-pro',
                    contents: `Simplify this text for a ${targetLevel} learner: "${text}"`,        config: {
          systemInstruction: `You are an expert text simplification engine for language learners. Your task is to rewrite text for a student whose proficiency in the target language is extremely low, around 10 out of 100. Use a very limited vocabulary and extremely simple sentence structures, as if explaining to a young child.

- Your primary goal is to make the text understandable to an absolute beginner.
- You MUST aggressively replace words with their simplest possible synonyms.
- Prioritize core meaning over nuance. It is acceptable to lose some subtlety for the sake of clarity.
- Break down sentences into shorter, simpler structures.
- CRITICAL: Your response MUST contain ONLY the simplified text. Do NOT include any explanations, apologies, or conversational filler.
- You must attempt to simplify every text. Do not return the original text unless it is already composed of the simplest possible words (e.g., "The cat sat.").`,
        }
      });
      
      let simplified = response.text.trim();

      // Clean up potential conversational filler and list formatting from the response.
      const lines = simplified.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      if (lines.length > 1) {
        // Find the first line that looks like a real sentence, not a header.
        const firstRealLineIndex = lines.findIndex(line => !/^(option \d|here are)/i.test(line));
        if (firstRealLineIndex !== -1) {
          // Take the first "real" line, assuming it's the primary simplification.
          simplified = lines[firstRealLineIndex];
        } else {
          // If all lines look like headers (unlikely), default to the first line.
          simplified = lines[0];
        }
      }
      
      // Remove any lingering quote marks around the whole string.
      simplified = simplified.replace(/^"|"$/g, '').trim();

      console.log('Simplification result:', { original: text, simplified });
      
      return simplified || text; // Return simplified text, or original if empty
    } catch (error) {
      console.error('Text simplification failed:', error);
      return text; // Return original text on error
    }
  }

  async translateText(text: string, targetLang: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'models/gemini-2.5-pro',
        contents: `Translate this text to ${targetLang}: "${text}"`,
        config: {
          systemInstruction: `You are a professional translator. Provide only the translation without any explanations or additional text.`,
        }
      });
      
      return response.text.trim();
    } catch (error) {
      console.error('Text translation failed:', error);
      return 'Translation unavailable';
    }
  }

  async extractVocabulary(text: string, targetLang: string): Promise<Array<{word: string; translation: string; context: string}>> {
    try {
      const response = await ai.models.generateContent({
        model: 'models/gemini-2.5-pro',
        contents: `Text: "${text}"`,
        config: {
          systemInstruction: `Extract 3-5 challenging vocabulary words from this text for a ${targetLang} language learner. For each word, provide the ${targetLang} translation and a brief context note.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              words: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    translation: { type: Type.STRING },
                    context: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });
      
      const result = JSON.parse(response.text.trim());
      return result.words || [];
    } catch (error) {
      console.error('Vocabulary extraction failed:', error);
      return [];
    }
  }


}

// Export singleton instance
export const geminiService = new GeminiService();