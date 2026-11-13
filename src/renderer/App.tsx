import { useState, useEffect } from 'react';

import './App.css';
import { ResponseViewer } from './components/ResponseViewer';
import { VariablesManager } from './components/VariablesManager';
import { CreateEnvironmentModal } from './components/CreateEnvironmentModal';
import { EnvironmentsPanel } from './components/EnvironmentsPanel';
import { ConfirmModal } from './components/ConfirmModal';
import { EnvironmentSelector } from './components/EnvironmentSelector';
import { RequestBuilder } from './components/RequestBuilder';
import { SidebarMenu } from './components/SidebarMenu';
import { HistoryPanel } from './components/HistoryPanel';
import { SavedRequestsPanel } from './components/SavedRequestsPanel';
import { WorkspacesPanel } from './components/WorkspacesPanel';
import { CreateWorkspaceModal } from './components/CreateWorkspaceModal';
import { saveLayoutOrientation, loadLayoutOrientation, saveActiveTabId, loadActiveTabId } from './services/storageService' 
import { saveTabs, getActiveTabId, loadTabs, createNewTab, removeTabFromList, updateTabInList } from './services/tabService'
import {
  loadWorkspaces,
  saveWorkspaces,
  loadActiveWorkspaceId,
  saveActiveWorkspaceId,
  addToHistory,
  createDefaultWorkspace,
  Workspace,
  SavedRequest,
  RequestHistory,
} from './services/workspaceService'
import { VARIABLES_TAB_ID, LOCAL_VARIABLES_TAB_ID } from './vars/tabIds'
import { Variable } from './components/VariablesManager';
import { UrlInputViewer } from './components/UrlInputViewer';

export interface RequestTab {
  id: string;
  name: string;
  url: string;
  baseUrl: string;
  method: string;
  body: string;
  queryParams: Array<{checked: boolean; key: string; value: string }>;
  requestHeaders: Array<{ checked: boolean; key: string; value: string }>;
  response: string;
  headers: Record<string, string>;
  responseInfo: { status: number; statusText: string; size: number; time: number } | null;
  sentUrl: string;
  loading: boolean;
  error: string;
  activeTab: 'body' | 'headers' | 'info';
  type?: 'request' | 'variables';
  environmentName?: string;
}

