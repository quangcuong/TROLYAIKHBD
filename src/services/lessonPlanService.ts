import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DbLessonPlan, DbLessonFile, DbGenerationLog, DbUserSettings, LessonPlanStatus } from '../types/database';
import {
  createLessonPlanSchema,
  updateLessonPlanSchema,
  updateLessonPlanStatusSchema,
  createLessonFileSchema,
  createGenerationLogSchema,
  updateUserSettingsSchema,
  CreateLessonPlanInput,
  UpdateLessonPlanInput,
  CreateLessonFileInput,
  CreateGenerationLogInput,
  UpdateUserSettingsInput,
} from '../schemas/lessonPlan';

// Mock storage fallback when Supabase is not configured or offline during local dev
let MOCK_LESSON_PLANS: DbLessonPlan[] = [
  {
    id: 'lp_001',
    user_id: 'usr_001',
    title: 'Giáo án Kế hoạch bài dạy 5512: Chuyển động thẳng biến đổi đều',
    type: '5512',
    subject: 'Vật lý',
    grade: 'Lớp 10',
    textbook: 'Kết nối tri thức với cuộc sống',
    duration: '2 tiết',
    summary: 'Giáo án chuẩn Công văn 5512 Bộ GDĐT tích hợp 4 bước hoạt động học tập, phát triển năng lực nhận thức vật lý.',
    status: 'completed',
    content: {
      objectives: {
        knowledge: ['Lập được công thức tính vận tốc và quãng đường đi được trong chuyển động thẳng biến đổi đều.'],
        capabilities: ['Năng lực tự học, năng lực giải quyết vấn đề toán học - vật lý.'],
        qualities: ['Trung thực, cẩn thận trong đo đạc thực nghiệm.'],
      },
    },
    metadata: { authorName: 'Giáo viên', viewsCount: 142, likesCount: 28 },
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export interface GetLessonPlansFilter {
  userId?: string;
  status?: LessonPlanStatus;
  subject?: string;
  grade?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export const lessonPlanService = {
  /**
   * Fetch a list of lesson plans with optional filters
   */
  async getLessonPlans(filters?: GetLessonPlansFilter): Promise<{ data: DbLessonPlan[]; count: number; error: string | null }> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('lesson_plans').select('*', { count: 'exact' });

        if (filters?.userId) {
          query = query.eq('user_id', filters.userId);
        }
        if (filters?.status) {
          query = query.eq('status', filters.status);
        }
        if (filters?.subject) {
          query = query.eq('subject', filters.subject);
        }
        if (filters?.grade) {
          query = query.eq('grade', filters.grade);
        }
        if (filters?.search) {
          query = query.or(`title.ilike.%${filters.search}%,summary.ilike.%${filters.search}%`);
        }

        query = query.order('created_at', { ascending: false });

        if (filters?.limit) {
          const from = filters.offset || 0;
          const to = from + filters.limit - 1;
          query = query.range(from, to);
        }

        const { data, count, error } = await query;

        if (!error && data && data.length > 0) {
          return { data: (data as DbLessonPlan[]) || [], count: count || 0, error: null };
        }
        if (error) {
          console.warn('Note: Supabase query returned error, using local fallback:', error.message);
        }
      } catch (err: any) {
        console.warn('Note: Exception querying Supabase, using local fallback:', err.message);
      }
    }

    // Mock fallback logic
    let result = [...MOCK_LESSON_PLANS];
    if (filters?.status) {
      result = result.filter((p) => p.status === filters.status);
    }
    if (filters?.subject) {
      result = result.filter((p) => p.subject === filters.subject);
    }
    if (filters?.grade) {
      result = result.filter((p) => p.grade === filters.grade);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q) || p.summary?.toLowerCase().includes(q));
    }

    return { data: result, count: result.length, error: null };
  },

  /**
   * Fetch a single lesson plan by ID
   */
  async getLessonPlanById(id: string): Promise<{ data: DbLessonPlan | null; error: string | null }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('lesson_plans')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          return { data: data as DbLessonPlan, error: null };
        }
      } catch (err: any) {
        // Fallback below
      }
    }

    const found = MOCK_LESSON_PLANS.find((p) => p.id === id) || null;
    return { data: found, error: found ? null : 'Không tìm thấy giáo án' };
  },

  /**
   * Create a new lesson plan with Zod schema validation
   */
  async createLessonPlan(input: CreateLessonPlanInput, userId?: string): Promise<{ data: DbLessonPlan | null; error: string | null }> {
    // Validate input with Zod
    const parseResult = createLessonPlanSchema.safeParse(input);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join(', ');
      return { data: null, error: `Dữ liệu không hợp lệ: ${errorMsg}` };
    }

    const validatedData = parseResult.data;

    if (isSupabaseConfigured) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const activeUserId = userId || userData?.user?.id || 'usr_001';

        const payload = {
          user_id: activeUserId,
          title: validatedData.title,
          type: validatedData.type,
          subject: validatedData.subject,
          grade: validatedData.grade,
          textbook: validatedData.textbook || null,
          duration: validatedData.duration || null,
          summary: validatedData.summary || null,
          status: validatedData.status,
          content: validatedData.content,
          metadata: validatedData.metadata,
        };

        const { data, error } = await supabase
          .from('lesson_plans')
          .insert(payload)
          .select('*')
          .single();

        if (!error && data) {
          return { data: data as DbLessonPlan, error: null };
        }

        console.warn('Supabase insert failed, using local store fallback:', error?.message);
      } catch (err: any) {
        console.warn('Exception during Supabase insert, using local store fallback:', err?.message);
      }
    }

    // Mock fallback
    const newPlan: DbLessonPlan = {
      id: `lp_${Date.now()}`,
      user_id: userId || 'usr_001',
      title: validatedData.title,
      type: validatedData.type,
      subject: validatedData.subject,
      grade: validatedData.grade,
      textbook: validatedData.textbook || null,
      duration: validatedData.duration || null,
      summary: validatedData.summary || null,
      status: validatedData.status,
      content: validatedData.content,
      metadata: validatedData.metadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    MOCK_LESSON_PLANS.unshift(newPlan);
    return { data: newPlan, error: null };
  },

  /**
   * Update an existing lesson plan
   */
  async updateLessonPlan(id: string, input: UpdateLessonPlanInput): Promise<{ data: DbLessonPlan | null; error: string | null }> {
    const parseResult = updateLessonPlanSchema.safeParse(input);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join(', ');
      return { data: null, error: `Dữ liệu cập nhật không hợp lệ: ${errorMsg}` };
    }

    const validatedData = parseResult.data;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('lesson_plans')
          .update({
            ...validatedData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select('*')
          .maybeSingle();

        if (!error && data) {
          return { data: data as DbLessonPlan, error: null };
        }
        console.warn('Supabase update failed, updating local store fallback:', error?.message);
      } catch (err: any) {
        console.warn('Exception during Supabase update, using local store fallback:', err?.message);
      }
    }

    // Mock fallback
    const idx = MOCK_LESSON_PLANS.findIndex((p) => p.id === id);
    if (idx === -1) {
      return { data: null, error: 'Không tìm thấy giáo án cần cập nhật' };
    }

    MOCK_LESSON_PLANS[idx] = {
      ...MOCK_LESSON_PLANS[idx],
      ...validatedData,
      updated_at: new Date().toISOString(),
    };

    return { data: MOCK_LESSON_PLANS[idx], error: null };
  },

  /**
   * Update state status of a lesson plan (draft, uploading, analyzing, generating, validating, completed, failed, archived)
   */
  async updateLessonPlanStatus(id: string, status: LessonPlanStatus): Promise<{ data: DbLessonPlan | null; error: string | null }> {
    const parseResult = updateLessonPlanStatusSchema.safeParse({ status });
    if (!parseResult.success) {
      return { data: null, error: 'Trạng thái giáo án không hợp lệ' };
    }

    return this.updateLessonPlan(id, { status });
  },

  /**
   * Delete a lesson plan
   */
  async deleteLessonPlan(id: string): Promise<{ success: boolean; error: string | null }> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('lesson_plans').delete().eq('id', id);

        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true, error: null };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    // Mock fallback
    MOCK_LESSON_PLANS = MOCK_LESSON_PLANS.filter((p) => p.id !== id);
    return { success: true, error: null };
  },

  /**
   * Get lesson file by ID
   */
  async getLessonFileById(fileId: string): Promise<{ data: DbLessonFile | null; error: string | null }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('lesson_files')
          .select('*')
          .eq('id', fileId)
          .maybeSingle();

        if (error) return { data: null, error: error.message };
        return { data: data as DbLessonFile, error: null };
      } catch (err: any) {
        return { data: null, error: err.message };
      }
    }

    return { data: null, error: 'File không tồn tại' };
  },

  /**
   * Delete lesson file record
   */
  async deleteLessonFile(fileId: string): Promise<{ success: boolean; error: string | null }> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('lesson_files').delete().eq('id', fileId);
        if (error) return { success: false, error: error.message };
        return { success: true, error: null };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    return { success: true, error: null };
  },

  /**
   * Create a lesson file record
   */
  async addLessonFile(input: CreateLessonFileInput, userId?: string): Promise<{ data: DbLessonFile | null; error: string | null }> {
    const parseResult = createLessonFileSchema.safeParse(input);
    if (!parseResult.success) {
      return { data: null, error: parseResult.error.issues.map((i) => i.message).join(', ') };
    }

    if (isSupabaseConfigured) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const activeUserId = userId || userData.user?.id;

        const { data, error } = await supabase
          .from('lesson_files')
          .insert({
            ...parseResult.data,
            user_id: activeUserId,
          })
          .select('*')
          .single();

        if (error) return { data: null, error: error.message };
        return { data: data as DbLessonFile, error: null };
      } catch (err: any) {
        return { data: null, error: err.message };
      }
    }

    return {
      data: {
        id: `file_${Date.now()}`,
        lesson_plan_id: input.lesson_plan_id || null,
        user_id: userId || 'usr_001',
        file_name: input.file_name,
        file_path: input.file_path,
        file_size: input.file_size || 0,
        file_type: input.file_type || 'application/pdf',
        storage_bucket: input.storage_bucket || 'lesson-files',
        extracted_text: input.extracted_text || null,
        status: input.status || 'uploaded',
        metadata: input.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      error: null,
    };
  },

  /**
   * Get files associated with a lesson plan
   */
  async getLessonFiles(lessonPlanId: string): Promise<{ data: DbLessonFile[]; error: string | null }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('lesson_files')
          .select('*')
          .eq('lesson_plan_id', lessonPlanId)
          .order('created_at', { ascending: true });

        if (error) return { data: [], error: error.message };
        return { data: (data as DbLessonFile[]) || [], error: null };
      } catch (err: any) {
        return { data: [], error: err.message };
      }
    }

    return { data: [], error: null };
  },

  /**
   * Log AI generation activity
   */
  async addGenerationLog(input: CreateGenerationLogInput, userId?: string): Promise<{ data: DbGenerationLog | null; error: string | null }> {
    const parseResult = createGenerationLogSchema.safeParse(input);
    if (!parseResult.success) {
      return { data: null, error: parseResult.error.issues.map((i) => i.message).join(', ') };
    }

    if (isSupabaseConfigured) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const activeUserId = userId || userData.user?.id;

        const { data, error } = await supabase
          .from('generation_logs')
          .insert({
            ...parseResult.data,
            user_id: activeUserId,
          })
          .select('*')
          .single();

        if (error) return { data: null, error: error.message };
        return { data: data as DbGenerationLog, error: null };
      } catch (err: any) {
        return { data: null, error: err.message };
      }
    }

    return {
      data: {
        id: `gen_${Date.now()}`,
        lesson_plan_id: input.lesson_plan_id || null,
        user_id: userId || 'usr_001',
        model_used: input.model_used || 'gemini-2.0-flash',
        prompt_tokens: input.prompt_tokens || 0,
        completion_tokens: input.completion_tokens || 0,
        total_tokens: input.total_tokens || 0,
        duration_ms: input.duration_ms || 0,
        status: input.status || 'completed',
        error_message: input.error_message || null,
        prompt_payload: input.prompt_payload || null,
        response_payload: input.response_payload || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      error: null,
    };
  },

  /**
   * Get user settings
   */
  async getUserSettings(userId: string): Promise<{ data: DbUserSettings | null; error: string | null }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) return { data: null, error: error.message };
        return { data: data as DbUserSettings, error: null };
      } catch (err: any) {
        return { data: null, error: err.message };
      }
    }

    return {
      data: {
        id: 'sett_001',
        user_id: userId,
        default_subject: 'Vật lý',
        default_grade: 'Lớp 10',
        default_textbook: 'Kết nối tri thức với cuộc sống',
        ai_model: 'gemini-2.0-flash',
        temperature: 0.7,
        preferences: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      error: null,
    };
  },

  /**
   * Update or upsert user settings
   */
  async updateUserSettings(userId: string, input: UpdateUserSettingsInput): Promise<{ data: DbUserSettings | null; error: string | null }> {
    const parseResult = updateUserSettingsSchema.safeParse(input);
    if (!parseResult.success) {
      return { data: null, error: parseResult.error.issues.map((i) => i.message).join(', ') };
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: userId,
            ...parseResult.data,
            updated_at: new Date().toISOString(),
          })
          .select('*')
          .maybeSingle();

        if (error) return { data: null, error: error.message };
        return { data: data as DbUserSettings, error: null };
      } catch (err: any) {
        return { data: null, error: err.message };
      }
    }

    return {
      data: {
        id: 'sett_001',
        user_id: userId,
        default_subject: input.default_subject || 'Vật lý',
        default_grade: input.default_grade || 'Lớp 10',
        default_textbook: input.default_textbook || 'Kết nối tri thức với cuộc sống',
        ai_model: input.ai_model || 'gemini-2.0-flash',
        temperature: input.temperature || 0.7,
        preferences: input.preferences || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      error: null,
    };
  },
};
