import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Settings, Laptop, Users, Building, Plus } from 'lucide-react';
import { WizardFormData } from '../../schemas/wizardSchema';

interface Step4ConditionsProps {
  form: UseFormReturn<WizardFormData>;
}

export const Step4Conditions: React.FC<Step4ConditionsProps> = ({ form }) => {
  const { register, setValue, watch } = form;

  const currentTeacherEq = watch('teacherEquipment');
  const currentStudentEq = watch('studentEquipment');
  const currentDigital = watch('digitalTools');

  const appendSuggestion = (fieldName: keyof WizardFormData, text: string) => {
    const currentVal = (watch(fieldName) as string) || '';
    if (!currentVal) {
      setValue(fieldName, text, { shouldDirty: true });
    } else if (!currentVal.includes(text)) {
      setValue(fieldName, `${currentVal}, ${text}`, { shouldDirty: true });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" /> Bước 4: Điều kiện Tổ chức Dạy học
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Khai báo trang thiết bị, học liệu số và chuẩn bị của học sinh để AI thiết kế chuỗi hoạt động khả thi nhất.
        </p>
      </div>

      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Teacher Equipment */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
            <Laptop className="h-3.5 w-3.5 text-blue-600" /> 1. Thiết bị & Học liệu của Giáo viên
          </label>
          <textarea
            rows={2}
            {...register('teacherEquipment')}
            placeholder="VD: Máy tính cá nhân, Máy chiếu projector, Bài giảng điện tử Canva, Kế hoạch bài dạy..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Gợi ý nhanh:</span>
            {[
              'Máy tính & Máy chiếu',
              'Bài giảng Canva/PowerPoint',
              'Phiếu học tập cá nhân & nhóm',
              'Bộ thí nghiệm thực hành',
              'Mô hình/Tranh ảnh trực quan',
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => appendSuggestion('teacherEquipment', item)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <Plus className="h-2.5 w-2.5" /> {item}
              </button>
            ))}
          </div>
        </div>

        {/* Student Equipment */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-emerald-600" /> 2. Đồ dùng & Học liệu của Học sinh
          </label>
          <textarea
            rows={2}
            {...register('studentEquipment')}
            placeholder="VD: Sách giáo khoa, Vở ghi bài, Dụng cụ vẽ hình/đo đạc, Bảng nhóm A0, Bút dạ..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Gợi ý nhanh:</span>
            {[
              'SGK & Vở ghi',
              'Bảng phụ nhóm A0 & Bút dạ',
              'Giấy ghi chú Post-it',
              'Điện thoại thông minh/Máy tính bảng',
              'Bộ dụng cụ thực hành',
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => appendSuggestion('studentEquipment', item)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <Plus className="h-2.5 w-2.5" /> {item}
              </button>
            ))}
          </div>
        </div>

        {/* Digital Tools / Software */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
            <Laptop className="h-3.5 w-3.5 text-purple-600" /> 3. Ứng dụng CNTT & Học liệu số tích hợp
          </label>
          <textarea
            rows={2}
            {...register('digitalTools')}
            placeholder="VD: Phần mềm mô phỏng PhET, Trò chơi Kahoot/Quizizz, Padlet thảo luận..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Gợi ý nhanh:</span>
            {[
              'Mô phỏng PhET / GeoGebra',
              'Kahoot / Quizizz / Wordwall',
              'Padlet / Google Jamboard',
              'Video thí nghiệm / Tư liệu 3D',
              'Phiếu học tập điện tử Google Forms',
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => appendSuggestion('digitalTools', item)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <Plus className="h-2.5 w-2.5" /> {item}
              </button>
            ))}
          </div>
        </div>

        {/* Classroom Facilities & Prerequisites */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5 text-amber-600" /> Cơ sở vật chất phòng học
            </label>
            <input
              type="text"
              {...register('classroomFacilities')}
              placeholder="Lớp học truyền thống / Phòng máy tính / Phòng thí nghiệm..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Kiến thức & Kỹ năng tiên quyết của HS
            </label>
            <input
              type="text"
              {...register('studentPrerequisites')}
              placeholder="VD: Đã nắm kiến thức bài trước, có kỹ năng làm việc nhóm..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
