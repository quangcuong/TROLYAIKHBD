import React, { createContext, useContext, useState, useEffect } from 'react';
import { LessonPlan } from '../types';
import { MOCK_LESSON_PLANS } from '../data/mockData';
import { lessonPlanService } from '../services/lessonPlanService';
import { useAuth } from './AuthContext';
import { LessonPlanStatus } from '../types/database';

interface LessonPlanContextType {
  plans: LessonPlan[];
  activePlan: LessonPlan | null;
  isLoading: boolean;
  error: string | null;
  setActivePlan: (plan: LessonPlan | null) => void;
  getPlanById: (id: string) => LessonPlan | undefined;
  addPlan: (newPlan: LessonPlan) => Promise<void>;
  updatePlan: (id: string, updatedFields: Partial<LessonPlan>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  duplicatePlan: (id: string) => Promise<LessonPlan | undefined>;
  refreshPlans: () => Promise<void>;
}

const LessonPlanContext = createContext<LessonPlanContextType | undefined>(undefined);

export const LessonPlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<LessonPlan[]>(MOCK_LESSON_PLANS);
  const [activePlan, setActivePlan] = useState<LessonPlan | null>(MOCK_LESSON_PLANS[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper map DbLessonPlan -> App LessonPlan
  const mapDbPlanToAppPlan = (dbPlan: any): LessonPlan => {
    const meta = dbPlan.metadata || {};
    return {
      id: dbPlan.id,
      title: dbPlan.title,
      type: (dbPlan.type || '5512') as any,
      subject: dbPlan.subject,
      grade: dbPlan.grade as any,
      textbook: (dbPlan.textbook || 'Kết nối tri thức với cuộc sống') as any,
      duration: dbPlan.duration || '2 tiết',
      authorId: dbPlan.user_id,
      authorName: meta.authorName || user?.name || 'Giáo viên',
      status: dbPlan.status || 'draft',
      createdAt: dbPlan.created_at,
      updatedAt: dbPlan.updated_at,
      summary: dbPlan.summary || '',
      content5512: dbPlan.content?.content5512 || dbPlan.content?.objectives ? dbPlan.content : undefined,
      contentNCBH: dbPlan.content?.contentNCBH,
      contentSTEM: dbPlan.content?.contentSTEM,
      tags: meta.tags || ['Bộ GDĐT', 'Mới'],
      viewsCount: meta.viewsCount || 0,
      likesCount: meta.likesCount || 0,
    };
  };

  const refreshPlans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await lessonPlanService.getLessonPlans({ userId: user?.id });
      if (res.data && res.data.length > 0) {
        const mapped = res.data.map(mapDbPlanToAppPlan);
        setPlans(mapped);
        if (!activePlan || !mapped.some((p) => p.id === activePlan.id)) {
          setActivePlan(mapped[0]);
        }
      }
    } catch (err: any) {
      console.error('Failed to load plans from Supabase:', err);
      setError(err.message || 'Không thể tải danh sách giáo án');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshPlans();
  }, [user?.id]);

  const getPlanById = (id: string) => {
    return plans.find((p) => p.id === id);
  };

  const addPlan = async (newPlan: LessonPlan) => {
    setIsLoading(true);
    // Optimistic UI update
    setPlans((prev) => [newPlan, ...prev]);
    setActivePlan(newPlan);

    try {
      await lessonPlanService.createLessonPlan(
        {
          title: newPlan.title,
          type: newPlan.type,
          subject: newPlan.subject,
          grade: newPlan.grade,
          textbook: newPlan.textbook,
          duration: newPlan.duration,
          summary: newPlan.summary,
          status: newPlan.status as LessonPlanStatus,
          content: {
            content5512: newPlan.content5512,
            contentNCBH: newPlan.contentNCBH,
            contentSTEM: newPlan.contentSTEM,
          },
          metadata: {
            authorName: newPlan.authorName,
            tags: newPlan.tags,
            viewsCount: newPlan.viewsCount,
            likesCount: newPlan.likesCount,
          },
        },
        user?.id
      );
    } catch (err: any) {
      console.error('Error persisting new lesson plan:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePlan = async (id: string, updatedFields: Partial<LessonPlan>) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields, updatedAt: new Date().toISOString() } : p))
    );
    if (activePlan?.id === id) {
      setActivePlan((prev) => (prev ? { ...prev, ...updatedFields, updatedAt: new Date().toISOString() } : null));
    }

    try {
      await lessonPlanService.updateLessonPlan(id, {
        title: updatedFields.title,
        type: updatedFields.type,
        subject: updatedFields.subject,
        grade: updatedFields.grade,
        textbook: updatedFields.textbook,
        duration: updatedFields.duration,
        summary: updatedFields.summary,
        status: updatedFields.status as LessonPlanStatus,
      });
    } catch (err) {
      console.error('Error updating lesson plan:', err);
    }
  };

  const deletePlan = async (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    if (activePlan?.id === id) {
      setActivePlan(plans.find((p) => p.id !== id) || null);
    }

    try {
      await lessonPlanService.deleteLessonPlan(id);
    } catch (err) {
      console.error('Error deleting lesson plan:', err);
    }
  };

  const duplicatePlan = async (id: string) => {
    const target = plans.find((p) => p.id === id);
    if (!target) return undefined;

    const duplicated: LessonPlan = {
      ...target,
      id: `lp_${Date.now()}`,
      title: `${target.title} (Bản sao)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewsCount: 0,
      likesCount: 0,
    };

    await addPlan(duplicated);
    return duplicated;
  };

  return (
    <LessonPlanContext.Provider
      value={{
        plans,
        activePlan,
        isLoading,
        error,
        setActivePlan,
        getPlanById,
        addPlan,
        updatePlan,
        deletePlan,
        duplicatePlan,
        refreshPlans,
      }}
    >
      {children}
    </LessonPlanContext.Provider>
  );
};

export const useLessonPlans = () => {
  const context = useContext(LessonPlanContext);
  if (!context) {
    throw new Error('useLessonPlans must be used within a LessonPlanProvider');
  }
  return context;
};
