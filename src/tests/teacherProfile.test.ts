import { describe, it, expect, beforeEach } from 'vitest';

describe('Teacher Profile Data Structure & Local Persistence', () => {
  const PROFILE_KEY = 'teacher_profile_data';
  let mockStorage: Record<string, string> = {};

  const localStorageMock = {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => {
      mockStorage[key] = value;
    },
    clear: () => {
      mockStorage = {};
    },
    removeItem: (key: string) => {
      delete mockStorage[key];
    },
  };

  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should format profile object correctly without mock defaults', () => {
    const profile = {
      id: 'usr_current',
      full_name: 'Nguyễn Thị Minh',
      school_name: 'THPT Nguyễn Trãi',
      department: 'Tổ Toán - Tin',
      subject: 'Toán học',
      school_level: 'THPT',
      default_school_year: '2025-2026',
      role: 'teacher',
      updated_at: new Date().toISOString(),
    };

    localStorageMock.setItem(PROFILE_KEY, JSON.stringify(profile));

    const retrieved = JSON.parse(localStorageMock.getItem(PROFILE_KEY) || '{}');
    expect(retrieved.full_name).toBe('Nguyễn Thị Minh');
    expect(retrieved.school_name).toBe('THPT Nguyễn Trãi');
    expect(retrieved.department).toBe('Tổ Toán - Tin');
    expect(retrieved.subject).toBe('Toán học');
    expect(retrieved.school_level).toBe('THPT');
    expect(retrieved.default_school_year).toBe('2025-2026');
    expect(retrieved.role).toBe('teacher');
  });

  it('should allow clearing profile fields when user leaves them empty', () => {
    const emptyProfile = {
      id: 'usr_current',
      full_name: '',
      school_name: '',
      department: '',
      subject: '',
      school_level: '',
      default_school_year: '',
      role: 'teacher',
      updated_at: new Date().toISOString(),
    };

    localStorageMock.setItem(PROFILE_KEY, JSON.stringify(emptyProfile));

    const retrieved = JSON.parse(localStorageMock.getItem(PROFILE_KEY) || '{}');
    expect(retrieved.full_name).toBe('');
    expect(retrieved.school_name).toBe('');
    expect(retrieved.department).toBe('');
  });
});
