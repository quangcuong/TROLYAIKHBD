export interface SubjectConfig {
  id: string;
  code: string;
  name: string;
  gradeLevels: string[];
  status: 'active' | 'inactive';
}

export interface GradeLevelConfig {
  id: string;
  code: string;
  name: string;
  schoolLevel: 'Tiểu học' | 'THCS' | 'THPT';
  subjectsCount: number;
}

export interface TeachingMethodConfig {
  id: string;
  name: string;
  category: 'Phương pháp' | 'Kỹ thuật' | 'Hình thức tổ chức';
  description: string;
  suitableSubjects: string[];
  status: 'active' | 'inactive';
}

export interface AiModelConfig {
  id: string;
  name: string;
  modelAlias: string; // e.g. gemini-3.6-flash
  provider: string;
  isDefault: boolean;
  status: 'active' | 'maintenance' | 'disabled';
  maxTokens: number;
  temperature: number;
}

export interface QuotaConfig {
  role: 'teacher' | 'head_teacher' | 'admin';
  monthlyTokenLimit: number;
  maxPlansPerDay: number;
  priorityQueue: boolean;
}

export interface SystemTemplateConfig {
  id: string;
  title: string;
  type: '5512' | 'ncbh' | 'stem';
  description: string;
  systemPrompt: string;
  version: string;
  updatedAt: string;
}

