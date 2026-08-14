import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BookOpen, Sparkles, Target, Layers, Cpu } from 'lucide-react';
import { WizardFormData } from '../../schemas/wizardSchema';
import { GradeLevel, TextbookSeries } from '../../types';

interface Step3LessonInfoProps {
  form: UseFormReturn<WizardFormData>;
}

export const Step3LessonInfo: React.FC<Step3LessonInfoProps> = ({ form }) => {
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  const docType = watch('type');

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" /> Bước 3: Khai báo Thông tin Bài học
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Điền các thông tin cơ bản về môn học, bài dạy và định hướng mục tiêu bài học.
        </p>
      </div>

      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
            Tên Bài học / Chủ đề Giáo án <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('title')}
            placeholder="VD: Bài 12: Lực ma sát và ứng dụng / Chủ đề: Mô hình Nhà kính trồng rau..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
        </div>

        {/* Subject & Grade */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Môn học <span className="text-red-500">*</span>
            </label>
            <select
              {...register('subject')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="Vật lý">Vật lý</option>
              <option value="Toán học">Toán học</option>
              <option value="Khoa học Tự nhiên">Khoa học Tự nhiên</option>
              <option value="Hóa học">Hóa học</option>
              <option value="Sinh học">Sinh học</option>
              <option value="Ngữ văn">Ngữ văn</option>
              <option value="Tiếng Anh">Tiếng Anh</option>
              <option value="Tin học">Tin học</option>
              <option value="Công nghệ">Công nghệ</option>
              <option value="Lịch sử & Địa lý">Lịch sử & Địa lý</option>
              <option value="Giáo dục công dân">Giáo dục công dân</option>
            </select>
            {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Khối lớp <span className="text-red-500">*</span>
            </label>
            <select
              {...register('grade')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {(['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'] as GradeLevel[]).map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            {errors.grade && <p className="mt-1 text-xs text-red-500">{errors.grade.message}</p>}
          </div>
        </div>

        {/* Textbook & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Bộ sách giáo khoa <span className="text-red-500">*</span>
            </label>
            <select
              {...register('textbook')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {(
                [
                  'Kết nối tri thức với cuộc sống',
                  'Cánh diều',
                  'Chân trời sáng tạo',
                  'Khác',
                ] as TextbookSeries[]
              ).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Thời lượng tiết học <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('duration')}
              placeholder="VD: 2 tiết (90 phút) / 1 tiết (45 phút)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* General Objectives / Yêu cầu cần đạt */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
            <span>Yêu cầu cần đạt / Mục tiêu chung của bài học</span>
            <span className="text-[11px] font-normal text-slate-400">(Trích từ CT GDPT 2018)</span>
          </label>
          <textarea
            rows={3}
            {...register('generalObjectives')}
            placeholder="Nêu các yêu cầu cần đạt trọng tâm của bài học..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        {/* DYNAMIC FIELDS PER TYPE */}

        {/* 5512 Specific Fields */}
        {docType === '5512' && (
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <Target className="h-4 w-4" /> Chi tiết 3 Mục tiêu theo Công văn 5512
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  1. Mục tiêu Kiến thức
                </label>
                <textarea
                  rows={2}
                  {...register('knowledgeObjectives')}
                  placeholder="Nêu các kiến thức cốt lõi HS cần trình bày, phân tích, vận dụng..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  2. Mục tiêu Năng lực (Năng lực đặc thù & Năng lực chung)
                </label>
                <textarea
                  rows={2}
                  {...register('capabilityObjectives')}
                  placeholder="Năng lực chuyên môn, tự chủ tự học, giao tiếp hợp tác..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  3. Mục tiêu Phẩm chất
                </label>
                <textarea
                  rows={2}
                  {...register('qualityObjectives')}
                  placeholder="Yêu nước, nhân ái, chăm chỉ, trung thực, trách nhiệm..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* NCBH Specific Fields */}
        {docType === 'ncbh' && (
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Layers className="h-4 w-4" /> Chi tiết Mục tiêu Nghiên cứu Bài học (NCBH)
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Chủ đề nghiên cứu bài học
                </label>
                <input
                  type="text"
                  {...register('researchTopic')}
                  placeholder="VD: Đổi mới phương pháp dạy học thông qua quan sát hành vi tiếp thu của HS yếu"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mục tiêu nghiên cứu của Tổ chuyên môn
                </label>
                <textarea
                  rows={2}
                  {...register('researchGoals')}
                  placeholder="Các vấn đề giảng dạy tổ chuyên môn đang cần rút kinh nghiệm và thống nhất..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Câu hỏi quan sát trọng tâm cho Giáo viên dự giờ
                </label>
                <textarea
                  rows={2}
                  {...register('focusObservationQuestions')}
                  placeholder="Học sinh gặp vướng mắc ở bước nào? Phản ứng của HS khi làm việc nhóm?"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEM Specific Fields */}
        {docType === 'stem' && (
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Cpu className="h-4 w-4" /> Ma trận Tích hợp Bài học STEM
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Chủ đề Dự án STEM & Mô tả Sản phẩm HS chế tạo
                </label>
                <input
                  type="text"
                  {...register('stemTheme')}
                  placeholder="Tên bài học/dự án STEM"
                  className="w-full mb-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <textarea
                  rows={2}
                  {...register('stemProductDescription')}
                  placeholder="Mô tả cụ thể mô hình/sản phẩm học sinh cần hoàn thành (kích thước, tính năng)..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Science (Khoa học):
                  </label>
                  <input
                    type="text"
                    {...register('integratedScience')}
                    placeholder="Kiến thức khoa học cốt lõi..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Technology (Công nghệ):
                  </label>
                  <input
                    type="text"
                    {...register('integratedTechnology')}
                    placeholder="Sử dụng phần mềm, công cụ gia công..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Engineering (Kỹ thuật):
                  </label>
                  <input
                    type="text"
                    {...register('integratedEngineering')}
                    placeholder="Quy trình thiết kế & thử nghiệm..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Mathematics (Toán học):
                  </label>
                  <input
                    type="text"
                    {...register('integratedMath')}
                    placeholder="Tính toán thông số, tỉ lệ, chi phí..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
