import { useState } from 'react';
import type { Attachment } from '../../types';

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}

export function AttachmentPreview({ attachments, onRemove }: AttachmentPreviewProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-3 py-2">
      {attachments.map((att) => (
        <div key={att.id} className="relative group">
          <div className="w-16 h-16 rounded-md overflow-hidden border border-zinc-700 bg-zinc-800/50">
            <img
              src={`data:${att.mimeType};base64,${att.base64}`}
              alt={att.fileName}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setSelectedImage(`data:${att.mimeType};base64,${att.base64}`)}
            />
          </div>
          <button
            type="button"
            onClick={() => onRemove(att.id)}
            className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center rounded-full bg-zinc-700 hover:bg-red-500 text-zinc-300 text-[10px] transition-colors opacity-0 group-hover:opacity-100"
          >
            ×
          </button>
          <div className="text-[10px] text-zinc-500 truncate max-w-[64px] mt-0.5 text-center">
            {att.fileName}
          </div>
        </div>
      ))}

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute -top-3.5 -right-3.5 w-7 h-7 flex items-center justify-center rounded-full bg-zinc-800/20 hover:bg-zinc-700/70 border border-zinc-700 text-zinc-200 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
