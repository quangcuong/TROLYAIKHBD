/**
 * Export utilities for filename normalization and HTML processing.
 */

/**
 * Normalizes filenames for Vietnamese text without losing meaning or causing OS encoding issues.
 * Replaces spaces with underscores and strips invalid filesystem characters.
 */
export function normalizeExportFilename(
  title: string,
  extension: 'docx' | 'pdf',
  subject?: string
): string {
  if (!title || !title.trim()) {
    title = 'Giao_An_Bai_Day';
  }

  // Remove accents for clean filename prefix while keeping readable slug
  const removeAccents = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  };

  let cleanTitle = removeAccents(title.trim())
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');

  if (cleanTitle.length > 60) {
    cleanTitle = cleanTitle.substring(0, 60);
  }

  let cleanSubject = subject
    ? removeAccents(subject.trim())
        .replace(/[^a-zA-Z0-9\s_-]/g, '')
        .replace(/\s+/g, '_')
    : '';

  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = 'GiaoAn';

  let filename = `${prefix}_${cleanTitle}`;
  if (cleanSubject) {
    filename += `_${cleanSubject}`;
  }
  filename += `_${timestamp}.${extension}`;

  return filename;
}

/**
 * Basic HTML tag stripper for plain text extraction
 */
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}
