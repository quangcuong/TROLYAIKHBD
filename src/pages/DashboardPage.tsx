import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  FileText,
  FlaskConical,
  GraduationCap,
  Sparkles,
  Download,
  Eye,
  Trash2,
  Copy,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileDown,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Calendar,
  X,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLessonPlans } from '../context/LessonPlanContext';
import { DocumentType, PlanStatus } from '../types';

interface DashboardPageProps {
  onNavigate: (page: string, params?: { type?: string; planId?: string }) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { plans, deletePlan, duplicatePlan, isLoading, error, refreshPlans } = useLessonPlans();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<PlanStatus | 'all'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | '7_days' | '30_days' | '90_days'>('all');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal & Action Loading States
  const [planToDelete, setPlanToDelete] = useState<{ id: string; title: string } | null>(null);
  const [exportingPlanId, setExportingPlanId] = useState<{ id: string; type: 'docx' | 'pdf' } | null>(null);

  // Available Filter Options
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    plans.forEach((p) => p.subject && set.add(p.subject));
    return Array.from(set).sort();
  }, [plans]);

  const availableGrades = useMemo(() => {
    const set = new Set<string>();
    plans.forEach((p) => p.grade && set.add(p.grade));
    return Array.from(set).sort();
  }, [plans]);

  // Filter Logic
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      // 1. Search Query
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        plan.title.toLowerCase().includes(term) ||
        plan.subject.toLowerCase().includes(term) ||
        plan.grade.toLowerCase().includes(term) ||
        plan.textbook.toLowerCase().includes(term) ||
        plan.summary.toLowerCase().includes(term);

      // 2. Document Type
      const matchesType = typeFilter === 'all' || plan.type === typeFilter;

      // 3. Subject
      const matchesSubject = subjectFilter === 'all' || plan.subject === subjectFilter;

      // 4. Grade
      const matchesGrade = gradeFilter === 'all' || plan.grade === gradeFilter;

      // 5. Status
      const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;

      // 6. Time Range
      let matchesTime = true;
      if (timeFilter !== 'all') {
        const planDate = new Date(plan.createdAt || plan.updatedAt).getTime();
        const now = Date.now();
        const daysDiff = (now - planDate) / (1000 * 3600 * 24);
        if (timeFilter === '7_days') matchesTime = daysDiff <= 7;
        if (timeFilter === '30_days') matchesTime = daysDiff <= 30;
        if (timeFilter === '90_days') matchesTime = daysDiff <= 90;
      }

      return matchesSearch && matchesType && matchesSubject && matchesGrade && matchesStatus && matchesTime;
    });
  }, [plans, searchTerm, typeFilter, subjectFilter, gradeFilter, statusFilter, timeFilter]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setSubjectFilter('all');
    setGradeFilter('all');
    setStatusFilter('all');
    setTimeFilter('all');
    setCurrentPage(1);
  };

  // Pagination Logic
  const totalItems = filteredPlans.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedPlans = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPlans.slice(start, start + pageSize);
  }, [filteredPlans, currentPage, pageSize]);

  // Statistics
  const count5512 = plans.filter((p) => p.type === '5512').length;
  const countSTEM = plans.filter((p) => p.type === 'stem').length;
  const countNCBH = plans.filter((p) => p.type === 'ncbh').length;
  const countApproved = plans.filter((p) => p.status === 'approved').length;
  const countReviewing = plans.filter((p) => p.status === 'reviewing').length;

  // Actions
  const handleDuplicate = async (id: string) => {
    const duplicated = await duplicatePlan(id);
    if (duplicated) {
      alert(`Đã nhân bản giáo án "${duplicated.title}" thành công!`);
    }
  };

  const confirmDelete = async () => {
    if (!planToDelete) return;
    try {
      await deletePlan(planToDelete.id);
      setPlanToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa giáo án.');
    }
  };

  const handleExportDocx = async (planId: string, title: string) => {
    setExportingPlanId({ id: planId, type: 'docx' });
    try {
      const res = await fetch('/api/export/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonPlanId: planId, userId: user?.id || 'usr_001' }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || 'Lỗi khi xuất file DOCX');
      }

      const blob = await res.blob();
      const disposition = res.headers.get('content-disposition');
      let fileName = `${title || 'GiaoAn'}.docx`;
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
        if (match && match[1]) fileName = decodeURIComponent(match[1]);
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Không thể xuất file Word');
    } finally {
      setExportingPlanId(null);
    }
  };

  const handleExportPdf = async (planId: string, title: string) => {
    setExportingPlanId({ id: planId, type: 'pdf' });
    try {
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonPlanId: planId, userId: user?.id || 'usr_001' }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || 'Lỗi khi xuất file PDF');
      }

      const blob = await res.blob();
      const disposition = res.headers.get('content-disposition');
      let fileName = `${title || 'GiaoAn'}.pdf`;
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
        if (match && match[1]) fileName = decodeURIComponent(match[1]);
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Không thể xuất file PDF');
    } finally {
      setExportingPlanId(null);
    }
  };

  return (
    <div className="space-y-8 py-2">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200">
              <Sparkles className="h-4 w-4" /> Bảng điều khiển & Lịch sử Soạn giảng
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Xin chào, {user?.name || 'Thầy/Cô'}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
              {user?.school || 'Sở GD&ĐT'} | Môn chính:{' '}
              <span className="font-semibold">{user?.subject || 'Tất cả môn'}</span>
            </p>
          </div>

          <button
            onClick={() => onNavigate('create')}
            className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-bold text-blue-700 shadow-lg hover:bg-blue-50 transition self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" /> Tạo Giáo án AI Mới
          </button>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Tổng số giáo án</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{plans.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Tất cả bài soạn</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Công văn 5512</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{count5512}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Chuẩn Phụ lục IV</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Giáo án STEM</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <FlaskConical className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{countSTEM}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Tích hợp liên môn</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Nghiên cứu bài học</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{countNCBH}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Sinh hoạt chuyên môn</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Đã phê duyệt</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{countApproved}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{countReviewing} đang chờ duyệt</p>
        </div>
      </div>

      {/* Main Table & Comprehensive Filters */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Lịch sử & Quản lý Giáo án</h2>
            <p className="text-xs text-slate-500">Tìm kiếm, lọc đa tiêu chí và xuất bản Word (.docx) / PDF chuẩn Bộ GD&ĐT</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              title="Đặt lại tất cả bộ lọc"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên bài, từ khóa, môn..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Filter: Type */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">Tất cả loại giáo án</option>
            <option value="5512">Công văn 5512</option>
            <option value="stem">Giáo án STEM</option>
            <option value="ncbh">Nghiên cứu bài học</option>
          </select>

          {/* Filter: Subject */}
          <select
            value={subjectFilter}
            onChange={(e) => {
              setSubjectFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">Tất cả môn học</option>
            {availableSubjects.map((sbj) => (
              <option key={sbj} value={sbj}>
                {sbj}
              </option>
            ))}
          </select>

          {/* Filter: Grade */}
          <select
            value={gradeFilter}
            onChange={(e) => {
              setGradeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">Tất cả khối/lớp</option>
            {availableGrades.map((grd) => (
              <option key={grd} value={grd}>
                {grd}
              </option>
            ))}
          </select>

          {/* Filter: Status */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="draft">Bản nháp</option>
            <option value="reviewing">Đang chờ duyệt</option>
            <option value="approved">Đã phê duyệt</option>
          </select>
        </div>

        {/* Second Filter Row: Time Range */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-semibold text-slate-600 dark:text-slate-400">Thời gian:</span>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: '7_days', label: '7 ngày qua' },
            { id: '30_days', label: '30 ngày qua' },
            { id: '90_days', label: '90 ngày qua' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTimeFilter(t.id as any);
                setCurrentPage(1);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                timeFilter === t.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* UI State: Error */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => refreshPlans()}
              className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Table list or Loading / Empty States */}
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Đang tải danh sách giáo án từ cơ sở dữ liệu...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 uppercase text-[10px] font-semibold tracking-wider text-slate-400 dark:bg-slate-800/50">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Tên Giáo án & Tóm tắt</th>
                  <th className="p-3.5">Loại & Môn</th>
                  <th className="p-3.5">Bộ sách / Lớp</th>
                  <th className="p-3.5">Trạng thái</th>
                  <th className="p-3.5">Cập nhật</th>
                  <th className="p-3.5 text-right rounded-r-xl">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedPlans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                        <FileText className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Không tìm thấy giáo án nào
                      </p>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Thử điều chỉnh từ khóa tìm kiếm hoặc bấm &quot;Xóa bộ lọc&quot; để hiển thị toàn bộ tài liệu.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800"
                      >
                        Đặt lại bộ lọc
                      </button>
                    </td>
                  </tr>
                ) : (
                  paginatedPlans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3.5 max-w-xs">
                        <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                          {plan.title}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {plan.summary || 'Chưa có tóm tắt nội dung.'}
                        </p>
                      </td>

                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          plan.type === '5512'
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300'
                            : plan.type === 'stem'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}>
                          {plan.type === '5512' ? '5512' : plan.type === 'stem' ? 'STEM' : 'NCBH'}
                        </span>
                        <span className="ml-2 font-medium">{plan.subject}</span>
                      </td>

                      <td className="p-3.5">
                        <p className="font-medium">{plan.grade}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{plan.textbook}</p>
                      </td>

                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          plan.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : plan.status === 'reviewing'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {plan.status === 'approved' ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" /> Đã duyệt
                            </>
                          ) : plan.status === 'reviewing' ? (
                            <>
                              <Clock className="h-3 w-3" /> Đang chờ duyệt
                            </>
                          ) : (
                            'Bản nháp'
                          )}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-500 text-[11px]">
                        {new Date(plan.updatedAt || plan.createdAt).toLocaleDateString('vi-VN')}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Detail / Edit */}
                          <button
                            onClick={() => onNavigate('plan_detail', { planId: plan.id })}
                            title="Xem & Chỉnh sửa chi tiết"
                            className="rounded-lg p-1.5 text-slate-600 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Export Word (.docx) */}
                          <button
                            onClick={() => handleExportDocx(plan.id, plan.title)}
                            disabled={exportingPlanId?.id === plan.id}
                            title="Tải tệp Microsoft Word (.docx)"
                            className="rounded-lg p-1.5 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 dark:text-slate-400 dark:hover:bg-slate-800 transition disabled:opacity-50"
                          >
                            {exportingPlanId?.id === plan.id && exportingPlanId?.type === 'docx' ? (
                              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                            ) : (
                              <Download className="h-4 w-4 text-emerald-600" />
                            )}
                          </button>

                          {/* Export PDF */}
                          <button
                            onClick={() => handleExportPdf(plan.id, plan.title)}
                            disabled={exportingPlanId?.id === plan.id}
                            title="Tải tệp PDF"
                            className="rounded-lg p-1.5 text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-slate-800 transition disabled:opacity-50"
                          >
                            {exportingPlanId?.id === plan.id && exportingPlanId?.type === 'pdf' ? (
                              <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
                            ) : (
                              <FileDown className="h-4 w-4 text-rose-600" />
                            )}
                          </button>

                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicate(plan.id)}
                            title="Nhân bản giáo án"
                            className="rounded-lg p-1.5 text-slate-600 hover:bg-amber-50 hover:text-amber-600 dark:text-slate-400 dark:hover:bg-slate-800"
                          >
                            <Copy className="h-4 w-4 text-amber-600" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setPlanToDelete({ id: plan.id, title: plan.title })}
                            title="Xóa giáo án"
                            className="rounded-lg p-1.5 text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-800"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>Hiển thị</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <option value={5}>5 giáo án/trang</option>
                <option value={10}>10 giáo án/trang</option>
                <option value={20}>20 giáo án/trang</option>
              </select>
              <span>trên tổng số <strong>{totalItems}</strong> giáo án</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="px-3 font-semibold text-slate-800 dark:text-slate-200">
                Trang {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {planToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Xác nhận xóa giáo án</h3>
                  <p className="text-xs text-slate-500">Hành động này không thể hoàn tác</p>
                </div>
              </div>
              <button
                onClick={() => setPlanToDelete(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 line-clamp-2">
                &quot;{planToDelete.title}&quot;
              </p>
            </div>

            <p className="text-xs text-slate-500">
              Giáo án này sẽ bị xóa vĩnh viễn khỏi tài khoản của bạn. Bạn có chắc chắn muốn tiếp tục?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPlanToDelete(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 shadow-md shadow-red-600/25"
              >
                Xác nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
