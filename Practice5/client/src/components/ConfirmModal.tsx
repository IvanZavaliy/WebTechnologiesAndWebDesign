import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  confirmLabel?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
  confirmLabel = 'Підтвердити',
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" id="confirm-modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} id="confirm-modal">
        <h3 className="modal__title">{title}</h3>
        <p className="modal__message">{message}</p>
        <div className="modal__actions">
          <button
            className="btn btn--ghost"
            onClick={onCancel}
            disabled={isLoading}
            id="modal-cancel-btn"
          >
            Скасувати
          </button>
          <button
            className="btn btn--danger"
            onClick={onConfirm}
            disabled={isLoading}
            id="modal-confirm-btn"
          >
            {isLoading ? 'Видалення...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
