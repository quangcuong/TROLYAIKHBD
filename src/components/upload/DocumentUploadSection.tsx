import React, { useState, useRef } from 'react';
import {
  FileText,
  Calendar,
  BookOpen,
  FolderPlus,
  UploadCloud,
  FileCheck,
  AlertCircle,
  Loader2,
  Trash2,
  Eye,
  RefreshCw,
  X,
  Check,
  Copy,
  File
} from 'lucide-react';
import { DocumentCategory, DbLessonFile } from '../../types/database';
import { validateFile, MAX_FILE_SIZE_MB } from '../../utils/fileValidation';
import { useAuth } from '../../context/AuthContext';

export interface CategoryInfo {
  id: DocumentCategory;
  title: string;
  description: string;
  icon: React.ElementType;
  badgeColor: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'sample_lesson_plan',
    title: '1. Giáo án mẫu',
    description: 'Tải lên giáo án mẫu (.pdf, .docx) chuẩn cấu trúc của tổ/trường',
    icon: FileText,
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  },
  {
    id: 'curriculum_distribution',
    title: '2. Phân phối chương trình',
    description: 'Tải lên Kế hoạch giáo dục / Phân phối tiết dạy môn học',
    icon: Calendar,
    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  },
  {
    id: 'textbook_content',
    title: '3. Nội dung SGK',
    description: 'Tải lên trích đoạn nội dung bài học SGK hoặc sách giáo viên',
    icon: BookOpen,
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  },
  {
    id: 'reference_material',
    title: '4. Tài liệu tham khảo',
    description: 'Phiếu học tập, bài tập mở rộng, tư liệu tham khảo khác',
    icon: FolderPlus,
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  },
];

interface UploadProgressItem {
  id: string;
  category: DocumentCategory;
  fileName: string;
  fileSize: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
  extractedText?: string;
  fileRecord?: DbLessonFile;
}

interface DocumentUploadSectionProps {
  lessonPlanId?: string;
  onFilesChange?: (files: DbLessonFile[]) => void;
  existingFiles?: DbLessonFile[];
}

