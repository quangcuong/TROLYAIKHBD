import express, { Request, Response } from 'express';
import path from 'path';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { lessonPlanService } from './src/services/lessonPlanService';
import { LessonPlanStatus } from './src/types/database';
import { validateFile, normalizeFileName, checkFileOwnership, MAX_FILE_SIZE_BYTES } from './src/utils/fileValidation';
import { extractTextFromBuffer } from './src/services/fileExtractor';
import { supabase, isSupabaseConfigured } from './src/lib/supabase';
import { verifyAuthAndOwnership, verifyAdminRole } from './src/utils/apiAuth';
import { aiPipelineService } from './src/services/aiPipelineService';
import { exportService } from './src/services/exportService';
import { adminService } from './src/services/adminService';
import {
  analyzeTemplateInputSchema,
  extractContentInputSchema,
  generatePlanInputSchema,
  validatePlanInputSchema,
  rewriteSectionInputSchema,
} from './src/schemas/aiPlanSchemas';
import { aiApiRateLimiter, generalApiRateLimiter } from './src/utils/rateLimiter';
import { logger } from './src/utils/logger';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body parser middleware
  app.use(express.json({ limit: '10mb' }));

  // Apply Rate Limiters
  app.use('/api/ai', aiApiRateLimiter);
  app.use('/api', generalApiRateLimiter);

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'Lesson Plan AI Assistant API', timestamp: new Date().toISOString() });
  });

  // ==========================================
  // LESSON PLANS API ROUTES
  // ==========================================

  /**
   * GET /api/lesson-plans
   * List lesson plans with filters (status, subject, grade, search, limit, offset, userId)
   */
  app.get('/api/lesson-plans', async (req: Request, res: Response) => {
    try {
      const { userId, status, subject, grade, search, limit, offset } = req.query;

      const result = await lessonPlanService.getLessonPlans({
        userId: userId as string | undefined,
        status: status as LessonPlanStatus | undefined,
        subject: subject as string | undefined,
        grade: grade as string | undefined,
        search: search as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
      });

      if (result.error) {
        return res.status(400).json({ success: false, error: result.error });
      }

      return res.json({
        success: true,
        data: result.data,
        count: result.count,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Lỗi hệ thống' });
    }
  });

  /**
   * GET /api/lesson-plans/:id
   * Get single lesson plan detail by ID
   */
  app.get('/api/lesson-plans/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await lessonPlanService.getLessonPlanById(id);

      if (result.error || !result.data) {
        return res.status(404).json({ success: false, error: result.error || 'Không tìm thấy giáo án' });
      }

      return res.json({ success: true, data: result.data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Lỗi hệ thống' });
    }
  });

  /**
   * POST /api/lesson-plans
   * Create a new lesson plan with Zod validation
   */
  app.post('/api/lesson-plans', async (req: Request, res: Response) => {
    try {
      const { userId, ...lessonData } = req.body;

      const result = await lessonPlanService.createLessonPlan(lessonData, userId);

      if (result.error || !result.data) {
        return res.status(400).json({ success: false, error: result.error });
      }

      return res.status(201).json({ success: true, data: result.data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Lỗi hệ thống' });
    }
  });

  /**
   * PUT /api/lesson-plans/:id
   * Update an existing lesson plan with Zod validation
   */
  app.put('/api/lesson-plans/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await lessonPlanService.updateLessonPlan(id, req.body);

      if (result.error || !result.data) {
        return res.status(400).json({ success: false, error: result.error });
      }

      return res.json({ success: true, data: result.data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Lỗi hệ thống' });
    }
  });

  /**
   * PATCH /api/lesson-plans/:id/status
   * Update lesson plan status (draft, uploading, analyzing, generating, validating, completed, failed, archived)
   */
  app.patch('/api/lesson-plans/:id/status', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, error: 'Thiếu trường status' });
      }

      const result = await lessonPlanService.updateLessonPlanStatus(id, status as LessonPlanStatus);

      if (result.error || !result.data) {
        return res.status(400).json({ success: false, error: result.error });
      }

      return res.json({ success: true, data: result.data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Lỗi hệ thống' });
    }
  });

  /**
   * DELETE /api/lesson-plans/:id
   * Delete a lesson plan
   */
  app.delete('/api/lesson-plans/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await lessonPlanService.deleteLessonPlan(id);

      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      return res.json({ success: true, message: 'Đã xóa giáo án thành công' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Lỗi hệ thống' });
    }
  });

  // ==========================================
  // MILESTONE 4: FILE UPLOAD & EXTRACTION ROUTES
  // ==========================================

  /**
   * POST /api/files/upload
   * Single file upload with validation, text extraction & Supabase Storage upload
   */
  app.post('/api/files/upload', upload.single('file'), async (req: Request, res: Response) => {
    try {
      const file = req.file;
      const { lessonPlanId, category, userId } = req.body;

      if (!file) {
        return res.status(400).json({ success: false, error: 'Không tìm thấy file tải lên' });
      }

      // 1. Validate file extension, MIME type, docm check, size
      const validation = validateFile({
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
      });

      if (!validation.valid) {
        return res.status(400).json({ success: false, error: validation.error });
      }

      const activeUserId = userId || 'usr_001';

      // 2. Normalize file name
      const normalizedName = normalizeFileName(file.originalname);

      // 3. Storage bucket path: userId/lessonPlanId/normalizedName
      const folderPath = `${activeUserId}/${lessonPlanId || 'uncategorized'}`;
      const filePath = `${folderPath}/${normalizedName}`;

      // 4. Extract text from buffer (Mammoth for docx, pdf-parse for pdf)
      const extraction = await extractTextFromBuffer(file.buffer, normalizedName);

      if (extraction.error) {
        console.warn('File text extraction warning:', extraction.error);
      }

      // 5. Upload to Supabase Storage bucket 'lesson-files' if configured
      let storageBucket = 'lesson-files';
      if (isSupabaseConfigured) {
        try {
          const { error: uploadErr } = await supabase.storage
            .from(storageBucket)
            .upload(filePath, file.buffer, {
              contentType: file.mimetype,
              upsert: true,
            });

          if (uploadErr) {
            console.error('Supabase Storage upload error:', uploadErr);
          }
        } catch (sErr: any) {
          console.error('Supabase Storage exception:', sErr);
        }
      }

      // 6. Save metadata and extracted text into lesson_files table
      const fileRecord = await lessonPlanService.addLessonFile(
        {
          lesson_plan_id: lessonPlanId || null,
          file_name: normalizedName,
          file_path: filePath,
          file_size: file.size,
          file_type: file.mimetype,
          storage_bucket: storageBucket,
          extracted_text: extraction.text || '',
          status: extraction.error ? 'failed' : 'completed',
          metadata: {
            original_name: file.originalname,
            category: category || 'reference_material',
            word_count: extraction.wordCount,
            char_count: extraction.characterCount,
            extraction_error: extraction.error || null,
          },
        },
        activeUserId
      );

      if (fileRecord.error || !fileRecord.data) {
        return res.status(400).json({ success: false, error: fileRecord.error });
      }

      return res.status(201).json({
        success: true,
        data: fileRecord.data,
        extractionSummary: {
          wordCount: extraction.wordCount,
          characterCount: extraction.characterCount,
          hasText: Boolean(extraction.text),
        },
      });
    } catch (err: any) {
      console.error('File upload API error:', err);
      return res.status(500).json({ success: false, error: err.message || 'Lỗi xử lý file' });
    }
  });

  /**
   * GET /api/files/:id
   * Get detail of a specific file record (including extracted_text)
   */
  app.get('/api/files/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const currentUserId = (req.query.userId as string) || 'usr_001';

      const fileResult = await lessonPlanService.getLessonFileById(id);
      if (fileResult.error || !fileResult.data) {
        return res.status(404).json({ success: false, error: 'Không tìm thấy file' });
      }

      // Ownership check
      const isOwner = checkFileOwnership(fileResult.data.user_id, currentUserId, false);
      if (!isOwner) {
        return res.status(403).json({ success: false, error: 'Bạn không có quyền xem file này' });
      }

      return res.json({ success: true, data: fileResult.data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /**
   * POST /api/files/:id/replace
   * Replace existing file with a new file buffer
   */
  app.post('/api/files/:id/replace', upload.single('file'), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const file = req.file;
      const currentUserId = req.body.userId || 'usr_001';

      if (!file) {
        return res.status(400).json({ success: false, error: 'Không tìm thấy file mới để thay thế' });
      }

      // Check existing file ownership
      const existing = await lessonPlanService.getLessonFileById(id);
      if (!existing.data) {
        return res.status(404).json({ success: false, error: 'File cần thay thế không tồn tại' });
      }

      const isOwner = checkFileOwnership(existing.data.user_id, currentUserId, false);
      if (!isOwner) {
        return res.status(403).json({ success: false, error: 'Bạn không có quyền thay thế file này' });
      }

      // Validate new file
      const validation = validateFile({
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
      });

      if (!validation.valid) {
        return res.status(400).json({ success: false, error: validation.error });
      }

      // Normalize name & extract text
      const normalizedName = normalizeFileName(file.originalname);
      const extraction = await extractTextFromBuffer(file.buffer, normalizedName);

      // Upload to storage
      if (isSupabaseConfigured) {
        await supabase.storage
          .from(existing.data.storage_bucket)
          .upload(existing.data.file_path, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
          });
      }

      // Update db record
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('lesson_files')
          .update({
            file_name: normalizedName,
            file_size: file.size,
            file_type: file.mimetype,
            extracted_text: extraction.text || '',
            status: extraction.error ? 'failed' : 'completed',
            metadata: {
              ...(existing.data.metadata || {}),
              original_name: file.originalname,
              word_count: extraction.wordCount,
              char_count: extraction.characterCount,
              updated_at: new Date().toISOString(),
            },
          })
          .eq('id', id)
          .select('*')
          .maybeSingle();

        if (error) return res.status(400).json({ success: false, error: error.message });
        return res.json({ success: true, data });
      }

      return res.json({
        success: true,
        data: {
          ...existing.data,
          file_name: normalizedName,
          file_size: file.size,
          extracted_text: extraction.text || '',
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /**
   * DELETE /api/files/:id
   * Delete file from storage and database
   */
  app.delete('/api/files/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const currentUserId = (req.query.userId as string) || 'usr_001';

      const fileResult = await lessonPlanService.getLessonFileById(id);
      if (!fileResult.data) {
        return res.status(404).json({ success: false, error: 'File không tồn tại' });
      }

      // Check ownership
      const isOwner = checkFileOwnership(fileResult.data.user_id, currentUserId, false);
      if (!isOwner) {
        return res.status(403).json({ success: false, error: 'Bạn không có quyền xóa file này' });
      }

      // Delete from Supabase Storage
      if (isSupabaseConfigured && fileResult.data.file_path) {
        await supabase.storage
          .from(fileResult.data.storage_bucket || 'lesson-files')
          .remove([fileResult.data.file_path]);
      }

      // Delete database record
      await lessonPlanService.deleteLessonFile(id);

      return res.json({ success: true, message: 'Đã xóa file thành công' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // LESSON FILES & GENERATION LOGS API ROUTES
  // ==========================================

  app.get('/api/lesson-plans/:id/files', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await lessonPlanService.getLessonFiles(id);
      return res.json({ success: true, data: result.data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/lesson-plans/:id/files', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { userId, ...fileData } = req.body;

      const result = await lessonPlanService.addLessonFile(
        { ...fileData, lesson_plan_id: id },
        userId
      );

      if (result.error) return res.status(400).json({ success: false, error: result.error });
      return res.status(201).json({ success: true, data: result.data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/generation-logs', async (req: Request, res: Response) => {
    try {
      const { userId, ...logData } = req.body;
      const result = await lessonPlanService.addGenerationLog(logData, userId);
      if (result.error) return res.status(400).json({ success: false, error: result.error });
      return res.status(201).json({ success: true, data: result.data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // MILESTONE 6: AI PIPELINE ENDPOINTS
  // ==========================================

  /**
   * POST /api/ai/analyze-template
   * Stage 1: Analyze template structure
   */
  app.post('/api/ai/analyze-template', async (req: Request, res: Response) => {
    try {
      // 1. Zod input validation
      const parseResult = analyzeTemplateInputSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Dữ liệu đầu vào không hợp lệ: ' + parseResult.error.issues.map((i) => i.message).join(', '),
          },
        });
      }

      const input = parseResult.data;

      // 2. Auth & Ownership Check
      const auth = await verifyAuthAndOwnership(req, input.lessonPlanId);
      if (auth.errorResponse) {
        return res.status(auth.errorResponse.statusCode).json(auth.errorResponse.payload);
      }

      // 3. Execute AI Pipeline Stage 1
      const result = await aiPipelineService.analyzeTemplate(input, auth.userId, auth.lessonPlan);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'STAGE_1_FAILED',
            message: result.error || 'Phân tích mẫu giáo án thất bại.',
          },
        });
      }

      return res.json({
        success: true,
        data: result.data,
        lessonPlan: result.lessonPlan,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Lỗi hệ thống khi phân tích cấu trúc mẫu giáo án.',
        },
      });
    }
  });

  /**
   * POST /api/ai/extract-content
   * Stage 2: Extract content from textbook and curriculum files
   */
  app.post('/api/ai/extract-content', async (req: Request, res: Response) => {
    try {
      // 1. Zod input validation
      const parseResult = extractContentInputSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Dữ liệu đầu vào không hợp lệ: ' + parseResult.error.issues.map((i) => i.message).join(', '),
          },
        });
      }

      const input = parseResult.data;

      // 2. Auth & Ownership Check
      const auth = await verifyAuthAndOwnership(req, input.lessonPlanId);
      if (auth.errorResponse) {
        return res.status(auth.errorResponse.statusCode).json(auth.errorResponse.payload);
      }

      // 3. Execute AI Pipeline Stage 2
      const result = await aiPipelineService.extractContent(input, auth.userId, auth.lessonPlan);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'STAGE_2_FAILED',
            message: result.error || 'Trích xuất nội dung từ tài liệu thất bại.',
          },
        });
      }

      return res.json({
        success: true,
        data: result.data,
        lessonPlan: result.lessonPlan,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Lỗi hệ thống khi trích xuất nội dung bài học.',
        },
      });
    }
  });

  /**
   * POST /api/ai/generate-plan
   * Stage 3: Generate full lesson plan JSON
   */
  app.post('/api/ai/generate-plan', async (req: Request, res: Response) => {
    try {
      // 1. Zod input validation
      const parseResult = generatePlanInputSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Dữ liệu đầu vào không hợp lệ: ' + parseResult.error.issues.map((i) => i.message).join(', '),
          },
        });
      }

      const input = parseResult.data;

      // 2. Auth & Ownership Check
      const auth = await verifyAuthAndOwnership(req, input.lessonPlanId);
      if (auth.errorResponse) {
        return res.status(auth.errorResponse.statusCode).json(auth.errorResponse.payload);
      }

      // 3. Execute AI Pipeline Stage 3
      const result = await aiPipelineService.generatePlan(input, auth.userId, auth.lessonPlan);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'STAGE_3_FAILED',
            message: result.error || 'Sinh giáo án bằng AI thất bại.',
          },
        });
      }

      return res.json({
        success: true,
        data: result.data,
        lessonPlan: result.lessonPlan,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Lỗi hệ thống khi khởi tạo sinh giáo án.',
        },
      });
    }
  });

  /**
   * POST /api/ai/validate-plan
   * Stage 4: Quality check, missing field validation, duration mismatch check, and auto-fix
   */
  app.post('/api/ai/validate-plan', async (req: Request, res: Response) => {
    try {
      // 1. Zod input validation
      const parseResult = validatePlanInputSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Dữ liệu đầu vào không hợp lệ: ' + parseResult.error.issues.map((i) => i.message).join(', '),
          },
        });
      }

      const input = parseResult.data;

      // 2. Auth & Ownership Check
      const auth = await verifyAuthAndOwnership(req, input.lessonPlanId);
      if (auth.errorResponse) {
        return res.status(auth.errorResponse.statusCode).json(auth.errorResponse.payload);
      }

      // 3. Execute AI Pipeline Stage 4
      const result = await aiPipelineService.validatePlan(input, auth.userId, auth.lessonPlan);

      if (!result.success) {
        return res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Giáo án chưa đạt yêu cầu kiểm định chất lượng.',
          },
          validation: result.validation,
          lessonPlan: result.lessonPlan,
        });
      }

      return res.json({
        success: true,
        validation: result.validation,
        lessonPlan: result.lessonPlan,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Lỗi hệ thống khi kiểm định và sửa lỗi giáo án.',
        },
      });
    }
  });

  /**
   * POST /api/ai/rewrite-section
   * Rewrite/Modify selected text section using AI
   */
  app.post('/api/ai/rewrite-section', async (req: Request, res: Response) => {
    try {
      // 1. Zod input validation
      const parseResult = rewriteSectionInputSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Dữ liệu đầu vào không hợp lệ: ' + parseResult.error.issues.map((i) => i.message).join(', '),
          },
        });
      }

      const input = parseResult.data;

      // 2. Auth & Ownership Check
      const auth = await verifyAuthAndOwnership(req, input.lessonPlanId);
      if (auth.errorResponse) {
        return res.status(auth.errorResponse.statusCode).json(auth.errorResponse.payload);
      }

      // 3. Execute AI section rewrite
      const result = await aiPipelineService.rewriteSection(input, auth.userId, auth.lessonPlan);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'REWRITE_FAILED',
            message: result.error || 'Viết lại đoạn văn bản thất bại.',
          },
        });
      }

      return res.json({
        success: true,
        rewrittenText: result.rewrittenText,
        action: result.action,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Lỗi hệ thống khi xử lý đoạn văn bản AI.',
        },
      });
    }
  });

  // ==========================================
  // LESSON PLAN EXPORT API ROUTES (DOCX & PDF)
  // ==========================================

  /**
   * POST /api/export/docx
   * Export lesson plan to Microsoft Word (.docx)
   */
  app.post('/api/export/docx', async (req: Request, res: Response) => {
    try {
      const { lessonPlanId } = req.body;
      if (!lessonPlanId) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_INPUT', message: 'Thiếu thông tin lessonPlanId' },
        });
      }

      // 1. Auth & Ownership Check
      const auth = await verifyAuthAndOwnership(req, lessonPlanId);
      if (auth.errorResponse) {
        return res.status(auth.errorResponse.statusCode).json(auth.errorResponse.payload);
      }

      // 2. Generate DOCX Buffer
      const { buffer, filename } = await exportService.generateDocx(auth.lessonPlan);

      // 3. Return Binary Attachment Stream (no persistent temp files stored)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
      );
      return res.send(buffer);
    } catch (err: any) {
      console.error('Error exporting DOCX:', err);
      return res.status(500).json({
        success: false,
        error: {
          code: 'EXPORT_FAILED',
          message: err.message || 'Lỗi khi xuất file DOCX.',
        },
      });
    }
  });

  /**
   * POST /api/export/pdf
   * Export lesson plan to PDF document
   */
  app.post('/api/export/pdf', async (req: Request, res: Response) => {
    try {
      const { lessonPlanId } = req.body;
      if (!lessonPlanId) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_INPUT', message: 'Thiếu thông tin lessonPlanId' },
        });
      }

      // 1. Auth & Ownership Check
      const auth = await verifyAuthAndOwnership(req, lessonPlanId);
      if (auth.errorResponse) {
        return res.status(auth.errorResponse.statusCode).json(auth.errorResponse.payload);
      }

      // 2. Generate PDF Buffer
      const { buffer, filename } = await exportService.generatePdf(auth.lessonPlan);

      // 3. Return Binary Attachment Stream (no persistent temp files stored)
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
      );
      return res.send(buffer);
    } catch (err: any) {
      console.error('Error exporting PDF:', err);
      return res.status(500).json({
        success: false,
        error: {
          code: 'EXPORT_FAILED',
          message: err.message || 'Lỗi khi xuất file PDF.',
        },
      });
    }
  });

  // ==========================================
  // USER SETTINGS API ROUTES
  // ==========================================

  app.get('/api/user-settings/:userId', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const result = await lessonPlanService.getUserSettings(userId);
      return res.json({ success: true, data: result.data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/user-settings/:userId', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const result = await lessonPlanService.updateUserSettings(userId, req.body);
      if (result.error) return res.status(400).json({ success: false, error: result.error });
      return res.json({ success: true, data: result.data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // ADMIN PANEL & SYSTEM MANAGEMENT ROUTES
  // ==========================================

  /**
   * GET /api/admin/overview
   * Fetch system stats, AI usage metrics, lesson plan counts, and error stats.
   * Requires Admin Role.
   */
  app.get('/api/admin/overview', (req: Request, res: Response) => {
    const auth = verifyAdminRole(req);
    if (auth.errorResponse) {
      return res.status(auth.errorResponse.statusCode).json(auth.errorResponse.payload);
    }
    const stats = adminService.getOverviewStats();
    return res.json({ success: true, data: stats });
  });

  /**
   * Subjects Management API
   */
  app.get('/api/admin/subjects', (req: Request, res: Response) => {
    const auth = verifyAdminRole(req);
    if (auth.errorResponse) {
      return res.status(auth.errorResponse.statusCode).json(auth.errorResponse.payload);
    }
    return res.json({ success: true, data: adminService.getSubjects() });
  });

  app.post('/api/admin/subjects', (req: Request, res: Response) => {
    const auth = verifyAdminRole(req);
    if (auth.errorResponse) {
      return res.status(auth.errorResponse.statusCode).json(auth.errorResponse.payload);
    }
    const { code, name, gradeLevels } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, error: 'Thiếu mã môn hoặc tên môn học.' });
    }
    const created = adminService.addSubject({ code, name, gradeLevels: gradeLevels || [], status: 'active' });
    return res.json({ success: true, data: created });
  });

  app.delete('/api/admin/subjects/:id', (req: Request, res: Response) => {
    const auth = verifyAdminRole(req);
    if (auth.errorResponse) {
      return res.status(auth.errorResponse.statusCode).json(auth.errorResponse.payload);
    }
    adminService.deleteSubject(req.params.id);
    return res.json({ success: true, message: 'Đã xóa môn học.' });
  });

  /**
   * Grade Levels Management API
   */
  app.get('/api/admin/grades', (req: Request, res: Response) => {
    const auth = verifyAdminRole(req);
    if (auth.errorResponse) {
      return res.status(auth.errorResponse.statusCode).json(auth.errorResponse.payload);
    }
    return res.json({ success: true, data: adminService.getGradeLevels() });
  });

  app.post('/api/admin/grades', (req: Request, res: Response) => {
    const auth = verifyAdminRole(req);
    if (auth.errorResponse) {
      return res.status(auth.errorResponse.statusCode).json(auth.errorResponse.payload);
    }
    const { code, name, schoolLevel, subjectsCount } = req.body;
    if (!name || !schoolLevel) {
      return res.status(400).json({ success: false, error: 'Thiếu tên khối lớp hoặc cấp học.' });
    }
    const created = adminService.addGradeLevel({ code: code || name, name, schoolLevel, subjectsCount: subjectsCount || 10 });
    return res.json({ success: true, data: created });
  });

  app.delete('/api/admin/grades/:id', (req: Request, res: Response) => {
    const auth = verifyAdminRole(req);
    if (auth.errorResponse) {
      return res.status(auth.errorResponse.statusCode).json(auth.errorResponse.payload);
    }
    adminService.deleteGradeLevel(req.params.id);
    return res.json({ success: true, message: 'Đã xóa cấp/khối lớp.' });
  });

  /**
   * Teaching Methods & Techniques API
   */
  app.get('/api/admin/methods', (req: Request, res: Response) => {
    const auth = verifyAdminRole(req);
    if (auth.errorResponse) {
      return res.status(auth.errorResponse.statusCode).json(auth.errorResponse.payload);
    }
    return res.json({ success: true, data: adminService.getTeachingMethods() });
  });

  app.post('/api/admin/methods', (req: Request, res: Response) => {
    const auth = verifyAdminRole(req);
    if (auth.errorResponse) {
      return res.status(auth.errorResponse.statusCode).json(auth.errorResponse.payload);
    }
    const { name, category, description, suitableSubjects } = req.body;
    if (!name || !category) {
      return res.status(400).json({ success: false, error: 'Thiếu tên phương pháp hoặc phân loại.' });
    }
    const created = adminService.addTeachingMethod({
      name,
      category,
      description: description || '',
      suitableSubjects: suitableSubjects || ['Tất cả môn'],
      status: 'active',
    });
    return res.json({ success: true, data: created });
  });

  app.put('/api/admin/methods/:id', (req: Request, res: Response) => {
    const auth = verifyAdminRole(req);
    if (auth.errorResponse) {
      return res.status(auth.errorResponse.statusCode).json(auth.errorResponse.payload);
    }
    const updated = adminService.updateTeachingMethod(req.params.id, req.body);
    return res.json({ success: true, data: updated });
  });

  app.delete('/api/admin/methods/:id', (req: Request, res: Response) => {
    const auth = verifyAdminRole(req);
    if (auth.errorResponse) {
      return res.status(auth.errorResponse.statusCode).json(auth.errorResponse.payload);
    }
    adminService.deleteTeachingMethod(req.params.id);
    return res.json({ success: true, message: 'Đã xóa phương pháp dạy học.' });
  });

  /**
   * AI Models Management API
   */
  app.get('/api/admin/models', (req: Request, res: Response) => {
    const auth = verifyAdminRole(req);
    if (auth.errorResponse) {
      return res.status(auth.errorResponse.statusCode).json(auth.errorResponse.payload);
    }
    return res.json({ success: true, data: adminService.getAiModels() });
  });

  app.put('/api/admin/models/:id', (req: Request, res: Response) => {
    const auth = verifyAdminRole(req);
    if (auth.errorResponse) {
      return res.status(auth.errorResponse.statusCode).json(auth.errorResponse.payload);
    }
    const updated = adminService.updateAiModel(req.params.id, req.body);
    return res.json({ success: true, data: updated });
  });

  /**
   * Quota Configuration API
   */
  app.get('/api/admin/quotas', (req: Request, res: Response) => {
    const auth = verifyAdminRole(req);
    if (auth.errorResponse) {
      return res.status(auth.errorResponse.statusCode).json(auth.errorResponse.payload);
    }
    return res.json({ success: true, data: adminService.getQuotas() });
  });

  app.put('/api/admin/quotas/:role', (req: Request, res: Response) => {
    const auth = verifyAdminRole(req);
    if (auth.errorResponse) {
      return res.status(auth.errorResponse.statusCode).json(auth.errorResponse.payload);
    }
    const role = req.params.role as 'teacher' | 'head_teacher' | 'admin';
    const updated = adminService.updateQuota(role, req.body);
    return res.json({ success: true, data: updated });
  });

  /**
   * System Templates API
   */
  app.get('/api/admin/templates', (req: Request, res: Response) => {
    const auth = verifyAdminRole(req);
    if (auth.errorResponse) {
      return res.status(auth.errorResponse.statusCode).json(auth.errorResponse.payload);
    }
    return res.json({ success: true, data: adminService.getTemplates() });
  });

  app.put('/api/admin/templates/:id', (req: Request, res: Response) => {
    const auth = verifyAdminRole(req);
    if (auth.errorResponse) {
      return res.status(auth.errorResponse.statusCode).json(auth.errorResponse.payload);
    }
    const updated = adminService.updateTemplate(req.params.id, req.body);
    return res.json({ success: true, data: updated });
  });

  /**
   * Error Logs API
   */
  app.get('/api/admin/logs/errors', (req: Request, res: Response) => {
    const auth = verifyAdminRole(req);
    if (auth.errorResponse) {
      return res.status(auth.errorResponse.statusCode).json(auth.errorResponse.payload);
    }
    return res.json({ success: true, data: adminService.getErrorLogs() });
  });

  // ==========================================
  // VITE MIDDLEWARE & STATIC SERVING
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
