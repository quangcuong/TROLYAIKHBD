import { lessonPlanService } from './lessonPlanService';
import { callGeminiWithRetryAndTimeout } from './geminiClient';
import {
  validateLessonPlanData,
  AnalyzeTemplateInput,
  ExtractContentInput,
  GeneratePlanInput,
  ValidatePlanInput,
  RewriteSectionInput,
  ValidationResult,
} from '../schemas/aiPlanSchemas';
import { DbLessonPlan } from '../types/database';
import { sanitizeHtml } from '../utils/sanitize';

export const aiPipelineService = {
  /**
   * Stage 1: Analyze Template Structure
   */
  async analyzeTemplate(input: AnalyzeTemplateInput, activeUserId: string, lessonPlan: DbLessonPlan) {
    const startTime = Date.now();

    // 1. Gather reference text from sample lesson plan files if available
    const { data: files } = await lessonPlanService.getLessonFiles(input.lessonPlanId);
    const sampleFiles = files.filter(
      (f) => f.metadata?.category === 'sample_lesson_plan' || f.file_name.toLowerCase().includes('mau')
    );

    let referenceText = input.templateText || '';
    if (sampleFiles.length > 0) {
      referenceText += '\n\n' + sampleFiles.map((f) => f.extracted_text).filter(Boolean).join('\n---\n');
    }

    if (!referenceText.trim()) {
      referenceText = `Giáo án mẫu chuẩn Công văn 5512 Bộ Giáo dục và Đào tạo môn ${lessonPlan.subject} - ${lessonPlan.grade}. Khung cấu hình gồm 4 hoạt động: Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng.`;
    }

    const prompt = `Bạn là chuyên gia thẩm định giáo án GDPT 2018. Hãy phân tích cấu trúc giáo án mẫu dưới đây và trích xuất thông tin cấu trúc dưới dạng JSON:

NỘI DUNG GIÁO ÁN MẪU:
${referenceText.slice(0, 4000)}

Trả về kết quả dưới dạng cấu trúc JSON chính xác theo các trường:
{
  "detectedType": "5512",
  "structureOverview": "Tóm tắt cấu trúc chung...",
  "keySections": ["Tên mục 1", "Tên mục 2"],
  "activityFormat": "Mô tả bảng tiến trình bài dạy",
  "styleGuidelines": "Các lưu ý trình bày văn phong sư phạm"
}`;

    const geminiRes = await callGeminiWithRetryAndTimeout({
      model: 'gemini-3.6-flash',
      prompt,
      systemInstruction: 'Phân tích cấu trúc giáo án mẫu và trả về JSON thuần túy.',
      responseMimeType: 'application/json',
      timeoutMs: 45000,
      maxRetries: 2,
    });

    let resultData: any = {};
    let status = 'completed';
    let errorMessage: string | null = null;

    if (geminiRes.error) {
      status = 'failed';
      errorMessage = geminiRes.error;
      resultData = {
        detectedType: lessonPlan.type || '5512',
        structureOverview: 'Sử dụng khung cấu trúc tiêu chuẩn theo Công văn 5512 Bộ GDĐT.',
        keySections: ['I. Mục tiêu', 'II. Thiết bị dạy học và học liệu', 'III. Tiến trình dạy học'],
        activityFormat: '4 bước: Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng',
        styleGuidelines: 'Văn phong sư phạm ngắn gọn, rõ ràng.',
      };
    } else {
      try {
        resultData = JSON.parse(geminiRes.text);
      } catch (e) {
        resultData = {
          detectedType: lessonPlan.type || '5512',
          structureOverview: geminiRes.text.slice(0, 300),
          keySections: ['Mục tiêu', 'Thiết bị', 'Tiến trình'],
          activityFormat: 'Cấu hình tiêu chuẩn 5512',
          styleGuidelines: 'Văn phong chuẩn chuẩn mực',
        };
      }
    }

    // Save generation log
    await lessonPlanService.addGenerationLog(
      {
        lesson_plan_id: input.lessonPlanId,
        model_used: geminiRes.modelUsed,
        prompt_tokens: geminiRes.promptTokens,
        completion_tokens: geminiRes.completionTokens,
        total_tokens: geminiRes.totalTokens,
        duration_ms: geminiRes.durationMs,
        status: status === 'completed' ? 'completed' : 'failed',
        error_message: errorMessage,
        prompt_payload: { stage: 'stage1_analyze_template', lessonPlanId: input.lessonPlanId },
        response_payload: resultData,
      },
      activeUserId
    );

    // Update lesson plan database metadata
    const currentMeta = lessonPlan.metadata || {};
    const pipelineSteps = currentMeta.pipeline_steps || {};

    const updatedPipelineSteps = {
      ...pipelineSteps,
      step1_template: {
        status,
        updated_at: new Date().toISOString(),
        result: resultData,
        error: errorMessage,
      },
    };

    const updateRes = await lessonPlanService.updateLessonPlan(input.lessonPlanId, {
      status: status === 'completed' ? 'analyzing' : 'failed',
      metadata: {
        ...currentMeta,
        pipeline_steps: updatedPipelineSteps,
      },
    });

    return {
      success: status === 'completed',
      data: resultData,
      error: errorMessage,
      lessonPlan: updateRes.data || lessonPlan,
    };
  },

  /**
   * Stage 2: Extract Content from Curriculum, Textbook, and Reference Files
   */
  async extractContent(input: ExtractContentInput, activeUserId: string, lessonPlan: DbLessonPlan) {
    const { data: files } = await lessonPlanService.getLessonFiles(input.lessonPlanId);

    const targetFiles = input.fileIds && input.fileIds.length > 0
      ? files.filter((f) => input.fileIds?.includes(f.id))
      : files;

    const extractedTexts = targetFiles
      .map((f) => `--- File: ${f.file_name} (${f.metadata?.category || 'tài liệu'}) ---\n${f.extracted_text || ''}`)
      .join('\n\n');

    const promptText = extractedTexts.trim()
      ? extractedTexts.slice(0, 6000)
      : `Bài học: ${lessonPlan.title}. Môn ${lessonPlan.subject} - ${lessonPlan.grade} - Sách ${lessonPlan.textbook || 'Mới'}.`;

    const prompt = `Bạn là trợ lý chuyên môn giáo dục. Hãy trích xuất nội dung cốt lõi từ tư liệu học liệu dưới đây để chuẩn bị soạn giáo án:

TÀI LIỆU HỌC LIỆU / SGK:
${promptText}

Trả về JSON chính xác theo cấu trúc:
{
  "mainKnowledgePoints": ["Kiến thức cốt lõi 1", "Kiến thức cốt lõi 2"],
  "targetCompetencies": ["Năng lực đặc thù môn học", "Năng lực chung"],
  "targetQualities": ["Phẩm chất 1", "Phẩm chất 2"],
  "suggestedActivities": ["Gợi ý thí nghiệm/thảo luận 1", "Gợi ý bài tập 2"],
  "extractedConcepts": ["Khái niệm 1", "Thuật ngữ 2"]
}`;

    const geminiRes = await callGeminiWithRetryAndTimeout({
      model: 'gemini-3.6-flash',
      prompt,
      systemInstruction: 'Trích xuất nội dung bài học từ tư liệu và trả về JSON chuẩn.',
      responseMimeType: 'application/json',
      timeoutMs: 45000,
      maxRetries: 2,
    });

    let resultData: any = {};
    let status = 'completed';
    let errorMessage: string | null = null;

    if (geminiRes.error) {
      status = 'failed';
      errorMessage = geminiRes.error;
      resultData = {
        mainKnowledgePoints: [`Khái niệm và quy luật cốt lõi bài ${lessonPlan.title}`],
        targetCompetencies: ['Năng lực tự học', 'Năng lực giải quyết vấn đề'],
        targetQualities: ['Chăm chỉ', 'Trung thực'],
        suggestedActivities: ['Thảo luận nhóm', 'Giải bài tập thực hành'],
        extractedConcepts: [lessonPlan.title],
      };
    } else {
      try {
        resultData = JSON.parse(geminiRes.text);
      } catch (e) {
        resultData = {
          mainKnowledgePoints: [lessonPlan.title],
          targetCompetencies: ['Năng lực tự học'],
          targetQualities: ['Chăm chỉ'],
          suggestedActivities: ['Thực hành bài tập'],
          extractedConcepts: [lessonPlan.title],
        };
      }
    }

    // Save generation log
    await lessonPlanService.addGenerationLog(
      {
        lesson_plan_id: input.lessonPlanId,
        model_used: geminiRes.modelUsed,
        prompt_tokens: geminiRes.promptTokens,
        completion_tokens: geminiRes.completionTokens,
        total_tokens: geminiRes.totalTokens,
        duration_ms: geminiRes.durationMs,
        status: status === 'completed' ? 'completed' : 'failed',
        error_message: errorMessage,
        prompt_payload: { stage: 'stage2_extract_content', lessonPlanId: input.lessonPlanId },
        response_payload: resultData,
      },
      activeUserId
    );

    // Update DB
    const currentMeta = lessonPlan.metadata || {};
    const pipelineSteps = currentMeta.pipeline_steps || {};

    const updatedPipelineSteps = {
      ...pipelineSteps,
      step2_extraction: {
        status,
        updated_at: new Date().toISOString(),
        result: resultData,
        error: errorMessage,
      },
    };

    const updateRes = await lessonPlanService.updateLessonPlan(input.lessonPlanId, {
      status: status === 'completed' ? 'analyzing' : 'failed',
      metadata: {
        ...currentMeta,
        pipeline_steps: updatedPipelineSteps,
      },
    });

    return {
      success: status === 'completed',
      data: resultData,
      error: errorMessage,
      lessonPlan: updateRes.data || lessonPlan,
    };
  },

  /**
   * Stage 3: Generate Full Lesson Plan JSON according to document type (5512, NCBH, STEM)
   */
  async generatePlan(input: GeneratePlanInput, activeUserId: string, lessonPlan: DbLessonPlan) {
    const docType = input.docType || lessonPlan.type || '5512';
    const pipelineSteps = lessonPlan.metadata?.pipeline_steps || {};

    const templateResult = pipelineSteps.step1_template?.result || {};
    const extractedContent = pipelineSteps.step2_extraction?.result || {};

    let schemaPromptInstructions = '';

    if (docType === 'ncbh') {
      schemaPromptInstructions = `
TẠO BÀI HỌC NGHIÊN CỨU BÀI HỌC (NCBH) theo định dạng JSON:
{
  "title": "${lessonPlan.title}",
  "subject": "${lessonPlan.subject}",
  "grade": "${lessonPlan.grade}",
  "textbook": "${lessonPlan.textbook || 'Bộ sách chuẩn'}",
  "duration": "${lessonPlan.duration || '2 tiết (90 phút)'}",
  "totalDurationMinutes": 90,
  "researchTopic": "Chủ đề nghiên cứu sinh hoạt chuyên môn...",
  "researchGoals": ["Mục tiêu quan sát 1", "Mục tiêu quan sát 2"],
  "focusObservationQuestions": ["Câu hỏi tập trung quan sát học sinh 1"],
  "teachingActivities": [
    {
      "id": "act_1",
      "title": "Tên hoạt động 1",
      "time": "15 phút",
      "durationMinutes": 15,
      "studentActionFocus": "Hành vi và thao tác học sinh...",
      "teacherObservationFocus": "Nội dung giáo viên cần ghi nhận...",
      "expectedStudentDifficulties": "Khó khăn học sinh gặp phải...",
      "supportStrategy": "Giải pháp hỗ trợ của giáo viên..."
    }
  ],
  "postLessonReflectionCriteria": ["Tiêu chí phân tích suy ngẫm sau tiết dạy"]
}
LƯU Ý QUAN TRỌNG: Tổng durationMinutes của các teachingActivities PHẢI BẰNG EXACTLY totalDurationMinutes (${lessonPlan.duration || '90'}).
`;
    } else if (docType === 'stem') {
      schemaPromptInstructions = `
TẠO KẾ HOẠCH BÀI HỌC STEM tích hợp theo định dạng JSON:
{
  "title": "${lessonPlan.title}",
  "subject": "${lessonPlan.subject}",
  "grade": "${lessonPlan.grade}",
  "textbook": "${lessonPlan.textbook || 'Bộ sách chuẩn'}",
  "duration": "${lessonPlan.duration || '2 tiết (90 phút)'}",
  "totalDurationMinutes": 90,
  "stemTheme": "Tên chủ đề STEM...",
  "productDescription": "Mô tả sản phẩm STEM học sinh chế tạo...",
  "integratedSubjects": {
    "science": "Kiến thức Khoa học (S)...",
    "technology": "Ứng dụng Công nghệ (T)...",
    "engineering": "Quy trình Kỹ thuật (E)...",
    "mathematics": "Tính toán Toán học (M)..."
  },
  "productCriteria": ["Tiêu chí sản phẩm 1", "Tiêu chí sản phẩm 2"],
  "designSteps": [
    {
      "stepNumber": 1,
      "title": "Bước 1: Xác định vấn đề / Sản phẩm",
      "time": "15 phút",
      "durationMinutes": 15,
      "teacherGuide": "Hướng dẫn của giáo viên...",
      "studentTask": "Nhiệm vụ của học sinh...",
      "productOutcome": "Sản phẩm của bước..."
    }
  ],
  "assessmentRubric": [
    {
      "criterion": "Tiêu chí 1",
      "maxPoints": 10,
      "description": "Mô tả điểm tối đa..."
    }
  ]
}
LƯU Ý QUAN TRỌNG: Tổng durationMinutes của các designSteps PHẢI BẰNG EXACTLY totalDurationMinutes (${lessonPlan.duration || '90'}).
`;
    } else {
      schemaPromptInstructions = `
TẠO KẾ HOẠCH BÀI DẠY (KHBD 5512) theo định dạng JSON:
{
  "title": "${lessonPlan.title}",
  "subject": "${lessonPlan.subject}",
  "grade": "${lessonPlan.grade}",
  "textbook": "${lessonPlan.textbook || 'Kết nối tri thức với cuộc sống'}",
  "duration": "${lessonPlan.duration || '2 tiết (90 phút)'}",
  "totalDurationMinutes": 90,
  "objectives": {
    "knowledge": ["Yêu cầu về kiến thức 1", "Yêu cầu 2"],
    "capabilities": ["Năng lực đặc thù", "Năng lực chung"],
    "qualities": ["Phẩm chất 1", "Phẩm chất 2"]
  },
  "teachingEquipment": {
    "teacher": ["Máy tính, máy chiếu, bài giảng số"],
    "students": ["SGK, vở ghi, giấy A0"]
  },
  "activities": [
    {
      "id": "act_1",
      "title": "Hoạt động 1: Mở đầu (Khởi động)",
      "time": "10 phút",
      "durationMinutes": 10,
      "objective": "Mục tiêu khởi động...",
      "content": "Nội dung giao nhiệm vụ...",
      "product": "Sản phẩm học sinh trả lời...",
      "implementation": "1. GV giao nhiệm vụ -> 2. HS thực hiện -> 3. Báo cáo -> 4. GV chốt."
    },
    {
      "id": "act_2",
      "title": "Hoạt động 2: Hình thành kiến thức mới",
      "time": "45 phút",
      "durationMinutes": 45,
      "objective": "Mục tiêu khám phá kiến thức...",
      "content": "Nội dung bài học...",
      "product": "Kết quả phiếu học tập...",
      "implementation": "GV tổ chức thảo luận nhóm khám phá..."
    },
    {
      "id": "act_3",
      "title": "Hoạt động 3: Luyện tập",
      "time": "20 phút",
      "durationMinutes": 20,
      "objective": "Củng cố kiến thức...",
      "content": "Bài tập trắc nghiệm / tự luận...",
      "product": "Lời giải của học sinh...",
      "implementation": "GV giao bài tập, HS làm bài..."
    },
    {
      "id": "act_4",
      "title": "Hoạt động 4: Vận dụng",
      "time": "15 phút",
      "durationMinutes": 15,
      "objective": "Ứng dụng thực tiễn...",
      "content": "Bài tập thực tế...",
      "product": "Báo cáo thu hoạch...",
      "implementation": "GV hướng dẫn về nhà làm..."
    }
  ]
}
LƯU Ý QUAN TRỌNG: Tổng durationMinutes của tất cả các hoạt động PHẢI BẰNG EXACTLY totalDurationMinutes (ở đây là 90 phút).
`;
    }

    const prompt = `Bạn là chuyên gia thiết kế bài giảng GDPT 2018. Hãy biên soạn một giáo án hoàn chỉnh, chất lượng cao cho bài học:

TÊN BÀI HỌC: ${lessonPlan.title}
MÔN HỌC: ${lessonPlan.subject}
LỚP: ${lessonPlan.grade}
SÁCH: ${lessonPlan.textbook || 'Chương trình mới'}
THỜI LƯỢNG: ${lessonPlan.duration || '2 tiết (90 phút)'}

KẾT QUẢ PHÂN TÍCH CẤU TRÚC:
${JSON.stringify(templateResult)}

NỘI DUNG TRÍCH XUẤT TỪ SGK & HỌC LIỆU:
${JSON.stringify(extractedContent)}

TÙY CHỌN BỔ SUNG:
${JSON.stringify(input.options || {})}

${schemaPromptInstructions}

YÊU CẦU BẮT BUỘC: Trả về duy nhất 1 JSON object đúng định dạng, không bao gồm ký tự mã Markdown thừa.`;

    const geminiRes = await callGeminiWithRetryAndTimeout({
      model: 'gemini-3.6-flash',
      prompt,
      systemInstruction: 'Bạn là chuyên gia soạn giáo án. Chỉ trả về JSON duy nhất đúng cấu trúc được yêu cầu.',
      responseMimeType: 'application/json',
      timeoutMs: 90000,
      maxRetries: 2,
    });

    let generatedJson: any = null;
    let status = 'completed';
    let errorMessage: string | null = null;

    if (geminiRes.error) {
      status = 'failed';
      errorMessage = geminiRes.error;
    } else {
      try {
        generatedJson = JSON.parse(geminiRes.text);
      } catch (e: any) {
        status = 'failed';
        errorMessage = 'Lỗi parse JSON kết quả Gemini: ' + e.message;
      }
    }

    // Save generation log
    await lessonPlanService.addGenerationLog(
      {
        lesson_plan_id: input.lessonPlanId,
        model_used: geminiRes.modelUsed,
        prompt_tokens: geminiRes.promptTokens,
        completion_tokens: geminiRes.completionTokens,
        total_tokens: geminiRes.totalTokens,
        duration_ms: geminiRes.durationMs,
        status: status === 'completed' ? 'completed' : 'failed',
        error_message: errorMessage,
        prompt_payload: { stage: 'stage3_generate_plan', docType, lessonPlanId: input.lessonPlanId },
        response_payload: generatedJson || { rawText: geminiRes.text },
      },
      activeUserId
    );

    // Update lesson plan database
    const currentMeta = lessonPlan.metadata || {};
    const pipelineStepsMeta = currentMeta.pipeline_steps || {};

    const updatedPipelineSteps = {
      ...pipelineStepsMeta,
      step3_generation: {
        status,
        updated_at: new Date().toISOString(),
        result: generatedJson,
        error: errorMessage,
      },
    };

    const updateRes = await lessonPlanService.updateLessonPlan(input.lessonPlanId, {
      status: status === 'completed' ? 'generating' : 'failed',
      content: generatedJson || lessonPlan.content,
      type: docType,
      metadata: {
        ...currentMeta,
        pipeline_steps: updatedPipelineSteps,
      },
    });

    return {
      success: status === 'completed',
      data: generatedJson,
      error: errorMessage,
      lessonPlan: updateRes.data || lessonPlan,
    };
  },

  /**
   * Stage 4: Validate Quality, Check Missing Fields & Total Duration, Auto-Fix
   */
  async validatePlan(input: ValidatePlanInput, activeUserId: string, lessonPlan: DbLessonPlan) {
    const docType = lessonPlan.type || '5512';
    const planContent = lessonPlan.content;

    // 1. Perform Zod & duration validation
    let validationRes = validateLessonPlanData(planContent, docType);

    let finalContent = planContent;
    let autoFixAttempted = false;

    // 2. If invalid and autoFix enabled, attempt Gemini Auto-Fix
    if (!validationRes.valid && input.autoFix) {
      autoFixAttempted = true;

      const fixPrompt = `Giáo án JSON dưới đây bị các lỗi chất lượng / thiếu trường / sai tổng thời lượng:

LỖI PHÁT HIỆN:
${JSON.stringify(validationRes.issues, null, 2)}

GIÁO ÁN HIỆN TẠI (LỖI):
${JSON.stringify(planContent, null, 2)}

YÊU CẦU: Hãy sửa lại toàn bộ JSON này sao cho:
1. Đầy đủ tất cả các trường bắt buộc theo loại giáo án ${docType}.
2. Điều chỉnh tổng durationMinutes của tất cả các hoạt động/bước sao cho BẰNG EXACTLY totalDurationMinutes (${validationRes.totalPlannedMinutes || 90}).
3. Chỉ trả về JSON duy nhất đã được sửa hoàn chỉnh.`;

      const geminiRes = await callGeminiWithRetryAndTimeout({
        model: 'gemini-3.6-flash',
        prompt: fixPrompt,
        systemInstruction: 'Sửa lỗi cấu trúc giáo án JSON và trả về JSON chuẩn.',
        responseMimeType: 'application/json',
        timeoutMs: 60000,
        maxRetries: 1,
      });

      if (!geminiRes.error) {
        try {
          const fixedObj = JSON.parse(geminiRes.text);
          const reValidation = validateLessonPlanData(fixedObj, docType);
          if (reValidation.issues.length <= validationRes.issues.length) {
            finalContent = fixedObj;
            validationRes = reValidation;
          }
        } catch (e) {
          // Keep original validation
        }
      }

      // Save log for auto-fix
      await lessonPlanService.addGenerationLog(
        {
          lesson_plan_id: input.lessonPlanId,
          model_used: geminiRes.modelUsed,
          prompt_tokens: geminiRes.promptTokens,
          completion_tokens: geminiRes.completionTokens,
          total_tokens: geminiRes.totalTokens,
          duration_ms: geminiRes.durationMs,
          status: validationRes.valid ? 'completed' : 'failed',
          error_message: geminiRes.error,
          prompt_payload: { stage: 'stage4_autofix', lessonPlanId: input.lessonPlanId },
          response_payload: { fixedContent: finalContent, validationRes },
        },
        activeUserId
      );
    }

    const isFinalValid = validationRes.valid;
    const finalStatus = isFinalValid ? 'completed' : 'failed';

    // Update lesson plan database
    const currentMeta = lessonPlan.metadata || {};
    const pipelineStepsMeta = currentMeta.pipeline_steps || {};

    const updatedPipelineSteps = {
      ...pipelineStepsMeta,
      step4_validation: {
        status: isFinalValid ? 'completed' : 'failed',
        updated_at: new Date().toISOString(),
        validation: validationRes,
        autoFixAttempted,
      },
    };

    const updateRes = await lessonPlanService.updateLessonPlan(input.lessonPlanId, {
      status: finalStatus,
      content: finalContent,
      metadata: {
        ...currentMeta,
        pipeline_steps: updatedPipelineSteps,
        last_validated_at: new Date().toISOString(),
        validation_passed: isFinalValid,
      },
    });

    return {
      success: isFinalValid,
      validation: validationRes,
      lessonPlan: updateRes.data || lessonPlan,
    };
  },

  /**
   * Rewrite Section: Modify a selected fragment of text/HTML using AI
   */
  async rewriteSection(input: RewriteSectionInput, activeUserId: string, lessonPlan: DbLessonPlan) {
    const actionPrompts: Record<string, string> = {
      rewrite: 'Viết lại đoạn văn bản sau bằng văn phong sư phạm chuẩn mực, diễn đạt trôi chảy, súc tích và dễ hiểu.',
      shorten: 'Tóm tắt và rút gọn đoạn văn bản sau, giữ lại các ý chính súc tích nhất.',
      expand: 'Mở rộng đoạn văn bản sau, bổ sung chi tiết hướng dẫn sư phạm, giải thích sâu sắc và làm rõ hoạt động.',
      add_examples: `Bổ sung các ví dụ minh họa thực tế, sinh động phù hợp với học sinh ${lessonPlan.grade || ''} môn ${lessonPlan.subject || ''}.`,
      add_questions: 'Thêm các câu hỏi gợi mở, thảo luận hoặc kiểm tra đánh giá tương ứng với nội dung đoạn văn bản.',
      differentiate: 'Bổ sung hướng dẫn phân hóa nhiệm vụ học tập theo 3 mức độ (Cần hỗ trợ / Đạt / Khá - Giỏi).',
      create_rubric: 'Tạo bảng/tiêu chí đánh giá Rubric (dưới dạng bảng HTML <table>...</table> hoặc tiêu chí rõ ràng) cho phần nội dung này.',
      create_worksheet: 'Tạo nội dung phiếu học tập (Worksheet) bài tập/nhiệm vụ học sinh tương ứng với phần này.',
    };

    const actionInstruction = actionPrompts[input.action] || actionPrompts.rewrite;
    const additionalInstruction = input.promptInstruction ? `\nYêu cầu bổ sung từ người dùng: ${input.promptInstruction}` : '';

    const prompt = `Bạn là trợ lý chuyên môn viết giáo án phổ thông GDPT 2018.

NGỮ CẢNH BÀI HỌC:
- Tên bài: ${lessonPlan.title || ''}
- Môn: ${lessonPlan.subject || ''} - Khối: ${lessonPlan.grade || ''}
${input.context ? `- Ngữ cảnh bổ sung: ${input.context}` : ''}

NHIỆM VỤ: ${actionInstruction}${additionalInstruction}

ĐOẠN VĂN BẢN/NỘI DUNG ĐƯỢC CHỌN:
"""
${input.selectedText}
"""

LƯU Ý QUAN TRỌNG:
1. Chỉ trả về phần nội dung đã được xử lý/viết lại (dưới dạng văn bản hoặc thẻ HTML cơ bản như <p>, <ul>, <li>, <table> nếu tạo rubric).
2. KHÔNG kèm lời chào, KHÔNG kèm lời dẫn ("Dưới đây là...", "Đây là kết quả...").
3. KHÔNG lặp lại toàn bộ giáo án hay phần ngoài đoạn được chọn.`;

    const geminiRes = await callGeminiWithRetryAndTimeout({
      model: 'gemini-3.6-flash',
      prompt,
      systemInstruction: 'Trả về DUY NHẤT đoạn văn bản/HTML đã chỉnh sửa, không kèm lời dẫn.',
      timeoutMs: 30000,
      maxRetries: 2,
    });

    let outputText = geminiRes.text?.trim() || input.selectedText;
    if (outputText.startsWith('```')) {
      outputText = outputText.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
    }

    const sanitizedOutput = sanitizeHtml(outputText);

    // Save generation log
    await lessonPlanService.addGenerationLog(
      {
        lesson_plan_id: input.lessonPlanId,
        model_used: geminiRes.modelUsed,
        prompt_tokens: geminiRes.promptTokens,
        completion_tokens: geminiRes.completionTokens,
        total_tokens: geminiRes.totalTokens,
        duration_ms: geminiRes.durationMs,
        status: geminiRes.error ? 'failed' : 'completed',
        error_message: geminiRes.error,
        prompt_payload: { stage: 'rewrite_section', action: input.action, selectedText: input.selectedText.slice(0, 200) },
        response_payload: { result: sanitizedOutput.slice(0, 500) },
      },
      activeUserId
    );

    return {
      success: !geminiRes.error,
      rewrittenText: sanitizedOutput,
      action: input.action,
      error: geminiRes.error,
    };
  },
};

