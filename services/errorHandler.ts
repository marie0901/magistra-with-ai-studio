export class APIError extends Error {
  constructor(public code: number, public status: string, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

export function parseGeminiError(error: any): APIError | null {
  console.log('Parsing error:', error);
  
  // Check standard Gemini error format
  if (error?.error?.code && error?.error?.status) {
    return new APIError(error.error.code, error.error.status, error.error.message);
  }
  
  // Check if error is thrown directly with error property
  if (error?.code && error?.status) {
    return new APIError(error.code, error.status, error.message);
  }
  
  // Check if it's a fetch response error
  if (error?.status === 503 || error?.message?.includes('503')) {
    return new APIError(503, 'UNAVAILABLE', 'The model is overloaded. Please try again later.');
  }
  
  return null;
}

export async function showRetryDialog(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const result = window.confirm(`${message}\n\nClick OK to retry, or Cancel to use default response.`);
    resolve(result);
  });
}