import React from 'react';
import { importEnvironmentFromJson } from '../services/jsonImportService';


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

    // Filter out duplicate keys and track which were ignored
    const seenKeys = new Set<string>();
    const ignoredKeys: string[] = [];
    const uniqueVars = envVariables.filter(variable => {
      if (seenKeys.has(variable.key)) {
        ignoredKeys.push(variable.key);
        return false;
      }
      seenKeys.add(variable.key);
      return true;
    });

    // Show info about ignored variables
    if (ignoredKeys.length > 0) {
      setError(`Environment created. Ignored duplicate keys: ${ignoredKeys.join(', ')}`);
    } else {
      setError('');
    }

    onCreate(envName, uniqueVars);
    setEnvName('');
  };

  const handleClose = () => {
    setEnvName('');
    setError('');
    onClose();
  };

  const importFromJson = async() => {
    try {
      const filePaths = await window.electron.ipcRenderer.invoke('open-file');
      
      if (!filePaths || !filePaths.contents) {
        setError('No file selected or file is empty');
        return;
      }

      const { name, variables, error } = importEnvironmentFromJson(filePaths.contents);

      if (error) {
        setError(error);
        return;
      }

      // Filter out duplicate keys within the imported data
      const seenKeys = new Set<string>();
      const ignoredKeys: string[] = [];
      const uniqueVars = (variables || []).filter(variable => {
        if (seenKeys.has(variable.key)) {
          ignoredKeys.push(variable.key);
          return false;
        }
        seenKeys.add(variable.key);
        return true;
      });

      setEnvName(name);
      setEnvVariables(uniqueVars);

      // Show info about ignored variables
      if (ignoredKeys.length > 0) {
        setError(`Imported. Ignored duplicate keys in JSON: ${ignoredKeys.join(', ')}`);
      } else {
        setError('');
      }
    } catch (err) {
      setError(`Error importing file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
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
