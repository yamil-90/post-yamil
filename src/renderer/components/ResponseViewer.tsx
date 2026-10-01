import { formatBytes, JsonHighlight } from "../helpers/formatting";

interface ResponseViewerProps {
  response: string;
  headers: Record<string, string>;
  responseInfo: { status: number; statusText: string; size: number; time: number} | null;
  activeTab: 'body' | 'headers' | 'info';
  onTabChange: (tab: 'body' | 'headers' | 'info') => void;
  fullUrl: string;
}

export const ResponseViewer = ({
  response,
  headers,
  responseInfo,
  activeTab,
  onTabChange,
  fullUrl
}: ResponseViewerProps) => {

  const renderInfo = () => {
      if (!responseInfo) return null;

      const statusColor = responseInfo.status >= 200 && responseInfo.status < 300 ? '#28a745' : 
                          responseInfo.status >= 300 && responseInfo.status < 400 ? '#ffc107' :
                          responseInfo.status >= 400 ? '#dc3545' : '#6c757d';

      return (
          <div className="info-container">
          <div className="info-item">
              <span className="info-label">Status Code:</span>
              <span className="info-value" style={{ color: statusColor, fontWeight: 'bold' }}>
              {responseInfo.status} {responseInfo.statusText}
              </span>
          </div>
          <div className="info-item">
              <span className="info-label">Response Size:</span>
              <span className="info-value">{formatBytes(responseInfo.size)}</span>
          </div>
          <div className="info-item">
              <span className="info-label">Time Taken:</span>
              <span className="info-value">{responseInfo.time}ms</span>
          </div>
          <div className="info-item">
              <span className="info-label">URL:</span>
              <span className="info-value info-url">{fullUrl}</span>
          </div>
          </div>
      );
  };

  const renderHeaders = () => {
      if (Object.keys(headers).length === 0) {
          return <p className="no-headers">No headers received</p>;
  }

  const maxKeyLength = Math.min(
      Math.max(...Object.keys(headers).map(k => k.length)) + 1,
      40
  );

  return (
      <div className="headers-container">
          {Object.entries(headers).map(([key, value]) => (
              <div key={key} className="header-item" style={{ '--key-width': `${maxKeyLength}ch` } as React.CSSProperties}>
              <span className="header-key">{key}:</span>
              <span className="header-value">{value}</span>
              </div>
          ))}
          </div>
      );
  };

  const renderResponse = () => {
      if (!response) return null;

      try {
        const parsed = JSON.parse(response);
        const jsonString = JSON.stringify(parsed, null, 2);
        return <JsonHighlight json={jsonString} />;
      } catch {
        if (response.trim().startsWith('<')) {
          return (
            <div className="html-response">
              <p className="response-label">HTML Response:</p>
              <pre>{response}</pre>
            </div>
          );
        }
        return (
          <pre className="text-response">
            {response}
          </pre>
        );
      }
  };

  return  <div className="response-section">
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'body' ? 'active' : ''}`}
                onClick={() => onTabChange( 'body' )}
              >
                Body
              </button>
              <button
                className={`tab ${activeTab === 'headers' ? 'active' : ''}`}
                onClick={() => onTabChange( 'headers' )}
              >
                Headers
              </button>
              <button
                className={`tab ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => onTabChange( 'info' )}
              >
                Info
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'body' && renderResponse()}
              {activeTab === 'headers' && renderHeaders()}
              {activeTab === 'info' && renderInfo()}
            </div>
          </div>
}