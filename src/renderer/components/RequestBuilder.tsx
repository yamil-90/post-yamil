import { useState } from 'react';
import { RequestTab } from '../App';
import { BodyViewer } from './BodyViewer';
import { QueryViewer } from './QueryViewer';
import { HeadersManager } from './HeadersManager';

interface RequestBuilderProps {
  currentTab: RequestTab;
  emptyParamKey: string;
  emptyHeaderKey: string;
  updateTab: (updates: Partial<RequestTab>) => void;
  setEmptyParamKey: (value: string) => void;
  setEmptyHeaderKey: (value: string) => void;
}

type RequestBuilderTab = 'query' | 'headers' | 'body';

export const RequestBuilder = ({
  currentTab,
  emptyParamKey,
  emptyHeaderKey,
  updateTab,
  setEmptyParamKey,
  setEmptyHeaderKey,
}: RequestBuilderProps) => {
  const [activeBuilderTab, setActiveBuilderTab] = useState<RequestBuilderTab>('query');

  const showBodyTab = currentTab.method === 'POST' || currentTab.method === 'PUT' || currentTab.method === 'PATCH';

  return (
    <div className="request-builder">
      <div className="tabs">
        <button
          className={`tab ${activeBuilderTab === 'query' ? 'active' : ''}`}
          onClick={() => setActiveBuilderTab('query')}
        >
          Query Parameters
        </button>
        <button
          className={`tab ${activeBuilderTab === 'headers' ? 'active' : ''}`}
          onClick={() => setActiveBuilderTab('headers')}
        >
          Headers
        </button>
        {showBodyTab && (
          <button
            className={`tab ${activeBuilderTab === 'body' ? 'active' : ''}`}
            onClick={() => setActiveBuilderTab('body')}
          >
            Body
          </button>
        )}
      </div>

      <div className="tab-content">
        {activeBuilderTab === 'query' && (
          <QueryViewer
            currentTab={currentTab}
            emptyParamKey={emptyParamKey}
            updateTab={updateTab}
            setEmptyParamKey={setEmptyParamKey}
          />
        )}

        {activeBuilderTab === 'headers' && (
          <HeadersManager
            currentTab={currentTab}
            emptyHeaderKey={emptyHeaderKey}
            updateTab={updateTab}
            setEmptyHeaderKey={setEmptyHeaderKey}
          />
        )}

        {activeBuilderTab === 'body' && showBodyTab && (
          <BodyViewer
            currentTab={currentTab}
            updateTab={updateTab}
          />
        )}
      </div>
    </div>
  );
};
