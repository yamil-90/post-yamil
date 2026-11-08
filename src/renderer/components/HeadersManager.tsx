import { useRef } from 'react';
import { RequestTab } from '../App';

interface HeadersManagerProps {
  currentTab: RequestTab;
  emptyHeaderKey: string;
  updateTab: (tab: any) => void;
  setEmptyHeaderKey: (value: string) => void;
}

export const HeadersManager = ({
  currentTab,
  emptyHeaderKey,
  updateTab,
  setEmptyHeaderKey,
}: HeadersManagerProps) => {
  const valueInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());
  const keyInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  const removeHeader = (index: number) => {
    updateTab({ requestHeaders: currentTab.requestHeaders.filter((_, i) => i !== index) });
  };

  const updateHeader = (index: number, field: 'key' | 'value' | 'checked', value: string | boolean) => {
    const updated: any[] = [...currentTab.requestHeaders];
    updated[index][field] = value;
    updateTab({ requestHeaders: updated });
  };

  const handleEmptyKeyChange = (value: string) => {
    if (value.trim() && !emptyHeaderKey.trim()) {
      const newIndex = currentTab.queryParams.length;
      updateTab({ queryParams: [...currentTab.queryParams, { checked: true, key: value, value: '' }] });

      setTimeout(() => {
        keyInputRefs.current.get(newIndex)?.focus();
      }, 0);
    } else  {
    setEmptyHeaderKey(value);
    }
  };

  const handleEmptyKeyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Tab to the value field: add header first, then move to value
    if (e.key === 'Tab' && emptyHeaderKey.trim()) {
      e.preventDefault();
      const newIndex = currentTab.requestHeaders.length;
      updateTab({ requestHeaders: [...currentTab.requestHeaders, { checked: true, key: emptyHeaderKey, value: '' }] });
      setEmptyHeaderKey('');
      // Focus the value field of the newly added header
      setTimeout(() => {
        valueInputRefs.current.get(newIndex)?.focus();
      }, 0);
    }
  };

  const renderHeaders = () => {
    return (
      <div className="headers-section">
        <div className="headers-header">
          <h3>Headers</h3>
        </div>

        <div className="headers-table">
          <div className="headers-row header-row">
            <div className="headers-col">Check</div>
            <div className="headers-col">Key</div>
            <div className="headers-col">Value</div>
            <div className="headers-col action">Action</div>
          </div>
          {currentTab.requestHeaders.map((header, index) => (
            <div key={`header-${index}`} className="headers-row">
              <input
                type="checkbox"
                className="headers-input-check"
                onChange={(e) => updateHeader(index, 'checked', e.target.checked)}
                checked={header.checked ?? true}
              />
              <input
                ref={(el) => {
                  if (el) keyInputRefs.current.set(index, el);
                }}
                type="text"
                className="headers-input-name"
                placeholder="Header name"
                value={header.key}
                onChange={(e) => updateHeader(index, 'key', e.target.value)}
              />
              <input
                ref={(el) => {
                  if (el) valueInputRefs.current.set(index, el);
                }}
                type="text"
                className="headers-input-value"
                placeholder="Header value"
                value={header.value}
                onChange={(e) => updateHeader(index, 'value', e.target.value)}
              />
              <button
                className="delete-btn"
                onClick={() => removeHeader(index)}
              >
                Delete
              </button>
            </div>
          ))}
          <div key="empty-row" className="headers-row">
            <input
              type="checkbox"
              className="headers-input-check"
              disabled
            />
            <input
              type="text"
              className="headers-input-name"
              placeholder="Header name"
              value={emptyHeaderKey}
              onChange={(e) => handleEmptyKeyChange(e.target.value)}
              onKeyDown={handleEmptyKeyKeyDown}
            />
            <input
              type="text"
              className="headers-input-value"
              placeholder="Header value"
              disabled
            />
            <div className="headers-col action"></div>
          </div>
        </div>
      </div>
    );
  };

  return renderHeaders();
};
