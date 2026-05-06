import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
  confirmLabel = 'Підтвердити',
  cancelLabel = 'Скасувати',
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} id="confirm-modal">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3 className="modal__title">{title}</h3>
        </div>
        <div className="modal__body">
          <p>{message}</p>
        </div>
        <div className="modal__footer">
          <button
            className="btn btn--ghost"
            onClick={onCancel}
            disabled={isLoading}
            id="modal-cancel"
          >
            {cancelLabel}
          </button>
          <button
            className="btn btn--danger"
            onClick={onConfirm}
            disabled={isLoading}
            id="modal-confirm"
          >
            {isLoading ? '⏳ Видалення...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
