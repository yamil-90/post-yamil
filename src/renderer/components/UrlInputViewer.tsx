import { RequestTab } from "../App";
import { getDisplayUrl } from '../helpers/urlBuilder';
import { getMethodColor } from '../helpers/formatting';
import { Variable } from "./VariablesManager";
import { isCurlCommand, parseCurl, applyCurlToTab } from '../helpers/curlParser';

import { handleUrlChange, handleSendRequest } from '../services/requestService'

interface UrlInputViewerProps {
    currentTab:RequestTab;
    updateTab:(tab: any) => void;
    globalVariables:Variable[];
    localVariables:Record<string, Variable[]>;
    activeLocalEnv: string;
    onRequestSent?: (url: string, method: string, status: number) => void;
}

export const UrlInputViewer = ({
    currentTab,
    updateTab,
    globalVariables,
    localVariables,
    activeLocalEnv,
    onRequestSent,
}:UrlInputViewerProps) =>{

    const handleUrlInputChange = (value: string) => {
        // Check if it's a cURL command
        if (isCurlCommand(value)) {
            const parsed = parseCurl(value);
            if (parsed) {
                // Apply cURL data to current tab
                const updates = applyCurlToTab(currentTab, parsed);
                updateTab(updates);
                return;
            }
        }
        // Regular URL handling
        handleUrlChange(value, updateTab);
    };

    return <div className="input-group">
    <select
        value={currentTab.method}
        onChange={(e) => updateTab({ method: e.target.value })}
        style={{
        color: getMethodColor(currentTab.method),
        fontWeight: 'bold',
        minWidth: '100px',
        }}
    >
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="DELETE">DELETE</option>
        <option value="PATCH">PATCH</option>
        <option value="OPTIONS">OPTIONS</option>
        <option value="HEAD">HEAD</option>
    </select>
    <input
        type="text"
        placeholder="Enter URL or paste a cURL command"
        value={getDisplayUrl(currentTab, globalVariables, localVariables, activeLocalEnv)}
        onChange={(e) => handleUrlInputChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSendRequest(currentTab, globalVariables, localVariables, activeLocalEnv, updateTab, onRequestSent)}
    />
    <button onClick={() => handleSendRequest(currentTab, globalVariables, localVariables, activeLocalEnv, updateTab, onRequestSent)} disabled={currentTab.loading}>
        {currentTab.loading ? 'Sending...' : 'Send Request'}
    </button>
    </div>
}