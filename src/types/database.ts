export type DocumentCategory =
  | 'sample_lesson_plan'
  | 'curriculum_distribution'
  | 'textbook_content'
  | 'reference_material';

export type FileProcessingStatus = 'uploading' | 'processing' | 'completed' | 'failed';

export type LessonPlanStatus =
  | 'draft'
  | 'uploading'
  | 'analyzing'
  | 'generating'
  | 'validating'
  | 'completed'
  | 'failed'
  | 'archived';

export type DocumentType = '5512' | 'ncbh' | 'stem';

export interface DbLessonPlan {
  id: string;
  user_id: string;
  title: string;
  type: DocumentType | string;
  subject: string;
  grade: string;
  textbook?: string | null;
  duration?: string | null;
  summary?: string | null;
  status: LessonPlanStatus;
  content: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DbLessonFile {
  id: string;
  lesson_plan_id: string | null;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size?: number | null;
  file_type?: string | null;
  storage_bucket: string;
  extracted_text?: string | null;
  status: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DbGenerationLog {
  id: string;
  lesson_plan_id: string | null;
  user_id: string;
  model_used: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  duration_ms: number;
  status: string;
  error_message?: string | null;
  prompt_payload?: Record<string, any> | null;
  response_payload?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface DbUserSettings {
  id: string;
  user_id: string;
  default_subject: string;
  default_grade: string;
  default_textbook: string;
  ai_model: string;
  temperature: number;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}
