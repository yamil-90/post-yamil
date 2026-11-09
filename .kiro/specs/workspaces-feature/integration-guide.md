# Workspace Integration Guide

## Changes Needed in App.tsx

### 1. Add Imports
```typescript
import { SidebarMenu } from './components/SidebarMenu';
import { HistoryPanel } from './components/HistoryPanel';
import { SavedRequestsPanel } from './components/SavedRequestsPanel';
import {
  loadWorkspaces,
  saveWorkspaces,
  loadActiveWorkspaceId,
  saveActiveWorkspaceId,
  addToHistory,
  createDefaultWorkspace,
} from './services/workspaceService';
```

### 2. Add State Variables
```typescript
// Workspace state
const [workspaces, setWorkspaces] = useState<Workspace[]>(() => loadWorkspaces());
const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => loadActiveWorkspaceId());

// Sidebar state
const [sidebarOpen, setSidebarOpen] = useState(false);
const [activePanel, setActivePanel] = useState<'none' | 'my-requests' | 'history'>('none');

// Current workspace reference
const currentWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
```

### 3. Update localStorage Effects
- Replace individual variable saves with workspace saves
- Replace `setTabs` to also save workspace history
- Add effects for workspace changes

### 4. Add Workspace Functions
```typescript
// Switch workspace
const switchWorkspace = (workspaceId: string) => {
  setActiveWorkspaceId(workspaceId);
  saveActiveWorkspaceId(workspaceId);
  // Reload state from workspace
};

// Add to history (call after successful request)
const trackRequest = (url: string, method: string, status: number) => {
  if (!currentWorkspace) return;
  const updatedWorkspace = {
    ...currentWorkspace,
    history: addToHistory(currentWorkspace.history, url, method, status),
  };
  updateWorkspace(updatedWorkspace);
};

// Save request
const saveCurrentRequest = (name: string, description: string) => {
  // Get current request data from UI
  // Add to workspace.savedRequests
};

// Load saved request
const loadSavedRequest = (savedRequest: SavedRequest) => {
  // Create new tab with saved request data
};
```

### 5. Integration Points
- Call `trackRequest()` after successful HTTP request in handleSendRequest
- Add "Save Request" button to the request section
- Connect sidebar menu buttons to panel state
- Pass history and saved requests to panels as props

### 6. Update Storage Service
- Modify storageService.ts to work with workspaces
- Update variables loading to read from current workspace
- Add workspace persistence effects

## Implementation Steps
1. Add imports to App.tsx
2. Add state variables for workspaces and sidebar
3. Update useEffect hooks to handle workspace persistence
4. Add workspace switching logic
5. Integrate SidebarMenu component
6. Integrate HistoryPanel and SavedRequestsPanel
7. Add "Save Request" functionality
8. Test workspace isolation and data persistence
