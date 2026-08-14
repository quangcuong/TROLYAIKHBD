# 💾 HƯỚNG DẪN SAO LƯU VÀ PHỤC HỒI DỮ LIỆU (DATABASE BACKUP & RESTORE GUIDE)

Tài liệu hướng dẫn quy trình sao lưu (Backup) tự động và phục hồi (Restore / Recovery) cơ sở dữ liệu Supabase PostgreSQL cho hệ thống Soạn Giáo Án AI.

---

## 1. 🔄 Phương Án Sao Lưu (Backup Strategies)

### Cách 1: Point-in-Time Recovery (PITR) Tự Động (Khuyên dùng cho Production)
Môi trường Supabase Pro mặc định hỗ trợ tính năng **PITR (Point-in-Time Recovery)** giúp khôi phục dữ liệu về đúng từng giây bất kỳ trong vòng 7–28 ngày gần nhất:
1. Truy cập **Supabase Dashboard** > Chọn Project.
2. Vào mục **Database** > **Backups** > **Point-in-Time Recovery**.
3. Chọn chính xác mốc thời gian (Timestamp) cần khôi phục và bấm **Restore**.

### Cách 2: Sao Lưu Thủ Công / Định Kỳ Bằng `pg_dump` CLI

Sử dụng công cụ `pg_dump` kết hợp với Supabase Direct Database Connection string:

```bash
# Biến môi trường
DB_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
BACKUP_FILE="backup_lesson_plans_$(date +%Y%m%d_%H%M%S).sql"

# Thực hiện Dump cơ sở dữ liệu (Bao gồm Schema và Data)
pg_dump "$DB_URL" --clean --if-exists --no-owner --no-privileges -f "$BACKUP_FILE"

# Nén file sao lưu
gzip "$BACKUP_FILE"
```

---

## 2. ⏪ Quy Trình Phục Hồi Dữ Liệu (Restore Procedure)

### Bước 1: Chuẩn bị Môi Trường Khôi Phục
- Kiểm tra tính toàn vẹn của file sao lưu `.sql` hoặc `.sql.gz`.
- Đảm bảo các kết nối ứng dụng đang được tạm dừng để tránh xung đột ghi dữ liệu trong lúc khôi phục.

### Bước 2: Thực Hiện Phục Hồi Bằng `psql`

```bash
# Giải nén file backup
gunzip backup_lesson_plans_20260804_120000.sql.gz

# Thực hiện khôi phục vào Database
psql "$DB_URL" -f backup_lesson_plans_20260804_120000.sql
```

---

## 3. 📂 Sao Lưu Tệp Tin Đính Kèm (Supabase Storage Backup)

Các file mẫu Word/PDF đính kèm lưu trữ tại Bucket `lesson-plan-documents` có thể được đồng bộ về kho lưu trữ an toàn định kỳ bằng Supabase CLI hoặc rclone:

```bash
# Đồng bộ bucket về thư mục cục bộ
supabase storage cp -r ss:///lesson-plan-documents ./storage_backup/
```

---

## 4. 🚨 Kế Hoạch Ứng Phó Sự Cố (Disaster Recovery Plan)

1. **Phát hiện lỗi dữ liệu/mất mát**: Xác định phạm vi ảnh hưởng (toàn bộ hay theo tài khoản).
2. **Kích hoạt chế độ Bảo trì**: Cập nhật trạng thái ứng dụng sang trang thông báo bảo trì tạm thời.
3. **Tiến hành Restore**: Khôi phục từ bản PITR gần nhất hoặc bản Dump thủ công gần nhất.
4. **Kiểm tra sau khôi phục**:
   - Chạy bộ kiểm thử tự động `npm test`.
   - Kiểm tra ngẫu nhiên 5 giáo án xem đầy đủ dữ liệu bài học và nội dung rich-text.
   - Thử nghiệm xuất file Word và PDF.
5. **Mở lại hệ thống**: Tắt trang bảo trì và ghi nhận báo cáo sự cố.
