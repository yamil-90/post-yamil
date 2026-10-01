import { Variable } from '../components/VariablesManager';

const GLOBAL_VARIABLES_STORAGE_KEY = 'postyamil_global_variables';
const LOCAL_VARIABLES_STORAGE_KEY = 'postyamil_local_variables';
const ACTIVE_LOCAL_ENV_STORAGE_KEY = 'postyamil_active_local_env';

export const saveGlobalVariables = (variables: Variable[]) => {
  localStorage.setItem(GLOBAL_VARIABLES_STORAGE_KEY, JSON.stringify(variables));
};

export const loadGlobalVariables = (): Variable[] => {
  const stored = localStorage.getItem(GLOBAL_VARIABLES_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveLocalVariables = (localVars: Record<string, Variable[]>) => {
  localStorage.setItem(LOCAL_VARIABLES_STORAGE_KEY, JSON.stringify(localVars));
};

export const loadLocalVariables = (): Record<string, Variable[]> => {
  const stored = localStorage.getItem(LOCAL_VARIABLES_STORAGE_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
};

export const saveActiveLocalEnv = (envName: string) => {
  localStorage.setItem(ACTIVE_LOCAL_ENV_STORAGE_KEY, envName);
};

export const loadActiveLocalEnv = (): string => {
  return localStorage.getItem(ACTIVE_LOCAL_ENV_STORAGE_KEY) || '';
};
