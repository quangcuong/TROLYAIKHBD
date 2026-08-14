import { describe, it, expect } from 'vitest';
import { normalizeExportFilename, stripHtmlTags } from '../utils/exportUtils';
import { exportService } from '../services/exportService';
import { DbLessonPlan } from '../types/database';

describe('Milestone 8: Lesson Plan Export Service Tests', () => {
  const mockLessonPlan: DbLessonPlan = {
    id: 'lp_test_001',
    user_id: 'usr_001',
    title: 'Bài 15: Định luật II Newton và Bài tập áp dụng',
    type: '5512',
    subject: 'Vật lý',
    grade: 'Lớp 10',
    textbook: 'Kết nối tri thức',
    duration: '2 tiết (90 phút)',
    summary: 'Giúp học sinh nắm vững công thức F = ma và giải các bài tập vận dụng.',
    status: 'draft',
    content: {},
    metadata: {
      editor_html: `
        <h1>I. MỤC TIÊU BÀI HỌC</h1>
        <p>1. Về kiến thức: Phát biểu được định luật II Newton, viết được công thức <strong>F = ma</strong>.</p>
        <p>2. Về năng lực: Giải được các bài toán cơ bản về chuyển động thẳng biến đổi đều.</p>
        <h2>II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</h2>
        <p>Phiếu học tập, máy chiếu, bộ thí nghiệm lực và gia tốc.</p>
        <h2>III. TIẾN TRÌNH DẠY HỌC</h2>
        <table>
          <thead>
            <tr>
              <th>Hoạt động</th>
              <th>Mục tiêu</th>
              <th>Nội dung</th>
              <th>Sản phẩm</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Hoạt động 1: Khởi động</td>
              <td>Tạo tình huống học tập</td>
              <td>Xem video xe ô tô hãm phanh</td>
              <td>Câu trả lời của HS</td>
            </tr>
            <tr>
              <td>Hoạt động 2: Hình thành kiến thức</td>
              <td>Xây dựng công thức F = ma</td>
              <td>Thí nghiệm đo gia tốc a theo lực F</td>
              <td>Báo cáo kết quả thí nghiệm</td>
            </tr>
          </tbody>
        </table>
      `,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  describe('Filename Normalization Tests', () => {
    it('should normalize Vietnamese title and subject into clean filesystem safe filename for DOCX', () => {
      const filename = normalizeExportFilename(
        'Bài 15: Định luật II Newton & Bài tập',
        'docx',
        'Vật lý'
      );

      expect(filename).toContain('GiaoAn_Bai_15_Dinh_luat_II_Newton_Bai_tap_Vat_ly_');
      expect(filename.endsWith('.docx')).toBe(true);
      expect(filename).not.toMatch(/[àáảãạđêơư]/i);
    });

    it('should normalize filename for PDF with empty subject fallback', () => {
      const filename = normalizeExportFilename('Giáo án STEM: Tên gỉ tên gì', 'pdf');

      expect(filename).toContain('GiaoAn_Giao_an_STEM_Ten_gi_ten_gi_');
      expect(filename.endsWith('.pdf')).toBe(true);
    });

    it('should fall back to default title if empty string is provided', () => {
      const filename = normalizeExportFilename('', 'docx');
      expect(filename).toContain('GiaoAn_Giao_An_Bai_Day');
      expect(filename.endsWith('.docx')).toBe(true);
    });
  });

  describe('HTML Stripper Tests', () => {
    it('should strip HTML tags while preserving text lines', () => {
      const html = '<h1>I. MỤC TIÊU</h1><p>Học sinh nắm <strong>kiến thức</strong>.</p>';
      const plain = stripHtmlTags(html);
      expect(plain).toContain('I. MỤC TIÊU');
      expect(plain).toContain('Học sinh nắm kiến thức.');
      expect(plain).not.toContain('<h1>');
      expect(plain).not.toContain('<strong>');
    });
  });

  describe('DOCX Export Generation Tests', () => {
    it('should generate a valid binary DOCX buffer with tables and headers', async () => {
      const { buffer, filename } = await exportService.generateDocx(mockLessonPlan);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(1000);
      expect(filename).toContain('GiaoAn_Bai_15_Dinh_luat_II_Newton_va_Bai_tap_ap_dung');
      expect(filename.endsWith('.docx')).toBe(true);
      // PK header check for zip/docx format
      expect(buffer[0]).toBe(0x50); // 'P'
      expect(buffer[1]).toBe(0x4b); // 'K'
    });
  });

  describe('PDF Export Generation Tests', () => {
    it('should generate a valid PDF buffer starting with %PDF', async () => {
      const { buffer, filename } = await exportService.generatePdf(mockLessonPlan);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(500);
      expect(filename.endsWith('.pdf')).toBe(true);

      const headerStr = buffer.subarray(0, 5).toString('ascii');
      expect(headerStr).toBe('%PDF-');
    });
  });
});
