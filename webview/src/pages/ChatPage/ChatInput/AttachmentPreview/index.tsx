import type { Attachment } from '../../../../types';
import { isImageAttachment, isFileAttachment, isFolderAttachment } from '../../../../types';
import { ImagePreview } from './ImagePreview';
import { FileChip } from './FileChip';
import { FolderChip } from './FolderChip';

interface Props {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}

export function AttachmentPreview(props: Props) {
  const { attachments, onRemove } = props;

  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-3 py-2">
      {attachments.map((att) => {
        if (isImageAttachment(att)) {
          return <ImagePreview key={att.id} attachment={att} onRemove={onRemove} />;
        }
        if (isFileAttachment(att)) {
          return <FileChip key={att.id} attachment={att} onRemove={onRemove} />;
        }
        if (isFolderAttachment(att)) {
          return <FolderChip key={att.id} attachment={att} onRemove={onRemove} />;
        }
        return null;
      })}
    </div>
  );
}
