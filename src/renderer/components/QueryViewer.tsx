import { useRef } from 'react';
import { RequestTab } from '../App';

interface QueryViewerProps {
    currentTab: RequestTab;
    emptyParamKey: string;
    updateTab:(tab: any) => void;
    setEmptyParamKey: (value: string) => void;

}

export const QueryViewer = ({
    currentTab,
    emptyParamKey,
    updateTab,
    setEmptyParamKey,
}: QueryViewerProps ) => {

  const valueInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());
  const keyInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  const removeQueryParam = (index: number) => {
    updateTab({ queryParams: currentTab.queryParams.filter((_, i) => i !== index) });
  };

  const updateQueryParam = (index: number, field: 'key' | 'value' | 'checked', value: string | boolean) => {
    const updated : any[] = [...currentTab.queryParams];
    console.log(updated[index]);
    updated[index][field] = value;
    updateTab({ queryParams: updated });
  };

  const handleEmptyKeyChange = (value: string) => {
    if (value.trim() && !emptyParamKey.trim()) {
      const newIndex = currentTab.queryParams.length;
      updateTab({ queryParams: [...currentTab.queryParams, { checked: true, key: value, value: '' }] });

      setTimeout(() => {
        keyInputRefs.current.get(newIndex)?.focus();
      }, 0);
    } else  {
      setEmptyParamKey(value);
    }
  };

  const handleEmptyKeyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Tab to the value field: add param first, then move to value
    if (e.key === 'Tab' && emptyParamKey.trim()) {
      e.preventDefault();
      const newIndex = currentTab.queryParams.length;
      updateTab({ queryParams: [...currentTab.queryParams, { checked: true, key: emptyParamKey, value: '' }] });
      setEmptyParamKey('');
      // Focus the value field of the newly added param
      setTimeout(() => {
        valueInputRefs.current.get(newIndex)?.focus();
      }, 0);
    }
  };

  const renderQueryParams = () => {
    return (
      <div className="query-params-section">
        <div className="params-header">
          <h3>Query Parameters</h3>
        </div>

        <div className="params-table">
          <div className="params-row header-row">
            <div className="params-col">Key</div>
            <div className="params-col">Value</div>
            <div className="params-col action">Action</div>
          </div>
          {currentTab.queryParams.map((param, index) => (
            <div key={`param-${index}`} className="params-row">
              <input 
              className="params-input-check"
              type="checkbox"
              onChange={(e) => updateQueryParam(index, 'checked', e.target.checked)}
              checked={param.checked}
              />
              <input
                ref={(el) => {
                  if (el) keyInputRefs.current.set(index, el);
                }}
                type="text"
                className="params-input-name"
                placeholder=""
                value={param.key}
                onChange={(e) => updateQueryParam(index, 'key', e.target.value)}
              />
              <input
                ref={(el) => {
                  if (el) valueInputRefs.current.set(index, el);
                }}
                type="text"
                className="params-input-value"
                placeholder=""
                value={param.value}
                onChange={(e) => updateQueryParam(index, 'value', e.target.value)}
              />
              <button
                className="delete-btn"
                onClick={() => removeQueryParam(index)}
              >
                Delete
              </button>
            </div>
          ))}
          <div key="empty-row" className="params-row">
            <input
              className='params-input-check'
              type="checkbox"

            />
            <input
              type="text"
              className="params-input-name"
              placeholder=""
              value={emptyParamKey}
              onChange={(e) => handleEmptyKeyChange(e.target.value)}
              onKeyDown={handleEmptyKeyKeyDown}
            />
            <input
              type="text"
              className="params-input-value"
              placeholder=""
              disabled
            />
            <div className="params-col action"></div>
          </div>
        </div>
      </div>
    );
  };

  return renderQueryParams();
}