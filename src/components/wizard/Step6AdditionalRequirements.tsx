import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Sparkles, Bot, Layers, Monitor, MessageSquare } from 'lucide-react';
import { WizardFormData } from '../../schemas/wizardSchema';

interface Step6AdditionalRequirementsProps {
  form: UseFormReturn<WizardFormData>;
}

export const Step6AdditionalRequirements: React.FC<Step6AdditionalRequirementsProps> = ({ form }) => {
  const { register, watch, setValue } = form;

  const enableAICapability = watch('enableAICapability');

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" /> Bước 6: Yêu cầu Bổ sung & Năng lực AI
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Định hướng phân hóa học sinh, tích hợp năng lực công nghệ số và kích hoạt tính năng AI hướng dẫn bài học.
        </p>
      </div>

      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* AI Capability Toggle Switch */}
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 p-4 shadow-sm dark:border-indigo-900/50 dark:from-indigo-950/40 dark:to-purple-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                  Tích hợp Năng lực AI cho Học sinh trong Giáo án
                  <span className="rounded-full bg-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    Nổi bật
                  </span>
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  Tự động bổ sung hoạt động hướng dẫn học sinh ứng dụng AI (ChatGPT/Gemini) an toàn, có trách nhiệm trong tự học.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={enableAICapability}
              onClick={() => setValue('enableAICapability', !enableAICapability, { shouldDirty: true })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                enableAICapability ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  enableAICapability ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {enableAICapability && (
            <div className="mt-3 pt-3 border-t border-indigo-200/60 dark:border-indigo-800/60 text-[11px] text-indigo-900 dark:text-indigo-300 space-y-1">
              <p>✓ AI sẽ gợi ý các câu lệnh prompt mẫu cho học sinh tra cứu tài liệu bài học.</p>
              <p>✓ Tích hợp quy tắc kiểm chứng thông tin và đạo đức khi dùng AI trong làm bài tập.</p>
            </div>
          )}
        </div>

        {/* Differentiated Instruction */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-blue-600" /> 1. Định hướng Dạy học Phân hóa
          </label>
          <select
            {...register('differentiatedInstruction')}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="Phân hóa 3 mức độ (Nhận biết - Thông hiểu - Vận dụng)">
              Phân hóa 3 mức độ (Nhận biết - Thông hiểu - Vận dụng)
            </option>
            <option value="Hỗ trợ tích cực cho học sinh trung bình - yếu (nhắc lại kiến thức, phiếu học tập dàn ý)">
              Hỗ trợ tích cực cho học sinh trung bình - yếu
            </option>
            <option value="Tập trung bài tập nâng cao & mở rộng cho học sinh khá giỏi">
              Tập trung bài tập nâng cao & mở rộng cho học sinh khá giỏi
            </option>
            <option value="Phân hóa theo phong cách học tập (Thị giác V - Thính giác A - Vận động K)">
              Phân hóa theo phong cách học tập (VARK)
            </option>
          </select>
        </div>

        {/* Digital Competency Integration */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
            <Monitor className="h-3.5 w-3.5 text-emerald-600" /> 2. Tích hợp Năng lực số GDPT 2018
          </label>
          <textarea
            rows={2}
            {...register('digitalCompetency')}
            placeholder="Nêu các năng lực số học sinh sẽ thực hành: Sử dụng phần mềm, tìm kiếm tài liệu trên Internet, trình bày sản phẩm số..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Special Notes for AI */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-amber-600" /> 3. Ghi chú & Yêu cầu Đặc biệt khác
          </label>
          <textarea
            rows={3}
            {...register('specialNotes')}
            placeholder="Nhập bất kỳ ghi chú bổ sung nào cho giáo án (ví dụ: 'Ưu tiên ngữ liệu địa phương', 'Đơn giản hóa phần thí nghiệm'...)"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>
    </div>
  );
};
