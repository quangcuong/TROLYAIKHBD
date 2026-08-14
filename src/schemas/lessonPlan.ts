import { z } from 'zod';

export const lessonPlanStatusEnum = z.enum([
  'draft',
  'uploading',
  'analyzing',
  'generating',
  'validating',
  'completed',
  'failed',
  'archived',
]);

export const documentTypeEnum = z.enum(['5512', 'ncbh', 'stem']);

export const createLessonPlanSchema = z.object({
  title: z.string().min(1, 'Tiêu đề giáo án không được để trống').max(200, 'Tiêu đề quá dài'),
  type: z.string().default('5512'),
  subject: z.string().min(1, 'Môn học không được để trống'),
  grade: z.string().min(1, 'Khối lớp không được để trống'),
  textbook: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  status: lessonPlanStatusEnum.default('draft'),
  content: z.record(z.string(), z.any()).default({}),
  metadata: z.record(z.string(), z.any()).default({}),
});

export const updateLessonPlanSchema = createLessonPlanSchema.partial();

export const updateLessonPlanStatusSchema = z.object({
  status: lessonPlanStatusEnum,
});

export const createLessonFileSchema = z.object({
  lesson_plan_id: z.string().uuid().optional().nullable(),
  file_name: z.string().min(1, 'Tên file không được để trống'),
  file_path: z.string().min(1, 'Đường dẫn file không được để trống'),
  file_size: z.number().nonnegative().optional().default(0),
  file_type: z.string().optional().nullable(),
  storage_bucket: z.string().default('lesson-files'),
  extracted_text: z.string().optional().nullable(),
  status: z.string().default('uploaded'),
  metadata: z.record(z.string(), z.any()).default({}),
});

export const createGenerationLogSchema = z.object({
  lesson_plan_id: z.string().uuid().optional().nullable(),
  model_used: z.string().default('gemini-2.0-flash'),
  prompt_tokens: z.number().int().nonnegative().default(0),
  completion_tokens: z.number().int().nonnegative().default(0),
  total_tokens: z.number().int().nonnegative().default(0),
  duration_ms: z.number().int().nonnegative().default(0),
  status: z.string().default('completed'),
  error_message: z.string().optional().nullable(),
  prompt_payload: z.record(z.string(), z.any()).optional().nullable(),
  response_payload: z.record(z.string(), z.any()).optional().nullable(),
});

export const updateUserSettingsSchema = z.object({
  default_subject: z.string().optional(),
  default_grade: z.string().optional(),
  default_textbook: z.string().optional(),
  ai_model: z.string().optional(),
  temperature: z.number().min(0.0).max(2.0).optional(),
  preferences: z.record(z.string(), z.any()).optional(),
});

export type CreateLessonPlanInput = z.infer<typeof createLessonPlanSchema>;
export type UpdateLessonPlanInput = z.infer<typeof updateLessonPlanSchema>;
export type UpdateLessonPlanStatusInput = z.infer<typeof updateLessonPlanStatusSchema>;
export type CreateLessonFileInput = z.infer<typeof createLessonFileSchema>;
export type CreateGenerationLogInput = z.infer<typeof createGenerationLogSchema>;
export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>;
