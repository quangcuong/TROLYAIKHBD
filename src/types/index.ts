export type DocumentType = '5512' | 'ncbh' | 'stem';

export type PlanStatus = 'draft' | 'reviewing' | 'approved' | 'archived';

export type GradeLevel = 'Lớp 6' | 'Lớp 7' | 'Lớp 8' | 'Lớp 9' | 'Lớp 10' | 'Lớp 11' | 'Lớp 12';

export type TextbookSeries = 'Kết nối tri thức với cuộc sống' | 'Cánh diều' | 'Chân trời sáng tạo' | 'Khác';

export interface UserProfile {
  id: string;
  full_name: string;
  school_name: string;
  department: string;
  subject: string;
  school_level: string;
  default_school_year: string;
  role: 'teacher' | 'head_teacher' | 'admin' | string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'teacher' | 'head_teacher' | 'admin';
  school: string;
  subject: string;
  department?: string;
  schoolLevel?: string;
  defaultSchoolYear?: string;
  emailConfirmed?: boolean;
  aiQuotaUsed: number;
  aiQuotaLimit: number;
}

export interface ActivitySection5512 {
  id: string;
  title: string; // e.g. "Hoạt động 1: Mở đầu"
  time: string; // e.g. "7 phút"
  objective: string; // Mục tiêu
  content: string; // Nội dung
  product: string; // Sản phẩm
  implementation: string; // Tổ chức thực hiện (Chuyển giao nv, Thực hiện nv, Báo cáo thảo luận, Kết luận nhận định)
}

export interface LessonPlan5512Content {
  objectives: {
    knowledge: string[];
    capabilities: string[]; // Năng lực chung & đặc thù
    qualities: string[]; // Phẩm chất
  };
  teachingEquipment: {
    teacher: string[];
    students: string[];
  };
  activities: ActivitySection5512[];
}

export interface ActivitySectionNCBH {
  id: string;
  title: string;
  phase: string; // e.g. "Giai đoạn 1: Khởi động & Dự đoán"
  researchObjective: string; // Mục tiêu nghiên cứu hành vi học tập
  teacherAction: string;
  expectedStudentBehavior: string;
  observationPoints: string[]; // Điểm quan sát trọng tâm cho giáo viên dự giờ
}

export interface LessonPlanNCBHContent {
  researchTopic: string; // Chủ đề nghiên cứu bài học
  researchGoals: string[]; // Mục tiêu nghiên cứu của tổ chuyên môn
  focusQuestions: string[]; // Câu hỏi nghiên cứu trọng tâm
  activities: ActivitySectionNCBH[];
  postLessonReflectionCriteria: string[]; // Tiêu chí thảo luận rút kinh nghiệm
}

export interface LessonPlanSTEMContent {
  stemTheme: string; // Tên chủ đề/dự án STEM
  productDescription: string; // Mô tả sản phẩm STEM sinh viên/học sinh cần chế tạo
  integratedSubjects: {
    science: string;
    technology: string;
    engineering: string;
    mathematics: string;
  };
  productCriteria: {
    criterion: string;
    weight: string;
    description: string;
  }[];
  designSteps: {
    step: number;
    title: string;
    duration: string;
    studentTask: string;
  }[];
  assessmentRubric: {
    level: string;
    scoreRange: string;
    details: string;
  }[];
}

export interface LessonPlan {
  id: string;
  title: string;
  type: DocumentType;
  subject: string;
  grade: GradeLevel;
  textbook: TextbookSeries;
  duration: string; // e.g., "2 tiết"
  authorId: string;
  authorName: string;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
  summary: string;
  content5512?: LessonPlan5512Content;
  contentNCBH?: LessonPlanNCBHContent;
  contentSTEM?: LessonPlanSTEMContent;
  tags: string[];
  viewsCount: number;
  likesCount: number;
}

export interface SystemStats {
  totalPlans: number;
  plansThisMonth: number;
  activeTeachers: number;
  aiTokensUsed: number;
  approvalRate: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  type: DocumentType;
  description: string;
  promptText: string;
  isDefault: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}
