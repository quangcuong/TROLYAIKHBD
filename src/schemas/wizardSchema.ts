import { z } from 'zod';

export const documentTypeSchema = z.enum(['5512', 'ncbh', 'stem']);

export const wizardFormSchema = z.object({
  // Step 1: Type
  type: documentTypeSchema,

  // Step 2: Documents
  fileIds: z.array(z.string()),

  // Step 3: Lesson Info
  subject: z.string().min(1, 'Vui lòng chọn môn học'),
  grade: z.string().min(1, 'Vui lòng chọn khối lớp'),
  textbook: z.string().min(1, 'Vui lòng chọn bộ sách giáo khoa'),
  title: z.string().min(3, 'Tên bài học/chủ đề phải có ít nhất 3 ký tự'),
  duration: z.string().min(1, 'Vui lòng nhập thời lượng tiết học'),
  generalObjectives: z.string().catch(''),

  // Step 3 Specific - 5512
  knowledgeObjectives: z.string().catch(''),
  capabilityObjectives: z.string().catch(''),
  qualityObjectives: z.string().catch(''),

  // Step 3 Specific - NCBH
  researchTopic: z.string().catch(''),
  researchGoals: z.string().catch(''),
  focusObservationQuestions: z.string().catch(''),

  // Step 3 Specific - STEM
  stemTheme: z.string().catch(''),
  stemProductDescription: z.string().catch(''),
  integratedScience: z.string().catch(''),
  integratedTechnology: z.string().catch(''),
  integratedEngineering: z.string().catch(''),
  integratedMath: z.string().catch(''),

  // Step 4: Organizational Conditions
  teacherEquipment: z.string().catch(''),
  studentEquipment: z.string().catch(''),
  digitalTools: z.string().catch(''),
  classroomFacilities: z.string().catch(''),
  studentPrerequisites: z.string().catch(''),

  // Step 5: Teaching Methods & Techniques
  teachingMethods: z.array(z.string()),
  teachingTechniques: z.array(z.string()),
  customMethods: z.array(z.string()),

  // Step 6: Additional Requirements
  differentiatedInstruction: z.string().catch(''),
  digitalCompetency: z.string().catch(''),
  enableAICapability: z.boolean(),
  specialNotes: z.string().catch(''),
});

export type WizardFormData = z.infer<typeof wizardFormSchema>;
