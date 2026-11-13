import React, { useState } from 'react';
import { Workspace } from '../services/workspaceService';

interface WorkspacesPanelProps {
  isOpen: boolean;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onWorkspaceSelect: (workspaceId: string) => void;
  onCreateWorkspace: () => void;
  onDeleteWorkspace: (workspaceId: string) => void;
  onUpdateWorkspaceName: (workspaceId: string, name: string) => void;
  onClose: () => void;
}

export const WorkspacesPanel = ({
  isOpen,
  workspaces,
  activeWorkspaceId,
  onWorkspaceSelect,
  onCreateWorkspace,
  onDeleteWorkspace,
  onUpdateWorkspaceName,
  onClose,
}: WorkspacesPanelProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const startEdit = (workspace: Workspace) => {
    setEditingId(workspace.id);
    setEditingName(workspace.name);
  };

  const saveEdit = (workspaceId: string) => {
    if (editingName.trim()) {
      onUpdateWorkspaceName(workspaceId, editingName);
    }
    setEditingId(null);
    setEditingName('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  if (!isOpen) return null;

  return (
    <div className="content-panel">
      <div className="panel-header">
        <h3>Workspaces</h3>
        <button
          className="panel-close-btn"
          onClick={onClose}
          title="Close panel"
        >
          ×
        </button>
      </div>
      <div className="panel-content">
        {workspaces.length === 0 ? (
          <p className="empty-message">No workspaces yet</p>
        ) : (
          <div className="workspaces-list">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className={`workspace-item ${workspace.id === activeWorkspaceId ? 'active' : ''}`}
              >
                {editingId === workspace.id ? (
                  <div className="workspace-edit-mode">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(workspace.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      autoFocus
                      className="workspace-edit-input"
                    />
                    <button
                      className="workspace-edit-btn confirm"
                      onClick={() => saveEdit(workspace.id)}
                      title="Save"
                    >
                      ✓
                    </button>
                    <button
                      className="workspace-edit-btn cancel"
                      onClick={cancelEdit}
                      title="Cancel"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      className="workspace-item-content"
                      onClick={() => {
                        if (workspace.id !== activeWorkspaceId) {
                          onWorkspaceSelect(workspace.id);
                        }
                      }}
                    >
                      <div className="workspace-name">{workspace.name}</div>
                      <div className="workspace-meta">
                        <span className="workspace-info">
                          {workspace.savedRequests.length} requests
                        </span>
                        <span className="workspace-info">
                          {Object.keys(workspace.localVariables).length} envs
                        </span>
                      </div>
                    </div>
                    <div className="workspace-actions">
                      <button
                        className="workspace-action-btn edit"
                        onClick={() => startEdit(workspace)}
                        title="Edit name"
                      >
                        ✎
                      </button>
                      {workspace.id !== activeWorkspaceId && (
                        <button
                          className="workspace-action-btn delete"
                          onClick={() => onDeleteWorkspace(workspace.id)}
                          title="Delete workspace"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        <button
          className="workspace-create-btn"
          onClick={onCreateWorkspace}
        >
          + New Workspace
        </button>
      </div>
    </div>
  );
};
