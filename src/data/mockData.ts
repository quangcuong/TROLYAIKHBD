import { LessonPlan, User, SystemStats, PromptTemplate, ActivityLog } from '../types';

export const CURRENT_MOCK_USER: User = {
  id: 'usr_001',
  name: '',
  email: 'lyquangcuong01@gmail.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher',
  role: 'teacher',
  school: '',
  subject: '',
  department: '',
  schoolLevel: '',
  defaultSchoolYear: '',
  aiQuotaUsed: 142500,
  aiQuotaLimit: 300000,
};

export const MOCK_USERS_LIST: User[] = [
  CURRENT_MOCK_USER,
  {
    id: 'usr_002',
    name: 'Cô Trần Thị Phương Thảo',
    email: 'phuongthao.physics@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    role: 'teacher',
    school: 'THCS Lê Quý Đôn, Q.3, TP.HCM',
    subject: 'Khoa học Tự nhiên',
    aiQuotaUsed: 89000,
    aiQuotaLimit: 200000,
  },
  {
    id: 'usr_003',
    name: 'Thầy Lê Hoàng Nam',
    email: 'namle.toan@edu.vn',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    role: 'teacher',
    school: 'THPT Chu Văn An, Hà Nội',
    subject: 'Toán học',
    aiQuotaUsed: 210000,
    aiQuotaLimit: 300000,
  },
  {
    id: 'usr_004',
    name: 'PGS. TSKH Đặng Minh Khôi',
    email: 'minhkhoi.admin@soedu.gov.vn',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    role: 'admin',
    school: 'Sở Giáo dục và Đào tạo Hà Nội',
    subject: 'Quản lý Giáo dục',
    aiQuotaUsed: 450000,
    aiQuotaLimit: 1000000,
  }
];

