import { Request, Response } from 'express';
import { lessonPlanService } from '../services/lessonPlanService';
import { DbLessonPlan } from '../types/database';

export interface AuthAndOwnershipResult {
  userId: string;
  lessonPlan: DbLessonPlan;
  errorResponse?: {
    statusCode: number;
    payload: {
      success: boolean;
      error: {
        code: string;
        message: string;
      };
    };
  };
}

/**
 * Verify user authentication and lesson plan ownership.
 */
export async function verifyAuthAndOwnership(
  req: Request,
  lessonPlanId: string
): Promise<AuthAndOwnershipResult> {
  // Extract user ID from header, query or body
  const headerUserId = req.headers['x-user-id'] as string;
  const bodyUserId = req.body?.userId as string;
  const queryUserId = req.query?.userId as string;

  const activeUserId = headerUserId || bodyUserId || queryUserId || 'usr_001';

  if (!activeUserId) {
    return {
      userId: '',
      lessonPlan: null as any,
      errorResponse: {
        statusCode: 401,
        payload: {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Yêu cầu không hợp lệ. Vui lòng đăng nhập hệ thống.',
          },
        },
      },
    };
  }

  // Fetch lesson plan by ID
  const { data: lessonPlan, error } = await lessonPlanService.getLessonPlanById(lessonPlanId);

  if (error || !lessonPlan) {
    return {
      userId: activeUserId,
      lessonPlan: null as any,
      errorResponse: {
        statusCode: 404,
        payload: {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Không tìm thấy Kế hoạch bài dạy với mã ID: ${lessonPlanId}`,
          },
        },
      },
    };
  }

  // Verify ownership
  // Allow if owner or if using default mock user ID
  if (lessonPlan.user_id && lessonPlan.user_id !== activeUserId && activeUserId !== 'usr_001') {
    return {
      userId: activeUserId,
      lessonPlan,
      errorResponse: {
        statusCode: 403,
        payload: {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Bạn không có quyền thao tác trên Kế hoạch bài dạy này.',
          },
        },
      },
    };
  }

  return {
    userId: activeUserId,
    lessonPlan,
  };
}

export interface AdminAuthResult {
  isAdmin: boolean;
  userId: string;
  userRole: string;
  errorResponse?: {
    statusCode: number;
    payload: {
      success: boolean;
      error: {
        code: string;
        message: string;
      };
    };
  };
}

/**
 * Verify if request is from an authorized Administrator.
 * Checks x-user-role header or user parameters server-side.
 */
export function verifyAdminRole(req: Request): AdminAuthResult {
  const role =
    (req.headers['x-user-role'] as string) ||
    (req.body?.userRole as string) ||
    (req.query?.userRole as string);

  const userId =
    (req.headers['x-user-id'] as string) ||
    (req.body?.userId as string) ||
    (req.query?.userId as string) ||
    'usr_001';

  // Allow if role is explicitly admin or user is the system admin
  if (role !== 'admin' && userId !== 'usr_004' && role !== 'administrator') {
    return {
      isAdmin: false,
      userId,
      userRole: role || 'teacher',
      errorResponse: {
        statusCode: 403,
        payload: {
          success: false,
          error: {
            code: 'FORBIDDEN_ADMIN_ONLY',
            message: 'Truy cập bị từ chối. Thao tác này yêu cầu quyền Quản trị viên (Admin) phía máy chủ.',
          },
        },
      },
    };
  }

  return {
    isAdmin: true,
    userId,
    userRole: 'admin',
  };
}

