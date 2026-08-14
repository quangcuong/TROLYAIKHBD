import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  FlaskConical,
  GraduationCap,
  Settings,
  ShieldAlert,
  Home,
  Sparkles,
  HelpCircle,
  FolderKanban
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string, params?: { type?: string }) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { user } = useAuth();

  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
    { id: 'create', label: 'Tạo giáo án AI', icon: PlusCircle, badge: 'AI' },
  ];

  const docTypes = [
    { type: '5512', label: 'KHBD Công văn 5512', icon: FileText, color: 'text-blue-500' },
    { type: 'ncbh', label: 'Nghiên cứu bài học', icon: GraduationCap, color: 'text-amber-500' },
    { type: 'stem', label: 'KHBD STEM', icon: FlaskConical, color: 'text-emerald-500' },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      {/* Main Navigation */}
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Chức năng chính
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Document Types Filter Shortcuts */}
      <div className="mt-6 space-y-1">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Loại tài liệu
        </p>
        {docTypes.map((doc) => {
          const Icon = doc.icon;
          return (
            <button
              key={doc.type}
              onClick={() => onNavigate('create', { type: doc.type })}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
            >
              <Icon className={`h-4 w-4 ${doc.color}`} />
              <span>{doc.label}</span>
            </button>
          );
        })}
      </div>

      {/* Management & System */}
      <div className="mt-6 space-y-1">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Hệ thống
        </p>
        <button
          onClick={() => onNavigate('settings')}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
            currentPage === 'settings'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Cài đặt</span>
        </button>

        <button
          onClick={() => onNavigate('admin')}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
            currentPage === 'admin'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-4 w-4 text-purple-500" />
            <span>Quản trị</span>
          </div>
          {user?.role === 'admin' && (
            <span className="h-2 w-2 rounded-full bg-purple-500" />
          )}
        </button>
      </div>

      {/* AI Quota Widget */}
      {user && (
        <div className="mt-auto pt-6">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/50 p-3.5 dark:border-slate-800 dark:from-slate-800/80 dark:to-blue-950/20">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                Hạn ngạch AI
              </span>
              <span>
                {Math.round((user.aiQuotaUsed / user.aiQuotaLimit) * 100)}%
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                style={{ width: `${Math.min(100, (user.aiQuotaUsed / user.aiQuotaLimit) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              Đã dùng {user.aiQuotaUsed.toLocaleString('vi-VN')} / {user.aiQuotaLimit.toLocaleString('vi-VN')} tokens
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
