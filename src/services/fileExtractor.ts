import mammoth from 'mammoth';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export interface ExtractionResult {
  text: string;
  wordCount: number;
  characterCount: number;
  error?: string;
}

/**
 * Extracts plain text from DOCX or PDF buffer
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  fileNameOrMime: string
): Promise<ExtractionResult> {
  const lowerName = fileNameOrMime.toLowerCase();

  try {
    let extractedText = '';

    if (lowerName.endsWith('.docx') || lowerName.includes('wordprocessingml')) {
      // DOCX Extraction via Mammoth
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || '';
    } else if (lowerName.endsWith('.pdf') || lowerName.includes('pdf')) {
      // PDF Extraction via pdf-parse
      const data = await pdfParse(buffer);
      extractedText = data.text || '';
    } else {
      return {
        text: '',
        wordCount: 0,
        characterCount: 0,
        error: 'Định dạng file không hỗ trợ trích xuất văn bản (Chỉ hỗ trợ .pdf và .docx)',
      };
    }

    // Clean up text
    const cleanText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const words = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
    const chars = cleanText.length;

    return {
      text: cleanText,
      wordCount: words,
      characterCount: chars,
    };
  } catch (err: any) {
    console.error('Text extraction failed:', err);
    return {
      text: '',
      wordCount: 0,
      characterCount: 0,
      error: `Lỗi trích xuất văn bản: ${err.message || 'Không thể đọc tập tin'}`,
    };
  }
}
