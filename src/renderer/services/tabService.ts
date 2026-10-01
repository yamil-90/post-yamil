import { RequestTab } from '../App';

const STORAGE_KEY = 'postyamil_tabs';

export const getDefaultTab = (id: string): RequestTab => ({
  id,
  name: 'New Request',
  url: '',
  baseUrl: '',
  method: 'GET',
  body: '',
  queryParams: [],
  requestHeaders: [],
  response: '',
  headers: {},
  responseInfo: null,
  sentUrl: '',
  loading: false,
  error: '',
  activeTab: 'body',
});

export const saveTabs = (tabs: RequestTab[]) => {
  const tabsToSave = tabs.map(tab => ({
    id: tab.id,
    name: tab.name,
    url: tab.url,
    baseUrl: tab.baseUrl,
    method: tab.method,
    body: tab.body,
    queryParams: tab.queryParams,
    requestHeaders: tab.requestHeaders,
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tabsToSave));
};

export const loadTabs = (): RequestTab[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [getDefaultTab('1')];
  }
  try {
    const parsed = JSON.parse(stored);
    return parsed.map((tab: any) => ({
      ...tab,
      requestHeaders: tab.requestHeaders || [],
      response: '',
      headers: {},
      responseInfo: null,
      sentUrl: '',
      loading: false,
      error: '',
      activeTab: 'body' as const,
    }));
  } catch {
    return [getDefaultTab('1')];
  }
};

export const getActiveTabId = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return '1';
    try {
      const parsed = JSON.parse(stored);
      return parsed[0]?.id || '1';
    } catch {
      return '1';
    }
}

/**
 * Creates a new tab with a unique ID
 * @returns New RequestTab with default values
 */
export const createNewTab = (): RequestTab => {
  const newId = Math.random().toString();
  return getDefaultTab(newId);
};

/**
 * Removes a tab from the tabs array
 * @param tabId ID of tab to remove
 * @param tabs Current tabs array
 * @returns New tabs array and the new active tab ID
 */
export const removeTabFromList = (
  tabId: string,
  tabs: RequestTab[]
): { newTabs: RequestTab[]; newActiveId: string } => {
  if (tabs.length === 1) {
    return { newTabs: tabs, newActiveId: tabs[0].id };
  }
  const newTabs = tabs.filter(t => t.id !== tabId);
  const newActiveId = tabId === newTabs[0].id ? newTabs[0].id : newTabs[0].id;
  return { newTabs, newActiveId };
};

/**
 * Updates a specific tab in the tabs array
 * @param tabId ID of tab to update
 * @param updates Partial updates to apply
 * @param tabs Current tabs array
 * @returns New tabs array with updated tab
 */
export const updateTabInList = (
  tabId: string,
  updates: Partial<RequestTab>,
  tabs: RequestTab[]
): RequestTab[] => {
  return tabs.map(t => t.id === tabId ? { ...t, ...updates } : t);
};