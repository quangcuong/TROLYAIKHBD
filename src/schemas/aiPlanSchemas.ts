import { z } from 'zod';

// ==========================================
// 1. SCHEMAS FOR DOCUMENT TYPES
// ==========================================

// Activity 5512 Schema
export const activity5512Schema = z.object({
  id: z.string().min(1, 'Mã hoạt động không được để trống'),
  title: z.string().min(3, 'Tên hoạt động phải từ 3 ký tự trở lên'),
  time: z.string().min(1, 'Thời lượng hoạt động không được để trống'),
  durationMinutes: z.number().nonnegative('Thời lượng phút phải >= 0'),
  objective: z.string().min(1, 'Mục tiêu hoạt động không được để trống'),
  content: z.string().min(1, 'Nội dung hoạt động không được để trống'),
  product: z.string().min(1, 'Sản phẩm học tập không được để trống'),
  implementation: z.string().min(1, 'Tổ chức thực hiện không được để trống'),
});

// Full KHBD 5512 Schema
export const plan5512Schema = z.object({
  title: z.string().min(3, 'Tên bài học phải từ 3 ký tự trở lên'),
  subject: z.string().min(1, 'Môn học không được để trống'),
  grade: z.string().min(1, 'Lớp không được để trống'),
  textbook: z.string().min(1, 'Bộ sách giáo khoa không được để trống'),
  duration: z.string().min(1, 'Thời lượng bài học không được để trống'),
  totalDurationMinutes: z.number().positive('Tổng thời lượng phải lớn hơn 0'),
  objectives: z.object({
    knowledge: z.array(z.string()).min(1, 'Cần ít nhất 1 mục tiêu kiến thức'),
    capabilities: z.array(z.string()).min(1, 'Cần ít nhất 1 mục tiêu năng lực'),
    qualities: z.array(z.string()).min(1, 'Cần ít nhất 1 mục tiêu phẩm chất'),
  }),
  teachingEquipment: z.object({
    teacher: z.array(z.string()).min(1, 'Cần thiết bị dạy học của giáo viên'),
    students: z.array(z.string()).min(1, 'Cần học liệu của học sinh'),
  }),
  activities: z.array(activity5512Schema).min(1, 'Cần có ít nhất 1 hoạt động học tập'),
});

// NCBH Activity Schema
export const ncbhActivitySchema = z.object({
  id: z.string().min(1, 'Mã hoạt động không được để trống'),
  title: z.string().min(3, 'Tên hoạt động không được để trống'),
  time: z.string().min(1, 'Thời lượng không được để trống'),
  durationMinutes: z.number().nonnegative('Thời lượng phút phải >= 0'),
  studentActionFocus: z.string().min(1, 'Trọng tâm hành vi học sinh không được để trống'),
  teacherObservationFocus: z.string().min(1, 'Trọng tâm quan sát của giáo viên không được để trống'),
  expectedStudentDifficulties: z.string().min(1, 'Khó khăn dự kiến không được để trống'),
  supportStrategy: z.string().min(1, 'Biện pháp hỗ trợ không được để trống'),
});

// Full NCBH Schema
export const planNCBHSchema = z.object({
  title: z.string().min(3, 'Tên bài học không được để trống'),
  subject: z.string().min(1, 'Môn học không được để trống'),
  grade: z.string().min(1, 'Lớp không được để trống'),
  textbook: z.string().min(1, 'Bộ sách không được để trống'),
  duration: z.string().min(1, 'Thời lượng không được để trống'),
  totalDurationMinutes: z.number().positive('Tổng thời lượng phải lớn hơn 0'),
  researchTopic: z.string().min(3, 'Chủ đề nghiên cứu bài học không được để trống'),
  researchGoals: z.array(z.string()).min(1, 'Cần ít nhất 1 mục tiêu nghiên cứu'),
  focusObservationQuestions: z.array(z.string()).min(1, 'Cần ít nhất 1 câu hỏi quan sát'),
  teachingActivities: z.array(ncbhActivitySchema).min(1, 'Cần ít nhất 1 hoạt động dạy học'),
  postLessonReflectionCriteria: z.array(z.string()).min(1, 'Cần tiêu chí suy ngẫm sau bài dạy'),
});

// STEM Design Step Schema
export const stemDesignStepSchema = z.object({
  stepNumber: z.number().positive('Bước phải > 0'),
  title: z.string().min(3, 'Tên bước STEM không được để trống'),
  time: z.string().min(1, 'Thời lượng không được để trống'),
  durationMinutes: z.number().nonnegative('Thời lượng phút phải >= 0'),
  teacherGuide: z.string().min(1, 'Hướng dẫn giáo viên không được để trống'),
  studentTask: z.string().min(1, 'Nhiệm vụ học sinh không được để trống'),
  productOutcome: z.string().min(1, 'Sản phẩm đạt được không được để trống'),
});

