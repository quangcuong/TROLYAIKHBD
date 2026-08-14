import { GoogleGenAI } from '@google/genai';

let genAIInstance: GoogleGenAI | null = null;

export function getGenAIClient(): GoogleGenAI {
  if (!genAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable is not defined.');
    }
    genAIInstance = new GoogleGenAI({
      apiKey: apiKey || 'missing_key',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIInstance;
}

export interface GeminiCallParams {
  model?: string;
  prompt: string;
  systemInstruction?: string;
  responseMimeType?: string;
  responseSchema?: any;
  timeoutMs?: number;
  maxRetries?: number;
}

export interface GeminiCallResult {
  text: string;
  modelUsed: string;
  durationMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  retriesCount: number;
  error?: string;
}

/**
 * Call Gemini API with timeout and bounded retry count.
 */
export async function callGeminiWithRetryAndTimeout(params: GeminiCallParams): Promise<GeminiCallResult> {
  const modelUsed = params.model || 'gemini-3.6-flash';
  const timeoutMs = params.timeoutMs || 60000; // 60 seconds default timeout
  const maxRetries = params.maxRetries !== undefined ? params.maxRetries : 2; // max 2 retries (total 3 attempts)

  let attempt = 0;
  let lastError: Error | null = null;
  const startTime = Date.now();

  while (attempt <= maxRetries) {
    attempt++;
    try {
      const ai = getGenAIClient();

      // Implement Timeout using Promise.race
      const callPromise = ai.models.generateContent({
        model: modelUsed,
        contents: params.prompt,
        config: {
          systemInstruction: params.systemInstruction,
          responseMimeType: params.responseMimeType || 'application/json',
          responseSchema: params.responseSchema,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Thao tác Gemini API bị quá thời gian (${timeoutMs}ms)`)), timeoutMs);
      });

      const response = await Promise.race([callPromise, timeoutPromise]);
      const durationMs = Date.now() - startTime;

      const rawText = response.text || '';
      const usage = response.usageMetadata;
      const promptTokens = usage?.promptTokenCount || 0;
      const completionTokens = usage?.candidatesTokenCount || 0;
      const totalTokens = usage?.totalTokenCount || promptTokens + completionTokens;

      return {
        text: rawText,
        modelUsed,
        durationMs,
        promptTokens,
        completionTokens,
        totalTokens,
        retriesCount: attempt - 1,
      };
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini API Call Attempt ${attempt}/${maxRetries + 1} failed]: ${err?.message}`);

      if (attempt <= maxRetries) {
        // Exponential backoff delay: 1s, 2s...
        const backoffMs = attempt * 1000;
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }

  const durationMs = Date.now() - startTime;
  return {
    text: '',
    modelUsed,
    durationMs,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    retriesCount: attempt - 1,
    error: lastError?.message || 'Lỗi không xác định khi gọi Gemini API',
  };
}
