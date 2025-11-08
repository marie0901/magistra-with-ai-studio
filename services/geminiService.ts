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
        model: 'gemini-2.5-flash',
        contents: `Source Text: "${original}"
User's Translation: "${translation}"`,
        config: {
          systemInstruction: `You are an expert ${targetLang} language tutor. Evaluate the user's translation with detailed analysis:

1. Score (0-100): Rate accuracy, grammar, and fluency
2. Feedback: Provide specific, constructive feedback explaining errors and improvements
3. Corrections: If score < 90, provide the corrected translation
4. Vocabulary: Extract 2-3 challenging words from the original text with ${targetLang} translations

Be encouraging but precise in your assessment.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: {
                type: Type.NUMBER,
                description: 'Score from 0 to 100 for the translation quality'
              },
              feedback: {
                type: Type.STRING,
                description: 'Detailed constructive feedback with specific improvements'
              },
              corrections: {
                type: Type.STRING,
                description: 'Corrected translation if score < 90, otherwise empty'
              },
              vocabularyWords: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING, description: 'English word' },
                    translation: { type: Type.STRING, description: `${targetLang} translation` },
                    context: { type: Type.STRING, description: 'Brief context or usage note' }
                  }
                },
                description: '2-3 challenging vocabulary words from the text'
              }
            }
          }
        }
      });
      
      const result = JSON.parse(response.text.trim());
      return {
        score: result.score || 50,
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

  async chatResponse(message: string, context?: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `USER'S QUESTION: "${message}"`,
        config: {
          systemInstruction: `You are a friendly and knowledgeable language tutor AI. Your role is to help a student who is learning a new language.
- Answer the user's questions clearly and concisely.
- You can answer questions about grammar, vocabulary, verb conjugations, cultural context, or provide translations.
- Keep your tone encouraging and helpful.
- Focus on answering their specific question.
${context ? `\nContext: ${context}` : ''}`,
        },
      });
      
      return response.text.trim() || "I'm here to help with your language learning journey!";
    } catch (error) {
      console.error('Chat response failed:', error);
      return "I'm having trouble responding right now, but I'm here to help with your language learning!";
    }
  }

  async simplifyText(text: string, targetLevel: string = 'beginner'): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Original text: "${text}"`,
        config: {
          systemInstruction: `You are an expert in adapting text for language learners. Simplify the following text to make it easier for a ${targetLevel} learner to translate. Use more common vocabulary and simpler grammatical structures, but ensure the core meaning of the text is preserved. Provide only the simplified text.`,
        },
      });
      
      return response.text.trim() || text;
    } catch (error) {
      console.error('Text simplification failed:', error);
      return text;
    }
  }

  async extractVocabulary(text: string, targetLang: string): Promise<Array<{word: string; translation: string; context: string}>> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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