import { Variable } from './VariablesManager';

interface EnvironmentSelectorProps {
  activeLocalEnv: string;
  localVariables: Record<string, Variable[]>;
  onEnvironmentChange: (envName: string) => void;
  onCreateNewClick: () => void;
  onDeleteClick: () => void;
}

export const EnvironmentSelector = ({
  activeLocalEnv,
  localVariables,
  onEnvironmentChange,
  onCreateNewClick,
  onDeleteClick,
}: EnvironmentSelectorProps) => {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '__create_new__') {
      onCreateNewClick();
      e.target.value = activeLocalEnv;
    } else {
      onEnvironmentChange(value);
    }
  };

  return (
    <div className="env-selector-group">
      <label htmlFor="env-select">Local Env:</label>
      <select
        id="env-select"
        value={activeLocalEnv}
        onChange={handleSelectChange}
        className="env-select"
      >
        <option value="">None</option>
        {Object.keys(localVariables).map(envName => (
          <option key={envName} value={envName}>
            {envName}
          </option>
        ))}
        <option value="__create_new__">+ Create New</option>
      </select>
      <button className="delete-btn" onClick={onDeleteClick}>
        delete local env
      </button>
    </div>
  );
};
