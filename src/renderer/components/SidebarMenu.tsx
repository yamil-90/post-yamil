import React, { useRef, useEffect } from 'react';

interface SidebarMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onMyRequestsClick: () => void;
  onHistoryClick: () => void;
  onWorkspacesClick: () => void;
  onEnvironmentsClick: () => void;
  activePanel: 'none' | 'my-requests' | 'history' | 'workspaces' | 'environments';
  onPanelClose: () => void;
}

export const SidebarMenu = ({
  isOpen,
  onToggle,
  onMyRequestsClick,
  onHistoryClick,
  onWorkspacesClick,
  onEnvironmentsClick,
  activePanel,
  onPanelClose,
}: SidebarMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Close menu if clicking outside both menu and button
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  return (
    <>
      {/* Hamburger Button */}
      <button
        ref={buttonRef}
        className="hamburger-btn"
        onClick={onToggle}
        title="Toggle menu"
      >
        ☰
      </button>

      {/* Menu Panel */}
      {isOpen && (
        <div ref={menuRef} className="menu-panel">
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
          <button
            className={`menu-panel-btn ${activePanel === 'workspaces' ? 'active' : ''}`}
            onClick={onWorkspacesClick}
          >
            Workspaces
          </button>
          <button
            className={`menu-panel-btn ${activePanel === 'environments' ? 'active' : ''}`}
            onClick={onEnvironmentsClick}
          >
            Environments
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
