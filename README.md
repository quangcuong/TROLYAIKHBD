# 📘 Hệ Thống Trợ Lý AI Soạn Giáo ÁN Chuẩn GDPT 2018 (Lesson Plan AI Assistant)

Hệ thống ứng dụng AI hỗ trợ Giáo viên Việt Nam khởi tạo, trích xuất, biên soạn, thẩm định và xuất bản Giáo án/Kế hoạch bài dạy (KHBD) chuẩn Công văn 5512/BGDĐT.

---

## 🌟 Tính Năng Nổi Bật

1. **Pipeline AI 5 Bước Chuyên Sâu**:
   - **Bước 1**: Phân tích cấu trúc mẫu giáo án (Word/PDF).
   - **Bước 2**: Trích xuất nội dung từ SGK & Tài liệu giảng dạy.
   - **Bước 3**: Sinh giáo án đầy đủ chuẩn 4 hoạt động Công văn 5512.
   - **Bước 4**: Thẩm định và chấm điểm chất lượng sư phạm.
   - **Bước 5**: Chỉnh sửa theo từng hoạt động / viết lại đoạn văn bản.
2. **Trình Bỏ Soạn Thảo Rich-Text Tiptap**:
   - Hỗ trợ định dạng bảng, danh sách, tiêu đề, highlight, canh lề.
   - Tự động đồng bộ và lưu nháp theo thời gian thực.
3. **Xuất File Chuẩn Xuất Bản**:
   - **Word (DOCX)**: Định dạng A4, Font Times New Roman 13-14pt, lề chuẩn, bảng biểu rõ ràng, khu vực ký duyệt BGH/Tổ chuyên môn.
   - **PDF**: Định dạng chuẩn trang, bảo toàn font tiếng Việt.
4. **Bảo Mật & Quản Trị Hệ Thống (Dashboard & Admin)**:
   - Thống kê giáo án, tìm kiếm, lọc theo môn, lớp, trạng thái.
   - Trang Admin kiểm soát người dùng, hạn mức AI, nhật ký lỗi và cấu hình hệ thống.
   - Bảo mật Server-side cho API Key, Sanitization XSS, Rate Limiting và Supabase RLS.

---

## 🏗️ Kiến Trúc Hệ Thống

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Tiptap Editor.
- **Backend**: Node.js, Express, Multer, Zod, Rate Limiter.
- **AI Core**: Google Gemini API (`@google/genai` SDK - Server-side only).
- **Database & Storage**: Supabase (PostgreSQL + RLS + Auth + Storage Buckets).
- **Export Engines**: `docx` (Word) & `@react-pdf/renderer` / Puppeteer HTML-to-PDF.

---

## 🚀 Hướng Dẫn Cài Đặt & Phát Triển Cục Bộ (Local Development)

### 1. Khởi tạo dự án
```bash
git clone <repository-url>
cd <repository-folder>
npm install
```

### 2. Thiết lập Biến Môi Trường
Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```
Điền các thông tin:
```env
GEMINI_API_KEY=AIzaSy...
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

### 3. Chạy môi trường Dev
```bash
npm run dev
```
Truy cập trình duyệt tại: `http://localhost:3000`

### 4. Chạy Kiểm Thử (Tests)
```bash
npm test
```

---

## 🌐 Hướng Dẫn Triển Khai (Deployment)

### Option 1: Triển khai trên Vercel (Recommended for Frontend & Serverless API)

1. **Import dự án lên Vercel**:
   - Kết nối Vercel với GitHub Repository của bạn.
2. **Cấu hình Environment Variables trong Vercel Dashboard**:
   - `GEMINI_API_KEY`: API Key của Google AI Studio.
   - `VITE_SUPABASE_URL`: Đường dẫn URL dự án Supabase.
   - `VITE_SUPABASE_ANON_KEY`: Anon Public Key.
   - `SUPABASE_SERVICE_ROLE_KEY`: Service Role Key (Server-only).
3. **Build & Output Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Deploy**:
   - Bấm nút **Deploy**. Vercel sẽ tự động build ứng dụng và khởi tạo Serverless API routes từ Server Express.

### Option 2: Triển khai bằng Docker / Cloud Run

1. **Build Docker Container**:
   ```bash
   docker build -t lesson-plan-ai .
   ```
2. **Run Container**:
   ```bash
   docker run -d -p 3000:3000 --env-file .env lesson-plan-ai
   ```

---

## 🛡️ Kiểm Tra Bảo Mật & Tuân Thủ

- **Rate Limiting**: Giới hạn tối đa 20 lượt gọi API AI/phút/IP để chống quá tải tài nguyên.
- **XSS Prevention**: Mọi nội dung HTML từ AI hoặc nhập từ người dùng được lọc bằng DOMPurify trước khi render.
- **MIME & File Size Limit**: Chặn file chứa Macro (`.docm`), giới hạn file tải lên tối đa 25MB.
- **Secrets Management**: `GEMINI_API_KEY` và `SUPABASE_SERVICE_ROLE_KEY` tuyệt đối không bị đóng gói vào bundle client.
