import React, { useState } from 'react';
import {
  Sparkles,
  Sun,
  Moon,
  Search,
  Bell,
  Plus,
  User as UserIcon,
  LogOut,
  Settings,
  Shield,
  BookOpen,
  Menu,
  ChevronDown
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  onOpenMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage, onOpenMobileNav }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, switchUserRole } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const notifications = [
    { id: '1', title: 'Giáo án đã được duyệt', time: '10 phút trước', read: false },
    { id: '2', title: 'Cập nhật Công văn 5512 mới', time: '2 giờ trước', read: false },
    { id: '3', title: 'Hạn ngạch AI được reset', time: '1 ngày trước', read: true },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      {/* Left side: Mobile menu button + Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div
          onClick={() => onNavigate('home')}
          className="flex cursor-pointer items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white shadow-md shadow-blue-500/20">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div className="hidden sm:block">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Trợ lý Giáo án <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">AI</span>
            </span>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              Chuẩn GDPT 2018 & CV 5512
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Global Search */}
      <div className="hidden max-w-md flex-1 px-8 md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bài học, KHBD 5512, STEM, bài nghiên cứu..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-400"
          />
        </div>
      </div>

      {/* Right side: Actions & User menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Create Button */}
        <button
          onClick={() => onNavigate('create')}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:bg-blue-600 dark:hover:bg-blue-500 sm:text-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Tạo giáo án</span>
        </button>

        {/* Role Demo Switcher Badge */}
        {user && (
          <div className="relative hidden xl:block">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Shield className="h-3.5 w-3.5 text-indigo-500" />
              <span>
                {user.role === 'admin'
                  ? 'Quản trị viên'
                  : user.role === 'head_teacher'
                  ? 'Tổ trưởng chuyên môn'
                  : 'Giáo viên'}
              </span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {showRoleSwitcher && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Đổi vai trò xem thử:
                </p>
                <button
                  onClick={() => {
                    switchUserRole('teacher');
                    setShowRoleSwitcher(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                    user.role === 'teacher' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" /> Giáo viên
                </button>
                <button
                  onClick={() => {
                    switchUserRole('head_teacher');
                    setShowRoleSwitcher(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                    user.role === 'head_teacher' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5 text-indigo-500" /> Tổ trưởng chuyên môn
                </button>
                <button
                  onClick={() => {
                    switchUserRole('admin');
                    setShowRoleSwitcher(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                    user.role === 'admin' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5 text-red-500" /> Quản trị hệ thống
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Tắt/mở chế độ tối"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-amber-400" />
          ) : (
            <Moon className="h-5 w-5 text-slate-600" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Thông báo"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                <span className="font-semibold text-slate-900 dark:text-white text-sm">Thông báo</span>
                <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">Đánh dấu đã đọc</span>
              </div>
              <div className="mt-2 space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex flex-col rounded-xl p-2.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{n.title}</span>
                    <span className="text-[10px] text-slate-400">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Menu or Auth buttons */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-full p-1 hover:ring-2 hover:ring-blue-500/30"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-100 p-3 dark:border-slate-800">
                  <p className="font-semibold text-slate-900 text-sm dark:text-white">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  <span className="mt-1.5 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                    {user.school}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      onNavigate('dashboard');
                      setShowUserMenu(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <BookOpen className="h-4 w-4 text-blue-500" /> Bảng điều khiển
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('settings');
                      setShowUserMenu(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Settings className="h-4 w-4 text-slate-500" /> Cài đặt tài khoản
                  </button>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        onNavigate('admin');
                        setShowUserMenu(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <Shield className="h-4 w-4 text-purple-500" /> Quản trị hệ thống
                    </button>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-1 dark:border-slate-800">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                      onNavigate('login');
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    <LogOut className="h-4 w-4" /> Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('login')}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Đăng ký
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
