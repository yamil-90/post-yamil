import { useState, useEffect } from 'react';

import './App.css';
import { getMethodColor } from './helpers/formatting';
import { ResponseViewer } from './components/ResponseViewer';
import { QueryViewer } from './components/QueryViewer';
import { BodyViewer } from './components/BodyViewer';
import { HeadersManager } from './components/HeadersManager';
import { VariablesManager } from './components/VariablesManager';
import { CreateEnvironmentModal } from './components/CreateEnvironmentModal';
import { EnvironmentSelector } from './components/EnvironmentSelector';
import { RequestBuilder } from './components/RequestBuilder';
import { saveGlobalVariables, saveLocalVariables, saveActiveLocalEnv, loadLocalVariables, loadActiveLocalEnv, loadGlobalVariables } from './services/storageService' 
import { saveTabs, getActiveTabId, loadTabs, createNewTab, removeTabFromList, updateTabInList } from './services/tabService'
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
  requestHeaders: Array<{ key: string; value: string }>;
  response: string;
  headers: Record<string, string>;
  responseInfo: { status: number; statusText: string; size: number; time: number } | null;
  sentUrl: string;
  loading: boolean;
  error: string;
  activeTab: 'body' | 'headers' | 'info';
}

export default function App() {
  const [activeTabId, setActiveTabId] = useState(() => getActiveTabId());
  const [emptyParamKey, setEmptyParamKey] = useState('');
  const [emptyHeaderKey, setEmptyHeaderKey] = useState('');
  const [globalVariablesTabVisible, setGlobalVariablesTabVisible] = useState(false);
  const [localVariablesTabVisible, setLocalVariablesTabVisible] = useState(false);
  const [showCreateEnvModal, setShowCreateEnvModal] = useState(false);
  const [localVariables, setLocalVariables] = useState<Record<string, Variable[]>>(() => loadLocalVariables());
  const [activeLocalEnv, setActiveLocalEnv] = useState<string>(() => loadActiveLocalEnv());
  const [globalVariables, setGlobalVariables] = useState<Variable[]>(() => loadGlobalVariables());
  const [tabs, setTabs] = useState<RequestTab[]>(() => loadTabs());
  const currentTab = tabs.find(t => t.id === activeTabId);
  const isGlobalVariablesTabOpen = activeTabId === VARIABLES_TAB_ID;
  const isLocalVariablesTabOpen = activeTabId === LOCAL_VARIABLES_TAB_ID;

  // Save variables to localStorage whenever they change
  useEffect(() => {
    saveGlobalVariables(globalVariables);
  }, [globalVariables]);

  useEffect(() => {
    saveLocalVariables(localVariables);
  }, [localVariables]);

  useEffect(() => {
    if (activeLocalEnv) {
      saveActiveLocalEnv(activeLocalEnv);
    }
  }, [activeLocalEnv]);

  // Save tabs to localStorage whenever they change
  useEffect(() => {
    saveTabs(tabs);
  }, [tabs]);


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

  const handleCreateEnvironment = (name: string, variables?:  { key: string; value: string }[]) => {
    setLocalVariables({
      ...localVariables,
      [name]: variables?? [],
    });
    setActiveLocalEnv(name);
    setShowCreateEnvModal(false);
  };

  const handleDeleteEnvironment = (name: string) => {
    const updated = {...localVariables}
    delete updated[name]

    setLocalVariables(updated)
    const first = Object.keys(localVariables)[0] ?? '';
    setActiveLocalEnv(first);
    saveActiveLocalEnv(first)
  };

  return (
    <div className="container">
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
            {activeLocalEnv}
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
      ) : currentTab ? (
        <div className="request-section">
          <UrlInputViewer 
                currentTab={currentTab}
                updateTab={updateTab}
                globalVariables={globalVariables}
                localVariables={localVariables}
                activeLocalEnv={activeLocalEnv}
                />

        <RequestBuilder
          currentTab={currentTab}
          emptyParamKey={emptyParamKey}
          emptyHeaderKey={emptyHeaderKey}
          updateTab={updateTab}
          setEmptyParamKey={setEmptyParamKey}
          setEmptyHeaderKey={setEmptyHeaderKey}
        />
        </div>
      ) : null}

      {currentTab && currentTab.error && <div className="error">{currentTab.error}</div>}

      {currentTab && (currentTab.response || currentTab.responseInfo) && (
        <ResponseViewer
          response={currentTab.response}
          headers={currentTab.headers}
          responseInfo={currentTab.responseInfo}
          activeTab={currentTab.activeTab}
          onTabChange={(tab) => updateTab({activeTab: tab})}
          fullUrl={currentTab.sentUrl}
        />
      )}

      <CreateEnvironmentModal
        isOpen={showCreateEnvModal}
        onClose={() => setShowCreateEnvModal(false)}
        onCreate={handleCreateEnvironment}
        existingEnvironments={Object.keys(localVariables)}
      />
    </div>
  );
}
