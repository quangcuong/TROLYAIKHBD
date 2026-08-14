import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile } from '../types';
import { CURRENT_MOCK_USER, MOCK_USERS_LIST } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  schoolName: string;
  department?: string;
  subject?: string;
  schoolLevel?: string;
  defaultSchoolYear?: string;
  role?: 'teacher' | 'head_teacher' | 'admin';
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  isSupabaseActive: boolean;

  signUp: (data: SignUpData) => Promise<{ success: boolean; needsEmailVerification?: boolean; message?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (newPassword: string) => Promise<{ success: boolean; message?: string }>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; message?: string }>;
  updateUserProfile: (updatedFields: Partial<UserProfile & User>) => Promise<{ success: boolean; message?: string }>;

  // Quick / Mock helpers for demo
  login: (email: string, role?: 'teacher' | 'head_teacher' | 'admin') => void;
  logout: () => void;
  switchUserRole: (role: 'teacher' | 'head_teacher' | 'admin') => void;
  clearMessages: () => void;
}

const PROFILE_STORAGE_KEY = 'teacher_profile_data';

const getStoredLocalProfile = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading teacher_profile_data:', e);
  }
  return null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  // Map Supabase User + Profile to App User object
  const mapSupabaseUserToAppUser = (spUser: any, spProfile?: UserProfile | null): User => {
    const meta = spUser?.user_metadata || {};
    const localProf = getStoredLocalProfile();

    const name = spProfile?.full_name ?? localProf?.full_name ?? meta.full_name ?? '';
    const school = spProfile?.school_name ?? localProf?.school_name ?? meta.school_name ?? '';
    const subject = spProfile?.subject ?? localProf?.subject ?? meta.subject ?? '';
    const department = spProfile?.department ?? localProf?.department ?? meta.department ?? '';
    const schoolLevel = spProfile?.school_level ?? localProf?.school_level ?? meta.school_level ?? '';
    const defaultSchoolYear = spProfile?.default_school_year ?? localProf?.default_school_year ?? meta.default_school_year ?? '';
    const role = (spProfile?.role || localProf?.role || meta.role || 'teacher') as 'teacher' | 'head_teacher' | 'admin';

    return {
      id: spUser?.id || 'usr_current',
      name,
      email: spUser?.email || 'lyquangcuong01@gmail.com',
      avatar: name
        ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
        : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher',
      role,
      school,
      subject,
      department,
      schoolLevel,
      defaultSchoolYear,
      emailConfirmed: Boolean(spUser?.email_confirmed_at),
      aiQuotaUsed: 12500,
      aiQuotaLimit: 500000,
    };
  };

  // Fetch or sync user profile from Supabase profiles table
  const fetchUserProfile = async (userId: string, spUser: any) => {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error: selectError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        setProfile(data as UserProfile);
        try {
          localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data));
        } catch (e) {}
        return data as UserProfile;
      }
      return null;
    } catch (err) {
      console.error('Error fetching profile from Supabase:', err);
      return null;
    }
  };

  // Initialize Supabase Auth Session and local profile
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      const localProf = getStoredLocalProfile();
      if (localProf) {
        setProfile(localProf);
      }

      if (!isSupabaseConfigured) {
        if (mounted) {
          const defaultUser: User = {
            id: 'usr_current',
            email: 'lyquangcuong01@gmail.com',
            name: localProf?.full_name || '',
            school: localProf?.school_name || '',
            department: localProf?.department || '',
            subject: localProf?.subject || '',
            schoolLevel: localProf?.school_level || '',
            defaultSchoolYear: localProf?.default_school_year || '',
            role: (localProf?.role as any) || 'teacher',
            avatar: localProf?.full_name
              ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(localProf.full_name)}`
              : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher',
            emailConfirmed: true,
            aiQuotaUsed: 12500,
            aiQuotaLimit: 500000,
          };
          setUser(defaultUser);
          setIsLoading(false);
        }
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          const spProfile = await fetchUserProfile(session.user.id, session.user);
          const activeProf = spProfile || localProf;
          if (activeProf) {
            setProfile(activeProf);
          }
          setUser(mapSupabaseUserToAppUser(session.user, activeProf));
        } else if (mounted) {
          const defaultUser: User = {
            id: 'usr_current',
            email: 'lyquangcuong01@gmail.com',
            name: localProf?.full_name || '',
            school: localProf?.school_name || '',
            department: localProf?.department || '',
            subject: localProf?.subject || '',
            schoolLevel: localProf?.school_level || '',
            defaultSchoolYear: localProf?.default_school_year || '',
            role: (localProf?.role as any) || 'teacher',
            avatar: localProf?.full_name
              ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(localProf.full_name)}`
              : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher',
            emailConfirmed: true,
            aiQuotaUsed: 12500,
            aiQuotaLimit: 500000,
          };
          setUser(defaultUser);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initSession();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setSuccessMessage('Vui lòng nhập mật khẩu mới của bạn bên dưới.');
        }

        if (session?.user) {
          const spProfile = await fetchUserProfile(session.user.id, session.user);
          if (mounted) {
            setUser(mapSupabaseUserToAppUser(session.user, spProfile));
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setUser(null);
            setProfile(null);
          }
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } else {
      setIsLoading(false);
    }
  }, []);

  // Sign up with Email & Password
  const signUp = async (data: SignUpData) => {
    clearMessages();
    setIsLoading(true);

    if (!isSupabaseConfigured) {
      // Mock Sign Up fallback
      setTimeout(() => {
        const newUser: User = {
          id: `usr_${Date.now()}`,
          name: data.fullName || 'Giáo viên mới',
          email: data.email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.fullName)}`,
          role: data.role || 'teacher',
          school: data.schoolName || 'THPT Nguyễn Du',
          subject: data.subject || 'Vật lý',
          department: data.department || 'Tổ Tự Nhiên',
          schoolLevel: data.schoolLevel || 'THPT',
          defaultSchoolYear: data.defaultSchoolYear || '2025-2026',
          emailConfirmed: true,
          aiQuotaUsed: 0,
          aiQuotaLimit: 500000,
        };
        setUser(newUser);
        setIsLoading(false);
        setSuccessMessage('Đăng ký tài khoản thành công!');
      }, 600);

      return { success: true };
    }

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            school_name: data.schoolName,
            department: data.department || 'Tổ Tự Nhiên',
            subject: data.subject || 'Vật lý',
            school_level: data.schoolLevel || 'THPT',
            default_school_year: data.defaultSchoolYear || '2025-2026',
            role: data.role || 'teacher',
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
        return { success: false, message: signUpError.message };
      }

      if (authData.user) {
        // Create initial profile in public.profiles table directly as well
        const newProfile: UserProfile = {
          id: authData.user.id,
          full_name: data.fullName,
          school_name: data.schoolName,
          department: data.department || 'Tổ Tự Nhiên',
          subject: data.subject || 'Vật lý',
          school_level: data.schoolLevel || 'THPT',
          default_school_year: data.defaultSchoolYear || '2025-2026',
          role: data.role || 'teacher',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await supabase.from('profiles').upsert(newProfile);
        setProfile(newProfile);

        const needsVerification = !authData.session;
        if (needsVerification) {
          const msg = 'Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản trước khi đăng nhập.';
          setSuccessMessage(msg);
          setIsLoading(false);
          return { success: true, needsEmailVerification: true, message: msg };
        } else {
          setUser(mapSupabaseUserToAppUser(authData.user, newProfile));
          setSuccessMessage('Đăng ký tài khoản thành công!');
          setIsLoading(false);
          return { success: true };
        }
      }

      setIsLoading(false);
      return { success: false, message: 'Không thể tạo tài khoản người dùng.' };
    } catch (err: any) {
      const msg = err.message || 'Đã có lỗi xảy ra trong quá trình đăng ký.';
      setError(msg);
      setIsLoading(false);
      return { success: false, message: msg };
    }
  };

  // Sign in with Email & Password
  const signIn = async (emailStr: string, passwordStr: string) => {
    clearMessages();
    setIsLoading(true);

    if (!isSupabaseConfigured) {
      // Mock Sign In fallback
      const found = MOCK_USERS_LIST.find((u) => u.email === emailStr);
      if (found) {
        setUser(found);
      } else {
        setUser({
          id: `usr_${Date.now()}`,
          name: emailStr.split('@')[0] || 'Giáo viên',
          email: emailStr,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(emailStr)}`,
          role: 'teacher',
          school: 'THPT Nguyễn Du',
          subject: 'Toán học',
          department: 'Tổ Tự Nhiên',
          schoolLevel: 'THPT',
          defaultSchoolYear: '2025-2026',
          emailConfirmed: true,
          aiQuotaUsed: 5000,
          aiQuotaLimit: 500000,
        });
      }
      setIsLoading(false);
      setSuccessMessage('Đăng nhập thành công!');
      return { success: true };
    }

    try {
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: emailStr,
        password: passwordStr,
      });

      if (signInErr) {
        setError(signInErr.message);
        setIsLoading(false);
        return { success: false, message: signInErr.message };
      }

      if (data.user) {
        const spProfile = await fetchUserProfile(data.user.id, data.user);
        setUser(mapSupabaseUserToAppUser(data.user, spProfile));
        setSuccessMessage('Đăng nhập thành công!');
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, message: 'Đăng nhập không thành công.' };
    } catch (err: any) {
      const msg = err.message || 'Lỗi hệ thống khi đăng nhập.';
      setError(msg);
      setIsLoading(false);
      return { success: false, message: msg };
    }
  };

  // Sign Out
  const signOut = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    setUser(null);
    setProfile(null);
    clearMessages();
    setIsLoading(false);
  };

  // Forgot Password
  const forgotPassword = async (emailStr: string) => {
    clearMessages();
    setIsLoading(true);

    if (!isSupabaseConfigured) {
      setIsLoading(false);
      const msg = `[Chế độ thử nghiệm] Đã gửi yêu cầu đặt lại mật khẩu đến email ${emailStr}.`;
      setSuccessMessage(msg);
      return { success: true, message: msg };
    }

    try {
      const redirectUrl = `${window.location.origin}`;
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(emailStr, {
        redirectTo: redirectUrl,
      });

      if (resetErr) {
        setError(resetErr.message);
        setIsLoading(false);
        return { success: false, message: resetErr.message };
      }

      const msg = `Đã gửi liên kết khôi phục mật khẩu tới ${emailStr}. Vui lòng kiểm tra hòm thư!`;
      setSuccessMessage(msg);
      setIsLoading(false);
      return { success: true, message: msg };
    } catch (err: any) {
      const msg = err.message || 'Lỗi khi gửi email khôi phục.';
      setError(msg);
      setIsLoading(false);
      return { success: false, message: msg };
    }
  };

  // Reset Password (when token is present / logged in)
  const resetPassword = async (newPassword: string) => {
    clearMessages();
    setIsLoading(true);

    if (!isSupabaseConfigured) {
      setIsLoading(false);
      const msg = 'Đã cập nhật mật khẩu mới thành công!';
      setSuccessMessage(msg);
      return { success: true, message: msg };
    }

    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateErr) {
        setError(updateErr.message);
        setIsLoading(false);
        return { success: false, message: updateErr.message };
      }

      const msg = 'Cập nhật mật khẩu mới thành công!';
      setSuccessMessage(msg);
      setIsLoading(false);
      return { success: true, message: msg };
    } catch (err: any) {
      const msg = err.message || 'Lỗi khi đổi mật khẩu.';
      setError(msg);
      setIsLoading(false);
      return { success: false, message: msg };
    }
  };

  // Resend Email Verification
  const resendVerificationEmail = async (emailStr: string) => {
    clearMessages();
    setIsLoading(true);

    if (!isSupabaseConfigured) {
      setIsLoading(false);
      const msg = `Đã gửi lại email xác minh tới ${emailStr}.`;
      setSuccessMessage(msg);
      return { success: true, message: msg };
    }

    try {
      const { error: resendErr } = await supabase.auth.resend({
        type: 'signup',
        email: emailStr,
      });

      if (resendErr) {
        setError(resendErr.message);
        setIsLoading(false);
        return { success: false, message: resendErr.message };
      }

      const msg = `Đã gửi lại email xác minh tới ${emailStr}. Vui lòng kiểm tra hòm thư.`;
      setSuccessMessage(msg);
      setIsLoading(false);
      return { success: true, message: msg };
    } catch (err: any) {
      const msg = err.message || 'Không thể gửi lại email xác minh.';
      setError(msg);
      setIsLoading(false);
      return { success: false, message: msg };
    }
  };

  // Update user profile
  const updateUserProfile = async (updatedFields: Partial<UserProfile & User>) => {
    clearMessages();
    setIsLoading(true);

    const currentEmail = user?.email || 'lyquangcuong01@gmail.com';
    const currentId = user?.id || profile?.id || 'usr_current';

    const newProfilePayload: UserProfile = {
      id: currentId,
      full_name: (updatedFields.full_name ?? updatedFields.name ?? profile?.full_name ?? user?.name ?? '').trim(),
      school_name: (updatedFields.school_name ?? updatedFields.school ?? profile?.school_name ?? user?.school ?? '').trim(),
      department: (updatedFields.department ?? profile?.department ?? user?.department ?? '').trim(),
      subject: (updatedFields.subject ?? profile?.subject ?? user?.subject ?? '').trim(),
      school_level: (updatedFields.school_level ?? updatedFields.schoolLevel ?? profile?.school_level ?? user?.schoolLevel ?? '').trim(),
      default_school_year: (updatedFields.default_school_year ?? updatedFields.defaultSchoolYear ?? profile?.default_school_year ?? user?.defaultSchoolYear ?? '').trim(),
      role: (updatedFields.role ?? profile?.role ?? user?.role ?? 'teacher') as any,
      updated_at: new Date().toISOString(),
    };

    // 1. Save to localStorage immediately
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfilePayload));
    } catch (e) {
      console.error('Failed to save profile to localStorage:', e);
    }

    // 2. Save to Supabase `profiles` table if configured
    if (isSupabaseConfigured && currentId) {
      try {
        const { data: dbData, error: dbErr } = await supabase
          .from('profiles')
          .upsert(newProfilePayload)
          .select('*')
          .maybeSingle();

        if (dbErr) {
          console.warn('Supabase upsert returned error, fallback to local storage:', dbErr.message);
        } else if (dbData) {
          newProfilePayload.updated_at = dbData.updated_at;
        }
      } catch (err: any) {
        console.warn('Supabase profile upsert exception:', err?.message);
      }
    }

    // 3. Update React context state
    setProfile(newProfilePayload);
    setUser({
      id: currentId,
      email: currentEmail,
      name: newProfilePayload.full_name,
      school: newProfilePayload.school_name,
      department: newProfilePayload.department,
      subject: newProfilePayload.subject,
      schoolLevel: newProfilePayload.school_level,
      defaultSchoolYear: newProfilePayload.default_school_year,
      role: newProfilePayload.role as 'teacher' | 'head_teacher' | 'admin',
      avatar: newProfilePayload.full_name
        ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newProfilePayload.full_name)}`
        : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher',
      emailConfirmed: true,
      aiQuotaUsed: user?.aiQuotaUsed ?? 12500,
      aiQuotaLimit: user?.aiQuotaLimit ?? 500000,
    });

    setIsLoading(false);
    setSuccessMessage('Đã cập nhật hồ sơ');
    return { success: true };
  };

  // Mock quick login & role switch
  const login = (emailStr: string, role: 'teacher' | 'head_teacher' | 'admin' = 'teacher') => {
    signIn(emailStr, '12345678');
  };

  const logout = () => {
    signOut();
  };

  const switchUserRole = (role: 'teacher' | 'head_teacher' | 'admin') => {
    if (user) {
      updateUserProfile({ role });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        error,
        successMessage,
        isSupabaseActive: isSupabaseConfigured,
        signUp,
        signIn,
        signOut,
        forgotPassword,
        resetPassword,
        resendVerificationEmail,
        updateUserProfile,
        login,
        logout,
        switchUserRole,
        clearMessages,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
