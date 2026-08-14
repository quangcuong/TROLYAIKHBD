import { describe, it, expect } from 'vitest';
import { validateLessonPlanData } from '../schemas/aiPlanSchemas';

describe('AI Lesson Plan Validation Tests', () => {
  // Test 1: Valid 5512 Lesson Plan
  it('should pass validation for a valid 5512 lesson plan with correct durations', () => {
    const valid5512 = {
      title: 'Bài 1: Chuyển động thẳng biến đổi đều',
      subject: 'Vật lý',
      grade: 'Lớp 10',
      textbook: 'Kết nối tri thức',
      duration: '2 tiết (90 phút)',
      totalDurationMinutes: 90,
      objectives: {
        knowledge: ['Nêu được khái niệm gia tốc', 'Viết được công thức tính vận tốc'],
        capabilities: ['Năng lực giải quyết vấn đề vật lý'],
        qualities: ['Trung thực trong học tập'],
      },
      teachingEquipment: {
        teacher: ['Máy chiếu', 'Phiếu học tập'],
        students: ['Sách giáo khoa', 'Dụng cụ đo'],
      },
      activities: [
        {
          id: 'act_1',
          title: 'Hoạt động 1: Khởi động',
          time: '10 phút',
          durationMinutes: 10,
          objective: 'Tạo tình huống học tập',
          content: 'Xem video về chuyển động xe đua',
          product: 'Câu trả lời của học sinh',
          implementation: '1. Giao nhiệm vụ -> 2. Thực hiện -> 3. Báo cáo',
        },
        {
          id: 'act_2',
          title: 'Hoạt động 2: Hình thành kiến thức mới',
          time: '45 phút',
          durationMinutes: 45,
          objective: 'Xây dựng công thức gia tốc',
          content: 'Thảo luận nhóm làm phiếu học tập',
          product: 'Bảng kết quả thảo luận nhóm',
          implementation: 'GV hướng dẫn các nhóm làm thí nghiệm ảo',
        },
        {
          id: 'act_3',
          title: 'Hoạt động 3: Luyện tập',
          time: '20 phút',
          durationMinutes: 20,
          objective: 'Áp dụng công thức làm bài tập',
          content: 'Giải các ví dụ 1 và 2 trong SGK',
          product: 'Vở ghi bài giải của học sinh',
          implementation: 'GV gọi 2 HS lên bảng làm bài',
        },
        {
          id: 'act_4',
          title: 'Hoạt động 4: Vận dụng',
          time: '15 phút',
          durationMinutes: 15,
          objective: 'Vận dụng tính quãng đường phanh xe',
          content: 'Tính khoảng cách an toàn giao thông',
          product: 'Báo cáo thu hoạch nhỏ',
          implementation: 'GV giao bài tập về nhà',
        },
      ],
    };

    const res = validateLessonPlanData(valid5512, '5512');
    expect(res.valid).toBe(true);
    expect(res.issues.length).toBe(0);
    expect(res.totalActivitiesMinutes).toBe(90);
    expect(res.totalPlannedMinutes).toBe(90);
  });

  // Test 2: Valid STEM Plan
  it('should pass validation for a valid STEM lesson plan', () => {
    const validSTEM = {
      title: 'Chế tạo xe chạy bằng năng lượng khí nén',
      subject: 'Vật lý',
      grade: 'Lớp 10',
      textbook: 'Cánh diều',
      duration: '90 phút',
      totalDurationMinutes: 90,
      stemTheme: 'Chế tạo xe khí nén',
      productDescription: 'Mô hình xe nhựa chạy bằng bóng bay thổi khí',
      integratedSubjects: {
        science: 'Định luật 3 Newton và phản lực',
        technology: 'Sử dụng dụng cụ cắt dán tái chế',
        engineering: 'Thiết kế khung xe và bánh xe',
        mathematics: 'Đo quãng đường và thời gian',
      },
      productCriteria: ['Xe chạy đường thẳng > 3m', 'Dùng vật liệu tái chế'],
      designSteps: [
        {
          stepNumber: 1,
          title: 'Bước 1: Khám phá nguyên lý',
          time: '20 phút',
          durationMinutes: 20,
          teacherGuide: 'Giới thiệu nguyên lý phản lực',
          studentTask: 'Tìm hiểu tài liệu và thảo luận',
          productOutcome: 'Bản đề xuất ý tưởng',
        },
        {
          stepNumber: 2,
          title: 'Bước 2: Thiết kế mô hình',
          time: '30 phút',
          durationMinutes: 30,
          teacherGuide: 'Góp ý bản vẽ thiết kế',
          studentTask: 'Vẽ bản thiết kế chi tiết',
          productOutcome: 'Bản vẽ xe trên giấy A3',
        },
        {
          stepNumber: 3,
          title: 'Bước 3: Chế tạo và thử nghiệm',
          time: '40 phút',
          durationMinutes: 40,
          teacherGuide: 'Hỗ trợ an toàn khi cắt lắp',
          studentTask: 'Lắp ráp mô hình xe',
          productOutcome: 'Sản phẩm xe chạy thực tế',
        },
      ],
      assessmentRubric: [
        {
          criterion: 'Tiêu chí vận hành',
          maxPoints: 5,
          description: 'Xe chạy được xa hơn 3m',
        },
      ],
    };

    const res = validateLessonPlanData(validSTEM, 'stem');
    expect(res.valid).toBe(true);
    expect(res.totalActivitiesMinutes).toBe(90);
  });

  // Test 3: Invalid JSON / Non-object
  it('should fail validation when given non-object or null input', () => {
    const resNull = validateLessonPlanData(null, '5512');
    expect(resNull.valid).toBe(false);
    expect(resNull.issues[0].code).toBe('SYNTAX_ERROR');

    const resString = validateLessonPlanData('Invalid string plan', '5512');
    expect(resString.valid).toBe(false);
    expect(resString.issues[0].code).toBe('SYNTAX_ERROR');
  });

  // Test 4: Missing Required Fields
  it('should fail validation when required fields are missing', () => {
    const incompletePlan = {
      title: 'Bài 1: Chuyển động',
      // Missing subject, grade, textbook, duration, objectives, activities
    };

    const res = validateLessonPlanData(incompletePlan, '5512');
    expect(res.valid).toBe(false);
    expect(res.issues.some((i) => i.code === 'MISSING_FIELD' || i.code === 'INVALID_TYPE')).toBe(true);
  });

  // Test 5: Total Duration Mismatch
  it('should report duration mismatch if sum of activity minutes does not equal total plan duration', () => {
    const mismatchedPlan = {
      title: 'Bài 2: Chuyển động tròn đều',
      subject: 'Vật lý',
      grade: 'Lớp 10',
      textbook: 'Chân trời sáng tạo',
      duration: '90 phút',
      totalDurationMinutes: 90, // Target 90 minutes
      objectives: {
        knowledge: ['Biết khái niệm tốc độ góc'],
        capabilities: ['Tự học'],
        qualities: ['Cẩn thận'],
      },
      teachingEquipment: {
        teacher: ['Tranh ảnh'],
        students: ['SGK'],
      },
      activities: [
        {
          id: 'act_1',
          title: 'Khởi động',
          time: '10 phút',
          durationMinutes: 10,
          objective: 'Tạo hứng thú',
          content: 'Xem tranh',
          product: 'Câu trả lời',
          implementation: 'GV đặt câu hỏi',
        },
        {
          id: 'act_2',
          title: 'Hình thành kiến thức',
          time: '30 phút',
          durationMinutes: 30, // Sum so far = 40 mins (Missing 50 mins!)
          objective: 'Tìm hiểu kiến thức',
          content: 'Đọc SGK',
          product: 'Phiếu học tập',
          implementation: 'Thảo luận',
        },
      ],
    };

    const res = validateLessonPlanData(mismatchedPlan, '5512');
    expect(res.valid).toBe(false);
    expect(res.totalActivitiesMinutes).toBe(40);
    expect(res.totalPlannedMinutes).toBe(90);
    expect(res.issues.some((i) => i.code === 'DURATION_MISMATCH')).toBe(true);
  });
});
