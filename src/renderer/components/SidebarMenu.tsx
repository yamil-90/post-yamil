import React from 'react';

interface SidebarMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onMyRequestsClick: () => void;
  onHistoryClick: () => void;
  activePanel: 'none' | 'my-requests' | 'history';
  onPanelClose: () => void;
}

export const SidebarMenu = ({
  isOpen,
  onToggle,
  onMyRequestsClick,
  onHistoryClick,
  activePanel,
  onPanelClose,
}: SidebarMenuProps) => {
  return (
    <>
      {/* Hamburger Button */}
      <button
        className="hamburger-btn"
        onClick={onToggle}
        title="Toggle menu"
      >
        ☰
      </button>

      {/* Menu Panel */}
      {isOpen && (
        <div className="menu-panel">
          <button
            className={`menu-panel-btn ${activePanel === 'my-requests' ? 'active' : ''}`}
            onClick={onMyRequestsClick}
          >
            My Requests
          </button>
          <button
            className={`menu-panel-btn ${activePanel === 'history' ? 'active' : ''}`}
            onClick={onHistoryClick}
          >
            History
          </button>
        </div>
      )}

      {/* Content Panel Overlay */}
      {activePanel !== 'none' && (
        <div
          className="content-panel-overlay"
          onClick={onPanelClose}
        ></div>
      )}
    </>
  );
};
