import React, { useState, useEffect } from 'react';
import {
  FileSearch,
  FileText,
  Sparkles,
  ShieldCheck,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DbLessonPlan } from '../../types/database';

interface AIPipelineProgressProps {
  lessonPlanId: string;
  onPlanUpdated?: (updatedPlan: DbLessonPlan) => void;
}

export const AIPipelineProgress: React.FC<AIPipelineProgressProps> = ({
  lessonPlanId,
  onPlanUpdated,
}) => {
  const [lessonPlan, setLessonPlan] = useState<DbLessonPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [runningStep, setRunningStep] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  const [docType, setDocType] = useState<'5512' | 'ncbh' | 'stem'>('5512');

  const fetchPlanDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/lesson-plans/${lessonPlanId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setLessonPlan(json.data);
        if (json.data.type) {
          setDocType(json.data.type as '5512' | 'ncbh' | 'stem');
        }
        if (onPlanUpdated) {
          onPlanUpdated(json.data);
        }
      } else {
        setErrorMsg(json.error || 'Không tìm thấy dữ liệu giáo án');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi tải dữ liệu giáo án');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lessonPlanId) {
      fetchPlanDetail();
    }
  }, [lessonPlanId]);

  const pipelineSteps = lessonPlan?.metadata?.pipeline_steps || {};
  const step1 = pipelineSteps.step1_template;
  const step2 = pipelineSteps.step2_extraction;
  const step3 = pipelineSteps.step3_generation;
  const step4 = pipelineSteps.step4_validation;

  // Run Stage 1
  const runStage1 = async () => {
    try {
      setRunningStep(1);
      setErrorMsg(null);
      const res = await fetch('/api/ai/analyze-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonPlanId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Phân tích mẫu giáo án thất bại');
      }
      if (json.lessonPlan) {
        setLessonPlan(json.lessonPlan);
        if (onPlanUpdated) onPlanUpdated(json.lessonPlan);
      } else {
        await fetchPlanDetail();
      }
      setExpandedStep(2); // Auto move to next step UI focus
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khởi tạo Bước 1');
      await fetchPlanDetail();
    } finally {
      setRunningStep(null);
    }
  };

  // Run Stage 2
  const runStage2 = async () => {
    try {
      setRunningStep(2);
      setErrorMsg(null);
      const res = await fetch('/api/ai/extract-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonPlanId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Trích xuất tài liệu thất bại');
      }
      if (json.lessonPlan) {
        setLessonPlan(json.lessonPlan);
        if (onPlanUpdated) onPlanUpdated(json.lessonPlan);
      } else {
        await fetchPlanDetail();
      }
      setExpandedStep(3);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khởi tạo Bước 2');
      await fetchPlanDetail();
    } finally {
      setRunningStep(null);
    }
  };

  // Run Stage 3
  const runStage3 = async () => {
    try {
      setRunningStep(3);
      setErrorMsg(null);
      const res = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonPlanId, docType }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Sinh giáo án bằng AI thất bại');
      }
      if (json.lessonPlan) {
        setLessonPlan(json.lessonPlan);
        if (onPlanUpdated) onPlanUpdated(json.lessonPlan);
      } else {
        await fetchPlanDetail();
      }
      setExpandedStep(4);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khởi tạo Bước 3');
      await fetchPlanDetail();
    } finally {
      setRunningStep(null);
    }
  };

  // Run Stage 4
  const runStage4 = async () => {
    try {
      setRunningStep(4);
      setErrorMsg(null);
      const res = await fetch('/api/ai/validate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonPlanId, autoFix: true }),
      });
      const json = await res.json();
      if (json.lessonPlan) {
        setLessonPlan(json.lessonPlan);
        if (onPlanUpdated) onPlanUpdated(json.lessonPlan);
      } else {
        await fetchPlanDetail();
      }
      if (!res.ok || !json.success) {
        setErrorMsg(json.error?.message || 'Kiểm định giáo án phát hiện lỗi chất lượng.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kiểm định Bước 4');
      await fetchPlanDetail();
    } finally {
      setRunningStep(null);
    }
  };

  // Run full 4-stage pipeline sequentially
  const runFullPipeline = async () => {
    try {
      setErrorMsg(null);
      await runStage1();
      await runStage2();
      await runStage3();
      await runStage4();
    } catch (e: any) {
      console.error('Full pipeline execution stopped:', e);
    }
  };

  if (loading && !lessonPlan) {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-neutral-200">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
        <span className="text-neutral-600 font-medium">Đang tải trạng thái AI Pipeline...</span>
      </div>
    );
  }

  const renderStatusBadge = (stepData: any) => {
    if (!stepData) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
          <Clock className="w-3.5 h-3.5 text-neutral-400" /> Chưa chạy
        </span>
      );
    }
    if (stepData.status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Hoàn thành
        </span>
      );
    }
    if (stepData.status === 'failed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
          <XCircle className="w-3.5 h-3.5 text-rose-600" /> Thất bại
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" /> Đang xử lý
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-neutral-200 bg-neutral-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-neutral-900 text-lg">Tiến trình Sinh Giáo án AI (4 Giai đoạn)</h3>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Trạng thái thực tế từ cơ sở dữ liệu: <span className="font-semibold uppercase text-blue-700">{lessonPlan?.status || 'DRAFT'}</span>
          </p>
        </div>

        <button
          onClick={runFullPipeline}
          disabled={runningStep !== null}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 shadow-sm"
        >
          {runningStep !== null ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          Chạy toàn bộ Pipeline
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-800 text-sm flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Thông báo từ hệ thống:</p>
            <p className="mt-0.5 text-rose-700">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* 4 Pipeline Steps Accordion */}
      <div className="divide-y divide-neutral-200">
        {/* Step 1: Phân tích cấu trúc giáo án mẫu */}
        <div className="p-4 transition-colors hover:bg-neutral-50/50">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedStep(expandedStep === 1 ? null : 1)}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                1
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-neutral-500" />
                  <h4 className="font-medium text-neutral-900">1. Phân tích cấu trúc giáo án mẫu</h4>
                  {renderStatusBadge(step1)}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">Trích xuất bố cục, các mục chính và phong cách trình bày sư phạm.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  runStage1();
                }}
                disabled={runningStep !== null}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-neutral-300 hover:bg-neutral-100 text-neutral-700 disabled:opacity-50"
              >
                {runningStep === 1 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                {step1 ? 'Chạy lại' : 'Bắt đầu'}
              </button>

              {expandedStep === 1 ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
            </div>
          </div>

          {expandedStep === 1 && step1?.result && (
            <div className="mt-3 p-3 bg-neutral-50 rounded-lg text-xs space-y-2 border border-neutral-200">
              <div>
                <span className="font-semibold text-neutral-700">Loại cấu trúc nhận diện:</span>{' '}
                <span className="text-blue-600 font-medium">{step1.result.detectedType || '5512'}</span>
              </div>
              <div>
                <span className="font-semibold text-neutral-700">Tổng quan cấu trúc:</span>{' '}
                <p className="text-neutral-600 mt-0.5">{step1.result.structureOverview}</p>
              </div>
              <div>
                <span className="font-semibold text-neutral-700">Các mục chính:</span>
                <ul className="list-disc list-inside mt-0.5 text-neutral-600 space-y-0.5">
                  {step1.result.keySections?.map((sec: string, idx: number) => (
                    <li key={idx}>{sec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Trích xuất nội dung từ SGK & tài liệu */}
        <div className="p-4 transition-colors hover:bg-neutral-50/50">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedStep(expandedStep === 2 ? null : 2)}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                2
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-neutral-500" />
                  <h4 className="font-medium text-neutral-900">2. Trích xuất nội dung từ SGK & tài liệu</h4>
                  {renderStatusBadge(step2)}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">Tổng hợp kiến thức trọng tâm, năng lực, phẩm chất và hoạt động gợi ý.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  runStage2();
                }}
                disabled={runningStep !== null}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-neutral-300 hover:bg-neutral-100 text-neutral-700 disabled:opacity-50"
              >
                {runningStep === 2 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                {step2 ? 'Chạy lại' : 'Bắt đầu'}
              </button>

              {expandedStep === 2 ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
            </div>
          </div>

          {expandedStep === 2 && step2?.result && (
            <div className="mt-3 p-3 bg-neutral-50 rounded-lg text-xs space-y-2 border border-neutral-200">
              <div>
                <span className="font-semibold text-neutral-700">Kiến thức cốt lõi:</span>
                <ul className="list-disc list-inside mt-0.5 text-neutral-600 space-y-0.5">
                  {step2.result.mainKnowledgePoints?.map((pt: string, idx: number) => (
                    <li key={idx}>{pt}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="font-semibold text-neutral-700">Năng lực hướng tới:</span>
                <p className="text-neutral-600 mt-0.5">{step2.result.targetCompetencies?.join(', ')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Sinh giáo án JSON */}
        <div className="p-4 transition-colors hover:bg-neutral-50/50">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedStep(expandedStep === 3 ? null : 3)}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm">
                3
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-neutral-500" />
                  <h4 className="font-medium text-neutral-900">3. Sinh giáo án JSON chính thức</h4>
                  {renderStatusBadge(step3)}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">Tạo cấu trúc bài dạy chi tiết kèm thời lượng và hoạt động cụ thể.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Type selector */}
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as any)}
                onClick={(e) => e.stopPropagation()}
                className="text-xs bg-white border border-neutral-300 rounded-md px-2 py-1 text-neutral-700"
              >
                <option value="5512">KHBD 5512</option>
                <option value="ncbh">Nghiên cứu bài học</option>
                <option value="stem">Bài học STEM</option>
              </select>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  runStage3();
                }}
                disabled={runningStep !== null}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-neutral-300 hover:bg-neutral-100 text-neutral-700 disabled:opacity-50"
              >
                {runningStep === 3 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                {step3 ? 'Chạy lại' : 'Bắt đầu'}
              </button>

              {expandedStep === 3 ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
            </div>
          </div>

          {expandedStep === 3 && step3?.result && (
            <div className="mt-3 p-3 bg-neutral-50 rounded-lg text-xs space-y-2 border border-neutral-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-700">Tên bài học sinh ra:</span>
                <span className="font-medium text-amber-700">{step3.result.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-700">Tổng thời lượng quy định:</span>
                <span className="font-medium text-neutral-800">{step3.result.duration} ({step3.result.totalDurationMinutes} phút)</span>
              </div>
              <div className="mt-2">
                <span className="font-semibold text-neutral-700">Danh sách các hoạt động học tập:</span>
                <div className="mt-1 space-y-1">
                  {(step3.result.activities || step3.result.teachingActivities || step3.result.designSteps)?.map((act: any, idx: number) => (
                    <div key={idx} className="p-2 bg-white rounded border border-neutral-200 flex justify-between items-center">
                      <span className="font-medium text-neutral-800">{act.title || `Hoạt động ${idx + 1}`}</span>
                      <span className="text-neutral-500 font-mono text-[11px]">{act.time || `${act.durationMinutes} phút`}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 4: Kiểm định chất lượng và sửa lỗi */}
        <div className="p-4 transition-colors hover:bg-neutral-50/50">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedStep(expandedStep === 4 ? null : 4)}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
                4
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-neutral-500" />
                  <h4 className="font-medium text-neutral-900">4. Kiểm định chất lượng & Tự động sửa lỗi</h4>
                  {renderStatusBadge(step4)}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">Xác thực Zod Schema, kiểm tra thiếu trường và khớp tổng thời lượng bài dạy.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  runStage4();
                }}
                disabled={runningStep !== null || !step3?.result}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-neutral-300 hover:bg-neutral-100 text-neutral-700 disabled:opacity-50"
              >
                {runningStep === 4 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                {step4 ? 'Chạy lại' : 'Kiểm định'}
              </button>

              {expandedStep === 4 ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
            </div>
          </div>

          {expandedStep === 4 && step4?.validation && (
            <div className="mt-3 p-3 bg-neutral-50 rounded-lg text-xs space-y-2 border border-neutral-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-700">Kết quả kiểm định chất lượng:</span>
                {step4.validation.valid ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Đạt chất lượng (100%)
                  </span>
                ) : (
                  <span className="text-rose-700 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Phát hiện {step4.validation.issues?.length || 0} vấn đề
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 p-2 bg-white rounded border border-neutral-200 text-center">
                <div>
                  <span className="text-neutral-500 block">Thời lượng kế hoạch:</span>
                  <span className="font-bold text-neutral-800">{step4.validation.totalPlannedMinutes} phút</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Tổng thời lượng các bước:</span>
                  <span className="font-bold text-neutral-800">{step4.validation.totalActivitiesMinutes} phút</span>
                </div>
              </div>

              {step4.validation.issues && step4.validation.issues.length > 0 && (
                <div className="mt-2 space-y-1">
                  <span className="font-semibold text-rose-800">Chi tiết các lỗi phát hiện:</span>
                  {step4.validation.issues.map((iss: any, idx: number) => (
                    <div key={idx} className="p-2 bg-rose-50 text-rose-800 rounded border border-rose-200 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                      <div>
                        <p className="font-semibold">[{iss.code}] {iss.field}:</p>
                        <p>{iss.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
