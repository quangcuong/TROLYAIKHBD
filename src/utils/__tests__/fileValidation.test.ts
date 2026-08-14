import { describe, it, expect } from 'vitest';
import {
  validateFile,
  normalizeFileName,
  checkFileOwnership,
  MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE_BYTES,
} from '../fileValidation';

describe('File Validation Unit Tests', () => {
  it('should accept valid PDF file within size limit', () => {
    const file = {
      name: 'GiaoAn_VatLy10.pdf',
      size: 5 * 1024 * 1024, // 5MB
      type: 'application/pdf',
    };
    const result = validateFile(file);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept valid DOCX file within size limit', () => {
    const file = {
      name: 'GiaoAn_GiaoDuc10.docx',
      size: 10 * 1024 * 1024, // 10MB
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it('should reject DOCM files explicitly', () => {
    const file = {
      name: 'GiaoAn_ChuaMacro.docm',
      size: 2 * 1024 * 1024,
      type: 'application/vnd.ms-word.document.macroEnabled.12',
    };
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('KHÔNG chấp nhận file Word chứa Macro (.docm)');
  });

  it('should reject disallowed extensions like .exe, .png, .doc', () => {
    const invalidFiles = [
      { name: 'document.doc', size: 1000, type: 'application/msword' },
      { name: 'script.exe', size: 1000, type: 'application/x-msdownload' },
      { name: 'image.png', size: 1000, type: 'image/png' },
      { name: 'archive.zip', size: 1000, type: 'application/zip' },
    ];

    invalidFiles.forEach((file) => {
      const result = validateFile(file);
      expect(result.valid).toBe(false);
    });
  });

  it('should reject files exceeding MAX_FILE_SIZE_MB', () => {
    const file = {
      name: 'Heavy_Document.pdf',
      size: 30 * 1024 * 1024, // 30MB > 25MB
      type: 'application/pdf',
    };
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain(`vượt quá giới hạn tối đa ${MAX_FILE_SIZE_MB}MB`);
  });

  it('should normalize filenames correctly removing Vietnamese diacritics and special chars', () => {
    expect(normalizeFileName('Giáo án Mẫu (Vật lý 10).docx')).toBe('Giao_an_Mau_Vat_ly_10.docx');
    expect(normalizeFileName('Phân phối chương trình 2026!@#.PDF')).toBe('Phan_phoi_chuong_trinh_2026.pdf');
    expect(normalizeFileName('   tài liệu tham khảo   .docx')).toBe('tai_lieu_tham_khao.docx');
    expect(normalizeFileName('')).toBe('unnamed_file');
  });
});

describe('Ownership Access Control Unit Tests', () => {
  it('should return true if current user matches resource owner', () => {
    expect(checkFileOwnership('usr_123', 'usr_123', false)).toBe(true);
  });

  it('should return false if current user does not match resource owner', () => {
    expect(checkFileOwnership('usr_123', 'usr_456', false)).toBe(false);
  });

  it('should return true for admin user regardless of owner', () => {
    expect(checkFileOwnership('usr_123', 'usr_456', true)).toBe(true);
  });

  it('should return false if resourceUserId or currentUserId is missing', () => {
    expect(checkFileOwnership(undefined, 'usr_123', false)).toBe(false);
    expect(checkFileOwnership('usr_123', null, false)).toBe(false);
  });
});
