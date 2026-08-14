-- Migration: Create lesson_plans, lesson_files, generation_logs, and user_settings tables
-- File: supabase/migrations/20260803_milestone3_lesson_plans_schema.sql

-- 1. Create lesson_plans table
CREATE TABLE IF NOT EXISTS public.lesson_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT '5512',
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,
  textbook TEXT,
  duration TEXT,
  summary TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'uploading', 'analyzing', 'generating', 'validating', 'completed', 'failed', 'archived')
  ),
  content JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create lesson_files table
CREATE TABLE IF NOT EXISTS public.lesson_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_plan_id UUID REFERENCES public.lesson_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  file_type TEXT,
  storage_bucket TEXT DEFAULT 'lesson-files',
  extracted_text TEXT,
  status TEXT DEFAULT 'uploaded',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create generation_logs table
CREATE TABLE IF NOT EXISTS public.generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_plan_id UUID REFERENCES public.lesson_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  model_used TEXT DEFAULT 'gemini-2.0-flash',
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  duration_ms INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  error_message TEXT,
  prompt_payload JSONB,
  response_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  default_subject TEXT DEFAULT 'Vật lý',
  default_grade TEXT DEFAULT 'Lớp 10',
  default_textbook TEXT DEFAULT 'Kết nối tri thức với cuộc sống',
  ai_model TEXT DEFAULT 'gemini-2.0-flash',
  temperature NUMERIC DEFAULT 0.7,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create Indexes for user_id, status, subject, grade, and created_at
CREATE INDEX IF NOT EXISTS idx_lesson_plans_user_id ON public.lesson_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_status ON public.lesson_plans(status);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_subject ON public.lesson_plans(subject);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_grade ON public.lesson_plans(grade);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_created_at ON public.lesson_plans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_user_created ON public.lesson_plans(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lesson_files_lesson_plan_id ON public.lesson_files(lesson_plan_id);
CREATE INDEX IF NOT EXISTS idx_lesson_files_user_id ON public.lesson_files(user_id);

CREATE INDEX IF NOT EXISTS idx_generation_logs_lesson_plan_id ON public.generation_logs(lesson_plan_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_user_id ON public.generation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_created_at ON public.generation_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- 7. Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. RLS Policies for lesson_plans
CREATE POLICY "Users can select own or admin select lesson_plans"
  ON public.lesson_plans FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own lesson_plans"
  ON public.lesson_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lesson_plans"
  ON public.lesson_plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own lesson_plans"
  ON public.lesson_plans FOR DELETE
  USING (auth.uid() = user_id);

-- 9. RLS Policies for lesson_files
CREATE POLICY "Users can select own or admin select lesson_files"
  ON public.lesson_files FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own lesson_files"
  ON public.lesson_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lesson_files"
  ON public.lesson_files FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own lesson_files"
  ON public.lesson_files FOR DELETE
  USING (auth.uid() = user_id);

-- 10. RLS Policies for generation_logs
CREATE POLICY "Users can select own or admin select generation_logs"
  ON public.generation_logs FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own generation_logs"
  ON public.generation_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generation_logs"
  ON public.generation_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own generation_logs"
  ON public.generation_logs FOR DELETE
  USING (auth.uid() = user_id);

-- 11. RLS Policies for user_settings (Secrets/preferences strictly for the owner)
CREATE POLICY "Users can select own user_settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user_settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own user_settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own user_settings"
  ON public.user_settings FOR DELETE
  USING (auth.uid() = user_id);

-- 12. Triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_lesson_plans_updated_at ON public.lesson_plans;
CREATE TRIGGER set_lesson_plans_updated_at
  BEFORE UPDATE ON public.lesson_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_lesson_files_updated_at ON public.lesson_files;
CREATE TRIGGER set_lesson_files_updated_at
  BEFORE UPDATE ON public.lesson_files
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_generation_logs_updated_at ON public.generation_logs;
CREATE TRIGGER set_generation_logs_updated_at
  BEFORE UPDATE ON public.generation_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER set_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
