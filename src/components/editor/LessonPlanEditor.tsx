import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Placeholder } from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow as Paragraph,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table as TableIcon,
  Trash2,
  Undo,
  Redo,
  Printer,
  Sparkles,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Plus,
  Minus,
  Eye,
} from 'lucide-react';
import { DbLessonPlan } from '../../types/database';
import { lessonPlanService } from '../../services/lessonPlanService';
import { convertLessonPlanToHtml } from '../../utils/lessonPlanHtmlConverter';
import { sanitizeHtml } from '../../utils/sanitize';
import { useAuth } from '../../context/AuthContext';

export interface LessonPlanEditorProps {
  lessonPlan: DbLessonPlan;
  onPlanUpdated?: (updatedPlan: DbLessonPlan) => void;
}

export const LessonPlanEditor: React.FC<LessonPlanEditorProps> = ({ lessonPlan, onPlanUpdated }) => {
  const { user } = useAuth();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState<boolean>(false);

  // AI Selection State
  const [aiLoadingAction, setAiLoadingAction] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [customAiPrompt, setCustomAiPrompt] = useState<string>('');
  const [showCustomPromptInput, setShowCustomPromptInput] = useState<boolean>(false);

  const activeUserId = user?.id || 'usr_001';

  // Initial HTML Content
  const initialHtml = useRef<string>(convertLessonPlanToHtml(lessonPlan)).current;

  // Save content logic
  const saveContent = useCallback(
    async (htmlContent: string) => {
      setSaveStatus('saving');
      setErrorMessage(null);

      const sanitized = sanitizeHtml(htmlContent);

      try {
        const currentMeta = lessonPlan.metadata || {};
        const updateRes = await lessonPlanService.updateLessonPlan(lessonPlan.id, {
          metadata: {
            ...currentMeta,
            editor_html: sanitized,
            last_editor_saved_at: new Date().toISOString(),
          },
        });

        if (updateRes.error) {
          setSaveStatus('failed');
          setErrorMessage(updateRes.error);
        } else {
          setSaveStatus('saved');
          const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLastSavedTime(timeStr);
          if (updateRes.data && onPlanUpdated) {
            onPlanUpdated(updateRes.data);
          }
        }
      } catch (err: any) {
        setSaveStatus('failed');
        setErrorMessage(err.message || 'Lỗi kết nối khi lưu giáo án.');
      }
    },
    [lessonPlan, onPlanUpdated]
  );

  // Debounced Autosave Ref
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // TipTap Editor Initialization
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: 'Soạn thảo và tinh chỉnh giáo án tại đây...',
      }),
    ],
    content: initialHtml,
    onUpdate: ({ editor }) => {
      setSaveStatus('idle');
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
      autosaveTimerRef.current = setTimeout(() => {
        saveContent(editor.getHTML());
      }, 1500);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, ' ');
      if (text.trim().length >= 2) {
        setSelectedText(text.trim());
      } else {
        setSelectedText('');
        setShowCustomPromptInput(false);
      }
    },
  });

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, []);

  // Handle AI Rewrite Action
  const handleAiAction = async (action: string, promptInstruction?: string) => {
    if (!selectedText || !editor) return;

    setAiLoadingAction(action);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/ai/rewrite-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonPlanId: lessonPlan.id,
          selectedText,
          action,
          promptInstruction: promptInstruction || undefined,
          userId: activeUserId,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || 'Lỗi khi xử lý đoạn văn bản AI');
      }

      const rewrittenText = resData.rewrittenText;

      // Replace selected text in TipTap
      editor.chain().focus().insertContent(rewrittenText).run();

      setSelectedText('');
      setShowCustomPromptInput(false);
      setCustomAiPrompt('');

      // Trigger immediate autosave
      saveContent(editor.getHTML());
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể áp dụng AI cho đoạn văn bản này');
    } finally {
      setAiLoadingAction(null);
    }
  };

  // Manual Save Now
  const handleManualSave = () => {
    if (editor) {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      saveContent(editor.getHTML());
    }
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2 text-blue-600" /> Đang tải trình chỉnh sửa giáo án...
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[700px]">
      {/* HEADER TOOLBAR & STATUS BAR */}
      <div className="no-print border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Save Status Indicator */}
        <div className="flex items-center gap-2 text-xs font-medium">
          {saveStatus === 'saving' && (
            <span className="flex items-center text-blue-600 dark:text-blue-400 gap-1.5 animate-pulse">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang tự động lưu...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center text-emerald-600 dark:text-emerald-400 gap-1.5">
              <CheckCircle className="h-3.5 w-3.5" />
              {lastSavedTime ? `Đã lưu lúc ${lastSavedTime}` : 'Đã lưu'}
            </span>
          )}
          {saveStatus === 'failed' && (
            <span className="flex items-center text-rose-600 dark:text-rose-400 gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" /> Lưu thất bại
            </span>
          )}
          {saveStatus === 'idle' && (
            <span className="text-slate-400 dark:text-slate-500">Sẵn sàng chỉnh sửa</span>
          )}

          {errorMessage && (
            <span className="text-rose-500 text-xs ml-2 truncate max-w-[250px]" title={errorMessage}>
              ({errorMessage})
            </span>
          )}
        </div>

        {/* Action Buttons: Save Now & Print Preview */}
        <div className="flex items-center gap-2">
          {saveStatus === 'failed' && (
            <button
              onClick={handleManualSave}
              className="px-2.5 py-1 text-xs rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-300 font-medium transition"
            >
              Thử lưu lại
            </button>
          )}

          <button
            onClick={handleManualSave}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 transition"
            title="Lưu ngay lập tức"
          >
            <Save className="h-3.5 w-3.5" /> Lưu ngay
          </button>

          <button
            onClick={() => setShowPrintPreview(!showPrintPreview)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-medium transition"
          >
            <Eye className="h-3.5 w-3.5" /> {showPrintPreview ? 'Quay lại chỉnh sửa' : 'Xem trước bản in'}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition"
          >
            <Printer className="h-3.5 w-3.5" /> In giáo án
          </button>
        </div>
      </div>

      {/* TIPTAP FORMATTING TOOLBAR */}
      {!showPrintPreview && (
        <div className="no-print border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 flex flex-wrap items-center gap-1 overflow-x-auto text-slate-700 dark:text-slate-300">
          {/* Headings */}
          <div className="flex items-center border-r border-slate-200 dark:border-slate-800 pr-1 mr-1 gap-0.5">
            <button
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={`p-1.5 rounded-lg text-xs font-medium transition ${
                editor.isActive('paragraph') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Văn bản thường"
            >
              <Paragraph className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-1.5 rounded-lg text-xs font-medium transition ${
                editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Tiêu đề 1 (H1)"
            >
              <Heading1 className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-1.5 rounded-lg text-xs font-medium transition ${
                editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Tiêu đề 2 (H2)"
            >
              <Heading2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-1.5 rounded-lg text-xs font-medium transition ${
                editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Tiêu đề 3 (H3)"
            >
              <Heading3 className="h-4 w-4" />
            </button>
          </div>

          {/* Inline styles */}
          <div className="flex items-center border-r border-slate-200 dark:border-slate-800 pr-1 mr-1 gap-0.5">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1.5 rounded-lg transition ${
                editor.isActive('bold') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="In đậm (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1.5 rounded-lg transition ${
                editor.isActive('italic') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="In nghiêng (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-1.5 rounded-lg transition ${
                editor.isActive('underline') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Gạch chân (Ctrl+U)"
            >
              <UnderlineIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center border-r border-slate-200 dark:border-slate-800 pr-1 mr-1 gap-0.5">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-1.5 rounded-lg transition ${
                editor.isActive('bulletList') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Danh sách dấu chấm"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-1.5 rounded-lg transition ${
                editor.isActive('orderedList') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Danh sách số"
            >
              <ListOrdered className="h-4 w-4" />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center border-r border-slate-200 dark:border-slate-800 pr-1 mr-1 gap-0.5">
            <button
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`p-1.5 rounded-lg transition ${
                editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Căn trái"
            >
              <AlignLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`p-1.5 rounded-lg transition ${
                editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Căn giữa"
            >
              <AlignCenter className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`p-1.5 rounded-lg transition ${
                editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Căn phải"
            >
              <AlignRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={`p-1.5 rounded-lg transition ${
                editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Căn đều 2 bên"
            >
              <AlignJustify className="h-4 w-4" />
            </button>
          </div>

          {/* Table Controls */}
          <div className="flex items-center border-r border-slate-200 dark:border-slate-800 pr-1 mr-1 gap-0.5">
            <button
              onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Chèn bảng 3x3"
            >
              <TableIcon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            </button>
            {editor.isActive('table') && (
              <>
                <button
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                  className="px-2 py-1 text-[11px] rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-medium"
                  title="Thêm hàng dưới"
                >
                  +Hàng
                </button>
                <button
                  onClick={() => editor.chain().focus().deleteRow().run()}
                  className="px-2 py-1 text-[11px] rounded bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 font-medium"
                  title="Xóa hàng"
                >
                  -Hàng
                </button>
                <button
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                  className="px-2 py-1 text-[11px] rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-medium"
                  title="Thêm cột bên phải"
                >
                  +Cột
                </button>
                <button
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                  className="px-2 py-1 text-[11px] rounded bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 font-medium"
                  title="Xóa cột"
                >
                  -Cột
                </button>
                <button
                  onClick={() => editor.chain().focus().deleteTable().run()}
                  className="p-1.5 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Xóa bảng"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 ml-auto">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition"
              title="Hoàn tác (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition"
              title="Làm lại (Ctrl+Y)"
            >
              <Redo className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* AI SELECTION FLOATING MENU */}
      {!showPrintPreview && selectedText && (
        <div className="no-print bg-slate-900 text-white dark:bg-slate-800 p-2.5 shadow-xl border border-slate-700 rounded-xl m-3 flex flex-col gap-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1.5">
            <span className="text-xs font-semibold flex items-center gap-1.5 text-blue-400">
              <Sparkles className="h-3.5 w-3.5" />
              AI Assistant menu cho đoạn được chọn ({selectedText.length} ký tự)
            </span>
            <button
              onClick={() => setSelectedText('')}
              className="text-slate-400 hover:text-white p-0.5 rounded"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Quick AI Actions */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handleAiAction('rewrite')}
              disabled={Boolean(aiLoadingAction)}
              className="px-2.5 py-1 text-xs rounded-lg bg-blue-600 hover:bg-blue-500 font-medium transition flex items-center gap-1 disabled:opacity-50"
            >
              {aiLoadingAction === 'rewrite' ? <Loader2 className="h-3 w-3 animate-spin" /> : '✏️'} Viết lại
            </button>
            <button
              onClick={() => handleAiAction('shorten')}
              disabled={Boolean(aiLoadingAction)}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-700 hover:bg-slate-600 font-medium transition flex items-center gap-1 disabled:opacity-50"
            >
              {aiLoadingAction === 'shorten' ? <Loader2 className="h-3 w-3 animate-spin" /> : '✂️'} Rút gọn
            </button>
            <button
              onClick={() => handleAiAction('expand')}
              disabled={Boolean(aiLoadingAction)}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-700 hover:bg-slate-600 font-medium transition flex items-center gap-1 disabled:opacity-50"
            >
              {aiLoadingAction === 'expand' ? <Loader2 className="h-3 w-3 animate-spin" /> : '➕'} Mở rộng
            </button>
            <button
              onClick={() => handleAiAction('add_examples')}
              disabled={Boolean(aiLoadingAction)}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-700 hover:bg-slate-600 font-medium transition flex items-center gap-1 disabled:opacity-50"
            >
              {aiLoadingAction === 'add_examples' ? <Loader2 className="h-3 w-3 animate-spin" /> : '💡'} Thêm ví dụ
            </button>
            <button
              onClick={() => handleAiAction('add_questions')}
              disabled={Boolean(aiLoadingAction)}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-700 hover:bg-slate-600 font-medium transition flex items-center gap-1 disabled:opacity-50"
            >
              {aiLoadingAction === 'add_questions' ? <Loader2 className="h-3 w-3 animate-spin" /> : '❓'} Thêm câu hỏi
            </button>
            <button
              onClick={() => handleAiAction('differentiate')}
              disabled={Boolean(aiLoadingAction)}
              className="px-2.5 py-1 text-xs rounded-lg bg-emerald-700 hover:bg-emerald-600 font-medium transition flex items-center gap-1 disabled:opacity-50"
            >
              {aiLoadingAction === 'differentiate' ? <Loader2 className="h-3 w-3 animate-spin" /> : '🎯'} Phân hóa
            </button>
            <button
              onClick={() => handleAiAction('create_rubric')}
              disabled={Boolean(aiLoadingAction)}
              className="px-2.5 py-1 text-xs rounded-lg bg-amber-700 hover:bg-amber-600 font-medium transition flex items-center gap-1 disabled:opacity-50"
            >
              {aiLoadingAction === 'create_rubric' ? <Loader2 className="h-3 w-3 animate-spin" /> : '📊'} Tạo Rubric
            </button>
            <button
              onClick={() => handleAiAction('create_worksheet')}
              disabled={Boolean(aiLoadingAction)}
              className="px-2.5 py-1 text-xs rounded-lg bg-indigo-700 hover:bg-indigo-600 font-medium transition flex items-center gap-1 disabled:opacity-50"
            >
              {aiLoadingAction === 'create_worksheet' ? <Loader2 className="h-3 w-3 animate-spin" /> : '📝'} Tạo phiếu học tập
            </button>
            <button
              onClick={() => setShowCustomPromptInput(!showCustomPromptInput)}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 font-medium text-slate-300 transition"
            >
              Lệnh tùy chỉnh...
            </button>
          </div>

          {/* Custom Prompt Input */}
          {showCustomPromptInput && (
            <div className="flex gap-2 pt-1 border-t border-slate-700">
              <input
                type="text"
                value={customAiPrompt}
                onChange={(e) => setCustomAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAiAction('rewrite', customAiPrompt);
                }}
                placeholder="Nhập yêu cầu tùy chỉnh cho đoạn này (ví dụ: Chuyển thành dạng bảng, thêm thơ minh họa)..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => handleAiAction('rewrite', customAiPrompt)}
                disabled={!customAiPrompt.trim() || Boolean(aiLoadingAction)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-lg transition disabled:opacity-50"
              >
                Gửi yêu cầu
              </button>
            </div>
          )}
        </div>
      )}

      {/* EDITOR CONTENT CANVAS OR PRINT PREVIEW */}
      <div className={`flex-1 p-6 sm:p-10 ${showPrintPreview ? 'bg-white text-black max-w-4xl mx-auto w-full shadow-lg border my-6 rounded-none' : ''}`}>
        <EditorContent editor={editor} className="prose dark:prose-invert max-w-none focus:outline-none" />
      </div>
    </div>
  );
};
