import { Variable } from './VariablesManager';

interface EnvironmentsPanelProps {
  isOpen: boolean;
  activeLocalEnv: string;
  localVariables: Record<string, Variable[]>;
  openGlobalVariablesTab: () => void;
  onOpenEnvironmentTab: (envName: string) => void;
  onClose: () => void;
}

export const EnvironmentsPanel = ({
  isOpen,
  activeLocalEnv,
  localVariables,
  openGlobalVariablesTab,
  onOpenEnvironmentTab,
  onClose,
}: EnvironmentsPanelProps) => {
  if (!isOpen) return null;

  return (
    <div className="content-panel">
      <div className="panel-header">
        <h3>My Environments</h3>
        <button
          className="panel-close-btn"
          onClick={onClose}
          title="Close panel"
        >
          ×
        </button>
      </div>
      <div className="panel-content">
        <button onClick={() => {
          openGlobalVariablesTab();
          onClose();
        }}>Global</button>
        {Object.keys(localVariables).length === 0 ? (
          <p className="empty-message">No local environments yet</p>
        ) : (
          <div>
            {Object.keys(localVariables).map(envName => (
              <p key={envName}>
                <button
                  value={envName}
                  onClick={() => {
                    onOpenEnvironmentTab(envName);
                    onClose();
                  }}
                >
                  {envName}
                </button>
                {activeLocalEnv === envName ? '(Active)' : ''}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
