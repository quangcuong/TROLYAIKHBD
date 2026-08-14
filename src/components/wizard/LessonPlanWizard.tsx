import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Check,
  AlertCircle,
  X,
  History,
  Sparkles,
  RotateCcw
} from 'lucide-react';

import { wizardFormSchema, WizardFormData } from '../../schemas/wizardSchema';
import { WizardStepIndicator, WIZARD_STEPS } from './WizardStepIndicator';
import { Step1DocType } from './Step1DocType';
import { Step2DocumentUpload } from './Step2DocumentUpload';
import { Step3LessonInfo } from './Step3LessonInfo';
import { Step4Conditions } from './Step4Conditions';
import { Step5Methods } from './Step5Methods';
import { Step6AdditionalRequirements } from './Step6AdditionalRequirements';
import { Step7ReviewConfirm } from './Step7ReviewConfirm';

import { useLessonPlans } from '../../context/LessonPlanContext';
import { useAuth } from '../../context/AuthContext';
import { LessonPlan, DocumentType, GradeLevel, TextbookSeries } from '../../types';
import { DbLessonFile } from '../../types/database';

const DRAFT_STORAGE_KEY = 'lesson_plan_wizard_draft_v1';

interface LessonPlanWizardProps {
  onNavigate: (page: string, params?: { type?: string; planId?: string }) => void;
  initialType?: string;
}

