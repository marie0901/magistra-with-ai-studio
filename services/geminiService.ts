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
  }> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Source Text: "${original}"
User's Translation: "${translation}"`,
        config: {
          systemInstruction: `You are an expert language tutor. Evaluate the user's translation of a text into ${targetLang}. Provide a score from 0 to 100 on the accuracy, grammar, and fluency of the user's translation. Also, provide brief, constructive, and encouraging feedback in one or two sentences, explaining any key errors and how to improve.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: {
                type: Type.NUMBER,
                description: 'A score from 0 to 100 for the translation.'
              },
              feedback: {
                type: Type.STRING,
                description: 'Constructive feedback for the user in 1-2 sentences.'
              }
            }
          }
        }
      });
      
      const result = JSON.parse(response.text.trim());
      return {
        score: result.score || 50,
        feedback: result.feedback || 'Good effort! Keep practicing.',
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
}

// Export singleton instance
export const geminiService = new GeminiService();