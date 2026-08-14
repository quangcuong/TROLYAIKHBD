import { describe, it, expect } from 'vitest';
import { adminService } from '../services/adminService';
import { verifyAdminRole } from '../utils/apiAuth';
import { Request } from 'express';

describe('Milestone 9: Dashboard & Admin Panel Unit Tests', () => {
  describe('Server-side Role Authorization Verification', () => {
    it('should allow access when role is admin', () => {
      const mockReq = {
        headers: { 'x-user-role': 'admin', 'x-user-id': 'usr_004' },
        body: {},
        query: {},
      } as unknown as Request;

      const auth = verifyAdminRole(mockReq);
      expect(auth.isAdmin).toBe(true);
      expect(auth.errorResponse).toBeUndefined();
    });

    it('should block access with 403 Forbidden when role is teacher', () => {
      const mockReq = {
        headers: { 'x-user-role': 'teacher', 'x-user-id': 'usr_002' },
        body: {},
        query: {},
      } as unknown as Request;

      const auth = verifyAdminRole(mockReq);
      expect(auth.isAdmin).toBe(false);
      expect(auth.errorResponse).toBeDefined();
      expect(auth.errorResponse?.statusCode).toBe(403);
      expect(auth.errorResponse?.payload.error.code).toBe('FORBIDDEN_ADMIN_ONLY');
    });

    it('should block access when no role header or user parameters are provided', () => {
      const mockReq = {
        headers: {},
        body: {},
        query: {},
      } as unknown as Request;

      const auth = verifyAdminRole(mockReq);
      expect(auth.isAdmin).toBe(false);
      expect(auth.errorResponse?.statusCode).toBe(403);
    });
  });

  describe('Admin Service Core Management Operations', () => {
    it('should retrieve system overview stats', () => {
      const stats = adminService.getOverviewStats();
      expect(stats.users.total).toBeGreaterThan(0);
      expect(stats.lessonPlans.total).toBeGreaterThan(0);
      expect(stats.aiUsage.tokensUsed).toBeGreaterThan(0);
      expect(stats.errors).toBeDefined();
    });

    it('should add, retrieve, and delete subjects', () => {
      const initialCount = adminService.getSubjects().length;
      const created = adminService.addSubject({
        code: 'AM_NHAC',
        name: 'Âm nhạc',
        gradeLevels: ['Lớp 6', 'Lớp 7'],
        status: 'active',
      });

      expect(created.id).toBeDefined();
      expect(adminService.getSubjects().length).toBe(initialCount + 1);

      adminService.deleteSubject(created.id);
      expect(adminService.getSubjects().length).toBe(initialCount);
    });

    it('should add and manage teaching methods and techniques', () => {
      const created = adminService.addTeachingMethod({
        name: 'Kỹ thuật 3 Lần 3',
        category: 'Kỹ thuật',
        description: 'Tập hợp ý kiến nhanh từ các nhóm nhỏ',
        suitableSubjects: ['Tất cả môn'],
        status: 'active',
      });

      expect(created.name).toBe('Kỹ thuật 3 Lần 3');

      const updated = adminService.updateTeachingMethod(created.id, { description: 'Updated description' });
      expect(updated?.description).toBe('Updated description');

      adminService.deleteTeachingMethod(created.id);
    });

    it('should set default AI model correctly', () => {
      const models = adminService.getAiModels();
      const targetModelId = models[1].id;

      adminService.updateAiModel(targetModelId, { isDefault: true });
      const updatedModels = adminService.getAiModels();

      const newDefault = updatedModels.find((m) => m.id === targetModelId);
      expect(newDefault?.isDefault).toBe(true);

      const otherModels = updatedModels.filter((m) => m.id !== targetModelId);
      otherModels.forEach((m) => expect(m.isDefault).toBe(false));
    });

    it('should update role quotas', () => {
      adminService.updateQuota('teacher', { monthlyTokenLimit: 250000 });
      const quotas = adminService.getQuotas();
      const teacherQuota = quotas.find((q) => q.role === 'teacher');
      expect(teacherQuota?.monthlyTokenLimit).toBe(250000);
    });
  });
});
