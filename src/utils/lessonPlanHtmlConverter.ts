import { DbLessonPlan } from '../types/database';
import { sanitizeHtml } from './sanitize';

/**
 * Converts a structured Lesson Plan JSON object into rich HTML suitable for TipTap Editor.
 */
export function convertLessonPlanToHtml(lessonPlan: DbLessonPlan): string {
  // If metadata already has saved editor_html, return it
  if (lessonPlan.metadata?.editor_html) {
    return sanitizeHtml(lessonPlan.metadata.editor_html);
  }

  const content = lessonPlan.content || {};
  const docType = lessonPlan.type || '5512';

  let html = `
    <h1 style="text-align: center;"><strong>${lessonPlan.title || 'KẾ HOẠCH BÀI DẠY'}</strong></h1>
    <p style="text-align: center;">
      <em>Môn học: ${lessonPlan.subject || ''} | Khối lớp: ${lessonPlan.grade || ''} | Bộ sách: ${lessonPlan.textbook || 'Chương trình mới'} | Thời lượng: ${lessonPlan.duration || '2 tiết'}</em>
    </p>
    <hr />
  `;

  if (docType === 'stem') {
    // STEM Layout
    html += `<h2>I. TỔNG QUAN CHỦ ĐỀ STEM</h2>`;
    if (content.stemTheme) html += `<p><strong>Tên chủ đề:</strong> ${content.stemTheme}</p>`;
    if (content.productDescription) html += `<p><strong>Mô tả sản phẩm:</strong> ${content.productDescription}</p>`;

    if (content.integratedSubjects) {
      html += `<h3> Kiến thức tích hợp S-T-E-M</h3><ul>`;
      html += `<li><strong>Science (Khoa học):</strong> ${content.integratedSubjects.science || ''}</li>`;
      html += `<li><strong>Technology (Công nghệ):</strong> ${content.integratedSubjects.technology || ''}</li>`;
      html += `<li><strong>Engineering (Kỹ thuật):</strong> ${content.integratedSubjects.engineering || ''}</li>`;
      html += `<li><strong>Mathematics (Toán học):</strong> ${content.integratedSubjects.mathematics || ''}</li>`;
      html += `</ul>`;
    }

    if (Array.isArray(content.designSteps) && content.designSteps.length > 0) {
      html += `<h2>II. QUY TRÌNH THIẾT KẾ & THỰC HIỆN</h2>`;
      html += `<table border="1" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="padding: 8px;">Bước</th>
            <th style="padding: 8px;">Tên bước / Thời lượng</th>
            <th style="padding: 8px;">Hướng dẫn Giáo viên</th>
            <th style="padding: 8px;">Nhiệm vụ Học sinh</th>
            <th style="padding: 8px;">Sản phẩm</th>
          </tr>
        </thead>
        <tbody>`;
      content.designSteps.forEach((step: any, idx: number) => {
        html += `
          <tr>
            <td style="padding: 8px; text-align: center;">${step.stepNumber || idx + 1}</td>
            <td style="padding: 8px;"><strong>${step.title || ''}</strong><br/><em>${step.time || ''}</em></td>
            <td style="padding: 8px;">${step.teacherGuide || ''}</td>
            <td style="padding: 8px;">${step.studentTask || ''}</td>
            <td style="padding: 8px;">${step.productOutcome || ''}</td>
          </tr>`;
      });
      html += `</tbody></table>`;
    }

    if (Array.isArray(content.assessmentRubric) && content.assessmentRubric.length > 0) {
      html += `<h2>III. BẢNG TIÊU CHÍ ĐÁNH GIÁ (RUBRIC)</h2>`;
      html += `<table border="1" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="padding: 8px;">Tiêu chí</th>
            <th style="padding: 8px;">Điểm tối đa</th>
            <th style="padding: 8px;">Mô tả mức độ đạt được</th>
          </tr>
        </thead>
        <tbody>`;
      content.assessmentRubric.forEach((rub: any) => {
        html += `
          <tr>
            <td style="padding: 8px;"><strong>${rub.criterion || ''}</strong></td>
            <td style="padding: 8px; text-align: center;">${rub.maxPoints || 10}</td>
            <td style="padding: 8px;">${rub.description || ''}</td>
          </tr>`;
      });
      html += `</tbody></table>`;
    }
  } else if (docType === 'ncbh') {
    // NCBH Layout
    html += `<h2>I. CHỦ ĐỀ VÀ MỤC TIÊU NGHIÊN CỨU BÀI HỌC</h2>`;
    if (content.researchTopic) html += `<p><strong>Chủ đề nghiên cứu:</strong> ${content.researchTopic}</p>`;
    if (Array.isArray(content.researchGoals)) {
      html += `<p><strong>Mục tiêu quan sát:</strong></p><ul>`;
      content.researchGoals.forEach((g: string) => (html += `<li>${g}</li>`));
      html += `</ul>`;
    }

    if (Array.isArray(content.teachingActivities) && content.teachingActivities.length > 0) {
      html += `<h2>II. TIẾN TRÌNH QUAN SÁT VÀ TỔ CHỨC DẠY HỌC</h2>`;
      html += `<table border="1" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="padding: 8px;">Hoạt động</th>
            <th style="padding: 8px;">Trọng tâm hành vi HS</th>
            <th style="padding: 8px;">Trọng tâm quan sát của GV</th>
            <th style="padding: 8px;">Khó khăn dự kiến & Hỗ trợ</th>
          </tr>
        </thead>
        <tbody>`;
      content.teachingActivities.forEach((act: any) => {
        html += `
          <tr>
            <td style="padding: 8px;"><strong>${act.title || ''}</strong><br/><em>${act.time || ''}</em></td>
            <td style="padding: 8px;">${act.studentActionFocus || ''}</td>
            <td style="padding: 8px;">${act.teacherObservationFocus || ''}</td>
            <td style="padding: 8px;">
              <p><strong>Khó khăn:</strong> ${act.expectedStudentDifficulties || ''}</p>
              <p><strong>Hỗ trợ:</strong> ${act.supportStrategy || ''}</p>
            </td>
          </tr>`;
      });
      html += `</tbody></table>`;
    }
  } else {
    // KHBD 5512 Standard Layout
    const objectives = content.objectives || {};
    html += `<h2>I. MỤC TIÊU BÀI HỌC</h2>`;

    if (Array.isArray(objectives.knowledge) && objectives.knowledge.length > 0) {
      html += `<h3>1. Về kiến thức</h3><ul>`;
      objectives.knowledge.forEach((k: string) => (html += `<li>${k}</li>`));
      html += `</ul>`;
    }

    if (Array.isArray(objectives.capabilities) && objectives.capabilities.length > 0) {
      html += `<h3>2. Về năng lực</h3><ul>`;
      objectives.capabilities.forEach((c: string) => (html += `<li>${c}</li>`));
      html += `</ul>`;
    }

    if (Array.isArray(objectives.qualities) && objectives.qualities.length > 0) {
      html += `<h3>3. Về phẩm chất</h3><ul>`;
      objectives.qualities.forEach((q: string) => (html += `<li>${q}</li>`));
      html += `</ul>`;
    }

    const equipment = content.teachingEquipment || {};
    html += `<h2>II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</h2>`;
    if (Array.isArray(equipment.teacher)) {
      html += `<p><strong>1. Giáo viên:</strong> ${equipment.teacher.join(', ')}</p>`;
    }
    if (Array.isArray(equipment.students)) {
      html += `<p><strong>2. Học sinh:</strong> ${equipment.students.join(', ')}</p>`;
    }

    const activities = Array.isArray(content.activities) ? content.activities : [];
    if (activities.length > 0) {
      html += `<h2>III. TIẾN TRÌNH DẠY HỌC</h2>`;
      html += `<table border="1" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="padding: 8px; width: 25%;">Hoạt động</th>
            <th style="padding: 8px; width: 20%;">Mục tiêu</th>
            <th style="padding: 8px; width: 25%;">Nội dung & Sản phẩm</th>
            <th style="padding: 8px; width: 30%;">Tổ chức thực hiện</th>
          </tr>
        </thead>
        <tbody>`;
      activities.forEach((act: any) => {
        html += `
          <tr>
            <td style="padding: 8px;"><strong>${act.title || ''}</strong><br/><em>${act.time || ''}</em></td>
            <td style="padding: 8px;">${act.objective || ''}</td>
            <td style="padding: 8px;">
              <p><strong>Nội dung:</strong> ${act.content || ''}</p>
              <p><strong>Sản phẩm:</strong> ${act.product || ''}</p>
            </td>
            <td style="padding: 8px;">${act.implementation || ''}</td>
          </tr>`;
      });
      html += `</tbody></table>`;
    }
  }

  return sanitizeHtml(html);
}
