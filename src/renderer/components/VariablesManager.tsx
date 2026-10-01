import { useState } from 'react';

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

  return (
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
  );
};
