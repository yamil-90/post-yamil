import React from 'react';


interface CreateEnvironmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, variables?: { key: string; value: string }[]) => void;
  existingEnvironments: string[];
}

export const CreateEnvironmentModal = ({
  isOpen,
  onClose,
  onCreate,
  existingEnvironments,
}: CreateEnvironmentModalProps) => {
  const [envName, setEnvName] = React.useState('');
  const [envVariables, setEnvVariables] = React.useState<{ key: string; value: string }[]>([]);
  const [error, setError] = React.useState('');

  const handleCreate = () => {
    if (!envName.trim()) {
      setError('Environment name cannot be empty');
      return;
    }
    if (existingEnvironments.includes(envName)) {
      setError('Environment already exists');
      return;
    }
    onCreate(envName, envVariables);
    setEnvName('');
    setError('');
  };

  const handleClose = () => {
    setEnvName('');
    setError('');
    onClose();
  };

  const importFromJson = async() => {
    const filePaths = await window.electron.ipcRenderer.invoke('open-file');
    const jsonContents = JSON.parse(filePaths.contents)
    jsonContents.name? setEnvName(jsonContents.name) : ''
    let variables = jsonContents.values
    setEnvVariables(variables)
    console.log(jsonContents.id)
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Create New Environment</h2>
          <button
            className="modal-close"
            onClick={handleClose}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <label htmlFor="env-name-input">Environment Name</label>
          <input
            id="env-name-input"
            type="text"
            placeholder="e.g., development, staging, production"
            value={envName}
            onChange={(e) => {
              setEnvName(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreate();
              } else if (e.key === 'Escape') {
                handleClose();
              }
            }}
            className="modal-input"
            autoFocus
          />
          <button
            onClick={() => importFromJson()}
            >
                import
            </button>
          {error && <div className="modal-error">{error}</div>}
        </div>
        <div className="modal-footer">
          <button
            onClick={handleClose}
            className="modal-btn cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="modal-btn primary"
            disabled={!envName.trim()}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};
