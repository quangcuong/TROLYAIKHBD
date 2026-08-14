import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LessonPlanProvider } from './context/LessonPlanContext';
import { AppLayout } from './components/layout/AppLayout';
import { ErrorBoundary } from './components/ErrorBoundary';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreatePlanPage } from './pages/CreatePlanPage';
import { PlanDetailPage } from './pages/PlanDetailPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';
import { Lock, LogIn, Sparkles, ShieldAlert } from 'lucide-react';

function ProtectedRoute({
  children,
  onNavigate,
  requiredRole,
}: {
  children: React.ReactNode;
  onNavigate: (page: string) => void;
  requiredRole?: 'admin' | 'head_teacher' | 'teacher';
}) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-xs font-semibold text-slate-500">Đang kiểm tra thông tin phiên đăng nhập Supabase...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md py-12 text-center space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Trang Yêu cầu Đăng nhập</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Bảng điều khiển và các tính năng chuyên môn được bảo vệ. Vui lòng đăng nhập tài khoản giáo viên để tiếp tục.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => onNavigate('login')}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700"
            >
              <LogIn className="h-4 w-4" /> Đăng nhập ngay
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Tạo tài khoản giáo viên mới
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return (
      <div className="mx-auto max-w-md py-12 text-center space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Quyền Truy cập Hạn chế</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Trang này dành riêng cho vai trò {requiredRole === 'admin' ? 'Quản trị viên' : 'Tổ trưởng chuyên môn'}.
          </p>
          <button
            onClick={() => onNavigate('dashboard')}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900"
          >
            Quay lại Bảng điều khiển
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function MainAppContent() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [navigationParams, setNavigationParams] = useState<{ type?: string; planId?: string }>({});

  const handleNavigate = (page: string, params?: { type?: string; planId?: string }) => {
    setCurrentPage(page);
    if (params) {
      setNavigationParams(params);
    } else {
      setNavigationParams({});
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      case 'forgot_password':
        return <ForgotPasswordPage onNavigate={handleNavigate} />;
      case 'reset_password':
        return <ResetPasswordPage onNavigate={handleNavigate} />;
      case 'dashboard':
        return (
          <ProtectedRoute onNavigate={handleNavigate}>
            <DashboardPage onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      case 'create':
        return (
          <ProtectedRoute onNavigate={handleNavigate}>
            <CreatePlanPage onNavigate={handleNavigate} initialType={navigationParams.type} />
          </ProtectedRoute>
        );
      case 'plan_detail':
        return (
          <ProtectedRoute onNavigate={handleNavigate}>
            <PlanDetailPage planId={navigationParams.planId} onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      case 'settings':
        return (
          <ProtectedRoute onNavigate={handleNavigate}>
            <SettingsPage />
          </ProtectedRoute>
        );
      case 'admin':
        return (
          <ProtectedRoute onNavigate={handleNavigate} requiredRole="admin">
            <AdminPage />
          </ProtectedRoute>
        );
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <AppLayout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <LessonPlanProvider>
            <MainAppContent />
          </LessonPlanProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