export const MOCK_LESSON_PLANS: LessonPlan[] = [
  {
    id: 'lp_5512_01',
    title: 'Kế hoạch bài dạy: Lực ma sát và ứng dụng trong thực tiễn',
    type: '5512',
    subject: 'Vật lý',
    grade: 'Lớp 10',
    textbook: 'Kết nối tri thức với cuộc sống',
    duration: '2 tiết (90 phút)',
    authorId: 'usr_001',
    authorName: 'Giáo viên',
    status: 'approved',
    createdAt: '2026-07-28T08:30:00Z',
    updatedAt: '2026-08-01T10:15:00Z',
    summary: 'KHBD chuẩn Công văn 5512/BGDĐT-GDTrH phát triển năng lực tìm hiểu tự nhiên, tích hợp thí nghiệm đo hệ số ma sát nghỉ & ma sát trượt.',
    tags: ['CV 5512', 'Vật lý 10', 'Thí nghiệm', 'Đổi mới PPDH'],
    viewsCount: 1240,
    likesCount: 185,
    content5512: {
      objectives: {
        knowledge: [
          'Nêu được đặc điểm, chiều và độ lớn của lực ma sát nghỉ, lực ma sát trượt và lực ma sát lăn.',
          'Viết được công thức tính lực ma sát trượt F_ms = µ.N và giải thích được các đại lượng.',
          'Phân tích được vai trò có lợi và có hại của lực ma sát trong đời sống và kỹ thuật.'
        ],
        capabilities: [
          'Năng lực Vật lý: Năng lực nhận thức vật lý thông qua việc biểu diễn vectơ lực ma sát; Năng lực tìm hiểu tự nhiên qua thí nghiệm đo lực ma sát trượt bằng lực kế.',
          'Năng lực chung: Năng lực tự học và tự nghiên cứu thông qua đọc SGK; Năng lực giao tiếp và hợp tác nhóm khi tiến hành thí nghiệm.'
        ],
        qualities: [
          'Trung thực trong ghi chép số liệu thực nghiệm.',
          'Chăm chỉ, cẩn thận và có tinh thần trách nhiệm trong công việc nhóm.'
        ]
      },
      teachingEquipment: {
        teacher: [
          'Bài giảng điện tử Canva/PowerPoint tương tác.',
          'Bộ thí nghiệm Vật lý 10: Khối gỗ, các bề mặt tiếp xúc (gỗ, nhựa, vải nhám), lực kế 0-5N, các quả nặng 50g.'
        ],
        students: [
          'SGK Vật lý 10 - Bộ Kết nối tri thức.',
          'Vở ghi bài, bảng nhóm A1 và bút dạ.',
          'Phiếu học tập số 1 & số 2.'
        ]
      },
      activities: [
        {
          id: 'act_1',
          title: 'Hoạt động 1: Mở đầu (Khởi động - 7 phút)',
          time: '7 phút',
          objective: 'Tạo tình huống có vấn đề về hiện tượng bánh xe bị trượt khi phanh gấp hoặc kéo vali trên sàn.',
          content: 'Học sinh quan sát video clip ngắn 45s về ô tô di chuyển trên đường khô và đường trơn trượt mưa bão, thảo luận nguyên nhân.',
          product: 'Câu trả lời cá nhân trên Padlet/Bảng phụ về sự xuất hiện của lực cản/lực tiếp xúc giữa bánh xe và mặt đường.',
          implementation: 'GV chiếu video -> Giao nhiệm vụ thảo luận cặp đôi -> HS thảo luận -> Đại diện nhóm phát biểu -> GV nhận xét và dẫn dắt vào bài mới.'
        },
        {
          id: 'act_2',
          title: 'Hoạt động 2: Hình thành kiến thức mới (38 phút)',
          time: '38 phút',
          objective: 'Hình thành khái niệm, công thức F_ms = µ.N và cách đo lực ma sát trượt.',
          content: 'HS nghiên cứu SGK kết hợp làm thí nghiệm theo nhóm 4 học sinh: Đo lực ma sát trượt khi thay đổi diện tích tiếp xúc, áp lực N và bản chất bề mặt.',
          product: 'Bảng số liệu thực nghiệm trong Phiếu học tập số 1; Rút ra kết luận lực ma sát trượt không phụ thuộc diện tích tiếp xúc mà phụ thuộc áp lực và bản chất bề mặt.',
          implementation: 'GV giao thiết bị thí nghiệm & Phiếu học tập -> HS phân công nhóm trưởng, thư ký, người thao tác -> Tiến hành 3 bước thí nghiệm -> Báo cáo kết quả lên bảng tương tác -> GV chuẩn hóa kiến thức.'
        },
        {
          id: 'act_3',
          title: 'Hoạt động 3: Luyện tập (25 phút)',
          time: '25 phút',
          objective: 'Củng cố công thức và kỹ năng giải bài tập vận dụng tính lực ma sát trên mặt phẳng ngang và mặt phẳng nghiêng.',
          content: 'Giải bài tập trắc nghiệm khách quan tương tác (Plickers/Kahoot) và 2 bài tập tự luận trong phiếu học tập số 2.',
          product: 'Đáp án chi tiết các câu hỏi luyện tập và lời giải bài toán phân tích lực ma sát.',
          implementation: 'GV phát phiếu bài tập -> HS làm cá nhân 10 phút -> Thảo luận nhóm đổi chéo chấm bài -> GV chốt đáp án & tuyên dương nhóm xuất sắc.'
        },
        {
          id: 'act_4',
          title: 'Hoạt động 4: Vận dụng & Mở rộng (20 phút)',
          time: '20 phút',
          objective: 'Vận dụng kiến thức lực ma sát vào thiết kế giải pháp giảm ma sát cho xích xe đạp hoặc tăng ma sát cho lốp xe bám đường.',
          content: 'Dự án nhỏ: Đề xuất phương án thiết kế gai lốp xe chạy trên đường trơn bão tuyết hoặc giải pháp tra mỡ ổ bi.',
          product: 'Bản vẽ phác thảo/Bài trình bày infographic trên Canva của nhóm.',
          implementation: 'GV giao bài tập về nhà -> HS làm theo nhóm -> Nộp sản phẩm trên hệ thống LMS trước tiết học sau.'
        }
      ]
    }
  },
  {
    id: 'lp_ncbh_02',
    title: 'Kế hoạch Nghiên cứu bài học: Phương trình bậc hai và Định lý Vi-ét',
    type: 'ncbh',
    subject: 'Toán học',
    grade: 'Lớp 9',
    textbook: 'Cánh diều',
    duration: '1 tiết (45 phút)',
    authorId: 'usr_003',
    authorName: 'Thầy Lê Hoàng Nam',
    status: 'reviewing',
    createdAt: '2026-07-30T14:20:00Z',
    updatedAt: '2026-08-02T09:00:00Z',
    summary: 'Kế hoạch bài dạy chuyên đề Nghiên cứu bài học (Lesson Study) của Tổ Toán - Tin, tập trung quan sát hành vi tư duy phản biện của HS khi vận dụng Định lý Vi-ét.',
    tags: ['Nghiên cứu bài học', 'Toán 9', 'Định lý Vi-ét', 'Sinh hoạt chuyên môn'],
    viewsCount: 890,
    likesCount: 142,
    contentNCBH: {
      researchTopic: 'Phát triển năng lực tư duy toán học thông qua dự đoán nghiệm và ứng dụng Định lý Vi-ét',
      researchGoals: [
        'Quan sát và phân tích các khó khăn tâm lý, sai lầm phổ biến của HS trung bình - yếu khi tính nhẩm nghiệm.',
        'Đánh giá hiệu quả của kỹ thuật "Mảnh ghép" trong việc thúc đẩy HS tự tin phát biểu ý kiến.',
        'Đề xuất cải tiến tài liệu học tập và câu hỏi gợi mở cho các tiết giảng diện rộng.'
      ],
      focusQuestions: [
        'Học sinh có chủ động phát hiện ra mối liên hệ giữa các hệ số a, b, c và tổng/tích hai nghiệm không?',
        'Những học sinh thụ động trong lớp tương tác ra sao khi làm việc trong nhóm 4 người?',
        'Thời gian dành cho việc tự sửa lỗi sai trên bảng phụ có đủ cho 80% học sinh hiểu bài không?'
      ],
      activities: [
        {
          id: 'ncbh_act_1',
          title: 'Khám phá quy luật tổng và tích hai nghiệm',
          phase: 'Giai đoạn 1: Khởi động & Phát hiện vấn đề',
          researchObjective: 'Quan sát khả năng liên tưởng và dự đoán quy luật số học của HS.',
          teacherAction: 'GV cho 3 phương trình x^2 - 5x + 6 = 0, x^2 - 7x + 12 = 0, x^2 + 4x + 3 = 0. Yêu cầu tính nghiệm x1, x2 rồi tính x1+x2 và x1.x2.',
          expectedStudentBehavior: 'HS tính nghiệm bằng công thức nghiệm thuộc bài cũ, sau đó bất ngờ phát hiện tổng x1+x2 luôn bằng -b/a và tích x1.x2 bằng c/a.',
          observationPoints: [
            'Xem nhóm HS dãy 3 có lúng túng khi viết công thức nghiệm không.',
            'Quan sát nét mặt và thái độ hưởng ứng của HS khi nhận ra quy luật đặc biệt.'
          ]
        },
        {
          id: 'ncbh_act_2',
          title: 'Thực hành tính nhẩm nghiệm dạng a + b + c = 0',
          phase: 'Giai đoạn 2: Luyện tập hợp tác nhóm',
          researchObjective: 'Quan sát sự tương tác giữa HS giỏi và HS trung bình trong việc giải thích cho nhau.',
          teacherAction: 'GV phát thẻ bài tập chứa các phương trình có hệ số lớn nhưng có tổng a+b+c=0. Yêu cầu giải nhanh trong 3 phút.',
          expectedStudentBehavior: 'HS trao đổi sôi nổi, HS giỏi hướng dẫn HS yếu cách áp dụng ngay công thức nhẩm x1=1, x2=c/a.',
          observationPoints: [
            'Ghi nhận số lượng HS tự tay viết được bài giải vào vở.',
            'Đếm số lần HS đặt câu hỏi "Tại sao lại ra c/a?" cho bạn cùng nhóm.'
          ]
        }
      ],
      postLessonReflectionCriteria: [
        'Tỷ lệ học sinh tham gia tích cực vào hoạt động nhóm đạt bao nhiêu %?',
        'GV dạy minh họa đã xử lý tình huống phát sinh nào hay?',
        'Cần điều chỉnh hệ thống bài tập nhẩm nghiệm như thế nào cho tiết học sau?'
      ]
    }
  },
  {
    id: 'lp_stem_03',
    title: 'KHBD STEM: Thiết kế và chế tạo Mô hình Lọc nước mini giá rẻ',
    type: 'stem',
    subject: 'Khoa học Tự nhiên & Công nghệ',
    grade: 'Lớp 8',
    textbook: 'Chân trời sáng tạo',
    duration: '3 tiết (135 phút)',
    authorId: 'usr_002',
    authorName: 'Cô Trần Thị Phương Thảo',
    status: 'approved',
    createdAt: '2026-07-25T10:00:00Z',
    updatedAt: '2026-07-29T16:30:00Z',
    summary: 'Giáo án tích hợp STEM (S - Hóa học/Sinh học, T - Công nghệ vật liệu, E - Quy trình thiết kế kỹ thuật, M - Đo lường thể tích & lưu lượng).',
    tags: ['KHBD STEM', 'KHTN 8', 'Bảo vệ môi trường', 'Chế tạo sản phẩm'],
    viewsCount: 2150,
    likesCount: 340,
    contentSTEM: {
      stemTheme: 'Thiết kế Mô hình Lọc nước sinh hoạt gia đình từ vật liệu tái chế',
      productDescription: 'Thiết bị lọc nước dạng cột tầng (chai nhựa 1.5L) chứa sỏi, cát thạch anh, than hoạt tính, bông lọc có khả năng lọc sạch nước phù sa/nước đục thành nước trong suốt đạt chuẩn cảm quan.',
      integratedSubjects: {
        science: 'KHTN 8: Hỗn hợp và phương pháp tách chất (lọc, gạn, hấp phụ của than hoạt tính).',
        technology: 'Công nghệ 8: Lựa chọn vật liệu dụng cụ, quy trình gia công chai nhựa an toàn.',
        engineering: 'Quy trình thiết kế kỹ thuật 5 bước: Xác định vấn đề -> Đề xuất giải pháp -> Bán vẽ -> Chế tạo -> Thử nghiệm & Đánh giá.',
        mathematics: 'Toán 8: Tính toán tỷ lệ thể tích các lớp vật liệu (1:2:2:1), đo lưu lượng nước mL/phút.'
      },
      productCriteria: [
        {
          criterion: 'Độ trong của nước đầu ra',
          weight: '40%',
          description: 'Nước lọc ra đạt độ trong suốt nhìn rõ đáy cốc glass, không còn cặn lơ lửng hay mùi hôi.'
        },
        {
          criterion: 'Tốc độ lọc nước',
          weight: '30%',
          description: 'Tốc độ lọc tối thiểu đạt 100 mL/phút, không bị tắc nghẽn dòng chảy.'
        },
        {
          criterion: 'Tính thẩm mỹ & Tái chế',
          weight: '20%',
          description: 'Sử dụng >80% vật liệu tái chế, kết cấu vững chắc, không rò rỉ nước ra ngoài.'
        },
        {
          criterion: 'Báo cáo & Thuyết trình',
          weight: '10%',
          description: 'Trình bày rõ ràng nguyên lý lọc và giải thích lý do lựa chọn thứ tự các lớp vật liệu.'
        }
      ],
      designSteps: [
        {
          step: 1,
          title: 'Tiết 1: Khai phá kiến thức & Giao nhiệm vụ thiết kế',
          duration: '45 phút',
          studentTask: 'Tìm hiểu nguyên lý lọc cơ học & hấp phụ. Nhận phiếu nhiệm vụ STEM và tiêu chí sản phẩm.'
        },
        {
          step: 2,
          title: 'Tiết 2: Thảo luận phương án & Lập bản vẽ thiết kế',
          duration: '45 phút',
          studentTask: 'Nhóm thảo luận chọn thứ tự lớp lọc (Cát - Than - Sỏi - Bông). Vẽ bản thiết kế chi tiết có chỉ dẫn kích thước.'
        },
        {
          step: 3,
          title: 'Tiết 3: Gia công, Chế tạo & Thử nghiệm chất lượng',
          duration: '45 phút',
          studentTask: 'Lắp ráp mô hình, rót 500mL nước phù sa thử nghiệm. Đo thời gian lọc và chấm điểm theo Rubric.'
        }
      ],
      assessmentRubric: [
        {
          level: 'Mức Xuất Sắc (9-10đ)',
          scoreRange: '9.0 - 10.0',
          details: 'Nước lọc cực trong, tốc độ >150mL/phút, thiết kế sáng tạo chắc chắn, thuyết trình thuyết phục.'
        },
        {
          level: 'Mức Đạt (7-8đ)',
          scoreRange: '7.0 - 8.9',
          details: 'Nước lọc tương đối trong, tốc độ 100-150mL/phút, mô hình hoàn thiện đúng bản vẽ.'
        },
        {
          level: 'Mức Cần Cải Thiện (<7đ)',
          scoreRange: '< 7.0',
          details: 'Nước lọc còn đục, rò rỉ nước hoặc chảy quá chậm (<50mL/phút).'
        }
      ]
    }
  }
];

