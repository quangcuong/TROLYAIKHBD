export const MAX_FILE_SIZE_MB = 25;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
export const DISALLOWED_EXTENSIONS = ['.docm', '.doc', '.exe', '.zip', '.rar', '.js', '.bat'];

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const DISALLOWED_MIME_TYPES = [
  'application/vnd.ms-word.document.macroEnabled.12', // DOCM
  'application/msword', // Old DOC
];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Normalizes filename by removing Vietnamese diacritics, special characters, and spaces
 */
export function normalizeFileName(originalName: string): string {
  if (!originalName) return 'unnamed_file';

  const lastDotIndex = originalName.lastIndexOf('.');
  let namePart = lastDotIndex !== -1 ? originalName.slice(0, lastDotIndex) : originalName;
  let extPart = lastDotIndex !== -1 ? originalName.slice(lastDotIndex).toLowerCase() : '';

  // Remove Vietnamese accents / diacritics
  namePart = namePart
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');

  // Replace special characters and spaces with underscores
  namePart = namePart.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');

  // Trim leading/trailing underscores
  namePart = namePart.replace(/^_+|_+$/g, '');

  if (!namePart) namePart = 'file';

  return `${namePart}${extPart}`;
}

/**
 * Validates a file object based on size, extension, and MIME type
 */
export function validateFile(file: { name: string; size: number; type?: string }): FileValidationResult {
  if (!file || !file.name) {
    return { valid: false, error: 'File không hợp lệ hoặc thiếu tên file' };
  }

  const lowerName = file.name.toLowerCase();

  // Explicit check for DOCM
  if (lowerName.endsWith('.docm') || lowerName.includes('.docm')) {
    return { valid: false, error: 'Hệ thống KHÔNG chấp nhận file Word chứa Macro (.docm)' };
  }

  // Check extension
  const hasAllowedExt = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  if (!hasAllowedExt) {
    return {
      valid: false,
      error: `Định dạng file không hỗ trợ. Chỉ chấp nhận các file có đuôi ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  // Check MIME type if available
  if (file.type) {
    if (DISALLOWED_MIME_TYPES.includes(file.type)) {
      return { valid: false, error: 'Loại MIME type của file bị từ chối (Chứa macro hoặc không an toàn)' };
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type) && !file.type.includes('octet-stream')) {
      return {
        valid: false,
        error: `MIME type không hợp lệ: ${file.type}. Chỉ chấp nhận PDF hoặc DOCX`,
      };
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Dung lượng file vượt quá giới hạn tối đa ${MAX_FILE_SIZE_MB}MB (${(
        file.size /
        (1024 * 1024)
      ).toFixed(2)}MB)`,
    };
  }

  return { valid: true };
}

/**
 * Checks file ownership and authorization
 */
export function checkFileOwnership(
  resourceUserId: string | null | undefined,
  currentUserId: string | null | undefined,
  isAdmin: boolean = false
): boolean {
  if (isAdmin) return true;
  if (!resourceUserId || !currentUserId) return false;
  return resourceUserId === currentUserId;
}