export default function App() {
  // Workspace state
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => loadWorkspaces());
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => loadActiveWorkspaceId());
  const currentWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'none' | 'my-requests' | 'history' | 'workspaces' | 'environments'>('none');

  // Tab state
  const [activeTabId, setActiveTabId] = useState(() => loadActiveTabId() || getActiveTabId());
  const [tabs, setTabs] = useState<RequestTab[]>(() => loadTabs());
  const [layoutOrientation, setLayoutOrientation] = useState<'row' | 'column'>(() => loadLayoutOrientation());

  // UI state
  const [emptyParamKey, setEmptyParamKey] = useState('');
  const [emptyHeaderKey, setEmptyHeaderKey] = useState('');
  const [globalVariablesTabVisible, setGlobalVariablesTabVisible] = useState(false);
  const [localVariablesTabVisible, setLocalVariablesTabVisible] = useState(false);
  const [showCreateEnvModal, setShowCreateEnvModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [envToDelete, setEnvToDelete] = useState<string>('');
  const [showSaveRequestModal, setShowSaveRequestModal] = useState(false);
  const [saveRequestName, setSaveRequestName] = useState('');
  const [saveRequestDescription, setSaveRequestDescription] = useState('');
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
  const [showConfirmDeleteWorkspace, setShowConfirmDeleteWorkspace] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<string>('');
  const [showConfirmDeleteRequest, setShowConfirmDeleteRequest] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<SavedRequest | null>(null);

  // Local environment state - initialized when workspace loads
  const [localVariables, setLocalVariables] = useState<Record<string, Variable[]>>({});
  const [activeLocalEnv, setActiveLocalEnv] = useState<string>('');
  const [globalVariables, setGlobalVariables] = useState<Variable[]>([]);

  // References and computations
  const currentTab = tabs.find(t => t.id === activeTabId);
  const isGlobalVariablesTabOpen = activeTabId === VARIABLES_TAB_ID;
  const isLocalVariablesTabOpen = activeTabId === LOCAL_VARIABLES_TAB_ID;

  // Save workspaces to localStorage whenever they change
  useEffect(() => {
    saveWorkspaces(workspaces);
  }, [workspaces]);

  // Save active workspace ID
  useEffect(() => {
    saveActiveWorkspaceId(activeWorkspaceId);
  }, [activeWorkspaceId]);

  // Initialize local state when workspace loads or changes
  useEffect(() => {
    if (currentWorkspace) {
      setLocalVariables(currentWorkspace.localVariables || {});
      setActiveLocalEnv(currentWorkspace.activeLocalEnv || '');
      setGlobalVariables(currentWorkspace.globalVariables || []);
    }
  }, [activeWorkspaceId]);

  // Save variables to current workspace whenever they change
  useEffect(() => {
    if (currentWorkspace) {
      const updatedWorkspaces = workspaces.map(w =>
        w.id === activeWorkspaceId
          ? { ...w, globalVariables }
          : w
      );
      setWorkspaces(updatedWorkspaces);
    }
  }, [globalVariables]);

  useEffect(() => {
    if (currentWorkspace) {
      const updatedWorkspaces = workspaces.map(w =>
        w.id === activeWorkspaceId
          ? { ...w, localVariables }
          : w
      );
      setWorkspaces(updatedWorkspaces);
    }
  }, [localVariables]);

  useEffect(() => {
    if (currentWorkspace && activeLocalEnv) {
      const updatedWorkspaces = workspaces.map(w =>
        w.id === activeWorkspaceId
          ? { ...w, activeLocalEnv }
          : w
      );
      setWorkspaces(updatedWorkspaces);
    }
  }, [activeLocalEnv]);

  // Save tabs to localStorage whenever they change
  useEffect(() => {
    saveTabs(tabs);
  }, [tabs]);

  useEffect(() => {
    saveActiveTabId(activeTabId);
  }, [activeTabId]);

  useEffect(() => {
    saveLayoutOrientation(layoutOrientation);
  }, [layoutOrientation]);


  const updateTab = (updates: Partial<RequestTab>) => {
    if (currentTab) {
      setTabs(updateTabInList(activeTabId, updates, tabs));
    }
  };

  const addTab = () => {
    const newTab = createNewTab();
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (id: string) => {
    const { newTabs, newActiveId } = removeTabFromList(id, tabs);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newActiveId);
    }
  };

  // Workspace functions
  const updateWorkspace = (updatedWorkspace: Workspace) => {
    const updatedWorkspaces = workspaces.map(w =>
      w.id === activeWorkspaceId ? updatedWorkspace : w
    );
    setWorkspaces(updatedWorkspaces);
  };

  const trackRequest = (url: string, method: string, status: number) => {
    if (!currentWorkspace) return;
    const updatedHistory = addToHistory(currentWorkspace.history, url, method, status);
    updateWorkspace({
      ...currentWorkspace,
      history: updatedHistory,
    });
  };

  const saveCurrentRequest = (name: string, description: string, groupId?: string) => {
    if (!currentTab || !currentWorkspace) return;

    const newSavedRequest: SavedRequest = {
      id: Math.random().toString(),
      name,
      description,
      groupId,
      url: currentTab.baseUrl,
      method: currentTab.method,
      body: currentTab.body,
      queryParams: currentTab.queryParams,
      requestHeaders: currentTab.requestHeaders,
      createdAt: Date.now(),
    };

    updateWorkspace({
      ...currentWorkspace,
      savedRequests: [...currentWorkspace.savedRequests, newSavedRequest],
    });

    setShowSaveRequestModal(false);
    setSaveRequestName('');
    setSaveRequestDescription('');
  };

  const loadSavedRequest = (savedRequest: SavedRequest) => {
    const newTab = createNewTab();
    const updatedTab: RequestTab = {
      ...newTab,
      baseUrl: savedRequest.url,
      url: savedRequest.url,
      method: savedRequest.method,
      body: savedRequest.body,
      queryParams: savedRequest.queryParams,
      requestHeaders: savedRequest.requestHeaders,
      name: savedRequest.name,
    };

    setTabs([...tabs, updatedTab]);
    setActiveTabId(updatedTab.id);
    setSidebarOpen(false);
    setActivePanel('none');
  };

  const handleLoadHistoryRequest = (historyEntry: RequestHistory) => {
    const newTab = createNewTab();
    const updatedTab: RequestTab = {
      ...newTab,
      baseUrl: historyEntry.url,
      url: historyEntry.url,
      method: historyEntry.method,
      name: historyEntry.url,
    };

    setTabs([...tabs, updatedTab]);
    setActiveTabId(updatedTab.id);
    setSidebarOpen(false);
    setActivePanel('none');
  };

  const switchWorkspace = (workspaceId: string) => {
    setActiveWorkspaceId(workspaceId);
    setSidebarOpen(false);
    setActivePanel('none');
  };

  const createNewWorkspace = () => {
    setShowCreateWorkspaceModal(true);
  };

  const handleCreateWorkspace = (name: string) => {
    const newWorkspaceId = Math.random().toString();
    const newWorkspace = createDefaultWorkspace(newWorkspaceId, name);
    setWorkspaces([...workspaces, newWorkspace]);
    setActiveWorkspaceId(newWorkspaceId);
    setShowCreateWorkspaceModal(false);
    setSidebarOpen(false);
    setActivePanel('none');
  };

  const deleteWorkspace = (workspaceId: string) => {
    if (workspaceId === activeWorkspaceId) {
      // Cannot delete active workspace
      return;
    }
    setWorkspaceToDelete(workspaceId);
    setShowConfirmDeleteWorkspace(true);
  };

  const confirmDeleteWorkspace = () => {
    if (workspaceToDelete) {
      setWorkspaces(workspaces.filter(w => w.id !== workspaceToDelete));
      setShowConfirmDeleteWorkspace(false);
      setWorkspaceToDelete('');
    }
  };

  const updateWorkspaceName = (workspaceId: string, newName: string) => {
    const updated = workspaces.map(w =>
      w.id === workspaceId ? { ...w, name: newName } : w
    );
    setWorkspaces(updated);
  };

  const openGlobalVariablesTab = () => {
    if (!isGlobalVariablesTabOpen) {
      setGlobalVariablesTabVisible(true);
      setActiveTabId(VARIABLES_TAB_ID);
    }
  };

  const openLocalVariablesTab = () => {
    if (!isLocalVariablesTabOpen) {
      setLocalVariablesTabVisible(true);
      setActiveTabId(LOCAL_VARIABLES_TAB_ID);
    }
  };

  const openEnvironmentTab = (envName: string) => {
    // Check if a tab for this environment already exists
    const existingTab = tabs.find(t => t.environmentName === envName);
    if (existingTab) {
      // Switch to existing tab
      setActiveTabId(existingTab.id);
    } else {
      // Create new environment tab
      const newTab = createNewTab();
      const envTab: RequestTab = {
        ...newTab,
        name: envName,
        type: 'variables',
        environmentName: envName,
      };
      setTabs([...tabs, envTab]);
      setActiveTabId(envTab.id);
    }
    setActivePanel('none');
  };

  const handleCreateEnvironment = (name: string, variables?:  { key: string; value: string }[]) => {
    setLocalVariables({
      ...localVariables,
      [name]: variables?? [],
    });
    setActiveLocalEnv(name);
    setShowCreateEnvModal(false);
  };

  const handleDeleteEnvironment = (name: string) => {
    setEnvToDelete(name);
    setShowConfirmDelete(true);
  };

  const confirmDeleteEnvironment = () => {
    if (envToDelete) {
      const updated = {...localVariables}
      delete updated[envToDelete]

      setLocalVariables(updated)
      const first = Object.keys(updated)[0] ?? '';
      setActiveLocalEnv(first);
      setShowConfirmDelete(false);
      setEnvToDelete('');
    }
  };

  return (
    <div className={`container ${activePanel !== 'none' ? 'panel-open' : ''}`}>
      <SidebarMenu
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onMyRequestsClick={() => {
          setActivePanel(activePanel === 'my-requests' ? 'none' : 'my-requests');
          setSidebarOpen(false);
        }}
        onHistoryClick={() => {
          setActivePanel(activePanel === 'history' ? 'none' : 'history');
          setSidebarOpen(false);
        }}
        onWorkspacesClick={() => {
          setActivePanel(activePanel === 'workspaces' ? 'none' : 'workspaces');
          setSidebarOpen(false);
        }}
        onEnvironmentsClick={() => {
          setActivePanel(activePanel === 'environments' ? 'none' : 'environments');
          setSidebarOpen(false);
        }}
        activePanel={activePanel}
        onPanelClose={() => setActivePanel('none')}
      />

      {activePanel === 'my-requests' && currentWorkspace && (
        <SavedRequestsPanel
          isOpen={true}
          savedRequests={currentWorkspace.savedRequests}
          requestGroups={currentWorkspace.requestGroups}
          onRequestClick={loadSavedRequest}
          onEditClick={(request) => {
            loadSavedRequest(request);
            setSaveRequestName(request.name);
            setSaveRequestDescription(request.description);
          }}
          onDeleteClick={(request) => {
            setRequestToDelete(request);
            setShowConfirmDeleteRequest(true);
          }}
          onClose={() => setActivePanel('none')}
        />
      )}

      {activePanel === 'history' && currentWorkspace && (
        <HistoryPanel
          isOpen={true}
          history={currentWorkspace.history}
          onRequestClick={handleLoadHistoryRequest}
          onClose={() => setActivePanel('none')}
        />
      )}

      {activePanel === 'workspaces' && (
        <WorkspacesPanel
          isOpen={true}
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          onWorkspaceSelect={switchWorkspace}
          onCreateWorkspace={createNewWorkspace}
          onDeleteWorkspace={deleteWorkspace}
          onUpdateWorkspaceName={updateWorkspaceName}
          onClose={() => setActivePanel('none')}
        />
      )}
      {activePanel === 'environments' && (
        <EnvironmentsPanel 
          isOpen={true}
          activeLocalEnv={activeLocalEnv}
          localVariables={localVariables}
          openGlobalVariablesTab={openGlobalVariablesTab}
          onOpenEnvironmentTab={openEnvironmentTab}
          onClose={() => setActivePanel('none')}
        />
      )}
      <div className="header-top">
        <h1>PostYamil - HTTP Client</h1>
        <div className="header-controls">
          <EnvironmentSelector
            activeLocalEnv={activeLocalEnv}
            localVariables={localVariables}
            onEnvironmentChange={setActiveLocalEnv}
            onCreateNewClick={() => setShowCreateEnvModal(true)}
            onDeleteClick={() => handleDeleteEnvironment(activeLocalEnv)}
          />
          <button
            className="variables-toggle"
            onClick={openLocalVariablesTab}
            disabled={isLocalVariablesTabOpen}
          >
            Local Env ({activeLocalEnv ? localVariables[activeLocalEnv]?.length || 0 : 0})
          </button>
          <button
            className="variables-toggle"
            onClick={openGlobalVariablesTab}
            disabled={isGlobalVariablesTabOpen}
          >
            Global Variables ({globalVariables.length})
          </button>
        </div>
      </div>

      <div className="request-tabs">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`request-tab ${tab.id === activeTabId ? 'active' : ''}`}
            onClick={() => setActiveTabId(tab.id)}
          >
            <span className="tab-name">{tab.name}</span>
            {tabs.length > 1 && (
              <button
                className="tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
        {globalVariablesTabVisible && (
        <div
          className={`request-tab ${isGlobalVariablesTabOpen ? 'active' : ''}`}
          onClick={() => setActiveTabId(VARIABLES_TAB_ID)}
        >
          <span className="tab-name">Global Variables</span>
          <button
            className="tab-close"
            onClick={(e) => {
              e.stopPropagation();
              setGlobalVariablesTabVisible(false);
              setActiveTabId(tabs[0]?.id || '1');
            }}
          >
            ×
          </button>
        </div>
        )}
        {localVariablesTabVisible && (
        <div
          className={`request-tab ${isLocalVariablesTabOpen ? 'active' : ''}`}
          onClick={() => setActiveTabId(LOCAL_VARIABLES_TAB_ID)}
        >
          <span className="tab-name">Local Env</span>
          <button
            className="tab-close"
            onClick={(e) => {
              e.stopPropagation();
              setLocalVariablesTabVisible(false);
              setActiveTabId(tabs[0]?.id || '1');
            }}
          >
            ×
          </button>
        </div>
        )}
        <button className="add-tab-btn" onClick={addTab}>+</button>
      </div>

      {isGlobalVariablesTabOpen ? (
        <div className="request-section">
          <VariablesManager
            variables={globalVariables}
            onVariablesChange={setGlobalVariables}
          />
        </div>
      ) : isLocalVariablesTabOpen ? (
        <div className="request-section">
            <h2 style={{ marginTop: 0, marginBottom: '16px' }}>{activeLocalEnv}</h2>
          {activeLocalEnv ? (
            <VariablesManager
              variables={localVariables[activeLocalEnv] || []}
              onVariablesChange={(vars) => {
                setLocalVariables({
                  ...localVariables,
                  [activeLocalEnv]: vars,
                });
              }}
            />
          ) : (
            <div style={{ padding: '20px', color: '#999', textAlign: 'center' }}>
              <p>Please select a local environment from the dropdown above or <button className='btn-link' onClick={()=>setShowCreateEnvModal(true)} >create one</button></p>
            </div>
          )}
        </div>
      ) : currentTab?.type === 'variables' && currentTab.environmentName ? (
        <div className="request-section">
          <h2 style={{ marginTop: 0, marginBottom: '16px' }}>{currentTab.environmentName}</h2>
          <VariablesManager
            variables={localVariables[currentTab.environmentName] || []}
            onVariablesChange={(vars) => {
              setLocalVariables({
                ...localVariables,
                [currentTab.environmentName!]: vars,
              });
            }}
          />
        </div>
      ) : currentTab ? (
        <div className="request-section">
          <UrlInputViewer 
                currentTab={currentTab}
                updateTab={updateTab}
                globalVariables={globalVariables}
                localVariables={localVariables}
                activeLocalEnv={activeLocalEnv}
                onRequestSent={trackRequest}
                />
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <button
              className="save-request-btn"
              onClick={() => setShowSaveRequestModal(true)}
              title="Save this request for later"
            >
              💾 Save Request
            </button>
          </div>
          <div className={`layout-container ${layoutOrientation}`}>
            <div className="request-response-wrapper">
              <RequestBuilder
                currentTab={currentTab}
                emptyParamKey={emptyParamKey}
                emptyHeaderKey={emptyHeaderKey}
                updateTab={updateTab}
                setEmptyParamKey={setEmptyParamKey}
                setEmptyHeaderKey={setEmptyHeaderKey}
              />
            </div>
            {currentTab && currentTab.error && <div className="error">{currentTab.error}</div>}
            {currentTab && (
              <ResponseViewer
                response={currentTab.response}
                headers={currentTab.headers}
                responseInfo={currentTab.responseInfo}
                activeTab={currentTab.activeTab}
                onTabChange={(tab) => updateTab({activeTab: tab})}
                fullUrl={currentTab.sentUrl}
              />
            )}
            <button
              className="layout-toggle-btn"
              onClick={() => setLayoutOrientation(layoutOrientation === 'column' ? 'row' : 'column')}
              title={`Switch to ${layoutOrientation === 'column' ? 'row' : 'column'} layout`}
            >
              {layoutOrientation === 'column' ? '↔' : '↕'}
            </button>
          </div>
        </div>
      ) : null}

      <CreateEnvironmentModal
        isOpen={showCreateEnvModal}
        onClose={() => setShowCreateEnvModal(false)}
        onCreate={handleCreateEnvironment}
        existingEnvironments={Object.keys(localVariables)}
      />

      <ConfirmModal
        isOpen={showConfirmDelete}
        title="Delete Environment"
        message={`Are you sure you want to delete the environment "${envToDelete}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={confirmDeleteEnvironment}
        onCancel={() => {
          setShowConfirmDelete(false);
          setEnvToDelete('');
        }}
      />

      <ConfirmModal
        isOpen={showSaveRequestModal}
        title="Save Request"
        message={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              placeholder="Request name"
              value={saveRequestName}
              onChange={(e) => setSaveRequestName(e.target.value)}
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            <textarea
              placeholder="Description (optional)"
              value={saveRequestDescription}
              onChange={(e) => setSaveRequestDescription(e.target.value)}
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                minHeight: '60px',
                fontFamily: 'monospace',
              }}
            />
          </div>
        }
        confirmText="Save"
        cancelText="Cancel"
        isDangerous={false}
        onConfirm={() => {
          if (saveRequestName.trim()) {
            saveCurrentRequest(saveRequestName, saveRequestDescription);
          }
        }}
        onCancel={() => {
          setShowSaveRequestModal(false);
          setSaveRequestName('');
          setSaveRequestDescription('');
        }}
      />

      <CreateWorkspaceModal
        isOpen={showCreateWorkspaceModal}
        onClose={() => setShowCreateWorkspaceModal(false)}
        onCreate={handleCreateWorkspace}
      />

      <ConfirmModal
        isOpen={showConfirmDeleteWorkspace}
        title="Delete Workspace"
        message={`Are you sure you want to delete this workspace? This action cannot be undone and all saved requests and variables will be lost.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={confirmDeleteWorkspace}
        onCancel={() => {
          setShowConfirmDeleteWorkspace(false);
          setWorkspaceToDelete('');
        }}
      />

      <ConfirmModal
        isOpen={showConfirmDeleteRequest}
        title="Delete Request"
        message={`Are you sure you want to delete the saved request "${requestToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={() => {
          if (requestToDelete && currentWorkspace) {
            updateWorkspace({
              ...currentWorkspace,
              savedRequests: currentWorkspace.savedRequests.filter(r => r.id !== requestToDelete.id),
            });
          }
          setShowConfirmDeleteRequest(false);
          setRequestToDelete(null);
        }}
        onCancel={() => {
          setShowConfirmDeleteRequest(false);
          setRequestToDelete(null);
        }}
      />
    </div>
  );
}
