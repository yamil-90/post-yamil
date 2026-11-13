import React from 'react';
import { RequestHistory } from '../services/workspaceService';

interface HistoryPanelProps {
  isOpen: boolean;
  history: RequestHistory[];
  onRequestClick: (request: RequestHistory) => void;
  onClose: () => void;
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // Less than 1 hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}m ago`;
  }

  // Less than 1 day
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}h ago`;
  }

  // Otherwise show date
  return date.toLocaleDateString();
};

const getStatusColor = (status: number): string => {
  if (status >= 200 && status < 300) return '#28a745';
  if (status >= 300 && status < 400) return '#ffc107';
  if (status >= 400) return '#dc3545';
  return '#6c757d';
};

export const HistoryPanel = ({
  isOpen,
  history,
  onRequestClick,
  onClose,
}: HistoryPanelProps) => {
  if (!isOpen) return null;

  return (
    <div className="content-panel">
      <div className="panel-header">
        <h3>History</h3>
        <button
          className="panel-close-btn"
          onClick={onClose}
          title="Close panel"
        >
          ×
        </button>
      </div>
      <div className="panel-content">
        {history.length === 0 ? (
          <p className="empty-message">No requests yet</p>
        ) : (
          <div className="history-list">
            {[...history].reverse().map((entry) => (
              <div
                key={entry.id}
                className="history-item"
                onClick={() => onRequestClick(entry)}
              >
                <div className="history-method" style={{ color: '#666' }}>
                  {entry.method}
                </div>
                {/* change so that the url gets cut off if too long... add a tooltip with the whole url? */}
                <div className="history-url" data-title={entry.url}>
                  {entry.url.length > 200 ? entry.url.substring(0, 200) + '...' : entry.url}
                </div>
                <div className="history-meta">
                  <span
                    className="history-status"
                    style={{ color: getStatusColor(entry.status) }}
                  >
                    {entry.status}
                  </span>
                  <span className="history-time">{formatDate(entry.timestamp)}</span>
                  {entry.count > 1 && (
                    <span className="history-count">({entry.count})</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