export const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  lessonPlanId,
  onFilesChange,
  existingFiles = [],
}) => {
  const { user } = useAuth();
  const [fileList, setFileList] = useState<DbLessonFile[]>(existingFiles);
  const [activeUploads, setActiveUploads] = useState<Record<string, UploadProgressItem>>({});
  const [dragOverCategory, setDragOverCategory] = useState<DocumentCategory | null>(null);
  const [categoryErrors, setCategoryErrors] = useState<Record<string, string | null>>({});

  // View modal state
  const [viewingFile, setViewingFile] = useState<DbLessonFile | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // File input refs
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Helper to format file size
  const formatSize = (bytes?: number | null) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Upload handler calling Express backend endpoint
  const processFileUpload = async (file: File, category: DocumentCategory, fileIdToReplace?: string) => {
    // Client-side validation
    const validation = validateFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!validation.valid) {
      setCategoryErrors((prev) => ({ ...prev, [category]: validation.error || 'File không hợp lệ' }));
      return;
    }

    setCategoryErrors((prev) => ({ ...prev, [category]: null }));

    const tempId = fileIdToReplace || `upload_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    // Set uploading state
    setActiveUploads((prev) => ({
      ...prev,
      [tempId]: {
        id: tempId,
        category,
        fileName: file.name,
        fileSize: file.size,
        status: 'uploading',
      },
    }));

    try {
      // Transition to processing state
      setTimeout(() => {
        setActiveUploads((prev) => (prev[tempId] ? { ...prev, [tempId]: { ...prev[tempId], status: 'processing' } } : prev));
      }, 600);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      if (lessonPlanId) formData.append('lessonPlanId', lessonPlanId);
      if (user?.id) formData.append('userId', user.id);

      const endpoint = fileIdToReplace ? `/api/files/${fileIdToReplace}/replace` : '/api/files/upload';

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Lỗi khi tải file lên hệ thống');
      }

      const uploadedRecord: DbLessonFile = json.data;

      // Update file list
      setFileList((prev) => {
        const filtered = prev.filter((f) => f.id !== uploadedRecord.id && f.id !== fileIdToReplace);
        const updated = [uploadedRecord, ...filtered];
        if (onFilesChange) onFilesChange(updated);
        return updated;
      });

      // Clear upload progress item
      setActiveUploads((prev) => {
        const copy = { ...prev };
        delete copy[tempId];
        return copy;
      });
    } catch (err: any) {
      console.error('File processing error:', err);
      setActiveUploads((prev) => ({
        ...prev,
        [tempId]: {
          id: tempId,
          category,
          fileName: file.name,
          fileSize: file.size,
          status: 'failed',
          error: err.message || 'Lỗi khi xử lý file',
        },
      }));
    }
  };

  const handleDrop = (e: React.DragEvent, category: DocumentCategory) => {
    e.preventDefault();
    setDragOverCategory(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      processFileUpload(droppedFile, category);
    }
  };

  const handleDragOver = (e: React.DragEvent, category: DocumentCategory) => {
    e.preventDefault();
    setDragOverCategory(category);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverCategory(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, category: DocumentCategory, replaceFileId?: string) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      processFileUpload(selectedFile, category, replaceFileId);
      e.target.value = ''; // reset input
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này không?')) return;

    try {
      const response = await fetch(`/api/files/${fileId}?userId=${user?.id || 'usr_001'}`, {
        method: 'DELETE',
      });
      const json = await response.json();

      if (response.ok && json.success) {
        setFileList((prev) => {
          const updated = prev.filter((f) => f.id !== fileId);
          if (onFilesChange) onFilesChange(updated);
          return updated;
        });
      } else {
        alert(json.error || 'Không thể xóa file');
      }
    } catch (err: any) {
      alert('Lỗi khi gửi yêu cầu xóa file: ' + err.message);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Notification */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Trung tâm Tải lên & Trích xuất Văn bản
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Hỗ trợ file <span className="font-semibold text-blue-700 dark:text-blue-300">.PDF</span> và{' '}
              <span className="font-semibold text-blue-700 dark:text-blue-300">.DOCX</span> (Tối đa {MAX_FILE_SIZE_MB}MB).{' '}
              <span className="text-red-500 font-medium">Không hỗ trợ .DOCM</span>
            </p>
          </div>
        </div>
      </div>

      {/* 4 Upload Dropzone Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isDragOver = dragOverCategory === cat.id;
          const catFiles = fileList.filter((f) => f.metadata?.category === cat.id);
          const catActiveUploads = (Object.values(activeUploads) as UploadProgressItem[]).filter(
            (u) => u.category === cat.id
          );
          const errorMessage = categoryErrors[cat.id];

          return (
            <div
              key={cat.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                {/* Zone Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`rounded-xl px-2.5 py-1 text-xs font-bold ${cat.badgeColor}`}>
                      {cat.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {catFiles.length} file đã tải
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{cat.description}</p>

                {/* Error Banner if any */}
                {errorMessage && (
                  <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCategoryErrors((prev) => ({ ...prev, [cat.id]: null }))}
                      className="text-red-400 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Drag and Drop Box */}
                <div
                  onDrop={(e) => handleDrop(e, cat.id)}
                  onDragOver={(e) => handleDragOver(e, cat.id)}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRefs.current[cat.id]?.click()}
                  className={`group relative cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${
                    isDragOver
                      ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/50'
                      : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/50 dark:border-slate-700 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <input
                    ref={(el) => { fileInputRefs.current[cat.id] = el; }}
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, cat.id)}
                  />

                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-blue-950 dark:group-hover:text-blue-400 transition">
                    <Icon className="h-5 w-5" />
                  </div>

                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Kéo thả file vào đây hoặc <span className="text-blue-600 underline">chọn file</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">PDF hoặc DOCX (Tối đa 25MB)</p>
                </div>

                {/* Active Uploading / Processing Items */}
                {catActiveUploads.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {catActiveUploads.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-xs dark:border-blue-900/40 dark:bg-blue-950/30"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {item.status === 'uploading' && (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600 shrink-0" />
                          )}
                          {item.status === 'processing' && (
                            <Loader2 className="h-4 w-4 animate-spin text-purple-600 shrink-0" />
                          )}
                          {item.status === 'failed' && (
                            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                          )}

                          <div className="truncate">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{item.fileName}</p>
                            <p className="text-[11px] text-slate-500">
                              {item.status === 'uploading' && 'Đang tải file lên...'}
                              {item.status === 'processing' && 'Đang trích xuất văn bản...'}
                              {item.status === 'failed' && (item.error || 'Lỗi xử lý')}
                              {item.status !== 'failed' && ` (${formatSize(item.fileSize)})`}
                            </p>
                          </div>
                        </div>

                        {item.status === 'failed' && (
                          <button
                            type="button"
                            onClick={() =>
                              setActiveUploads((prev) => {
                                const copy = { ...prev };
                                delete copy[item.id];
                                return copy;
                              })
                            }
                            className="text-slate-400 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Uploaded File Cards List */}
                {catFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">File đã sẵn sàng:</p>
                    {catFiles.map((f) => {
                      const isDocx = f.file_name.endsWith('.docx');
                      const charCount = f.metadata?.char_count || f.extracted_text?.length || 0;
                      const wordCount = f.metadata?.word_count || 0;

                      return (
                        <div
                          key={f.id}
                          className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/50"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-bold text-xs ${
                              isDocx ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                            }`}>
                              {isDocx ? 'DOCX' : 'PDF'}
                            </div>

                            <div className="truncate">
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {f.file_name}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                <span>{formatSize(f.file_size)}</span>
                                <span>•</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                  {charCount > 0 ? `Đã trích xuất ${charCount.toLocaleString()} ký tự` : 'Sẵn sàng'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons: Xem, Thay thế, Xóa */}
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {/* View Modal Trigger */}
                            <button
                              type="button"
                              onClick={() => setViewingFile(f)}
                              title="Xem văn bản đã trích xuất"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {/* Replace File Trigger */}
                            <label
                              title="Thay thế file"
                              className="cursor-pointer rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                            >
                              <RefreshCw className="h-4 w-4" />
                              <input
                                type="file"
                                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                className="hidden"
                                onChange={(e) => handleFileSelect(e, cat.id, f.id)}
                              />
                            </label>

                            {/* Delete File Trigger */}
                            <button
                              type="button"
                              onClick={() => handleDeleteFile(f.id)}
                              title="Xóa file"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-red-100 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950 dark:hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Extracted Text View Modal */}
      {viewingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {viewingFile.file_name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dung lượng: {formatSize(viewingFile.file_size)} • Độ dài:{' '}
                    {(viewingFile.extracted_text?.length || 0).toLocaleString()} ký tự
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingFile(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: Extracted Text Box */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nội dung văn bản đã trích xuất từ file (Mammoth / PDF-Parse):
                </span>
                {viewingFile.extracted_text && (
                  <button
                    type="button"
                    onClick={() => handleCopyText(viewingFile.extracted_text || '')}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {copiedText ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" /> Đã sao chép
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Sao chép văn bản
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-mono text-slate-800 leading-relaxed dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 max-h-[400px] overflow-y-auto whitespace-pre-wrap">
                {viewingFile.extracted_text || 'Chưa có nội dung văn bản được trích xuất.'}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-slate-100 px-6 py-3 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setViewingFile(null)}
                className="rounded-xl bg-slate-100 px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