export const MOCK_SYSTEM_STATS: SystemStats = {
  totalPlans: 14280,
  plansThisMonth: 1850,
  activeTeachers: 3420,
  aiTokensUsed: 84500000,
  approvalRate: 98.4
};

export const MOCK_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'pt_5512_default',
    name: 'Standard Prompt 5512 GDPT 2018',
    type: '5512',
    description: 'Prompt tối ưu hóa theo đúng khung Phụ lục IV Công văn 5512/BGDĐT-GDTrH.',
    promptText: 'Hãy đóng vai chuyên gia phát triển chương trình giáo dục phổ thông 2018. Xây dựng Kế hoạch bài dạy (Giáo án) theo Công văn 5512 với môn {{subject}}, lớp {{grade}}, bài {{title}}, bộ sách {{textbook}}. Đảm bảo đủ 4 hoạt động: Mở đầu, Hình thành kiến thức, Luyện tập, Vận dụng...',
    isDefault: true
  },
  {
    id: 'pt_stem_default',
    name: 'Standard Prompt KHBD STEM 5 Bước',
    type: 'stem',
    description: 'Prompt chuyên biệt cho bài học tích hợp STEM theo quy trình thiết kế kỹ thuật.',
    promptText: 'Hãy thiết kế Kế hoạch bài dạy STEM cho chủ đề {{title}}, môn {{subject}}, lớp {{grade}}. Yêu cầu nêu rõ 4 lĩnh vực S-T-E-M, tiêu chí sản phẩm, các bước chế tạo thử nghiệm và bảng kiểm Rubric đánh giá...',
    isDefault: true
  },
  {
    id: 'pt_ncbh_default',
    name: 'Prompt Nghiên cứu bài học chuyên sâu',
    type: 'ncbh',
    description: 'Dành cho tiết dạy minh họa SHCM theo nghiên cứu bài học tập trung vào HS.',
    promptText: 'Tạo kế hoạch nghiên cứu bài học cho môn {{subject}} lớp {{grade}} với mục tiêu quan sát hành vi và khó khăn học tập của học sinh. Xây dựng câu hỏi nghiên cứu và góc quan sát dự giờ...',
    isDefault: true
  }
];