export interface ErrorLog {
  id: string;
  timestamp: string;
  endpoint: string;
  statusCode: number;
  errorCode: string;
  errorMessage: string;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class AdminService {
  private subjects: SubjectConfig[] = [
    { id: 'sbj_01', code: 'VAT_LY', name: 'Vật lý', gradeLevels: ['Lớp 10', 'Lớp 11', 'Lớp 12'], status: 'active' },
    { id: 'sbj_02', code: 'TOAN', name: 'Toán học', gradeLevels: ['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'], status: 'active' },
    { id: 'sbj_03', code: 'HOA_HOC', name: 'Hóa học', gradeLevels: ['Lớp 10', 'Lớp 11', 'Lớp 12'], status: 'active' },
    { id: 'sbj_04', code: 'SINH_HOC', name: 'Sinh học', gradeLevels: ['Lớp 10', 'Lớp 11', 'Lớp 12'], status: 'active' },
    { id: 'sbj_05', code: 'KHTN', name: 'Khoa học Tự nhiên', gradeLevels: ['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9'], status: 'active' },
    { id: 'sbj_06', code: 'NGU_VAN', name: 'Ngữ văn', gradeLevels: ['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'], status: 'active' },
    { id: 'sbj_07', code: 'TIENG_ANH', name: 'Tiếng Anh', gradeLevels: ['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'], status: 'active' },
    { id: 'sbj_08', code: 'LICHSU_DIALY', name: 'Lịch sử & Địa lý', gradeLevels: ['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'], status: 'active' },
  ];

  private gradeLevels: GradeLevelConfig[] = [
    { id: 'grd_06', code: 'LOP_6', name: 'Lớp 6', schoolLevel: 'THCS', subjectsCount: 12 },
    { id: 'grd_07', code: 'LOP_7', name: 'Lớp 7', schoolLevel: 'THCS', subjectsCount: 12 },
    { id: 'grd_08', code: 'LOP_8', name: 'Lớp 8', schoolLevel: 'THCS', subjectsCount: 12 },
    { id: 'grd_09', code: 'LOP_9', name: 'Lớp 9', schoolLevel: 'THCS', subjectsCount: 12 },
    { id: 'grd_10', code: 'LOP_10', name: 'Lớp 10', schoolLevel: 'THPT', subjectsCount: 14 },
    { id: 'grd_11', code: 'LOP_11', name: 'Lớp 11', schoolLevel: 'THPT', subjectsCount: 14 },
    { id: 'grd_12', code: 'LOP_12', name: 'Lớp 12', schoolLevel: 'THPT', subjectsCount: 14 },
  ];

  private teachingMethods: TeachingMethodConfig[] = [
    { id: 'pp_01', name: 'Dạy học giải quyết vấn đề', category: 'Phương pháp', description: 'Đặt học sinh vào tình huống có vấn đề để chủ động tìm giải pháp', suitableSubjects: ['Vật lý', 'Toán học', 'KHTN', 'Hóa học'], status: 'active' },
    { id: 'pp_02', name: 'Dạy học Dự án (Project-Based Learning)', category: 'Phương pháp', description: 'Tổ chức cho học sinh thực hiện dự án thực tiễn tích hợp kiến thức', suitableSubjects: ['Tất cả môn'], status: 'active' },
    { id: 'pp_03', name: 'Bàn tay nặn bột (Inquiry-Based Learning)', category: 'Phương pháp', description: 'Quy trình 5 bước tìm tòi nghiên cứu khoa học cho HS', suitableSubjects: ['KHTN', 'Vật lý', 'Hóa học', 'Sinh học'], status: 'active' },
    { id: 'kt_01', name: 'Kỹ thuật Khăn trải bàn', category: 'Kỹ thuật', description: 'Thảo luận nhóm kết hợp làm việc cá nhân và thống nhất ý kiến chung', suitableSubjects: ['Tất cả môn'], status: 'active' },
    { id: 'kt_02', name: 'Kỹ thuật Sơ đồ tư duy (Mindmap)', category: 'Kỹ thuật', description: 'Hệ thống hóa kiến thức bằng hình ảnh và từ khóa', suitableSubjects: ['Tất cả môn'], status: 'active' },
    { id: 'kt_03', name: 'Kỹ thuật Trạm (Station Learning)', category: 'Kỹ thuật', description: 'Chia không gian lớp thành các trạm học tập độc lập xoay vòng', suitableSubjects: ['Vật lý', 'Toán học', 'Ngữ văn', 'KHTN'], status: 'active' },
    { id: 'kt_04', name: 'Kỹ thuật KWL / KWLH', category: 'Kỹ thuật', description: 'Xác định Điều đã biết (K), Điều muốn biết (W), Điều đã học (L)', suitableSubjects: ['Tất cả môn'], status: 'active' },
  ];

  private aiModels: AiModelConfig[] = [
    { id: 'mdl_01', name: 'Gemini 3.6 Flash (Khuyên dùng)', modelAlias: 'gemini-3.6-flash', provider: 'Google Cloud AI', isDefault: true, status: 'active', maxTokens: 16384, temperature: 0.2 },
    { id: 'mdl_02', name: 'Gemini 3.5 Pro (Chuyên sâu)', modelAlias: 'gemini-3.5-pro', provider: 'Google Cloud AI', isDefault: false, status: 'active', maxTokens: 32768, temperature: 0.3 },
    { id: 'mdl_03', name: 'Gemini 3.5 Flash (Nhanh)', modelAlias: 'gemini-3.5-flash', provider: 'Google Cloud AI', isDefault: false, status: 'active', maxTokens: 8192, temperature: 0.2 },
  ];

  private quotas: QuotaConfig[] = [
    { role: 'teacher', monthlyTokenLimit: 200000, maxPlansPerDay: 15, priorityQueue: false },
    { role: 'head_teacher', monthlyTokenLimit: 350000, maxPlansPerDay: 30, priorityQueue: true },
    { role: 'admin', monthlyTokenLimit: 1000000, maxPlansPerDay: 100, priorityQueue: true },
  ];

  private templates: SystemTemplateConfig[] = [
    { id: 'tpl_5512', title: 'Mẫu Kế hoạch bài dạy Phụ lục IV (CV 5512)', type: '5512', description: 'Khung kế hoạch bài dạy chuẩn Bộ GD&ĐT với Mục tiêu 3 thành phần & 4 Hoạt động học tập.', systemPrompt: 'Bạn là chuyên gia thiết kế chương trình GDPT 2018...', version: '2.1.0', updatedAt: '2026-07-20T00:00:00Z' },
    { id: 'tpl_stem', title: 'Mẫu Kế hoạch bài dạy STEM 5 bước', type: 'stem', description: 'Khung bài giảng STEM tích hợp quy trình thiết kế kỹ thuật và tiêu chí đánh giá sản phẩm.', systemPrompt: 'Bạn là chuyên gia giáo dục STEM định hướng GDPT 2018...', version: '1.8.0', updatedAt: '2026-07-25T00:00:00Z' },
    { id: 'tpl_ncbh', title: 'Mẫu Kế hoạch Nghiên cứu bài học chuyên môn', type: 'ncbh', description: 'Mẫu KHBD phục vụ sinh hoạt chuyên môn theo nghiên cứu bài học, quan sát hành vi học sinh.', systemPrompt: 'Bạn là cố vấn phương pháp dạy học cho các tổ chuyên môn...', version: '1.5.0', updatedAt: '2026-08-01T00:00:00Z' },
  ];

  private errorLogs: ErrorLog[] = [
    { id: 'err_101', timestamp: new Date(Date.now() - 3600000).toISOString(), endpoint: '/api/generate-plan', statusCode: 504, errorCode: 'GEMINI_TIMEOUT', errorMessage: 'Upstream API gateway timeout after 15000ms', userId: 'usr_002', severity: 'medium' },
    { id: 'err_102', timestamp: new Date(Date.now() - 86400000).toISOString(), endpoint: '/api/export/pdf', statusCode: 400, errorCode: 'INVALID_PLAN_DATA', errorMessage: 'Missing content structure for PDF rendering', userId: 'usr_003', severity: 'low' },
    { id: 'err_103', timestamp: new Date(Date.now() - 172800000).toISOString(), endpoint: '/api/ai-pipeline', statusCode: 429, errorCode: 'QUOTA_EXCEEDED', errorMessage: 'User monthly token quota reached', userId: 'usr_002', severity: 'medium' },
  ];

  // System Stats Overview
  public getOverviewStats() {
    return {
      users: {
        total: 128,
        teachers: 98,
        headTeachers: 24,
        admins: 6,
        activeThisMonth: 112,
      },
      lessonPlans: {
        total: 1450,
        type5512: 980,
        typeSTEM: 310,
        typeNCBH: 160,
        approvedRate: 94.5,
      },
      aiUsage: {
        totalGenerations: 4280,
        tokensUsed: 18450000,
        successRate: 99.2,
        avgLatencyMs: 1820,
      },
      errors: {
        totalLogged: this.errorLogs.length,
        errorRatePercentage: 0.8,
        recentErrors: this.errorLogs,
      },
    };
  }

  // Subjects
  public getSubjects() { return [...this.subjects]; }
  public addSubject(subject: Omit<SubjectConfig, 'id'>) {
    const newSubject = { id: `sbj_${Date.now()}`, ...subject };
    this.subjects.push(newSubject);
    return newSubject;
  }
  public deleteSubject(id: string) {
    this.subjects = this.subjects.filter((s) => s.id !== id);
    return true;
  }

  // Grades
  public getGradeLevels() { return [...this.gradeLevels]; }
  public addGradeLevel(grade: Omit<GradeLevelConfig, 'id'>) {
    const newGrade = { id: `grd_${Date.now()}`, ...grade };
    this.gradeLevels.push(newGrade);
    return newGrade;
  }
  public deleteGradeLevel(id: string) {
    this.gradeLevels = this.gradeLevels.filter((g) => g.id !== id);
    return true;
  }

  // Teaching Methods
  public getTeachingMethods() { return [...this.teachingMethods]; }
  public addTeachingMethod(method: Omit<TeachingMethodConfig, 'id'>) {
    const newMethod = { id: `pp_${Date.now()}`, ...method };
    this.teachingMethods.push(newMethod);
    return newMethod;
  }
  public updateTeachingMethod(id: string, updates: Partial<TeachingMethodConfig>) {
    const idx = this.teachingMethods.findIndex((m) => m.id === id);
    if (idx !== -1) {
      this.teachingMethods[idx] = { ...this.teachingMethods[idx], ...updates };
      return this.teachingMethods[idx];
    }
    return null;
  }
  public deleteTeachingMethod(id: string) {
    this.teachingMethods = this.teachingMethods.filter((m) => m.id !== id);
    return true;
  }

  // AI Models
  public getAiModels() { return [...this.aiModels]; }
  public updateAiModel(id: string, updates: Partial<AiModelConfig>) {
    const idx = this.aiModels.findIndex((m) => m.id === id);
    if (idx !== -1) {
      if (updates.isDefault) {
        this.aiModels.forEach((m) => (m.isDefault = false));
      }
      this.aiModels[idx] = { ...this.aiModels[idx], ...updates };
      return this.aiModels[idx];
    }
    return null;
  }

  // Quotas
  public getQuotas() { return [...this.quotas]; }
  public updateQuota(role: 'teacher' | 'head_teacher' | 'admin', updates: Partial<QuotaConfig>) {
    const idx = this.quotas.findIndex((q) => q.role === role);
    if (idx !== -1) {
      this.quotas[idx] = { ...this.quotas[idx], ...updates };
      return this.quotas[idx];
    }
    return null;
  }

  // Templates
  public getTemplates() { return [...this.templates]; }
  public updateTemplate(id: string, updates: Partial<SystemTemplateConfig>) {
    const idx = this.templates.findIndex((t) => t.id === id);
    if (idx !== -1) {
      this.templates[idx] = {
        ...this.templates[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return this.templates[idx];
    }
    return null;
  }

  // Error Logs
  public getErrorLogs() { return [...this.errorLogs]; }
}

export const adminService = new AdminService();
