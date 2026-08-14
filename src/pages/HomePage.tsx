import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  GraduationCap,
  FlaskConical,
  CheckCircle2,
  ArrowRight,
  Zap,
  ShieldCheck,
  Download,
  Users,
  Award,
  ChevronRight
} from 'lucide-react';
import { MOCK_LESSON_PLANS } from '../data/mockData';

interface HomePageProps {
  onNavigate: (page: string, params?: { type?: string; planId?: string }) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'5512' | 'ncbh' | 'stem'>('5512');

  const samplePlan = MOCK_LESSON_PLANS.find((p) => p.type === activeTab) || MOCK_LESSON_PLANS[0];

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 px-6 py-16 text-white shadow-2xl sm:px-12 sm:py-20 lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_50%)]" />

        <div className="relative mx-auto max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur border border-white/15 text-blue-200">
            <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
            <span>Nâng cấp Công nghệ AI cho Giáo dục Phổ thông 2018</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white leading-tight">
            Trợ lý Soạn Giáo án AI <br />
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              Chuẩn 5512 & STEM trong 60s
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Nền tảng trí tuệ nhân tạo chuyên biệt dành cho giáo viên Việt Nam. Tự động hóa việc khởi tạo Kế hoạch bài dạy Công văn 5512, Kế hoạch Nghiên cứu bài học và KHBD STEM chỉ với vài thao tác đơn giản.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('create')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-blue-500 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-blue-500/30 hover:bg-blue-400 transition transform hover:-translate-y-0.5"
            >
              <Zap className="h-5 w-5 fill-white" />
              Bắt đầu soạn giáo án ngay
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-6 py-4 text-sm font-semibold text-white hover:bg-white/20 transition border border-white/20"
            >
              Khám phá Bảng điều khiển
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/10 text-left">
            <div>
              <p className="text-2xl font-bold text-white">14,280+</p>
              <p className="text-xs text-slate-400">Giáo án đã khởi tạo</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">3,420+</p>
              <p className="text-xs text-slate-400">Giáo viên tin dùng</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-xs text-slate-400">Khung Công văn 5512</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">0.5s</p>
              <p className="text-xs text-slate-400">Xuất file Word DOCX</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Document Types */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Đáp ứng toàn diện 3 Loại Tài liệu Chuyên môn
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Xây dựng đầy đủ nội dung theo mẫu chuẩn do Bộ GD&ĐT quy định cho các bậc học.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 5512 */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl transition dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">KHBD Công văn 5512</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tự động chia cấu trúc chuẩn gồm Mục tiêu (Kiến thức - Năng lực - Phẩm chất), Thiết bị dạy học và 4 Hoạt động học (Mở đầu, Hình thành kiến thức, Luyện tập, Vận dụng).
              </p>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" /> Đúng Phụ lục IV CV 5512
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" /> Tích hợp ma trận câu hỏi
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('create', { type: '5512' })}
              className="mt-6 flex items-center justify-center gap-2 w-full rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-800 hover:bg-blue-600 hover:text-white transition dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-blue-600"
            >
              Soạn mẫu 5512 <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Card 2: Nghiên cứu bài học */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl transition dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Kế hoạch Nghiên cứu Bài học</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Chuyên biệt cho Sinh hoạt chuyên môn theo NCBH (Lesson Study). Tập trung vào quan sát hành vi, tâm lý và khó khăn học tập của học sinh thay vì thao tác của giáo viên.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-500" /> Khung quan sát dự giờ chuyên sâu
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-500" /> Biên bản thảo luận rút kinh nghiệm
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('create', { type: 'ncbh' })}
              className="mt-6 flex items-center justify-center gap-2 w-full rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-800 hover:bg-amber-600 hover:text-white transition dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-amber-600"
            >
              Soạn bài NCBH <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Card 3: STEM */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl transition dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <FlaskConical className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">KHBD STEM Tích hợp</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Thiết kế chủ đề bài học STEM theo quy trình thiết kế kỹ thuật (Engineering Design Process). Tích hợp liên môn Science - Technology - Engineering - Math với tiêu chí sản phẩm rõ ràng.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Ma trận môn học tích hợp S-T-E-M
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Phiếu Rubric chấm điểm sản phẩm
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('create', { type: 'stem' })}
              className="mt-6 flex items-center justify-center gap-2 w-full rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-800 hover:bg-emerald-600 hover:text-white transition dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-emerald-600"
            >
              Soạn bài STEM <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Sample Preview Section */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Xem trước Giáo án Mẫu Mẫu</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Xem trực tiếp nội dung được sinh tự động bởi Gemini AI</p>
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 self-start">
            <button
              onClick={() => setActiveTab('5512')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === '5512' ? 'bg-white text-blue-600 shadow dark:bg-slate-700 dark:text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Mẫu 5512
            </button>
            <button
              onClick={() => setActiveTab('ncbh')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'ncbh' ? 'bg-white text-amber-600 shadow dark:bg-slate-700 dark:text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Mẫu NCBH
            </button>
            <button
              onClick={() => setActiveTab('stem')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'stem' ? 'bg-white text-emerald-600 shadow dark:bg-slate-700 dark:text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Mẫu STEM
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {samplePlan.type === '5512' ? 'Công văn 5512' : samplePlan.type === 'ncbh' ? 'Nghiên cứu bài học' : 'KHBD STEM'}
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{samplePlan.title}</h4>
              <p className="text-xs text-slate-500">Môn: {samplePlan.subject} | {samplePlan.grade} | Bộ sách: {samplePlan.textbook}</p>
            </div>
            <button
              onClick={() => onNavigate('plan_detail', { planId: samplePlan.id })}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Mở bản xem chi tiết
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none text-xs space-y-3">
            <p className="italic text-slate-600 dark:text-slate-400">{samplePlan.summary}</p>

            {samplePlan.content5512 && (
              <div className="space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200">I. MỤC TIÊU BÀI HỌC</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Kiến thức:</strong> {samplePlan.content5512.objectives.knowledge[0]}</li>
                  <li><strong>Năng lực:</strong> {samplePlan.content5512.objectives.capabilities[0]}</li>
                </ul>
              </div>
            )}

            {samplePlan.contentNCBH && (
              <div className="space-y-2">
                <p className="font-bold text-amber-800 dark:text-amber-300">I. MỤC TIÊU NGHIÊN CỨU BÀI HỌC</p>
                <p>{samplePlan.contentNCBH.researchTopic}</p>
              </div>
            )}

            {samplePlan.contentSTEM && (
              <div className="space-y-2">
                <p className="font-bold text-emerald-800 dark:text-emerald-300">I. TÊN CHỦ ĐỀ STEM & MÔ TẢ SẢN PHẨM</p>
                <p>{samplePlan.contentSTEM.productDescription}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Steps workflow */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Quy trình 3 Bước Đơn giản</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Tiết kiệm đến 80% thời gian chuẩn bị tiết dạy hàng tuần</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 text-center space-y-3">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">1</div>
            <h4 className="font-bold text-slate-900 dark:text-white">Chọn Môn & Loại Giáo án</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Lựa chọn môn học, khối lớp, bộ sách giáo khoa và loại biểu mẫu cần khởi tạo.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 text-center space-y-3">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">2</div>
            <h4 className="font-bold text-slate-900 dark:text-white">AI Sinh Nội Dụng</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Trí tuệ nhân tạo Gemini xử lý yêu cầu và tự động điền các mục theo chuẩn GDPT 2018.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 text-center space-y-3">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">3</div>
            <h4 className="font-bold text-slate-900 dark:text-white">Chỉnh sửa & Xuất File Word</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Xem lại trên trình soạn thảo Rich Text, mở rộng hoạt động và tải xuống tệp .DOCX.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
