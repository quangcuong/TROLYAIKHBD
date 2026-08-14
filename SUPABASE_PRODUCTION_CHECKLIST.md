# 📋 SUPABASE PRODUCTION CONFIGURATION CHECKLIST

Tài liệu này cung cấp danh mục kiểm tra đầy đủ giúp thiết lập môi trường Supabase Production an toàn, tối ưu hiệu năng và bảo mật triệt để cho hệ thống Soạn Giáo Án AI.

---

## 1. 🔑 Cấu Hình Auth & Quản Lý Phiên (Authentication)

- [x] **Bật Email Confirmation**: Trong Supabase Dashboard > Authentication > Providers > Email, đảm bảo bật `Confirm email` để tránh spam đăng ký tài khoản giả mạo.
- [x] **Bật Secure Cookies**: Đảm bảo cấu hình SSL/HTTPS cho Domain sản xuất.
- [x] **Cấu hình Redirect URLs**: Thêm domain triển khai chính thức (ví dụ `https://your-domain.com/auth/callback`) vào danh sách Site URL & Redirect URLs cho phép.
- [x] **Rate Limit Đăng Nhập / Đăng Ký**: Giới hạn tần suất tạo tài khoản trong Auth Settings (mặc định 30 email/giờ/IP).

---

## 2. 🛡️ Chính Sách Bảo Mật Dữ Liệu Row Level Security (RLS)

Đảm bảo tất cả bảng trong Database đều đã bật `ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;`.

### Bảng `lesson_plans`
```sql
-- 1. Quyền Xem (SELECT): Giáo viên sở hữu HOẶC Quản trị viên (Admin)
CREATE POLICY "Users can view own lesson plans or if admin"
ON public.lesson_plans FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 2. Quyền Thêm mới (INSERT): Người dùng đã xác thực
CREATE POLICY "Users can insert own lesson plans"
ON public.lesson_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Quyền Cập nhật (UPDATE): Chủ sở hữu
CREATE POLICY "Users can update own lesson plans"
ON public.lesson_plans FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Quyền Xóa (DELETE): Chủ sở hữu HOẶC Admin
CREATE POLICY "Users or admin can delete lesson plans"
ON public.lesson_plans FOR DELETE
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
```

### Bảng `lesson_plan_files`
```sql
CREATE POLICY "Users can access own files"
ON public.lesson_plan_files FOR ALL
USING (auth.uid() = user_id);
```

---

## 3. 🗄️ Cấu Hình Storage Buckets (Tệp Tải Lên)

- [x] **Tạo Bucket Private**: Tạo bucket `lesson-plan-documents` ở chế độ Private (không chọn Public Bucket).
- [x] **Thiết lập MIME Type Allowed**:
  - `application/pdf`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- [x] **Thiết lập Max Upload Size**: Cấu hình tối đa 25MB (`26214400 bytes`).
- [x] **Storage Policy**:
```sql
CREATE POLICY "Allow authenticated users to upload and read their own folder files"
ON storage.objects FOR ALL
USING (
  bucket_id = 'lesson-plan-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## 4. ⚡ Chỉ Mục Hiệu Năng (Database Indexes)

Tạo các indexes sau để tối ưu hóa truy vấn phân trang và lọc dữ liệu:

```sql
-- Index cho lọc giáo án theo User, Môn học, Cấp học và Trạng thái
CREATE INDEX IF NOT EXISTS idx_lesson_plans_user_status ON public.lesson_plans(user_id, status);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_subject_grade ON public.lesson_plans(subject, grade);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_updated_at ON public.lesson_plans(updated_at DESC);

-- Index cho tìm kiếm văn bản nhanh (Full-Text Search)
CREATE INDEX IF NOT EXISTS idx_lesson_plans_title_trgm ON public.lesson_plans USING gin (title gin_trgm_ops);

-- Index cho bảng đếm nhật ký AI
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_date ON public.ai_usage_logs(user_id, created_at);
```

---

## 5. 🔐 Bảo Mật API Keys

- [x] **VITE_SUPABASE_ANON_KEY**: An toàn khi để ở client frontend (chỉ hoạt động khi RLS đã được bật đúng).
- [x] **SUPABASE_SERVICE_ROLE_KEY**: Tuyệt đối KHÔNG đưa vào biến VITE_* hoặc code client. Chỉ sử dụng trong môi trường Serverless / Backend NodeJS có bảo vệ.
