import { useState, useCallback, useMemo } from 'react';
import { Attachment, ImageAttachment, FileAttachment, FolderAttachment, ATTACHMENT_LIMITS } from '../../../types';

export interface UseAttachmentsReturn {
  attachments: Attachment[];
  addImageAttachment: (file: File) => Promise<void>;
  addFileAttachment: (absolutePath: string, fileName: string, size?: number) => void;
  addFolderAttachment: (absolutePath: string, folderName: string) => void;
  removeAttachment: (id: string) => void;
  clearAttachments: () => void;
  error: string | null;
  isDragOver: boolean;
  setIsDragOver: (v: boolean) => void;
}

export function useAttachments(): UseAttachmentsReturn {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const addImageAttachment = useCallback(async (file: File) => {
    // Clear previous error
    setError(null);

    // Validate MIME type
    if (!ATTACHMENT_LIMITS.ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ATTACHMENT_LIMITS.ALLOWED_IMAGE_MIME_TYPES)[number])) {
      setError(`지원하지 않는 파일 형식입니다: ${file.type || '알 수 없음'}`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Validate file size
    if (file.size > ATTACHMENT_LIMITS.MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setError(`파일 크기가 너무 큽니다: ${sizeMB}MB (최대 10MB)`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Read file as base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        // Strip "data:image/png;base64," prefix
        const base64Data = dataUrl.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    const attachment = new ImageAttachment({
      fileName: file.name || 'image.png',
      mimeType: file.type,
      base64,
      size: file.size,
    });

    setAttachments((prev) => [...prev, attachment]);
  }, []);

  const addFileAttachment = useCallback((absolutePath: string, fileName: string, size?: number) => {
    const attachment = new FileAttachment({ fileName, absolutePath, size });
    setAttachments((prev) => [...prev, attachment]);
  }, []);

  const addFolderAttachment = useCallback((absolutePath: string, folderName: string) => {
    const attachment = new FolderAttachment({ folderName, absolutePath });
    setAttachments((prev) => [...prev, attachment]);
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachments([]);
    setError(null);
  }, []);

  return useMemo(() => ({
    attachments,
    addImageAttachment,
    addFileAttachment,
    addFolderAttachment,
    removeAttachment,
    clearAttachments,
    error,
    isDragOver,
    setIsDragOver,
  }), [attachments, addImageAttachment, addFileAttachment, addFolderAttachment, removeAttachment, clearAttachments, error, isDragOver, setIsDragOver]);
}
