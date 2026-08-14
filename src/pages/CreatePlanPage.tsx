import React from 'react';
import { LessonPlanWizard } from '../components/wizard/LessonPlanWizard';

interface CreatePlanPageProps {
  onNavigate: (page: string, params?: { type?: string; planId?: string }) => void;
  initialType?: string;
}

export const CreatePlanPage: React.FC<CreatePlanPageProps> = ({ onNavigate, initialType }) => {
  return <LessonPlanWizard onNavigate={onNavigate} initialType={initialType} />;
};
