import { useState } from 'react';
import { importVariablesFromJson } from '../services/jsonImportService';

export interface Variable {
  key: string;
  value: string;
}

interface VariablesManagerProps {
  variables: Variable[];
  onVariablesChange: (variables: Variable[]) => void;
}

export const VariablesManager = ({
  variables,
  onVariablesChange,
}: VariablesManagerProps) => {
  const [emptyVarKey, setEmptyVarKey] = useState('');
  const [error, setError] = useState('');

  const addVariable = (key: string, value: string) => {
    if (key.trim()) {
      const updated = [...variables, { key: key.trim(), value }];
      onVariablesChange(updated);
    }
  };

  const removeVariable = (index: number) => {
    onVariablesChange(variables.filter((_, i) => i !== index));
  };

  const updateVariable = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...variables];
    updated[index][field] = value;
    onVariablesChange(updated);
  };

  const handleEmptyRowBlur = () => {
    if (emptyVarKey.trim()) {
      addVariable(emptyVarKey, '');
      setEmptyVarKey('');
    }
  };

  const importFromJson = async () => {
    try {
      const filePaths = await window.electron.ipcRenderer.invoke('open-file');

      if (!filePaths || !filePaths.contents) {
        setError('No file selected or file is empty');
        return;
      }

      const { variables: importedVars, error } = importVariablesFromJson(filePaths.contents);

      if (error) {
        setError(error);
        return;
      }

      // Filter out duplicates and track which were skipped
      const existingKeys = new Set(variables.map(v => v.key));
      const ignoredKeys: string[] = [];
      const uniqueVars = (importedVars || []).filter(v => {
        if (existingKeys.has(v.key)) {
          ignoredKeys.push(v.key);
          return false;
        }
        existingKeys.add(v.key);
        return true;
      });

      // Add unique imported variables to existing ones
      const updated = [...variables, ...uniqueVars];
      onVariablesChange(updated);

      // Show info about ignored variables
      if (ignoredKeys.length > 0) {
        setError(`Imported successfully. Ignored duplicate keys: ${ignoredKeys.join(', ')}`);
      } else {
        setError('');
      }
    } catch (err) {
      setError(`Error importing file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
        <button
          onClick={importFromJson}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Import from JSON
        </button>
      </div>
      {error && <div className="modal-error">{error}</div>}
      <div className="variables-table">
        <div className="variables-row header-row">
          <div className="variables-col">Key</div>
          <div className="variables-col">Value</div>
          <div className="variables-col action">Action</div>
        </div>

        {variables.map((variable, index) => (
          <div key={`var-${index}`} className="variables-row">
            <input
              type="text"
              className="variables-input"
              placeholder="Variable key"
              value={variable.key}
              onChange={(e) => updateVariable(index, 'key', e.target.value)}
            />
            <input
              type="text"
              className="variables-input"
              placeholder="Variable value"
              value={variable.value}
              onChange={(e) => updateVariable(index, 'value', e.target.value)}
            />
            <button
              className="delete-btn"
              onClick={() => removeVariable(index)}
            >
              Delete
            </button>
          </div>
        ))}

        <div key="empty-row" className="variables-row">
          <input
            type="text"
            className="variables-input"
            placeholder="Variable key"
            value={emptyVarKey}
            onChange={(e) => setEmptyVarKey(e.target.value)}
            onBlur={handleEmptyRowBlur}
          />
          <input
            type="text"
            className="variables-input"
            placeholder="Variable value"
            disabled
          />
          <div className="variables-col action"></div>
        </div>
      </div>
    </div>
  );
}