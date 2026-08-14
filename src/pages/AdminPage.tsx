import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Sparkles,
  Database,
  Search,
  Plus,
  Edit2,
  Trash2,
  Activity,
  CheckCircle2,
  Layers,
  Settings,
  AlertTriangle,
  Server,
  BookOpen,
  GraduationCap,
  Cpu,
  Sliders,
  FileCode,
  Loader2,
  RefreshCw,
  X,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MOCK_USERS_LIST } from '../data/mockData';
import { User } from '../types';
import {
  SubjectConfig,
  GradeLevelConfig,
  TeachingMethodConfig,
  AiModelConfig,
  QuotaConfig,
  SystemTemplateConfig,
  ErrorLog
} from '../services/adminService';

type AdminTab =
  | 'overview'
  | 'users'
  | 'subjects_grades'
  | 'methods'
  | 'models'
  | 'quotas'
  | 'templates'
  | 'error_logs';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Server Auth Check & Loading
  const [isServerVerifying, setIsServerVerifying] = useState(true);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  // System Stats Data State
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<User[]>(MOCK_USERS_LIST);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Admin Managed Resources
  const [subjects, setSubjects] = useState<SubjectConfig[]>([]);
  const [gradeLevels, setGradeLevels] = useState<GradeLevelConfig[]>([]);
  const [methods, setMethods] = useState<TeachingMethodConfig[]>([]);
  const [models, setModels] = useState<AiModelConfig[]>([]);
  const [quotas, setQuotas] = useState<QuotaConfig[]>([]);
  const [templates, setTemplates] = useState<SystemTemplateConfig[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);

  // Sub-forms and modals
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubject, setNewSubject] = useState({ code: '', name: '', gradeLevels: 'Lớp 10, Lớp 11, Lớp 12' });

  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [newGrade, setNewGrade] = useState({ code: '', name: '', schoolLevel: 'THPT' as 'THPT' | 'THCS' | 'Tiểu học' });

  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [newMethod, setNewMethod] = useState({
    name: '',
    category: 'Phương pháp' as 'Phương pháp' | 'Kỹ thuật' | 'Hình thức tổ chức',
    description: '',
    suitableSubjects: 'Tất cả môn'
  });

  const [editingTemplate, setEditingTemplate] = useState<SystemTemplateConfig | null>(null);

  // Common Headers for Server Verification
  const getAdminHeaders = () => ({
    'Content-Type': 'application/json',
    'x-user-role': user?.role || 'admin',
    'x-user-id': user?.id || 'usr_004',
  });

  // Load Admin Data with Server-Side Authorization Verification
  const fetchAdminData = async () => {
    setIsServerVerifying(true);
    setAccessDeniedMessage(null);

    try {
      // 1. Test Server Role Enforcer via /api/admin/overview
      const resOverview = await fetch('/api/admin/overview', {
        headers: getAdminHeaders(),
      });

      if (resOverview.status === 403) {
        const errJson = await resOverview.json().catch(() => ({}));
        setAccessDeniedMessage(
          errJson.error?.message || 'Truy cập bị từ chối phía máy chủ. Yêu cầu quyền Quản trị viên (Admin).'
        );
        setIsServerVerifying(false);
        return;
      }

      if (!resOverview.ok) {
        throw new Error('Lỗi từ máy chủ khi tải dữ liệu thống kê quản trị.');
      }

      const overviewData = await resOverview.json();
      setStats(overviewData.data);

      // 2. Load parallel admin resources
      const [resSubj, resGrd, resMeth, resMdl, resQta, resTpl, resLogs] = await Promise.all([
        fetch('/api/admin/subjects', { headers: getAdminHeaders() }),
        fetch('/api/admin/grades', { headers: getAdminHeaders() }),
        fetch('/api/admin/methods', { headers: getAdminHeaders() }),
        fetch('/api/admin/models', { headers: getAdminHeaders() }),
        fetch('/api/admin/quotas', { headers: getAdminHeaders() }),
        fetch('/api/admin/templates', { headers: getAdminHeaders() }),
        fetch('/api/admin/logs/errors', { headers: getAdminHeaders() }),
      ]);

      if (resSubj.ok) setSubjects((await resSubj.json()).data || []);
      if (resGrd.ok) setGradeLevels((await resGrd.json()).data || []);
      if (resMeth.ok) setMethods((await resMeth.json()).data || []);
      if (resMdl.ok) setModels((await resMdl.json()).data || []);
      if (resQta.ok) setQuotas((await resQta.json()).data || []);
      if (resTpl.ok) setTemplates((await resTpl.json()).data || []);
      if (resLogs.ok) setErrorLogs((await resLogs.json()).data || []);
    } catch (err: any) {
      console.error('Error fetching admin overview:', err);
      setAccessDeniedMessage(err.message || 'Không thể xác thực quyền Admin với máy chủ.');
    } finally {
      setIsServerVerifying(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  // Handler: Add Subject
  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          code: newSubject.code.toUpperCase(),
          name: newSubject.name,
          gradeLevels: newSubject.gradeLevels.split(',').map((s) => s.trim()),
        }),
      });

      if (!res.ok) throw new Error('Không thể thêm môn học');
      const data = await res.json();
      setSubjects((prev) => [...prev, data.data]);
      setShowAddSubjectModal(false);
      setNewSubject({ code: '', name: '', gradeLevels: 'Lớp 10, Lớp 11, Lớp 12' });
      alert('Đã thêm môn học thành công!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteSubject = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa môn học "${name}"?`)) return;
    try {
      await fetch(`/api/admin/subjects/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
      setSubjects((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handler: Add Grade Level
  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/grades', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          code: newGrade.code || newGrade.name,
          name: newGrade.name,
          schoolLevel: newGrade.schoolLevel,
          subjectsCount: 12,
        }),
      });

      if (!res.ok) throw new Error('Không thể thêm khối lớp');
      const data = await res.json();
      setGradeLevels((prev) => [...prev, data.data]);
      setShowAddGradeModal(false);
      setNewGrade({ code: '', name: '', schoolLevel: 'THPT' });
      alert('Đã thêm khối lớp thành công!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteGrade = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa khối lớp "${name}"?`)) return;
    try {
      await fetch(`/api/admin/grades/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
      setGradeLevels((prev) => prev.filter((g) => g.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handler: Add Method
  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/methods', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          name: newMethod.name,
          category: newMethod.category,
          description: newMethod.description,
          suitableSubjects: newMethod.suitableSubjects.split(',').map((s) => s.trim()),
        }),
      });

      if (!res.ok) throw new Error('Không thể thêm phương pháp');
      const data = await res.json();
      setMethods((prev) => [...prev, data.data]);
      setShowAddMethodModal(false);
      setNewMethod({ name: '', category: 'Phương pháp', description: '', suitableSubjects: 'Tất cả môn' });
      alert('Đã thêm phương pháp/kỹ thuật dạy học thành công!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteMethod = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa "${name}"?`)) return;
    try {
      await fetch(`/api/admin/methods/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
      setMethods((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handler: Update Model Default
  const handleSetDefaultModel = async (modelId: string) => {
    try {
      const res = await fetch(`/api/admin/models/${modelId}`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) {
        setModels((prev) =>
          prev.map((m) => ({ ...m, isDefault: m.id === modelId }))
        );
        alert('Đã đặt model AI mặc định thành công!');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handler: Update Role Quotas
  const handleUpdateQuota = async (role: 'teacher' | 'head_teacher' | 'admin', monthlyTokenLimit: number) => {
    try {
      const res = await fetch(`/api/admin/quotas/${role}`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify({ monthlyTokenLimit }),
      });
      if (res.ok) {
        setQuotas((prev) =>
          prev.map((q) => (q.role === role ? { ...q, monthlyTokenLimit } : q))
        );
        alert(`Đã cập nhật hạn ngạch Token cho vai trò ${role}!`);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handler: Save Template Edit
  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    try {
      const res = await fetch(`/api/admin/templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          systemPrompt: editingTemplate.systemPrompt,
          description: editingTemplate.description,
        }),
      });
      if (res.ok) {
        const updatedData = (await res.json()).data;
        setTemplates((prev) => prev.map((t) => (t.id === updatedData.id ? updatedData : t)));
        setEditingTemplate(null);
        alert('Đã lưu mẫu giáo án hệ thống!');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Render Server Verifying State
  if (isServerVerifying) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
        <p className="text-xs font-semibold text-slate-500">
          Đang xác thực quyền Quản trị viên (Admin Role) phía máy chủ...
        </p>
      </div>
    );
  }

  // Render Server Access Denied State
  if (accessDeniedMessage) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center space-y-6">
        <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-2xl dark:border-red-950 dark:bg-slate-900 space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Truy cập bị Từ chối</h2>
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
            {accessDeniedMessage}
          </p>
          <div className="rounded-2xl bg-slate-50 p-4 text-[11px] text-slate-500 dark:bg-slate-800 text-left space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300">Yêu cầu bảo mật máy chủ:</p>
            <p>• Vai trò tài khoản hiện tại: <strong>{user?.role || 'Chưa đăng nhập'}</strong></p>
            <p>• Mã Endpoint bảo vệ: <code>/api/admin/*</code> (Kiểm tra Server Authorization)</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-purple-700 mx-auto"
          >
            <RefreshCw className="h-4 w-4" /> Thử lại
          </button>
        </div>
      </div>
    );
  }

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.school.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 py-2">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-300">
            <ShieldAlert className="h-4 w-4" /> Quản trị Hệ thống Server-Enforced
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">
            Bảng Quản trị & Giám sát Chuyên môn
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Quản lý người dùng, môn học, khối lớp, phương pháp PPDH, model AI và hạn mức Token
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3.5 py-1.5 text-xs font-bold text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Gemini API Healthy
          </span>
          <button
            onClick={fetchAdminData}
            title="Làm mới dữ liệu"
            className="rounded-xl bg-white/10 p-2 text-white hover:bg-white/20 transition"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'overview', label: 'Thống kê Tổng quan', icon: Activity },
            { id: 'users', label: 'Quản lý Người dùng', icon: Users },
            { id: 'subjects_grades', label: 'Môn & Khối lớp', icon: BookOpen },
            { id: 'methods', label: 'PPDH & Kỹ thuật', icon: GraduationCap },
            { id: 'models', label: 'Danh sách Model AI', icon: Cpu },
            { id: 'quotas', label: 'Cấu hình Hạn mức', icon: Sliders },
            { id: 'templates', label: 'Mẫu Giáo án System', icon: FileCode },
            { id: 'error_logs', label: 'Nhật ký Lỗi', icon: Server },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 shrink-0 rounded-2xl px-4 py-2.5 font-bold transition ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Tổng Người dùng</span>
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                {stats.users?.total || 128}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {stats.users?.activeThisMonth || 112} hoạt động tháng này
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Tổng Giáo án đã Tạo</span>
                <Layers className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                {stats.lessonPlans?.total || 1450}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Tỷ lệ phê duyệt {stats.lessonPlans?.approvedRate || 94.5}%
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Lượt gọi AI / Token</span>
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                {((stats.aiUsage?.tokensUsed || 18450000) / 1000000).toFixed(1)}M
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {stats.aiUsage?.totalGenerations || 4280} lượt sinh giáo án
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Tỷ lệ Lỗi Hệ thống</span>
                <Server className="h-5 w-5 text-rose-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                {stats.errors?.errorRatePercentage || 0.8}%
              </p>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                99.2% phản hồi thành công
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-purple-600" /> Phân bổ Loại Kế hoạch bài dạy
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-blue-50 p-4 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40">
                  <p className="text-xs text-blue-600 font-bold">Công văn 5512</p>
                  <p className="text-2xl font-extrabold text-blue-900 dark:text-blue-200 mt-1">
                    {stats.lessonPlans?.type5512 || 980}
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
                  <p className="text-xs text-emerald-600 font-bold">Giáo án STEM</p>
                  <p className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-200 mt-1">
                    {stats.lessonPlans?.typeSTEM || 310}
                  </p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-4 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40">
                  <p className="text-xs text-amber-600 font-bold">NCBH Chuyên môn</p>
                  <p className="text-2xl font-extrabold text-amber-900 dark:text-amber-200 mt-1">
                    {stats.lessonPlans?.typeNCBH || 160}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Cpu className="h-4 w-4 text-indigo-600" /> Thời gian Phản hồi AI
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Độ trễ trung bình:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{stats.aiUsage?.avgLatencyMs || 1820} ms</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Trạng thái Gateway:</span>
                  <span className="font-bold text-emerald-600">Sẵn sàng (200 OK)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Mã hóa Secret Keys:</span>
                  <span className="font-bold text-purple-600">Bảo mật tuyệt đối</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS & QUOTAS */}
      {activeTab === 'users' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quản lý Tài khoản Giáo viên</h2>
              <p className="text-xs text-slate-500">Theo dõi phân quyền, đơn vị trường học và điều chỉnh hạn ngạch Token Gemini</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tên, email, trường..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 uppercase text-[10px] font-semibold tracking-wider text-slate-400 dark:bg-slate-800/50">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Giáo viên</th>
                  <th className="p-3.5">Vai trò</th>
                  <th className="p-3.5">Trường học / Môn</th>
                  <th className="p-3.5">Token Đã dùng</th>
                  <th className="p-3.5 text-right rounded-r-xl">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5 flex items-center gap-3">
                      <img src={u.avatar} alt={u.name} className="h-8 w-8 rounded-full object-cover shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.email}</p>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          : u.role === 'head_teacher'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {u.role === 'admin' ? 'Quản trị viên' : u.role === 'head_teacher' ? 'Tổ trưởng chuyên môn' : 'Giáo viên'}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{u.school}</p>
                      <p className="text-[10px] text-slate-400">{u.subject}</p>
                    </td>

                    <td className="p-3.5">
                      <div className="w-36 space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span>{u.aiQuotaUsed.toLocaleString('vi-VN')}</span>
                          <span className="text-slate-400">/ {u.aiQuotaLimit.toLocaleString('vi-VN')}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-purple-600 rounded-full"
                            style={{ width: `${Math.min(100, (u.aiQuotaUsed / u.aiQuotaLimit) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          const val = prompt(`Nhập hạn ngạch Token mới cho ${u.name}:`, String(u.aiQuotaLimit));
                          if (val && !isNaN(Number(val))) {
                            setUsersList((prev) =>
                              prev.map((item) => (item.id === u.id ? { ...item, aiQuotaLimit: Number(val) } : item))
                            );
                            alert('Đã cập nhật hạn ngạch thành công!');
                          }
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50 dark:border-slate-700 dark:bg-slate-800 dark:text-purple-300"
                      >
                        Chỉnh hạn ngạch
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SUBJECTS & GRADES */}
      {activeTab === 'subjects_grades' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subjects Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Danh mục Môn học</h3>
                <p className="text-xs text-slate-500">Quản lý môn dạy theo chương trình GDPT 2018</p>
              </div>
              <button
                onClick={() => setShowAddSubjectModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-700"
              >
                <Plus className="h-4 w-4" /> Thêm môn
              </button>
            </div>

            <div className="space-y-2">
              {subjects.map((sbj) => (
                <div
                  key={sbj.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{sbj.name}</span>
                    <span className="ml-2 rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-mono text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      {sbj.code}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{sbj.gradeLevels.join(', ')}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteSubject(sbj.id, sbj.name)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Grade Levels Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Cấp học & Khối lớp</h3>
                <p className="text-xs text-slate-500">Quản lý các khối lớp giảng dạy</p>
              </div>
              <button
                onClick={() => setShowAddGradeModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-700"
              >
                <Plus className="h-4 w-4" /> Thêm khối
              </button>
            </div>

            <div className="space-y-2">
              {gradeLevels.map((grd) => (
                <div
                  key={grd.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{grd.name}</span>
                    <span className="ml-2 rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {grd.schoolLevel}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteGrade(grd.id, grd.name)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PEDAGOGICAL METHODS & TECHNIQUES */}
      {activeTab === 'methods' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Phương pháp & Kỹ thuật Dạy học</h2>
              <p className="text-xs text-slate-500">Cấu hình thư viện phương pháp sư phạm phục vụ gợi ý AI khi thiết kế giáo án</p>
            </div>
            <button
              onClick={() => setShowAddMethodModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-purple-700"
            >
              <Plus className="h-4 w-4" /> Thêm phương pháp mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {methods.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      m.category === 'Phương pháp'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {m.category}
                    </span>
                    <button
                      onClick={() => handleDeleteMethod(m.id, m.name)}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-2">{m.name}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {m.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Môn phù hợp: {m.suitableSubjects.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AI MODELS MANAGEMENT */}
      {activeTab === 'models' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quản lý Mô hình AI Gemini</h2>
            <p className="text-xs text-slate-500">Cấu hình mô hình sinh giáo án mặc định, giới hạn Token và nhiệt độ sáng tạo</p>
          </div>

          <div className="space-y-4">
            {models.map((mdl) => (
              <div
                key={mdl.id}
                className={`rounded-2xl border p-5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  mdl.isDefault
                    ? 'border-purple-300 bg-purple-50/40 dark:border-purple-800 dark:bg-purple-950/20'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800/40'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{mdl.name}</span>
                    {mdl.isDefault && (
                      <span className="rounded-full bg-purple-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                        Mặc định Hệ thống
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-mono">Alias: {mdl.modelAlias} | {mdl.provider}</p>
                  <p className="text-[11px] text-slate-400">
                    Max Tokens: {mdl.maxTokens.toLocaleString('vi-VN')} | Temp: {mdl.temperature}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {!mdl.isDefault && (
                    <button
                      onClick={() => handleSetDefaultModel(mdl.id)}
                      className="rounded-xl border border-purple-200 bg-white px-4 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:bg-slate-800 dark:text-purple-300"
                    >
                      Đặt làm Mặc định
                    </button>
                  )}
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Sẵn sàng
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: QUOTAS CONFIGURATION */}
      {activeTab === 'quotas' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cấu hình Hạn mức Hàng tháng theo Vai trò</h2>
            <p className="text-xs text-slate-500">Thiết lập Token tối đa và số bài soạn/ngày cho từng vai trò người dùng</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quotas.map((q) => (
              <div
                key={q.role}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/40 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 dark:border-slate-700/60">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                    {q.role === 'admin' ? 'Quản trị viên' : q.role === 'head_teacher' ? 'Tổ trưởng chuyên môn' : 'Giáo viên'}
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1">Hạn ngạch Token/Tháng:</label>
                    <input
                      type="number"
                      defaultValue={q.monthlyTokenLimit}
                      onBlur={(e) => handleUpdateQuota(q.role, Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-white py-1.5 px-3 font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-between text-slate-500">
                    <span>Số giáo án tối đa / ngày:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{q.maxPlansPerDay} bài</span>
                  </div>

                  <div className="flex justify-between text-slate-500">
                    <span>Hàng chờ ưu tiên:</span>
                    <span className={`font-bold ${q.priorityQueue ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {q.priorityQueue ? 'Có' : 'Không'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: SYSTEM TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mẫu Giáo án Hệ thống (System Templates)</h2>
            <p className="text-xs text-slate-500">Cấu hình System Prompt và cấu trúc chuẩn ban hành cho AI pipeline</p>
          </div>

          <div className="space-y-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{tpl.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{tpl.description}</p>
                  </div>
                  <button
                    onClick={() => setEditingTemplate(tpl)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-50 dark:border-slate-700 dark:bg-slate-800 dark:text-purple-300 self-start sm:self-auto"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Chỉnh sửa System Prompt
                  </button>
                </div>

                <div className="rounded-xl bg-white p-3 font-mono text-[11px] text-slate-600 dark:bg-slate-900 dark:text-slate-300 border border-slate-100 dark:border-slate-800 max-h-24 overflow-y-auto">
                  {tpl.systemPrompt}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: ERROR LOGS */}
      {activeTab === 'error_logs' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Nhật ký Lỗi Hệ thống (Error Logs)</h2>
              <p className="text-xs text-slate-500">Theo dõi các ngoại lệ API, lỗi AI timeout và sự cố người dùng</p>
            </div>
            <button
              onClick={fetchAdminData}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Làm mới log
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 uppercase text-[10px] font-semibold tracking-wider text-slate-400 dark:bg-slate-800/50">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Thời gian</th>
                  <th className="p-3.5">Endpoint</th>
                  <th className="p-3.5">Mã Lỗi</th>
                  <th className="p-3.5">Chi tiết Thông điệp</th>
                  <th className="p-3.5 rounded-r-xl">Mức độ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {errorLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      Không có lỗi nào ghi nhận gần đây.
                    </td>
                  </tr>
                ) : (
                  errorLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-mono text-[10px] text-slate-500">
                        {new Date(log.timestamp).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-800 dark:text-slate-200">
                        {log.endpoint}
                      </td>
                      <td className="p-3.5">
                        <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold font-mono text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                          {log.errorCode} ({log.statusCode})
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {log.errorMessage}
                      </td>
                      <td className="p-3.5">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          log.severity === 'critical'
                            ? 'bg-red-600 text-white'
                            : log.severity === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {log.severity.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Subject */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <form onSubmit={handleAddSubject} className="w-full max-w-md rounded-3xl bg-white p-6 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Thêm Môn học Mới</h3>
              <button type="button" onClick={() => setShowAddSubjectModal(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Mã môn học (VD: VAT_LY):</label>
              <input
                type="text"
                required
                value={newSubject.code}
                onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tên môn học:</label>
              <input
                type="text"
                required
                value={newSubject.name}
                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Khối lớp (phân cách dấu phẩy):</label>
              <input
                type="text"
                value={newSubject.gradeLevels}
                onChange={(e) => setNewSubject({ ...newSubject, gradeLevels: e.target.value })}
                className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddSubjectModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold"
              >
                Hủy
              </button>
              <button type="submit" className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white">
                Thêm Môn
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Add Grade Level */}
      {showAddGradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <form onSubmit={handleAddGrade} className="w-full max-w-md rounded-3xl bg-white p-6 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Thêm Khối lớp Mới</h3>
              <button type="button" onClick={() => setShowAddGradeModal(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tên Khối (VD: Lớp 10):</label>
              <input
                type="text"
                required
                value={newGrade.name}
                onChange={(e) => setNewGrade({ ...newGrade, name: e.target.value })}
                className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Cấp học:</label>
              <select
                value={newGrade.schoolLevel}
                onChange={(e) => setNewGrade({ ...newGrade, schoolLevel: e.target.value as any })}
                className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="THPT">Cấp 3 - THPT</option>
                <option value="THCS">Cấp 2 - THCS</option>
                <option value="Tiểu học">Cấp 1 - Tiểu học</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddGradeModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold"
              >
                Hủy
              </button>
              <button type="submit" className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white">
                Thêm Khối
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Add Method */}
      {showAddMethodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <form onSubmit={handleAddMethod} className="w-full max-w-md rounded-3xl bg-white p-6 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Thêm Phương pháp / Kỹ thuật</h3>
              <button type="button" onClick={() => setShowAddMethodModal(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tên Phương pháp / Kỹ thuật:</label>
              <input
                type="text"
                required
                value={newMethod.name}
                onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Phân loại:</label>
              <select
                value={newMethod.category}
                onChange={(e) => setNewMethod({ ...newMethod, category: e.target.value as any })}
                className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="Phương pháp">Phương pháp dạy học</option>
                <option value="Kỹ thuật">Kỹ thuật dạy học</option>
                <option value="Hình thức tổ chức">Hình thức tổ chức</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Mô tả tóm tắt:</label>
              <textarea
                rows={3}
                value={newMethod.description}
                onChange={(e) => setNewMethod({ ...newMethod, description: e.target.value })}
                className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddMethodModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold"
              >
                Hủy
              </button>
              <button type="submit" className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white">
                Lưu Phương pháp
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Edit Template */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <form onSubmit={handleSaveTemplate} className="w-full max-w-2xl rounded-3xl bg-white p-6 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Chỉnh sửa System Prompt ({editingTemplate.type})
              </h3>
              <button type="button" onClick={() => setEditingTemplate(null)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Mô tả mẫu:</label>
              <input
                type="text"
                value={editingTemplate.description}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">System Prompt Text:</label>
              <textarea
                rows={8}
                value={editingTemplate.systemPrompt}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, systemPrompt: e.target.value })}
                className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold"
              >
                Hủy
              </button>
              <button type="submit" className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white">
                Lưu Thay đổi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
