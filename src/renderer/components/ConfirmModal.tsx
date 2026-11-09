import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDangerous = false,
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button
            className="modal-close"
            onClick={onCancel}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <p style={{ marginTop: 0 }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button
            onClick={onCancel}
            className="modal-btn cancel"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`modal-btn ${isDangerous ? 'danger' : 'primary'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
