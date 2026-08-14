import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Lightbulb, Plus, X, Check, Search, Tag } from 'lucide-react';
import { WizardFormData } from '../../schemas/wizardSchema';

interface Step5MethodsProps {
  form: UseFormReturn<WizardFormData>;
}

const PRESET_METHODS = [
  'Dạy học nhóm & thảo luận',
  'Dạy học giải quyết vấn đề',
  'Dạy học dự án',
  'Dạy học trực quan',
  'Thí nghiệm & thực hành',
  'Học theo trạm (Station Rotation)',
  'Học qua trò chơi (Gamification)',
  'Dạy học đàm thoại gợi mở',
  'Lớp học đảo ngược (Flipped Classroom)',
  'Dạy học phân hóa',
];

const PRESET_TECHNIQUES = [
  'Kỹ thuật Mảnh ghép (Jigsaw)',
  'Kỹ thuật Khăn phủ bàn (Tablecloth)',
  'Kỹ thuật KWHL (Khám phá tri thức)',
  'Kỹ thuật Sơ đồ tư duy (Mindmap)',
  'Kỹ thuật Brainstorming (Công não)',
  'Kỹ thuật Hỏi và Đáp (Q&A)',
  'Kỹ thuật 3 lần 3 (3x3)',
  'Kỹ thuật Bể cá (Fishbowl)',
  'Kỹ thuật Ổ bi (Ball bearing)',
  'Kỹ thuật Động não quay vòng',
];

export const Step5Methods: React.FC<Step5MethodsProps> = ({ form }) => {
  const { watch, setValue } = form;

  const selectedMethods = watch('teachingMethods') || [];
  const selectedTechniques = watch('teachingTechniques') || [];
  const customMethods = watch('customMethods') || [];

  const [customInput, setCustomInput] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const toggleMethod = (method: string) => {
    if (selectedMethods.includes(method)) {
      setValue(
        'teachingMethods',
        selectedMethods.filter((m) => m !== method),
        { shouldDirty: true }
      );
    } else {
      setValue('teachingMethods', [...selectedMethods, method], { shouldDirty: true });
    }
  };

  const toggleTechnique = (tech: string) => {
    if (selectedTechniques.includes(tech)) {
      setValue(
        'teachingTechniques',
        selectedTechniques.filter((t) => t !== tech),
        { shouldDirty: true }
      );
    } else {
      setValue('teachingTechniques', [...selectedTechniques, tech], { shouldDirty: true });
    }
  };

  const handleAddCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (!customMethods.includes(trimmed)) {
      setValue('customMethods', [...customMethods, trimmed], { shouldDirty: true });
    }
    setCustomInput('');
  };

  const handleRemoveCustom = (methodToRemove: string) => {
    setValue(
      'customMethods',
      customMethods.filter((m) => m !== methodToRemove),
      { shouldDirty: true }
    );
  };

  const filteredMethods = PRESET_METHODS.filter((m) =>
    m.toLowerCase().includes(searchFilter.toLowerCase())
  );
  const filteredTechniques = PRESET_TECHNIQUES.filter((t) =>
    t.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" /> Bước 5: Phương pháp & Kỹ thuật Dạy học
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Lựa chọn các phương pháp dạy học tích cực và kỹ thuật tổ chức hoạt động. Quý thầy cô có thể tự bổ sung phương pháp riêng.
        </p>
      </div>

      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Search filter for fast finding */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Tìm nhanh phương pháp hoặc kỹ thuật..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        {/* 1. Preset Methods */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2.5">
            1. Các Phương pháp Dạy học Tích cực
          </label>
          <div className="flex flex-wrap gap-2">
            {filteredMethods.map((method) => {
              const isSelected = selectedMethods.includes(method);
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => toggleMethod(method)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-sm dark:bg-blue-950 dark:text-blue-300'
                      : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {isSelected ? <Check className="h-3.5 w-3.5 text-blue-600" /> : <Plus className="h-3.5 w-3.5 text-slate-400" />}
                  <span>{method}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Preset Techniques */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2.5">
            2. Các Kỹ thuật Dạy học Tích cực
          </label>
          <div className="flex flex-wrap gap-2">
            {filteredTechniques.map((tech) => {
              const isSelected = selectedTechniques.includes(tech);
              return (
                <button
                  key={tech}
                  type="button"
                  onClick={() => toggleTechnique(tech)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold shadow-sm dark:bg-indigo-950 dark:text-indigo-300'
                      : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {isSelected ? <Check className="h-3.5 w-3.5 text-indigo-600" /> : <Plus className="h-3.5 w-3.5 text-slate-400" />}
                  <span>{tech}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Custom Methods Input */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-emerald-600" /> 3. Nhập Phương pháp / Kỹ thuật tùy chỉnh khác
          </label>
          <p className="text-[11px] text-slate-500 mb-2.5">
            Nếu môn học có phương pháp chuyên biệt (ví dụ: Dịch thuật ngữ văn, Thực hành vẽ bản đồ địa lý), vui lòng nhập bên dưới:
          </p>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustom();
                }
              }}
              placeholder="Nhập tên phương pháp/kỹ thuật..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={() => handleAddCustom()}
              className="flex items-center gap-1 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              <Plus className="h-3.5 w-3.5" /> Thêm
            </button>
          </div>

          {/* Custom Methods List */}
          {customMethods.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {customMethods.map((custom) => (
                <span
                  key={custom}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300"
                >
                  <span>{custom}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustom(custom)}
                    className="rounded-full p-0.5 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-700 dark:text-emerald-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
