import { useEffect } from 'react';
import { Portal } from '../Portal';

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog(props: Props) {
  const {
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'default',
    onConfirm,
    onCancel,
  } = props;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const confirmButtonClass =
    variant === 'danger'
      ? 'px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-colors'
      : 'px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors';

  return (
    <Portal>
      <div
        data-testid="confirm-dialog-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        onClick={handleBackdropClick}
      >
        <div
          role="dialog"
          className="bg-zinc-900 border border-white/10 rounded-xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4"
        >
          <h2 className="text-md font-semibold text-zinc-100">{title}</h2>
          <p className="text-sm text-zinc-400">{message}</p>
          <div className="flex justify-end gap-2 mt-2">
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-colors"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
            <button
              className={confirmButtonClass}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
