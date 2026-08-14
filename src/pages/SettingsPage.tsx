import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Sparkles,
  Moon,
  Sun,
  Save,
  Check,
  Building,
  GraduationCap,
  Layers,
  Calendar,
  AlertCircle,
  Loader2,
  Shield,
  BookOpen,
  Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const SettingsPage: React.FC = () => {
  const { user, profile, updateUserProfile, isLoading, error, successMessage, clearMessages } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [department, setDepartment] = useState('');
  const [subject, setSubject] = useState('');
  const [schoolLevel, setSchoolLevel] = useState('');
  const [defaultSchoolYear, setDefaultSchoolYear] = useState('');
  const [role, setRole] = useState<'teacher' | 'head_teacher' | 'admin'>('teacher');

  const [aiModel, setAiModel] = useState('gemini-2.0-flash');
  const [temperature, setTemperature] = useState(0.7);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state with profile and user context when updated
  useEffect(() => {
    setFullName(profile?.full_name ?? user?.name ?? '');
    setEmail(user?.email ?? 'lyquangcuong01@gmail.com');
    setSchoolName(profile?.school_name ?? user?.school ?? '');
    setDepartment(profile?.department ?? user?.department ?? '');
    setSubject(profile?.subject ?? user?.subject ?? '');
    setSchoolLevel(profile?.school_level ?? user?.schoolLevel ?? '');
    setDefaultSchoolYear(profile?.default_school_year ?? user?.defaultSchoolYear ?? '');
    setRole((profile?.role as any) ?? user?.role ?? 'teacher');
  }, [user, profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setValidationError(null);

    // Validate required fields
    if (!fullName.trim()) {
      setValidationError('Vui lòng nhập Họ và tên giáo viên.');
      return;
    }
    if (!schoolName.trim()) {
      setValidationError('Vui lòng nhập Trường công tác.');
      return;
    }
    if (!department.trim()) {
      setValidationError('Vui lòng nhập Tổ chuyên môn.');
      return;
    }
    if (!subject.trim()) {
      setValidationError('Vui lòng nhập Môn giảng dạy.');
      return;
    }
    if (!schoolLevel) {
      setValidationError('Vui lòng chọn Cấp học.');
      return;
    }
    if (!defaultSchoolYear) {
      setValidationError('Vui lòng chọn Năm học mặc định.');
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile({
        full_name: fullName.trim(),
        name: fullName.trim(),
        school_name: schoolName.trim(),
        school: schoolName.trim(),
        department: department.trim(),
        subject: subject.trim(),
        school_level: schoolLevel,
        schoolLevel: schoolLevel,
        default_school_year: defaultSchoolYear,
        defaultSchoolYear: defaultSchoolYear,
        role: role,
      });
    } catch (err: any) {
      setValidationError(err?.message || 'Có lỗi xảy ra khi lưu thông tin.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cài đặt – Hồ sơ giáo viên</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Quản lý thông tin hồ sơ giáo viên cá nhân và cấu hình môi trường giảng dạy
        </p>
      </div>

      {(error || validationError) && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-600 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{validationError || error}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-blue-500" />
              Thông tin Hồ sơ Giáo viên (Bảng profiles)
            </h2>
            <span className="text-[11px] text-slate-400 italic">* Trường bắt buộc</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Họ và tên *
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên giáo viên"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email tài khoản (Chỉ đọc)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2.5 pl-9 pr-3 text-xs text-slate-500 cursor-not-allowed dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                />
              </div>
            </div>

            {/* School Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Trường công tác *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Nhập tên trường công tác"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tổ chuyên môn *
              </label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Nhập tên tổ chuyên môn"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Môn giảng dạy *
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Nhập môn giảng dạy"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* School Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cấp học *
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={schoolLevel}
                  onChange={(e) => setSchoolLevel(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">-- Chọn cấp học --</option>
                  <option value="Tiểu học">Tiểu học</option>
                  <option value="THCS">THCS</option>
                  <option value="THPT">THPT</option>
                  <option value="Đại học / CĐ">Đại học / CĐ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>

            {/* Default School Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Năm học mặc định *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={defaultSchoolYear}
                  onChange={(e) => setDefaultSchoolYear(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">-- Chọn năm học --</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                  <option value="2027-2028">2027-2028</option>
                </select>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vai trò hệ thống (Role)
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="teacher">Giáo viên (teacher)</option>
                  <option value="head_teacher">Tổ trưởng chuyên môn (head_teacher)</option>
                  <option value="admin">Quản trị viên (admin)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* AI Model Config */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            Cấu hình Mô hình Gemini AI
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phiên bản mô hình AI
              </label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="gemini-2.0-flash">Gemini 2.0 Flash (Khuyên dùng - Phản hồi tức thì)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Suy luận sâu chuyên môn)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Độ sáng tạo (Temperature): {temperature}</span>
                <span className="text-slate-400 font-normal">Sáng tạo / Chuẩn mực</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">Giao diện Tối / Sáng</h3>
            <p className="text-[11px] text-slate-500">Chuyển đổi chế độ màu phù hợp ánh sáng phòng làm việc</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            <span>{theme === 'dark' ? 'Chế độ Tối' : 'Chế độ Sáng'}</span>
          </button>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving || isLoading}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {isSaving || isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Lưu thay đổi</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
