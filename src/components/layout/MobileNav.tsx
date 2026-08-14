import React from 'react';
import {
  X,
  Home,
  LayoutDashboard,
  PlusCircle,
  Settings,
  Shield,
  FileText,
  GraduationCap,
  FlaskConical,
  Sparkles,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onNavigate: (page: string, params?: { type?: string }) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose, currentPage, onNavigate }) => {
  const { user, logout } = useAuth();

  if (!isOpen) {
    return (
      /* Fixed Bottom Navigation Bar for Mobile */
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200 bg-white/90 px-2 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 lg:hidden">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
            currentPage === 'home' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Home className="h-5 w-5" />
          <span>Trang chủ</span>
        </button>
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
            currentPage === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Bảng ĐK</span>
        </button>
        <button
          onClick={() => onNavigate('create')}
          className="flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30"
          aria-label="Tạo giáo án"
        >
          <PlusCircle className="h-6 w-6" />
        </button>
        <button
          onClick={() => onNavigate('settings')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
            currentPage === 'settings' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Settings className="h-5 w-5" />
          <span>Cài đặt</span>
        </button>
        {user?.role === 'admin' && (
          <button
            onClick={() => onNavigate('admin')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
              currentPage === 'admin' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Shield className="h-5 w-5" />
            <span>Quản trị</span>
          </button>
        )}
      </nav>
    );
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm border-r border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-base">Trợ lý Giáo án AI</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2">Điều hướng</p>
            <button
              onClick={() => {
                onNavigate('home');
                onClose();
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                currentPage === 'home' ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <Home className="h-4 w-4" /> Trang chủ
            </button>
            <button
              onClick={() => {
                onNavigate('dashboard');
                onClose();
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                currentPage === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" /> Bảng điều khiển
            </button>
            <button
              onClick={() => {
                onNavigate('create');
                onClose();
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                currentPage === 'create' ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <PlusCircle className="h-4 w-4" /> Tạo giáo án AI
            </button>
          </div>

          <div className="mt-6 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2">Tạo nhanh theo mẫu</p>
            <button
              onClick={() => {
                onNavigate('create', { type: '5512' });
                onClose();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              <FileText className="h-4 w-4 text-blue-500" /> KHBD Công văn 5512
            </button>
            <button
              onClick={() => {
                onNavigate('create', { type: 'ncbh' });
                onClose();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              <GraduationCap className="h-4 w-4 text-amber-500" /> Kế hoạch Nghiên cứu bài học
            </button>
            <button
              onClick={() => {
                onNavigate('create', { type: 'stem' });
                onClose();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              <FlaskConical className="h-4 w-4 text-emerald-500" /> KHBD STEM Tích hợp
            </button>
          </div>
        </div>

        {user && (
          <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
            <div className="flex items-center gap-3 px-2">
              <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full object-cover" />
              <div>
                <p className="font-medium text-slate-900 text-xs dark:text-white">{user.name}</p>
                <p className="text-[10px] text-slate-500">{user.school}</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                onClose();
                onNavigate('login');
              }}
              className="mt-3 flex w-full items-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2 justify-center text-xs font-medium text-red-600 dark:border-red-950 dark:bg-red-950/30 dark:text-red-400"
            >
              <LogOut className="h-4 w-4" /> Đăng xuất
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
