import { Variable } from '../components/VariablesManager';

export interface RequestHistory {
  id: string;
  url: string;
  method: string;
  status: number;
  timestamp: number;
  count: number;
}

export interface SavedRequest {
  id: string;
  name: string;
  description: string;
  groupId?: string;
  url: string;
  method: string;
  body: string;
  queryParams: Array<{ checked: boolean; key: string; value: string }>;
  requestHeaders: Array<{ checked: boolean; key: string; value: string }>;
  createdAt: number;
}

export interface RequestGroup {
  id: string;
  name: string;
  workspaceId: string;
}

export interface Workspace {
  id: string;
  name: string;
  globalVariables: Variable[];
  localVariables: Record<string, Variable[]>;
  activeLocalEnv: string;
  savedRequests: SavedRequest[];
  requestGroups: RequestGroup[];
  history: RequestHistory[];
  createdAt: number;
}

const WORKSPACES_STORAGE_KEY = 'postyamil_workspaces';
const ACTIVE_WORKSPACE_KEY = 'postyamil_active_workspace';
const HISTORY_CLEANUP_TIME = 2 * 24 * 60 * 60 * 1000; // 2 days in ms

/**
 * Creates a new default workspace
 */
export const createDefaultWorkspace = (id: string, name: string = 'New Workspace'): Workspace => ({
  id,
  name,
  globalVariables: [],
  localVariables: {},
  activeLocalEnv: '',
  savedRequests: [],
  requestGroups: [],
  history: [],
  createdAt: Date.now(),
});

/**
 * Saves all workspaces to localStorage
 */
export const saveWorkspaces = (workspaces: Workspace[]) => {
  localStorage.setItem(WORKSPACES_STORAGE_KEY, JSON.stringify(workspaces));
};

/**
 * Loads all workspaces from localStorage
 */
export const loadWorkspaces = (): Workspace[] => {
  const stored = localStorage.getItem(WORKSPACES_STORAGE_KEY);
  if (!stored) {
    // Create default workspace if none exist
    const defaultWorkspace = createDefaultWorkspace('default', 'Default Workspace');
    saveWorkspaces([defaultWorkspace]);
    return [defaultWorkspace];
  }
  try {
    return JSON.parse(stored);
  } catch {
    // If parsing fails, return default workspace
    const defaultWorkspace = createDefaultWorkspace('default', 'Default Workspace');
    saveWorkspaces([defaultWorkspace]);
    return [defaultWorkspace];
  }
};

/**
 * Saves the active workspace ID
 */
export const saveActiveWorkspaceId = (workspaceId: string) => {
  localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspaceId);
};

/**
 * Loads the active workspace ID
 */
export const loadActiveWorkspaceId = (): string => {
  return localStorage.getItem(ACTIVE_WORKSPACE_KEY) || 'default';
};

/**
 * Cleans up old history entries (older than 2 days)
 */
export const cleanupOldHistory = (history: RequestHistory[]): RequestHistory[] => {
  const now = Date.now();
  return history.filter(entry => now - entry.timestamp < HISTORY_CLEANUP_TIME);
};

/**
 * Adds request to history, with deduplication
 */
export const addToHistory = (
  history: RequestHistory[],
  url: string,
  method: string,
  status: number
): RequestHistory[] => {
  const cleaned = cleanupOldHistory(history);
  
  // Check if last entry matches this request
  if (cleaned.length > 0) {
    const lastEntry = cleaned[cleaned.length - 1];
    if (lastEntry.url === url && lastEntry.method === method && lastEntry.status === status) {
      // Increment count for duplicate
      lastEntry.count += 1;
      return cleaned;
    }
  }

  // Add new history entry
  const newEntry: RequestHistory = {
    id: Math.random().toString(),
    url,
    method,
    status,
    timestamp: Date.now(),
    count: 1,
  };

  return [...cleaned, newEntry];
};

/**
 * Adds a saved request
 */
export const addSavedRequest = (
  savedRequests: SavedRequest[],
  name: string,
  description: string,
  url: string,
  method: string,
  body: string,
  queryParams: any[],
  requestHeaders: any[],
  groupId?: string
): SavedRequest[] => {
  const newRequest: SavedRequest = {
    id: Math.random().toString(),
    name,
    description,
    groupId,
    url,
    method,
    body,
    queryParams,
    requestHeaders,
    createdAt: Date.now(),
  };

  return [...savedRequests, newRequest];
};

/**
 * Updates a saved request
 */
export const updateSavedRequest = (
  savedRequests: SavedRequest[],
  requestId: string,
  updates: Partial<SavedRequest>
): SavedRequest[] => {
  return savedRequests.map(req =>
    req.id === requestId ? { ...req, ...updates } : req
  );
};

/**
 * Deletes a saved request
 */
export const deleteSavedRequest = (
  savedRequests: SavedRequest[],
  requestId: string
): SavedRequest[] => {
  return savedRequests.filter(req => req.id !== requestId);
};

/**
 * Creates a new request group
 */
export const createRequestGroup = (
  groups: RequestGroup[],
  name: string,
  workspaceId: string
): RequestGroup[] => {
  const newGroup: RequestGroup = {
    id: Math.random().toString(),
    name,
    workspaceId,
  };

  return [...groups, newGroup];
};

/**
 * Deletes a request group and moves its requests to ungrouped
 */
export const deleteRequestGroup = (
  groups: RequestGroup[],
  savedRequests: SavedRequest[],
  groupId: string
): { groups: RequestGroup[]; savedRequests: SavedRequest[] } => {
  const updatedGroups = groups.filter(g => g.id !== groupId);
  const updatedRequests = savedRequests.map(req =>
    req.groupId === groupId ? { ...req, groupId: undefined } : req
  );

  return { groups: updatedGroups, savedRequests: updatedRequests };
};
