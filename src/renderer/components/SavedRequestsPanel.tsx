import React, { useState } from 'react';
import { SavedRequest, RequestGroup } from '../services/workspaceService';

interface SavedRequestsPanelProps {
  isOpen: boolean;
  savedRequests: SavedRequest[];
  requestGroups: RequestGroup[];
  onRequestClick: (request: SavedRequest) => void;
  onEditClick: (request: SavedRequest) => void;
  onDeleteClick: (request: SavedRequest) => void;
  onClose: () => void;
}

export const SavedRequestsPanel = ({
  isOpen,
  savedRequests,
  requestGroups,
  onRequestClick,
  onEditClick,
  onDeleteClick,
  onClose,
}: SavedRequestsPanelProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  if (!isOpen) return null;

  // Group requests
  const grouped: Record<string, SavedRequest[]> = {};
  const ungrouped: SavedRequest[] = [];

  savedRequests.forEach(req => {
    if (req.groupId) {
      if (!grouped[req.groupId]) {
        grouped[req.groupId] = [];
      }
      grouped[req.groupId].push(req);
    } else {
      ungrouped.push(req);
    }
  });

  return (
    <div className="content-panel">
      <div className="panel-header">
        <h3>My Requests</h3>
        <button
          className="panel-close-btn"
          onClick={onClose}
          title="Close panel"
        >
          ×
        </button>
      </div>
      <div className="panel-content">
        {savedRequests.length === 0 ? (
          <p className="empty-message">No saved requests yet</p>
        ) : (
          <div className="saved-requests-list">
            {/* Ungrouped Requests */}
            {ungrouped.length > 0 && (
              <div className="requests-section">
                {ungrouped.map(req => (
                  <div key={req.id} className="saved-request-item">
                    <div
                      className="request-item-content"
                      onClick={() => onRequestClick(req)}
                    >
                      <div className="request-method">{req.method}</div>
                      <div className="request-name">{req.name}</div>
                      <div className="request-url">{req.url}</div>
                    </div>
                    <div className="request-item-actions">
                      <button
                        className="request-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditClick(req);
                        }}
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button
                        className="request-action-btn delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClick(req);
                        }}
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Grouped Requests */}
            {requestGroups.map(group => (
              <div key={group.id} className="group-section">
                <div
                  className="group-header"
                  onClick={() => toggleGroup(group.id)}
                >
                  <span className="group-toggle">
                    {expandedGroups.has(group.id) ? '▼' : '▶'}
                  </span>
                  <span className="group-name">{group.name}</span>
                </div>
                {expandedGroups.has(group.id) && (
                  <div className="group-requests">
                    {grouped[group.id]?.map(req => (
                      <div key={req.id} className="saved-request-item">
                        <div
                          className="request-item-content"
                          onClick={() => onRequestClick(req)}
                        >
                          <div className="request-method">{req.method}</div>
                          <div className="request-name">{req.name}</div>
                          <div className="request-url">{req.url}</div>
                        </div>
                        <div className="request-item-actions">
                          <button
                            className="request-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditClick(req);
                            }}
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button
                            className="request-action-btn delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteClick(req);
                            }}
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
