import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FileText, FlaskConical, GraduationCap, Check } from 'lucide-react';
import { WizardFormData } from '../../schemas/wizardSchema';
import { DocumentType } from '../../types';

interface Step1DocTypeProps {
  form: UseFormReturn<WizardFormData>;
}

export const Step1DocType: React.FC<Step1DocTypeProps> = ({ form }) => {
  const selectedType = form.watch('type');

  const options: {
    id: DocumentType;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    badgeColor: string;
    features: string[];
    bgActive: string;
    borderActive: string;
  }[] = [
    {
      id: '5512',
      title: 'KHBD Công văn 5512',
      subtitle: 'Giáo án tiết dạy tiêu chuẩn Bộ GD&ĐT',
      icon: FileText,
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
      bgActive: 'bg-blue-50/70 dark:bg-blue-950/40',
      borderActive: 'border-blue-600 ring-2 ring-blue-500/20',
      features: [
        'Khung 3 mục tiêu: Kiến thức - Năng lực - Phẩm chất',
        'Chuỗi 4 hoạt động: Mở đầu - Hình thành kiến thức - Luyện tập - Vận dụng',
        'Tổ chức thực hiện 4 bước: Giao NV - Thực hiện NV - Báo cáo - Kết luận',
        'Phù hợp mọi tiết dạy lý thuyết, bài tập thông thường',
      ],
    },
    {
      id: 'stem',
      title: 'Bài học / Chủ đề STEM',
      subtitle: 'Tích hợp khoa học, công nghệ, kỹ thuật, toán',
      icon: FlaskConical,
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      bgActive: 'bg-emerald-50/70 dark:bg-emerald-950/40',
      borderActive: 'border-emerald-600 ring-2 ring-emerald-500/20',
      features: [
        'Quy trình thiết kế kỹ thuật chế tạo sản phẩm STEM',
        'Ma trận tích hợp 4 lĩnh vực S-T-E-M rõ ràng',
        'Bảng tiêu chí đánh giá sản phẩm & Bảng kiểm rubric',
        'Rèn luyện tư duy thiết kế, giải quyết vấn đề thực tế',
      ],
    },
    {
      id: 'ncbh',
      title: 'Nghiên cứu Bài học (NCBH)',
      subtitle: 'Giáo án phục vụ sinh hoạt chuyên môn',
      icon: GraduationCap,
      badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
      bgActive: 'bg-amber-50/70 dark:bg-amber-950/40',
      borderActive: 'border-amber-600 ring-2 ring-amber-500/20',
      features: [
        'Tập trung quan sát và phân tích hành vi học tập của HS',
        'Xác định điểm quan sát trọng tâm cho giáo viên dự giờ',
        'Hệ thống câu hỏi thảo luận rút kinh nghiệm tổ chuyên môn',
        'Phù hợp chuyên đề minh họa & nâng cao chất lượng dạy học',
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" /> Bước 1: Chọn Loại Kế hoạch Bài dạy
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Lựa chọn mô hình giáo án phù hợp với yêu cầu chỉ đạo chuyên môn của Nhà trường và Tổ bộ môn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selectedType === opt.id;

          return (
            <div
              key={opt.id}
              onClick={() => form.setValue('type', opt.id, { shouldValidate: true, shouldDirty: true })}
              className={`relative cursor-pointer flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200 ${
                isSelected
                  ? `${opt.borderActive} ${opt.bgActive} shadow-md`
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                  <Check className="h-3.5 w-3.5" />
                </div>
              )}

              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <span className={`inline-block rounded-lg px-2.5 py-0.5 text-[11px] font-bold ${opt.badgeColor}`}>
                      {opt.id.toUpperCase()}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{opt.title}</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{opt.subtitle}</p>

                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                  {opt.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-3">
                <button
                  type="button"
                  className={`w-full rounded-xl py-2 text-xs font-bold transition ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {isSelected ? 'Đã lựa chọn' : 'Chọn loại giáo án này'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
