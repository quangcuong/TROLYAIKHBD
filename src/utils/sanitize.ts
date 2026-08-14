import DOMPurify from 'dompurify';

/**
 * Sanitize HTML string to prevent XSS attacks while keeping essential formatting tags.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // If running in browser environment with DOMPurify
  if (typeof window !== 'undefined' && DOMPurify && typeof DOMPurify.sanitize === 'function') {
    return DOMPurify.sanitize(html, {
      ADD_TAGS: ['table', 'thead', 'tbody', 'tr', 'td', 'th', 'p', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'strong', 'em', 'u', 'span', 'div', 'br'],
      ADD_ATTR: ['colspan', 'rowspan', 'style', 'class', 'align'],
    });
  }

  // Fallback regex sanitizer for server-side / Vitest environment without DOM window
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '');
}
