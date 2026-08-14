import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { UploadCloud, CheckCircle2 } from 'lucide-react';
import { WizardFormData } from '../../schemas/wizardSchema';
import { DocumentUploadSection } from '../upload/DocumentUploadSection';
import { DbLessonFile } from '../../types/database';

interface Step2DocumentUploadProps {
  form: UseFormReturn<WizardFormData>;
  uploadedFiles: DbLessonFile[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<DbLessonFile[]>>;
  lessonPlanId?: string;
}

export const Step2DocumentUpload: React.FC<Step2DocumentUploadProps> = ({
  form,
  uploadedFiles,
  setUploadedFiles,
  lessonPlanId,
}) => {
  const handleFilesChange = (files: DbLessonFile[]) => {
    setUploadedFiles(files);
    const ids = files.map((f) => f.id);
    form.setValue('fileIds', ids, { shouldDirty: true });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <UploadCloud className="h-5 w-5 text-blue-600" /> Bước 2: Tải lên Tài liệu Tham khảo (Tùy chọn)
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Hệ thống sẽ trích xuất văn bản từ file đính kèm (Giáo án mẫu, Phân phối chương trình, SGK) để học tập phong cách dạy học của quý thầy cô.
        </p>
      </div>

      <DocumentUploadSection
        lessonPlanId={lessonPlanId}
        existingFiles={uploadedFiles}
        onFilesChange={handleFilesChange}
      />

      {uploadedFiles.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>
            Đã tải lên <strong>{uploadedFiles.length} file tài liệu</strong>. Toàn bộ nội dung trích xuất sẽ được tự động truyền cho trợ lý AI ở bước tiếp theo.
          </span>
        </div>
      )}
    </div>
  );
};
