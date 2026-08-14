import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  AlignmentType,
  WidthType,
  BorderStyle,
  HeadingLevel,
  HeightRule,
  ShadingType,
  VerticalAlign,
} from 'docx';
import PDFDocument from 'pdfkit';
import { DbLessonPlan } from '../types/database';
import { convertLessonPlanToHtml } from '../utils/lessonPlanHtmlConverter';
import { normalizeExportFilename, stripHtmlTags } from '../utils/exportUtils';

export class ExportService {
  /**
   * Generates a native DOCX document buffer matching GDPT 2018 standard styling.
   */
  async generateDocx(lessonPlan: DbLessonPlan): Promise<{ buffer: Buffer; filename: string }> {
    const filename = normalizeExportFilename(lessonPlan.title, 'docx', lessonPlan.subject);
    const rawHtml = lessonPlan.metadata?.editor_html || convertLessonPlanToHtml(lessonPlan);

    const docChildren = this.parseHtmlToDocxElements(rawHtml, lessonPlan);

    // Signature Block at the end
    const signatureTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 33, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: 'TỔ TRƯỞNG CHUYÊN MÔN', bold: true, font: 'Times New Roman', size: 24 }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: '(Ký và ghi rõ họ tên)', italics: true, font: 'Times New Roman', size: 22 }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 34, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: 'GIÁO VIÊN BÁO CÁO', bold: true, font: 'Times New Roman', size: 24 }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: '(Ký và ghi rõ họ tên)', italics: true, font: 'Times New Roman', size: 22 }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 33, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: 'BAN GIÁM HIỆU DUYỆT', bold: true, font: 'Times New Roman', size: 24 }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: '(Ký tên và đóng dấu)', italics: true, font: 'Times New Roman', size: 22 }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                width: 11906, // A4 Width in twips (8.27 inch)
                height: 16838, // A4 Height in twips (11.69 inch)
              },
              margin: {
                top: 1134, // 20mm
                bottom: 1134, // 20mm
                left: 1701, // 30mm
                right: 1134, // 20mm
              },
            },
          },
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: `GIÁO ÁN CHUẨN GDPT 2018 — ${lessonPlan.subject || 'MÔN HỌC'}`,
                      font: 'Times New Roman',
                      size: 18,
                      italics: true,
                      color: '64748B',
                    }),
                  ],
                }),
              ],
            }),
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: 'Trang ', font: 'Times New Roman', size: 18, italics: true }),
                    new TextRun({ children: [PageNumber.CURRENT], font: 'Times New Roman', size: 18, italics: true }),
                    new TextRun({ text: ' / ', font: 'Times New Roman', size: 18, italics: true }),
                    new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Times New Roman', size: 18, italics: true }),
                  ],
                }),
              ],
            }),
          },
          children: [
            ...docChildren,
            new Paragraph({ spacing: { before: 400, after: 200 } }),
            signatureTable,
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    return { buffer, filename };
  }

  /**
   * Generates a PDF document buffer matching A4 layout constraints.
   */
  async generatePdf(lessonPlan: DbLessonPlan): Promise<{ buffer: Buffer; filename: string }> {
    const filename = normalizeExportFilename(lessonPlan.title, 'pdf', lessonPlan.subject);
    const rawHtml = lessonPlan.metadata?.editor_html || convertLessonPlanToHtml(lessonPlan);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 56.7, bottom: 56.7, left: 85, right: 56.7 }, // 20mm/30mm
          bufferPages: true,
        });

        const buffers: Buffer[] = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve({ buffer: pdfBuffer, filename });
        });

        // Document Title Header
        doc.fontSize(16).text(lessonPlan.title || 'KẾ HOẠCH BÀI DẠY', { align: 'center', lineGap: 4 });
        doc
          .fontSize(10)
          .text(
            `Môn: ${lessonPlan.subject || ''} | Khối: ${lessonPlan.grade || ''} | Bộ sách: ${lessonPlan.textbook || ''} | Thời lượng: ${lessonPlan.duration || ''}`,
            { align: 'center', lineGap: 10 }
          );

        doc.moveTo(85, doc.y).lineTo(538, doc.y).strokeColor('#cbd5e1').stroke();
        doc.moveDown(1);

        // Convert HTML content into readable PDF lines & blocks
        const plainTextLines = stripHtmlTags(rawHtml).split('\n');

        doc.fontSize(11);
        plainTextLines.forEach((line) => {
          const trimmed = line.trim();
          if (!trimmed) {
            doc.moveDown(0.3);
            return;
          }

          if (trimmed.startsWith('I.') || trimmed.startsWith('II.') || trimmed.startsWith('III.')) {
            doc.moveDown(0.5);
            doc.fontSize(13).text(trimmed, { underline: false });
            doc.fontSize(11);
          } else if (trimmed.match(/^[1-9]\./)) {
            doc.moveDown(0.3);
            doc.fontSize(12).text(trimmed);
            doc.fontSize(11);
          } else {
            doc.text(trimmed, { align: 'justify', lineGap: 3 });
          }
        });

        // Add Signatures Block at bottom
        doc.moveDown(2);
        const ySign = doc.y;
        if (ySign > 720) {
          doc.addPage();
        }

        const colWidth = 150;
        doc.fontSize(10).text('TỔ TRƯỞNG CHUYÊN MÔN', 85, doc.y, { width: colWidth, align: 'center' });
        doc.text('GIÁO VIÊN BÁO CÁO', 235, doc.y - 12, { width: colWidth, align: 'center' });
        doc.text('BAN GIÁM HIỆU DUYỆT', 385, doc.y - 12, { width: colWidth, align: 'center' });

        doc.moveDown(0.5);
        const ySub = doc.y;
        doc.fontSize(9).text('(Ký và ghi rõ họ tên)', 85, ySub, { width: colWidth, align: 'center' });
        doc.text('(Ký và ghi rõ họ tên)', 235, ySub, { width: colWidth, align: 'center' });
        doc.text('(Ký tên và đóng dấu)', 385, ySub, { width: colWidth, align: 'center' });

        // Add Footers with page numbers
        const range = doc.bufferedPageRange();
        for (let i = range.start; i < range.start + range.count; i++) {
          doc.switchToPage(i);
          doc.fontSize(8).text(`Trang ${i + 1} / ${range.count}`, 85, 800, {
            align: 'center',
            width: 450,
          });
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Internal parser to transform HTML blocks into DOCX Paragraphs and Tables.
   */
  private parseHtmlToDocxElements(html: string, lessonPlan: DbLessonPlan): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];

    // Check if HTML has table elements
    const tableRegex = /<table[\s\S]*?<\/table>/gi;
    const blocks = html.split(tableRegex);
    const matches = html.match(tableRegex) || [];

    let matchIdx = 0;
    for (let i = 0; i < blocks.length; i++) {
      const textBlock = blocks[i];
      if (textBlock.trim()) {
        const lines = stripHtmlTags(textBlock).split('\n');
        lines.forEach((line) => {
          const trimmed = line.trim();
          if (!trimmed) return;

          if (trimmed.startsWith('I.') || trimmed.startsWith('II.') || trimmed.startsWith('III.')) {
            elements.push(
              new Paragraph({
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 240, after: 120 },
                children: [
                  new TextRun({
                    text: trimmed,
                    bold: true,
                    size: 28, // 14pt
                    font: 'Times New Roman',
                    color: '1E293B',
                  }),
                ],
              })
            );
          } else if (trimmed.match(/^[1-9]\./)) {
            elements.push(
              new Paragraph({
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 180, after: 80 },
                children: [
                  new TextRun({
                    text: trimmed,
                    bold: true,
                    size: 26, // 13pt
                    font: 'Times New Roman',
                    color: '334155',
                  }),
                ],
              })
            );
          } else {
            elements.push(
              new Paragraph({
                spacing: { before: 60, after: 60, line: 276 }, // 1.15 line spacing
                children: [
                  new TextRun({
                    text: trimmed,
                    size: 26, // 13pt
                    font: 'Times New Roman',
                  }),
                ],
              })
            );
          }
        });
      }

      if (matches[matchIdx]) {
        const tableHtml = matches[matchIdx];
        elements.push(this.parseHtmlTableToDocxTable(tableHtml));
        matchIdx++;
      }
    }

    return elements;
  }

  /**
   * Helper to parse <table> HTML fragment into a docx Table object with borders and padding.
   */
  private parseHtmlTableToDocxTable(tableHtml: string): Table {
    const trRegex = /<tr[\s\S]*?<\/tr>/gi;
    const trMatches = tableHtml.match(trRegex) || [];

    const tableRows: TableRow[] = [];

    trMatches.forEach((trHtml, rowIndex) => {
      const cellRegex = /<(?:td|th)[\s\S]*?<\/(?:td|th)>/gi;
      const cellMatches = trHtml.match(cellRegex) || [];

      const isHeaderRow = rowIndex === 0 || trHtml.includes('<th');

      const cells: TableCell[] = cellMatches.map((cellHtml) => {
        const text = stripHtmlTags(cellHtml);
        const isTh = cellHtml.startsWith('<th');

        return new TableCell({
          shading: isHeaderRow || isTh ? { fill: 'F1F5F9', type: ShadingType.CLEAR } : undefined,
          children: [
            new Paragraph({
              alignment: isHeaderRow || isTh ? AlignmentType.CENTER : AlignmentType.LEFT,
              spacing: { before: 80, after: 80 },
              children: [
                new TextRun({
                  text,
                  bold: isHeaderRow || isTh,
                  size: 24, // 12pt in table
                  font: 'Times New Roman',
                }),
              ],
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 120, bottom: 120, left: 150, right: 150 },
        });
      });

      if (cells.length > 0) {
        tableRows.push(
          new TableRow({
            children: cells,
            tableHeader: isHeaderRow,
          })
        );
      }
    });

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
        left: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
        right: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
        insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
      },
      rows: tableRows.length > 0 ? tableRows : [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: '', font: 'Times New Roman' })] })],
            }),
          ],
        }),
      ],
    });
  }
}

export const exportService = new ExportService();
