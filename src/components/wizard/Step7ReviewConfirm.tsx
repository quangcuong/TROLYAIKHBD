import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  CheckCircle2,
  Edit3,
  FileText,
  UploadCloud,
  BookOpen,
  Settings,
  Lightbulb,
  Sparkles,
  Bot,
  Layers,
  Save,
  Check
} from 'lucide-react';
import { WizardFormData } from '../../schemas/wizardSchema';
import { DbLessonFile } from '../../types/database';

interface Step7ReviewConfirmProps {
  form: UseFormReturn<WizardFormData>;
  uploadedFiles: DbLessonFile[];
  onJumpToStep: (step: number) => void;
  onSaveDraft: () => void;
  onSubmitPlan: () => void;
  isSavingDraft: boolean;
  isSubmitting: boolean;
}

export const Step7ReviewConfirm: React.FC<Step7ReviewConfirmProps> = ({
  form,
  uploadedFiles,
  onJumpToStep,
  onSaveDraft,
  onSubmitPlan,
  isSavingDraft,
  isSubmitting,
}) => {
  const values = form.getValues();

  const typeLabels: Record<string, string> = {
    '5512': 'KHBD Công văn 5512',
    ncbh: 'Nghiên cứu Bài học (NCBH)',
    stem: 'Bài học / Chủ đề STEM Tích hợp',
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Bước 7: Kiểm tra & Xác nhận Thông tin
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Vui lòng kiểm tra lại toàn bộ dữ liệu cấu hình trước khi xác nhận lưu hoặc tiến hành khởi tạo Kế hoạch Bài dạy.
        </p>
      </div>

      <div className="space-y-4">
        {/* Step 1 Review */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" /> 1. Loại Kế hoạch bài dạy
            </h3>
            <button
              type="button"
              onClick={() => onJumpToStep(1)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
            >
              <Edit3 className="h-3 w-3" /> Chỉnh sửa
            </button>
          </div>
          <p className="text-xs font-semibold text-slate-900 dark:text-white">
            {typeLabels[values.type] || values.type}
          </p>
        </div>

        {/* Step 2 Review */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <UploadCloud className="h-4 w-4 text-blue-600" /> 2. Tài liệu tham khảo đính kèm
            </h3>
            <button
              type="button"
              onClick={() => onJumpToStep(2)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
            >
              <Edit3 className="h-3 w-3" /> Chỉnh sửa
            </button>
          </div>
          {uploadedFiles.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Không có tài liệu nào được đính kèm.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file) => (
                <span
                  key={file.id}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  📄 {file.file_name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Step 3 Review */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" /> 3. Thông tin bài học & Mục tiêu
            </h3>
            <button
              type="button"
              onClick={() => onJumpToStep(3)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
            >
              <Edit3 className="h-3 w-3" /> Chỉnh sửa
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
            <div>
              <span className="text-slate-400">Tên bài học:</span>{' '}
              <strong className="text-slate-900 dark:text-white">{values.title}</strong>
            </div>
            <div>
              <span className="text-slate-400">Môn học / Lớp:</span>{' '}
              <strong className="text-slate-900 dark:text-white">
                {values.subject} - {values.grade}
              </strong>
            </div>
            <div>
              <span className="text-slate-400">Bộ sách giáo khoa:</span>{' '}
              <strong className="text-slate-900 dark:text-white">{values.textbook}</strong>
            </div>
            <div>
              <span className="text-slate-400">Thời lượng:</span>{' '}
              <strong className="text-slate-900 dark:text-white">{values.duration}</strong>
            </div>
          </div>

          {values.generalObjectives && (
            <div className="text-xs border-t border-slate-100 dark:border-slate-800 pt-2.5">
              <span className="text-slate-400 font-medium block mb-1">Yêu cầu cần đạt / Mục tiêu chung:</span>
              <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                {values.generalObjectives}
              </p>
            </div>
          )}

          {values.type === '5512' && (values.knowledgeObjectives || values.capabilityObjectives || values.qualityObjectives) && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
              {values.knowledgeObjectives && (
                <p>
                  <strong>Kiến thức:</strong> {values.knowledgeObjectives}
                </p>
              )}
              {values.capabilityObjectives && (
                <p>
                  <strong>Năng lực:</strong> {values.capabilityObjectives}
                </p>
              )}
              {values.qualityObjectives && (
                <p>
                  <strong>Phẩm chất:</strong> {values.qualityObjectives}
                </p>
              )}
            </div>
          )}

          {values.type === 'stem' && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
              <p>
                <strong>Chủ đề & Mô tả STEM:</strong> {values.stemTheme} ({values.stemProductDescription})
              </p>
              <p>
                <strong>Tích hợp S-T-E-M:</strong> Science: {values.integratedScience || 'N/A'} | Technology: {values.integratedTechnology || 'N/A'} | Engineering: {values.integratedEngineering || 'N/A'} | Math: {values.integratedMath || 'N/A'}
              </p>
            </div>
          )}
        </div>

        {/* Step 4 Review */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Settings className="h-4 w-4 text-blue-600" /> 4. Điều kiện tổ chức dạy học
            </h3>
            <button
              type="button"
              onClick={() => onJumpToStep(4)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
            >
              <Edit3 className="h-3 w-3" /> Chỉnh sửa
            </button>
          </div>
          <div className="text-xs space-y-2 text-slate-700 dark:text-slate-300">
            <p>
              <strong>Thiết bị Giáo viên:</strong> {values.teacherEquipment || 'Chưa chọn'}
            </p>
            <p>
              <strong>Học liệu Học sinh:</strong> {values.studentEquipment || 'Chưa chọn'}
            </p>
            <p>
              <strong>CNTT & Học liệu số:</strong> {values.digitalTools || 'Chưa chọn'}
            </p>
            <p>
              <strong>Cơ sở vật chất:</strong> {values.classroomFacilities || 'Mặc định'}
            </p>
          </div>
        </div>

        {/* Step 5 Review */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" /> 5. Phương pháp & Kỹ thuật dạy học
            </h3>
            <button
              type="button"
              onClick={() => onJumpToStep(5)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
            >
              <Edit3 className="h-3 w-3" /> Chỉnh sửa
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {values.teachingMethods.map((m) => (
              <span key={m} className="rounded-lg bg-blue-50 text-blue-700 px-2.5 py-1 text-[11px] font-bold dark:bg-blue-950 dark:text-blue-300">
                {m}
              </span>
            ))}
            {values.teachingTechniques.map((t) => (
              <span key={t} className="rounded-lg bg-indigo-50 text-indigo-700 px-2.5 py-1 text-[11px] font-bold dark:bg-indigo-950 dark:text-indigo-300">
                {t}
              </span>
            ))}
            {values.customMethods.map((c) => (
              <span key={c} className="rounded-lg bg-emerald-50 text-emerald-800 px-2.5 py-1 text-[11px] font-bold dark:bg-emerald-950 dark:text-emerald-300">
                ★ {c}
              </span>
            ))}
            {values.teachingMethods.length === 0 && values.teachingTechniques.length === 0 && values.customMethods.length === 0 && (
              <p className="text-xs text-slate-400 italic">Chưa chọn phương pháp cụ thể.</p>
            )}
          </div>
        </div>

        {/* Step 6 Review */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" /> 6. Yêu cầu bổ sung & Tích hợp AI
            </h3>
            <button
              type="button"
              onClick={() => onJumpToStep(6)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
            >
              <Edit3 className="h-3 w-3" /> Chỉnh sửa
            </button>
          </div>

          <div className="text-xs space-y-2 text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-indigo-600" />
              <span>
                Công tắc Tích hợp Năng lực AI:{' '}
                <strong className={values.enableAICapability ? 'text-indigo-600' : 'text-slate-400'}>
                  {values.enableAICapability ? 'BẬT (Kích hoạt)' : 'TẮT'}
                </strong>
              </span>
            </div>
            <p>
              <strong>Dạy học Phân hóa:</strong> {values.differentiatedInstruction || 'Mặc định'}
            </p>
            {values.digitalCompetency && (
              <p>
                <strong>Năng lực số:</strong> {values.digitalCompetency}
              </p>
            )}
            {values.specialNotes && (
              <p>
                <strong>Ghi chú đặc biệt:</strong> {values.specialNotes}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Submit & Save Draft Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSavingDraft}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <Save className="h-4 w-4 text-slate-500" /> {isSavingDraft ? 'Đang lưu nháp...' : 'Lưu bản nháp'}
        </button>

        <button
          type="button"
          onClick={onSubmitPlan}
          disabled={isSubmitting}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500"
        >
          <Check className="h-4 w-4" /> Xác nhận & Hoàn tất Cấu hình Giáo án
        </button>
      </div>
    </div>
  );
};
