import React from 'react';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export const CreateWorkspaceModal = ({
  isOpen,
  onClose,
  onCreate,
}: CreateWorkspaceModalProps) => {
  const [workspaceName, setWorkspaceName] = React.useState('');

  const handleCreate = () => {
    if (workspaceName.trim()) {
      onCreate(workspaceName);
      setWorkspaceName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreate();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Create New Workspace</h2>
          <button
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <input
            type="text"
            placeholder="Workspace name"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div className="modal-footer">
          <button
            onClick={onClose}
            className="modal-btn cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="modal-btn primary"
            disabled={!workspaceName.trim()}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};