// STEM Rubric Criterion
export const stemRubricSchema = z.object({
  criterion: z.string().min(1, 'Tiêu chí đánh giá không được để trống'),
  maxPoints: z.number().positive('Điểm tối đa phải > 0'),
  description: z.string().min(1, 'Mô tả tiêu chí không được để trống'),
});

// Full STEM Schema
export const planSTEMSchema = z.object({
  title: z.string().min(3, 'Tên chủ đề STEM không được để trống'),
  subject: z.string().min(1, 'Môn học chủ đạo không được để trống'),
  grade: z.string().min(1, 'Lớp không được để trống'),
  textbook: z.string().min(1, 'Bộ sách không được để trống'),
  duration: z.string().min(1, 'Thời lượng không được để trống'),
  totalDurationMinutes: z.number().positive('Tổng thời lượng phải lớn hơn 0'),
  stemTheme: z.string().min(3, 'Tên chủ đề STEM không được để trống'),
  productDescription: z.string().min(5, 'Mô tả sản phẩm STEM không được để trống'),
  integratedSubjects: z.object({
    science: z.string().min(1, 'Tích hợp Khoa học S không được để trống'),
    technology: z.string().min(1, 'Tích hợp Công nghệ T không được để trống'),
    engineering: z.string().min(1, 'Tích hợp Kỹ thuật E không được để trống'),
    mathematics: z.string().min(1, 'Tích hợp Toán học M không được để trống'),
  }),
  productCriteria: z.array(z.string()).min(1, 'Cần ít nhất 1 tiêu chí sản phẩm STEM'),
  designSteps: z.array(stemDesignStepSchema).min(1, 'Cần ít nhất 1 bước thiết kế STEM'),
  assessmentRubric: z.array(stemRubricSchema).min(1, 'Cần có bảng tiêu chí đánh giá Rubric'),
});

// Union / Discriminated type helper
export type Plan5512 = z.infer<typeof plan5512Schema>;
export type PlanNCBH = z.infer<typeof planNCBHSchema>;
export type PlanSTEM = z.infer<typeof planSTEMSchema>;

// ==========================================
// 2. VALIDATION UTILITY & DURATION CHECK
// ==========================================

export interface ValidationIssue {
  field: string;
  code: 'MISSING_FIELD' | 'INVALID_TYPE' | 'DURATION_MISMATCH' | 'SYNTAX_ERROR';
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  docType: '5512' | 'ncbh' | 'stem' | string;
  issues: ValidationIssue[];
  totalPlannedMinutes: number;
  totalActivitiesMinutes: number;
  validatedData?: any;
}

/**
 * Helper to parse time text like "2 tiết (90 phút)" or "45 phút" to minutes number
 */
export function parseDurationToMinutes(durationStr?: string | null): number {
  if (!durationStr) return 0;
  // Match "(XX phút)" or "XX phút"
  const matchMin = durationStr.match(/(\d+)\s*phút/i);
  if (matchMin) {
    return parseInt(matchMin[1], 10);
  }
  // Match "X tiết" -> assume 45 mins per tiet
  const matchTiet = durationStr.match(/(\d+)\s*tiết/i);
  if (matchTiet) {
    return parseInt(matchTiet[1], 10) * 45;
  }
  const matchNumber = durationStr.match(/(\d+)/);
  if (matchNumber) {
    return parseInt(matchNumber[1], 10);
  }
  return 0;
}

/**
 * Validate lesson plan object against schema & check duration matching
 */
