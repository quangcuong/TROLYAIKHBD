import React, { useState } from 'react';
import { Sparkles, Mail, Lock, LogIn, Shield, BookOpen, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { signIn, login, isLoading, error, successMessage, clearMessages } = useAuth();
  const [email, setEmail] = useState('lyquangcuong01@gmail.com');
  const [password, setPassword] = useState('12345678');
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'head_teacher' | 'admin'>('teacher');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!email) return;

    const result = await signIn(email, password);
    if (result.success) {
      onNavigate('dashboard');
    }
  };

  const fillQuickAccount = (quickEmail: string, role: 'teacher' | 'head_teacher' | 'admin') => {
    setEmail(quickEmail);
    setSelectedRole(role);
    login(quickEmail, role);
    onNavigate('dashboard');
  };

  return (
    <div className="mx-auto max-w-md py-8 sm:py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Đăng nhập Trợ lý AI</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hệ thống Quản lý Giáo án & Hồ sơ Chuyên môn Giáo viên
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email giáo viên
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="giaovien@edu.vn"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Mật khẩu
              </label>
              <button
                type="button"
                onClick={() => {
                  clearMessages();
                  onNavigate('forgot_password');
                }}
                className="text-[11px] font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                Quên mật khẩu?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Đang đăng nhập...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" /> Đăng nhập
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Fill Buttons */}
        <div className="border-t border-slate-100 pt-4 dark:border-slate-800 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center">
            Đăng nhập nhanh với tài khoản mẫu
          </p>
          <div className="space-y-1.5">
            <button
              onClick={() => fillQuickAccount('lyquangcuong01@gmail.com', 'teacher')}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                <span className="font-semibold">Tài khoản Giáo viên</span>
              </div>
              <span className="text-[10px] text-slate-400">Giáo viên</span>
            </button>
            <button
              onClick={() => fillQuickAccount('minhkhoi.admin@soedu.gov.vn', 'admin')}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 hover:bg-purple-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-purple-500" />
                <span className="font-semibold">PGS. TSKH Đặng Minh Khôi</span>
              </div>
              <span className="text-[10px] text-slate-400">Quản trị viên</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          Chưa có tài khoản?{' '}
          <button
            onClick={() => {
              clearMessages();
              onNavigate('register');
            }}
            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Đăng ký giáo viên ngay
          </button>
        </div>
      </div>
    </div>
  );
};
