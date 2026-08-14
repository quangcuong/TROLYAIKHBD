import React, { useState } from 'react';
import {
  ArrowLeft,
  Download,
  Share2,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  Edit3,
  Copy,
  Printer,
  MessageSquare,
  ChevronDown,
  FileText,
  Paperclip,
  Loader2,
  FileDown
} from 'lucide-react';
import { useLessonPlans } from '../context/LessonPlanContext';
import { useAuth } from '../context/AuthContext';
import { PlanStatus } from '../types';
import { DocumentUploadSection } from '../components/upload/DocumentUploadSection';
import { AIPipelineProgress } from '../components/pipeline/AIPipelineProgress';
import { LessonPlanEditor } from '../components/editor/LessonPlanEditor';
import { DbLessonPlan } from '../types/database';

interface PlanDetailPageProps {
  planId?: string;
  onNavigate: (page: string) => void;
}

export const PlanDetailPage: React.FC<PlanDetailPageProps> = ({ planId, onNavigate }) => {
  const { plans, activePlan, getPlanById, updatePlan } = useLessonPlans();
  const { user } = useAuth();

  const currentPlan = planId ? getPlanById(planId) || activePlan : activePlan;

  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [comments, setComments] = useState([
    {
      id: '1',
      author: 'Cô Trần Thị Phương Thảo (Tổ phó)',
      text: 'Nội dung Hoạt động 2 rất chi tiết. Nên bổ sung thêm 1 câu hỏi phân hóa cho học sinh giỏi.',
      time: 'Hôm qua lúc 15:30',
    },
  ]);
  const [newComment, setNewComment] = useState('');

  const handleExportDocx = async () => {
    if (!currentPlan) return;
    setIsExportingDocx(true);
    try {
      const res = await fetch('/api/export/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonPlanId: currentPlan.id, userId: user?.id || 'usr_001' }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || 'Lỗi khi xuất file DOCX');
      }

      const blob = await res.blob();
      const disposition = res.headers.get('content-disposition');
      let fileName = `${currentPlan.title || 'GiaoAn'}.docx`;
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
      alert(err.message || 'Không thể xuất file DOCX');
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleExportPdf = async () => {
    if (!currentPlan) return;
    setIsExportingPdf(true);
    try {
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonPlanId: currentPlan.id, userId: user?.id || 'usr_001' }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || 'Lỗi khi xuất file PDF');
      }

      const blob = await res.blob();
      const disposition = res.headers.get('content-disposition');
      let fileName = `${currentPlan.title || 'GiaoAn'}.pdf`;
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
      setIsExportingPdf(false);
    }
  };

  if (!currentPlan) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-slate-500">Không tìm thấy giáo án được yêu cầu.</p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Quay lại Bảng điều khiển
        </button>
      </div>
    );
  }

  const dbPlan: DbLessonPlan = {
    id: currentPlan.id,
    user_id: (currentPlan as any).authorId || user?.id || 'usr_001',
    title: currentPlan.title,
    type: currentPlan.type,
    subject: currentPlan.subject,
    grade: currentPlan.grade,
    textbook: currentPlan.textbook,
    duration: currentPlan.duration,
    summary: currentPlan.summary,
    status: currentPlan.status as any,
    content: (currentPlan as any).content5512 || (currentPlan as any).contentNCBH || (currentPlan as any).contentSTEM || (currentPlan as any).content || {},
    metadata: (currentPlan as any).metadata || {},
    created_at: (currentPlan as any).createdAt || new Date().toISOString(),
    updated_at: (currentPlan as any).updatedAt || new Date().toISOString(),
  };


  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([
      ...comments,
      {
        id: Date.now().toString(),
        author: user?.name || 'Giáo viên',
        text: newComment,
        time: 'Vừa xong',
      },
    ]);
    setNewComment('');
  };

  const handleStatusChange = (newStatus: PlanStatus) => {
    updatePlan(currentPlan.id, { status: newStatus });
  };

  const handleAiRefine = () => {
    if (!aiPrompt.trim()) return;
    alert(`[AI Gemini Giả lập]: Đã tiếp nhận yêu cầu "${aiPrompt}". Đang cập nhật giáo án...`);
    setAiPrompt('');
    setAiDrawerOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sticky top-20 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Quay lại"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {currentPlan.type === '5512' ? 'KHBD Công văn 5512' : currentPlan.type === 'stem' ? 'KHBD STEM' : 'Nghiên cứu bài học'}
            </span>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1">
              {currentPlan.title}
            </h1>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('editor')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                viewMode === 'editor'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ✏️ Soạn thảo TipTap
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                viewMode === 'preview'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              📄 Xem tổng quan
            </button>
          </div>

          {/* Status Switcher */}
          <select
            value={currentPlan.status}
            onChange={(e) => handleStatusChange(e.target.value as PlanStatus)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="draft">Bản nháp</option>
            <option value="reviewing">Gửi duyệt (Đang chờ)</option>
            <option value="approved">Đã phê duyệt</option>
          </select>

          {/* AI Refine button */}
          <button
            onClick={() => setAiDrawerOpen(!aiDrawerOpen)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:opacity-90"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Chỉnh sửa</span>
          </button>

          {/* Export Word (.docx) */}
          <button
            onClick={handleExportDocx}
            disabled={isExportingDocx}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition disabled:opacity-50"
            title="Xuất bản Word .DOCX chuẩn A4 GDPT 2018"
          >
            {isExportingDocx ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
            ) : (
              <Download className="h-3.5 w-3.5 text-emerald-600" />
            )}
            <span>Xuất Word (.docx)</span>
          </button>

          {/* Export PDF */}
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition disabled:opacity-50"
            title="Xuất bản PDF chuẩn A4"
          >
            {isExportingPdf ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-600" />
            ) : (
              <FileDown className="h-3.5 w-3.5 text-rose-600" />
            )}
            <span>Xuất PDF</span>
          </button>

          <button
            onClick={() => alert('Đã sao chép liên kết chia sẻ giáo án!')}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Chia sẻ"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Document Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {viewMode === 'editor' ? (
            <LessonPlanEditor lessonPlan={dbPlan} />
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-lg dark:border-slate-800 dark:bg-slate-900 font-sans leading-relaxed space-y-8">
              {/* Header Official Style */}
              <div className="text-center space-y-2 border-b border-slate-200 pb-6 dark:border-slate-800">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  TRƯỜNG: {user?.school || 'THPT CHUYÊN HÀ NỘI - AMSTERDAM'} — TỔ: VẬT LÝ & KHTN
                </p>
                <h2 className="text-xl sm:text-2xl font-extrabold uppercase text-slate-900 dark:text-white tracking-tight">
                  {currentPlan.title}
                </h2>
                <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-500 pt-2">
                  <span>Môn học: <strong>{currentPlan.subject}</strong></span>
                  <span>•</span>
                  <span>Khối lớp: <strong>{currentPlan.grade}</strong></span>
                  <span>•</span>
                  <span>Bộ sách: <strong>{currentPlan.textbook}</strong></span>
                  <span>•</span>
                  <span>Thời lượng: <strong>{currentPlan.duration}</strong></span>
                </div>
              </div>


            {/* Document Content based on Type */}
            {currentPlan.type === '5512' && currentPlan.content5512 && (
              <div className="space-y-6 text-xs text-slate-800 dark:text-slate-200">
                {/* Objectives */}
                <div className="space-y-3">
                  <h3 className="font-bold text-sm uppercase text-blue-700 dark:text-blue-400 border-b border-slate-100 pb-1 dark:border-slate-800">
                    I. MỤC TIÊU BÀI HỌC
                  </h3>
                  <div className="space-y-2 pl-2">
                    <p className="font-semibold text-slate-900 dark:text-white">1. Kiến thức:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {currentPlan.content5512.objectives.knowledge.map((k, idx) => (
                        <li key={idx}>{k}</li>
                      ))}
                    </ul>

                    <p className="font-semibold text-slate-900 dark:text-white pt-2">2. Năng lực:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {currentPlan.content5512.objectives.capabilities.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>

                    <p className="font-semibold text-slate-900 dark:text-white pt-2">3. Phẩm chất:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {currentPlan.content5512.objectives.qualities.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Equipment */}
                <div className="space-y-3">
                  <h3 className="font-bold text-sm uppercase text-blue-700 dark:text-blue-400 border-b border-slate-100 pb-1 dark:border-slate-800">
                    II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
                  </h3>
                  <div className="space-y-2 pl-2">
                    <p className="font-semibold text-slate-900 dark:text-white">1. Giáo viên:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {currentPlan.content5512.teachingEquipment.teacher.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>

                    <p className="font-semibold text-slate-900 dark:text-white pt-2">2. Học sinh:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {currentPlan.content5512.teachingEquipment.students.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Teaching Activities */}
                <div className="space-y-4">
                  <h3 className="font-bold text-sm uppercase text-blue-700 dark:text-blue-400 border-b border-slate-100 pb-1 dark:border-slate-800">
                    III. TIẾN TRÌNH DẠY HỌC
                  </h3>

                  {currentPlan.content5512.activities.map((act) => (
                    <div
                      key={act.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-800">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{act.title}</span>
                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {act.time}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <p><strong>a) Mục tiêu:</strong> {act.objective}</p>
                        <p><strong>b) Nội dung:</strong> {act.content}</p>
                        <p><strong>c) Sản phẩm:</strong> {act.product}</p>
                        <p><strong>d) Tổ chức thực hiện:</strong> {act.implementation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content NCBH */}
            {currentPlan.type === 'ncbh' && currentPlan.contentNCBH && (
              <div className="space-y-6 text-xs text-slate-800 dark:text-slate-200">
                <div className="space-y-2">
                  <h3 className="font-bold text-sm uppercase text-amber-700 dark:text-amber-400 border-b border-slate-100 pb-1">
                    I. CHỦ ĐỀ VÀ MỤC TIÊU NGHIÊN CỨU
                  </h3>
                  <p><strong>Chủ đề:</strong> {currentPlan.contentNCBH.researchTopic}</p>
                  <p className="font-semibold pt-2">Mục tiêu của Tổ chuyên môn:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {currentPlan.contentNCBH.researchGoals.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-sm uppercase text-amber-700 dark:text-amber-400 border-b border-slate-100 pb-1">
                    II. CÁC GÓC QUAN SÁT DỰ GIỜ
                  </h3>
                  {currentPlan.contentNCBH.activities.map((act) => (
                    <div key={act.id} className="rounded-2xl border border-amber-200/60 bg-amber-50/30 p-4 space-y-2">
                      <p className="font-bold text-slate-900 dark:text-white">{act.title}</p>
                      <p><strong>Hành vi kỳ vọng ở học sinh:</strong> {act.expectedStudentBehavior}</p>
                      <p><strong>Ghi chú dự giờ:</strong> {act.observationPoints.join('; ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content STEM */}
            {currentPlan.type === 'stem' && currentPlan.contentSTEM && (
              <div className="space-y-6 text-xs text-slate-800 dark:text-slate-200">
                <div className="space-y-2">
                  <h3 className="font-bold text-sm uppercase text-emerald-700 dark:text-emerald-400 border-b border-slate-100 pb-1">
                    I. MÔ TẢ SẢN PHẨM STEM
                  </h3>
                  <p>{currentPlan.contentSTEM.productDescription}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-sm uppercase text-emerald-700 dark:text-emerald-400 border-b border-slate-100 pb-1">
                    II. BẢNG TIÊU CHÍ ĐÁNH GIÁ SẢN PHẨM (RUBRIC)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-200 text-left dark:border-slate-800">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800">
                          <th className="border p-2">Tiêu chí</th>
                          <th className="border p-2">Tỷ trọng</th>
                          <th className="border p-2">Mô tả chi tiết</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentPlan.contentSTEM.productCriteria.map((c, i) => (
                          <tr key={i}>
                            <td className="border p-2 font-semibold">{c.criterion}</td>
                            <td className="border p-2">{c.weight}</td>
                            <td className="border p-2">{c.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* AI Generation & Validation Pipeline (Milestone 6) */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <AIPipelineProgress lessonPlanId={currentPlan.id} />
            </div>

            {/* Document Upload & Reference Extraction Section */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-sm uppercase text-slate-900 dark:text-white flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-blue-600" /> IV. TÀI LIỆU ĐÍNH KÈM & HỌC LIỆU TRÍCH XUẤT
              </h3>
              <p className="text-xs text-slate-500">
                Tải lên và trích xuất dữ liệu từ Giáo án mẫu, Phân phối chương trình, Nội dung SGK hoặc Tài liệu tham khảo đính kèm cho giáo án này.
              </p>
              <DocumentUploadSection lessonPlanId={currentPlan.id} />
            </div>
          </div>
          )}
        </div>

        {/* Right Side Column: Comments & AI Side Drawer */}
        <div className="space-y-6">
          {/* AI Side Refine Drawer Panel */}
          {aiDrawerOpen && (
            <div className="rounded-3xl border border-blue-200 bg-blue-50/50 p-5 shadow-xl dark:border-blue-900/50 dark:bg-blue-950/30 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
                <Sparkles className="h-4 w-4" /> TRỢ LÝ AI CHỈNH SỬA BÀI HỌC
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Yêu cầu Gemini AI tự động tinh chỉnh, bổ sung hoạt động hoặc đổi phương pháp dạy học.
              </p>
              <textarea
                rows={4}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="VD: 'Bổ sung 2 câu hỏi mở cho Hoạt động 3', 'Rút ngắn Hoạt động 1 xuống 5 phút'..."
                className="w-full rounded-xl border border-blue-200 bg-white p-3 text-xs text-slate-800 focus:outline-none dark:border-blue-900 dark:bg-slate-900 dark:text-slate-100"
              />
              <button
                onClick={handleAiRefine}
                className="w-full rounded-xl bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                Gửi yêu cầu chỉnh sửa
              </button>
            </div>
          )}

          {/* Review & Comments Panel */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                Góp ýChuyên môn ({comments.length})
              </span>
            </div>

            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="rounded-2xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">{c.author}</span>
                    <span className="text-[9px] text-slate-400">{c.time}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{c.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="space-y-2 pt-2">
              <input
                type="text"
                placeholder="Nhập nhận xét / góp ý chuyên môn..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
              >
                Gửi góp ý
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