export const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log_01',
    userId: 'usr_001',
    userName: 'Giáo viên',
    action: 'Tạo giáo án AI',
    details: 'Đã tạo thành công KHBD 5512 môn Vật lý 10: Lực ma sát',
    timestamp: '2026-08-03T01:45:00Z'
  },
  {
    id: 'log_02',
    userId: 'usr_002',
    userName: 'Cô Trần Thị Phương Thảo',
    action: 'Xuất tệp DOCX',
    details: 'Đã tải xuống giáo án STEM Lọc nước mini',
    timestamp: '2026-08-02T16:20:00Z'
  },
  {
    id: 'log_03',
    userId: 'usr_003',
    userName: 'Thầy Lê Hoàng Nam',
    action: 'Gửi duyệt giáo án',
    details: 'Chuyển KHBD Nghiên cứu bài học Toán 9 sang trạng thái Chờ duyệt',
    timestamp: '2026-08-02T09:10:00Z'
  },
  {
    id: 'log_04',
    userId: 'usr_004',
    userName: 'PGS. TSKH Đặng Minh Khôi',
    action: 'Cập nhật System Prompt',
    details: 'Đã nâng cấp Prompt Template 5512 hỗ trợ bộ sách Cánh diều 2026',
    timestamp: '2026-08-01T14:00:00Z'
  }
];
