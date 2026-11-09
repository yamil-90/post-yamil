import { RequestTab } from "../App";
import { getDisplayUrl } from '../helpers/urlBuilder';
import { getMethodColor } from '../helpers/formatting';
import { Variable } from "./VariablesManager";

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
        placeholder="Enter URL (e.g., api.example.com/data)"
        value={getDisplayUrl(currentTab, globalVariables, localVariables, activeLocalEnv)}
        onChange={(e) => handleUrlChange(e.target.value, updateTab)}
        onKeyDown={(e) => e.key === 'Enter' && handleSendRequest(currentTab, globalVariables, localVariables, activeLocalEnv, updateTab, onRequestSent)}
    />
    <button onClick={() => handleSendRequest(currentTab, globalVariables, localVariables, activeLocalEnv, updateTab, onRequestSent)} disabled={currentTab.loading}>
        {currentTab.loading ? 'Sending...' : 'Send Request'}
    </button>
    </div>
}