export const LessonPlanWizard: React.FC<LessonPlanWizardProps> = ({
  onNavigate,
  initialType,
}) => {
  const { addPlan } = useLessonPlans();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxReachedStep, setMaxReachedStep] = useState<number>(1);
  const [uploadedFiles, setUploadedFiles] = useState<DbLessonFile[]>([]);
  const [hasDraft, setHasDraft] = useState<boolean>(false);
  const [draftTimestamp, setDraftTimestamp] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Default Form Values
  const defaultValues: WizardFormData = {
    type: (initialType as DocumentType) || '5512',
    fileIds: [],
    subject: user?.subject || 'Vật lý',
    grade: 'Lớp 10',
    textbook: 'Kết nối tri thức với cuộc sống',
    title: '',
    duration: '2 tiết (90 phút)',
    generalObjectives: '',
    knowledgeObjectives: '',
    capabilityObjectives: '',
    qualityObjectives: '',
    researchTopic: '',
    researchGoals: '',
    focusObservationQuestions: '',
    stemTheme: '',
    stemProductDescription: '',
    integratedScience: '',
    integratedTechnology: '',
    integratedEngineering: '',
    integratedMath: '',
    teacherEquipment: 'Máy tính cá nhân, Máy chiếu, Bài giảng điện tử Canva',
    studentEquipment: 'SGK, Vở ghi, Bảng nhóm A0, Bút dạ',
    digitalTools: 'Mô phỏng PhET, Trò chơi Kahoot, Phiếu học tập Google Forms',
    classroomFacilities: 'Lớp học tiêu chuẩn, bàn ghế di chuyển linh hoạt',
    studentPrerequisites: 'Đã nắm chắc kiến thức lý thuyết bài học trước đó',
    teachingMethods: ['Dạy học nhóm & thảo luận', 'Thí nghiệm & thực hành'],
    teachingTechniques: ['Kỹ thuật Mảnh ghép (Jigsaw)', 'Kỹ thuật Sơ đồ tư duy (Mindmap)'],
    customMethods: [],
    differentiatedInstruction: 'Phân hóa 3 mức độ (Nhận biết - Thông hiểu - Vận dụng)',
    digitalCompetency: 'Tự tra cứu tư liệu bài học và thực hành phần mềm mô phỏng',
    enableAICapability: true,
    specialNotes: '',
  };

  const form = useForm<WizardFormData>({
    resolver: zodResolver(wizardFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    reset,
    trigger,
    formState: { isDirty, errors },
  } = form;

  // Check for saved draft on mount
  useEffect(() => {
    try {
      const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (rawDraft) {
        const parsed = JSON.parse(rawDraft);
        if (parsed && parsed.data) {
          setHasDraft(true);
          setDraftTimestamp(parsed.updatedAt ? new Date(parsed.updatedAt).toLocaleString('vi-VN') : 'vừa xong');
        }
      }
    } catch (e) {
      console.warn('Failed to parse draft from localStorage:', e);
    }
  }, []);

  // Warn on page unload if form is dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Auto-save form state to localStorage
  const autoSaveDraftToStorage = () => {
    try {
      const currentValues = form.getValues();
      const payload = {
        data: currentValues,
        uploadedFiles,
        step: currentStep,
        maxReachedStep,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn('Failed auto-saving draft:', err);
    }
  };

  // Resume saved draft
  const handleResumeDraft = () => {
    try {
      const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (rawDraft) {
        const parsed = JSON.parse(rawDraft);
        if (parsed.data) {
          reset(parsed.data);
          if (parsed.uploadedFiles) {
            setUploadedFiles(parsed.uploadedFiles);
          }
          if (parsed.step) {
            setCurrentStep(parsed.step);
            setMaxReachedStep(parsed.maxReachedStep || parsed.step);
          }
          showToast('Đã khôi phục bản nháp thành công!');
        }
      }
    } catch (e) {
      console.error('Failed restoring draft:', e);
    } finally {
      setHasDraft(false);
    }
  };

  // Discard draft
  const handleDiscardDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasDraft(false);
    showToast('Đã xóa bản nháp cũ. Bắt đầu tạo mới!');
  };

  // Manual save draft
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    autoSaveDraftToStorage();
    await new Promise((r) => setTimeout(r, 400));
    setIsSavingDraft(false);
    showToast('Đã lưu bản nháp tự động thành công!');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Validate step fields before proceeding
  const handleNextStep = async () => {
    let isValid = true;

    if (currentStep === 1) {
      isValid = await trigger(['type']);
    } else if (currentStep === 3) {
      isValid = await trigger(['title', 'subject', 'grade', 'textbook', 'duration']);
    }

    if (!isValid) {
      showToast('Vui lòng hoàn thành các thông tin bắt buộc trước khi tiếp tục!');
      return;
    }

    const nextStep = Math.min(currentStep + 1, WIZARD_STEPS.length);
    setCurrentStep(nextStep);
    if (nextStep > maxReachedStep) {
      setMaxReachedStep(nextStep);
    }
    autoSaveDraftToStorage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    const prevStep = Math.max(currentStep - 1, 1);
    setCurrentStep(prevStep);
    autoSaveDraftToStorage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectStep = (step: number) => {
    if (step <= maxReachedStep) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Final Form Submission
  const onFinalSubmit = async (formData: WizardFormData) => {
    setIsSubmitting(true);
    try {
      const newPlanId = `lp_${Date.now()}`;
      const newPlan: LessonPlan = {
        id: newPlanId,
        title: formData.title.startsWith('Kế hoạch') ? formData.title : `Kế hoạch bài dạy: ${formData.title}`,
        type: formData.type,
        subject: formData.subject,
        grade: formData.grade as GradeLevel,
        textbook: formData.textbook as TextbookSeries,
        duration: formData.duration,
        authorId: user?.id || 'usr_001',
        authorName: user?.name || 'Giáo viên',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        summary: `Giáo án đã cấu hình qua Wizard cho bài "${formData.title}" môn ${formData.subject} - ${formData.grade}.`,
        tags: [formData.type.toUpperCase(), formData.subject, formData.grade, 'Wizard Configured'],
        viewsCount: 1,
        likesCount: 0,
        content5512:
          formData.type === '5512'
            ? {
                objectives: {
                  knowledge: formData.knowledgeObjectives
                    ? [formData.knowledgeObjectives]
                    : ['Mục tiêu kiến thức chuẩn công văn 5512.'],
                  capabilities: formData.capabilityObjectives
                    ? [formData.capabilityObjectives]
                    : ['Năng lực tự học và giải quyết vấn đề.'],
                  qualities: formData.qualityObjectives
                    ? [formData.qualityObjectives]
                    : ['Chăm chỉ, trung thực và có trách nhiệm.'],
                },
                teachingEquipment: {
                  teacher: [formData.teacherEquipment],
                  students: [formData.studentEquipment],
                },
                activities: [
                  {
                    id: 'act_1',
                    title: 'Hoạt động 1: Mở đầu (Khởi động - 7 phút)',
                    time: '7 phút',
                    objective: 'Tạo tâm thế học tập và kết nối tri thức.',
                    content: 'Học sinh tham gia thảo luận trò chơi hoặc tình huống mở đầu.',
                    product: 'Câu trả lời của học sinh trên bảng nhóm.',
                    implementation: 'GV nêu câu hỏi -> HS thảo luận -> GV chốt kiến thức.',
                  },
                ],
              }
            : undefined,
        contentNCBH:
          formData.type === 'ncbh'
            ? {
                researchTopic: formData.researchTopic || `Nghiên cứu bài học chuyên đề: ${formData.title}`,
                researchGoals: [formData.researchGoals || 'Quan sát hành vi học tập của học sinh'],
                focusQuestions: [formData.focusObservationQuestions || 'Học sinh có gặp khó khăn không?'],
                activities: [],
                postLessonReflectionCriteria: ['Mức độ tương tác của học sinh'],
              }
            : undefined,
        contentSTEM:
          formData.type === 'stem'
            ? {
                stemTheme: formData.stemTheme || `Chủ đề STEM: ${formData.title}`,
                productDescription: formData.stemProductDescription || 'Mô hình sản phẩm STEM học sinh chế tạo.',
                integratedSubjects: {
                  science: formData.integratedScience || 'Kiến thức khoa học cốt lõi',
                  technology: formData.integratedTechnology || 'Công nghệ gia công',
                  engineering: formData.integratedEngineering || 'Quy trình thiết kế kỹ thuật',
                  mathematics: formData.integratedMath || 'Tính toán thông số',
                },
                productCriteria: [],
                designSteps: [],
                assessmentRubric: [],
              }
            : undefined,
      };

      await addPlan(newPlan);
      // Clean draft after successful creation
      localStorage.removeItem(DRAFT_STORAGE_KEY);

      showToast('Khởi tạo cấu hình giáo án thành công!');
      setTimeout(() => {
        onNavigate('plan_detail', { planId: newPlanId });
      }, 500);
    } catch (err) {
      console.error('Failed submitting plan:', err);
      showToast('Có lỗi xảy ra khi tạo giáo án. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelClick = () => {
    if (isDirty) {
      setShowExitConfirm(true);
    } else {
      onNavigate('dashboard');
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-4 px-2 sm:px-4">
      {/* Toast Banner Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-2xl dark:bg-blue-600 animate-slideIn">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Draft Resume Banner Prompt */}
      {hasDraft && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50/90 p-4 shadow-sm dark:border-blue-900 dark:bg-blue-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <History className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-900 dark:text-blue-100">
                Phát hiện bản nháp chưa hoàn tất ({draftTimestamp})
              </p>
              <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                Bạn có muốn tiếp tục chỉnh sửa từ bản nháp đã lưu không?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-slate-900 dark:text-blue-300"
            >
              Bỏ qua & Tạo mới
            </button>
            <button
              type="button"
              onClick={handleResumeDraft}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Tiếp tục bản nháp
            </button>
          </div>
        </div>
      )}

      {/* Header Bar with Title & Exit */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Thủ thuật Wizard Tạo Giáo án Tiêu chuẩn GDPT 2018
          </h1>
          <p className="text-xs text-slate-500">Quy trình 7 bước cấu hình chuẩn mực trước khi khởi tạo</p>
        </div>

        <button
          type="button"
          onClick={handleCancelClick}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <X className="h-4 w-4" /> Thoát
        </button>
      </div>

      {/* Visual Step Indicator */}
      <WizardStepIndicator
        currentStep={currentStep}
        onSelectStep={handleSelectStep}
        maxReachedStep={maxReachedStep}
      />

      {/* Form Area */}
      <form onSubmit={handleSubmit(onFinalSubmit)} className="space-y-6">
        {currentStep === 1 && <Step1DocType form={form} />}

        {currentStep === 2 && (
          <Step2DocumentUpload
            form={form}
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
          />
        )}

        {currentStep === 3 && <Step3LessonInfo form={form} />}

        {currentStep === 4 && <Step4Conditions form={form} />}

        {currentStep === 5 && <Step5Methods form={form} />}

        {currentStep === 6 && <Step6AdditionalRequirements form={form} />}

        {currentStep === 7 && (
          <Step7ReviewConfirm
            form={form}
            uploadedFiles={uploadedFiles}
            onJumpToStep={setCurrentStep}
            onSaveDraft={handleSaveDraft}
            onSubmitPlan={() => handleSubmit(onFinalSubmit)()}
            isSavingDraft={isSavingDraft}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Step Navigation Controls (Steps 1 to 6) */}
        {currentStep < 7 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
            {/* Left: Previous Step or Cancel */}
            <div>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                >
                  <ArrowLeft className="h-4 w-4" /> Quay lại
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCancelClick}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                >
                  Hủy bỏ
                </button>
              )}
            </div>

            {/* Right: Save Draft & Continue */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                <Save className="h-4 w-4 text-slate-500" />
                <span>{isSavingDraft ? 'Đang lưu...' : 'Lưu bản nháp'}</span>
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700"
              >
                <span>Tiếp tục (Bước {currentStep + 1}/7)</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Thoát wizard tạo giáo án?</h3>
                <p className="text-xs text-slate-500 mt-0.5">Bạn có các thay đổi chưa được lưu vào danh sách chính.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Bạn có muốn lưu lại bản nháp vào bộ nhớ trước khi rời khỏi trang không?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  onNavigate('dashboard');
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:border-slate-700 dark:hover:bg-red-950/40"
              >
                Bỏ qua & Thoát
              </button>

              <button
                type="button"
                onClick={() => {
                  handleSaveDraft();
                  setShowExitConfirm(false);
                  onNavigate('dashboard');
                }}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
              >
                Lưu bản nháp & Thoát
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
