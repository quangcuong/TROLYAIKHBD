import React from 'react';
import { Sparkles, Heart, Shield, BookOpen, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-10 dark:border-slate-800 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-base">Trợ lý Giáo án AI</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Giải pháp AI hỗ trợ giáo viên Việt Nam soạn thảo Kế hoạch bài dạy chuẩn Công văn 5512, Nghiên cứu bài học & Giáo án STEM nhanh chóng.
            </p>
          </div>

          {/* Standards & Documents */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3">
              Chuẩn tài liệu
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#5512" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Phụ lục IV - Công văn 5512/BGDĐT
                </a>
              </li>
              <li>
                <a href="#stem" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Giáo án STEM Công văn 3089/BGDĐT
                </a>
              </li>
              <li>
                <a href="#ncbh" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Chuyên đề Sinh hoạt chuyên môn NCBH
                </a>
              </li>
              <li>
                <a href="#books" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Tương thích Cánh Diều, Kết Nối, Chân Trời
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Support */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3">
              Hỗ trợ giáo viên
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 text-blue-500" /> Hướng dẫn tạo KHBD 5512
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-indigo-500" /> Báo cáo an toàn dữ liệu & Bản quyền
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-emerald-500" /> hotro@trolygiaoan.edu.vn
              </li>
            </ul>
          </div>

          {/* Version & Notice */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3">
              Phiên bản Milestone 1
            </h4>
            <p className="text-[11px] text-slate-500">
              Hệ thống đáp ứng Chương trình Giáo dục Phổ thông 2018. Mọi biểu mẫu được biên soạn sát khung quy định của Bộ GD&ĐT.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
              <span>Phát triển với</span>
              <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
              <span>dành cho Giáo viên Việt Nam</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6 text-center text-[11px] text-slate-500">
          © {new Date().getFullYear()} Trợ lý Giáo án AI. Bản quyền thuộc về Hệ thống Giáo dục Thông minh.
        </div>
      </div>
    </footer>
  );
};