export function validateLessonPlanData(
  data: unknown,
  docType: '5512' | 'ncbh' | 'stem' | string
): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      docType,
      issues: [
        {
          field: 'root',
          code: 'SYNTAX_ERROR',
          message: 'Dữ liệu giáo án không đúng định dạng object/JSON',
        },
      ],
      totalPlannedMinutes: 0,
      totalActivitiesMinutes: 0,
    };
  }

  let schemaToUse: z.ZodSchema;
  if (docType === 'ncbh') {
    schemaToUse = planNCBHSchema;
  } else if (docType === 'stem') {
    schemaToUse = planSTEMSchema;
  } else {
    schemaToUse = plan5512Schema;
  }

  const parseRes = schemaToUse.safeParse(data);
  let validatedData: any = null;

  if (!parseRes.success) {
    for (const issue of parseRes.error.issues) {
      const fieldPath = issue.path.join('.');
      const isMissing = issue.code === 'invalid_type' && (issue as any).received === 'undefined';
      issues.push({
        field: fieldPath || 'root',
        code: isMissing ? 'MISSING_FIELD' : 'INVALID_TYPE',
        message: issue.message,
      });
    }
  } else {
    validatedData = parseRes.data;
  }

  const rawObj = data as Record<string, any>;
  const totalPlannedMinutes =
    typeof rawObj.totalDurationMinutes === 'number' && rawObj.totalDurationMinutes > 0
      ? rawObj.totalDurationMinutes
      : parseDurationToMinutes(rawObj.duration);

  let totalActivitiesMinutes = 0;

  if (docType === '5512' && Array.isArray(rawObj.activities)) {
    totalActivitiesMinutes = rawObj.activities.reduce((acc: number, act: any) => {
      const actMin =
        typeof act?.durationMinutes === 'number'
          ? act.durationMinutes
          : parseDurationToMinutes(act?.time);
      return acc + actMin;
    }, 0);
  } else if (docType === 'ncbh' && Array.isArray(rawObj.teachingActivities)) {
    totalActivitiesMinutes = rawObj.teachingActivities.reduce((acc: number, act: any) => {
      const actMin =
        typeof act?.durationMinutes === 'number'
          ? act.durationMinutes
          : parseDurationToMinutes(act?.time);
      return acc + actMin;
    }, 0);
  } else if (docType === 'stem' && Array.isArray(rawObj.designSteps)) {
    totalActivitiesMinutes = rawObj.designSteps.reduce((acc: number, act: any) => {
      const actMin =
        typeof act?.durationMinutes === 'number'
          ? act.durationMinutes
          : parseDurationToMinutes(act?.time);
      return acc + actMin;
    }, 0);
  }

  // Check Duration Mismatch
  if (totalPlannedMinutes > 0 && totalActivitiesMinutes > 0) {
    if (totalPlannedMinutes !== totalActivitiesMinutes) {
      issues.push({
        field: 'totalDurationMinutes',
        code: 'DURATION_MISMATCH',
        message: `Tổng thời lượng các hoạt động/bước (${totalActivitiesMinutes} phút) không khớp với tổng thời lượng giáo án (${totalPlannedMinutes} phút)`,
      });
    }
  }

  return {
    valid: issues.length === 0,
    docType,
    issues,
    totalPlannedMinutes,
    totalActivitiesMinutes,
    validatedData: parseRes.success ? parseRes.data : undefined,
  };
}

// ==========================================
// 3. API INPUT REQUEST SCHEMAS
// ==========================================

export const analyzeTemplateInputSchema = z.object({
  lessonPlanId: z.string().min(1, 'Thiếu lessonPlanId'),
  templateText: z.string().optional(),
  fileIds: z.array(z.string()).optional(),
  userId: z.string().optional(),
});

export const extractContentInputSchema = z.object({
  lessonPlanId: z.string().min(1, 'Thiếu lessonPlanId'),
  fileIds: z.array(z.string()).optional(),
  userId: z.string().optional(),
});

export const generatePlanInputSchema = z.object({
  lessonPlanId: z.string().min(1, 'Thiếu lessonPlanId'),
  docType: z.enum(['5512', 'ncbh', 'stem']).default('5512'),
  options: z.record(z.string(), z.any()).optional(),
  userId: z.string().optional(),
});

export const validatePlanInputSchema = z.object({
  lessonPlanId: z.string().min(1, 'Thiếu lessonPlanId'),
  autoFix: z.boolean().default(true),
  userId: z.string().optional(),
});

export const rewriteActionEnum = z.enum([
  'rewrite',
  'shorten',
  'expand',
  'add_examples',
  'add_questions',
  'differentiate',
  'create_rubric',
  'create_worksheet',
]);

export const rewriteSectionInputSchema = z.object({
  lessonPlanId: z.string().min(1, 'Thiếu lessonPlanId'),
  selectedText: z.string().min(1, 'Đoạn văn bản chọn không được để trống'),
  action: rewriteActionEnum.default('rewrite'),
  context: z.string().optional(),
  promptInstruction: z.string().optional(),
  userId: z.string().optional(),
});

export type AnalyzeTemplateInput = z.infer<typeof analyzeTemplateInputSchema>;
export type ExtractContentInput = z.infer<typeof extractContentInputSchema>;
export type GeneratePlanInput = z.infer<typeof generatePlanInputSchema>;
export type ValidatePlanInput = z.infer<typeof validatePlanInputSchema>;
export type RewriteAction = z.infer<typeof rewriteActionEnum>;
export type RewriteSectionInput = z.infer<typeof rewriteSectionInputSchema>;

