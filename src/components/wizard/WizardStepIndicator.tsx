import React from 'react';
import {
  FileText,
  UploadCloud,
  BookOpen,
  Settings,
  Lightbulb,
  Sparkles,
  CheckCircle2,
  Check,
  ChevronRight
} from 'lucide-react';

export interface StepItem {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

export const WIZARD_STEPS: StepItem[] = [
  { id: 1, title: 'Chọn loại', description: '5512 / NCBH / STEM', icon: FileText },
  { id: 2, title: 'Tải tài liệu', description: 'Học liệu tham khảo', icon: UploadCloud },
  { id: 3, title: 'Thông tin bài học', description: 'Môn, Lớp, Mục tiêu', icon: BookOpen },
  { id: 4, title: 'Điều kiện tổ chức', description: 'Thiết bị & Đồ dùng', icon: Settings },
  { id: 5, title: 'Phương pháp & KT', description: 'Tích cực & Tùy chỉnh', icon: Lightbulb },
  { id: 6, title: 'Yêu cầu bổ sung', description: 'Phân hóa & Năng lực AI', icon: Sparkles },
  { id: 7, title: 'Kiểm tra & Xác nhận', description: 'Xem lại trước khi tạo', icon: CheckCircle2 },
];

interface WizardStepIndicatorProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  maxReachedStep: number;
}

export const WizardStepIndicator: React.FC<WizardStepIndicatorProps> = ({
  currentStep,
  onSelectStep,
  maxReachedStep,
}) => {
  const currentStepData = WIZARD_STEPS.find((s) => s.id === currentStep) || WIZARD_STEPS[0];
  const progressPercent = Math.round((currentStep / WIZARD_STEPS.length) * 100);

  return (
    <div className="space-y-3">
      {/* Mobile Stepper Header */}
      <div className="block lg:hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 font-bold text-xs text-white">
              {currentStep}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Bước {currentStep}/7: {currentStepData.title}
              </p>
              <p className="text-[11px] text-slate-500">{currentStepData.description}</p>
            </div>
          </div>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            {progressPercent}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Mobile Step Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 scrollbar-none">
          {WIZARD_STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isClickable = step.id <= maxReachedStep;

            return (
              <button
                key={step.id}
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onSelectStep(step.id)}
                className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                  isCurrent
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : isClickable
                    ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    : 'bg-slate-50 text-slate-400 cursor-not-allowed dark:bg-slate-900 dark:text-slate-600'
                }`}
              >
                {isCompleted ? <Check className="h-3 w-3" /> : <span>{step.id}.</span>}
                <span className="whitespace-nowrap">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Stepper Bar */}
      <div className="hidden lg:block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-7 gap-1">
          {WIZARD_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isClickable = step.id <= maxReachedStep;

            return (
              <div key={step.id} className="relative flex flex-col items-center">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onSelectStep(step.id)}
                  className={`group flex w-full flex-col items-center rounded-xl p-2.5 text-center transition ${
                    isCurrent
                      ? 'bg-blue-50/90 ring-1 ring-blue-500/30 dark:bg-blue-950/40'
                      : isClickable
                      ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`mb-1.5 flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : isCompleted
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>

                  <span
                    className={`text-[11px] font-bold line-clamp-1 ${
                      isCurrent
                        ? 'text-blue-700 dark:text-blue-300'
                        : isCompleted
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {step.id}. {step.title}
                  </span>

                  <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {step.description}
                  </span>
                </button>

                {/* Connecting arrow separator if not last */}
                {idx < WIZARD_STEPS.length - 1 && (
                  <div className="absolute right-0 top-6 translate-x-1/2 text-slate-300 dark:text-slate-700 pointer-events-none z-10">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
