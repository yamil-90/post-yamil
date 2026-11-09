# Workspaces Feature Requirements

## Overview
Users can create multiple workspaces, each with isolated variables, history, and saved requests.

## 1. Workspace Management
- **Create Workspace**: New workspace with default name "New Workspace"
- **Switch Workspace**: Dropdown/selector to switch between workspaces
- **Delete Workspace**: Confirm before deletion, cannot delete if only one workspace exists
- **Rename Workspace**: Edit workspace name
- **Storage**: Workspace data persisted to localStorage with workspace ID as key

### Data Structure
```typescript
interface Workspace {
  id: string;
  name: string;
  globalVariables: Variable[];
  localVariables: Record<string, Variable[]>;
  activeLocalEnv: string;
  savedRequests: SavedRequest[];
  history: RequestHistory[];
  createdAt: number;
}
```

## 2. History Tab
- **Storage**: Array of request history items
- **Auto-cleanup**: Delete entries older than 2 days
- **Deduplication**: If same request made consecutively, show count (n) next to it
- **Display Format**: Request URL | Date | Status Code
- **Click Action**: Open request in new tab (read-only or editable)
- **Persistence**: Auto-save to localStorage

### Data Structure
```typescript
interface RequestHistory {
  id: string;
  url: string;
  method: string;
  status: number;
  timestamp: number;
  count: number; // 1 if single, >1 if repeated
}
```

## 3. My Requests (Saved Requests)
- **Save Request**: Button in UI to save current request with name and description
- **Grouping**: Organize requests into collapsible groups/folders
- **Edit**: Modify saved request details and request content
- **Delete**: Remove saved request with confirmation
- **Load**: Click to open saved request in new tab
- **Persistence**: Saved to localStorage

### Data Structure
```typescript
interface SavedRequest {
  id: string;
  name: string;
  description: string;
  groupId?: string;
  url: string;
  method: string;
  body: string;
  queryParams: QueryParam[];
  requestHeaders: RequestHeader[];
  createdAt: number;
}

interface RequestGroup {
  id: string;
  name: string;
  workspaceId: string;
}
```

## 4. Left Sidebar Menu
- **Hamburger Menu**: Top-left toggle button
- **Menu Panel**: Opens/closes when hamburger clicked
- **Tab Buttons**: "My Requests" and "History" buttons
- **Content Panel**: Slides in from left showing:
  - List of saved requests (with groups)
  - List of history items
- **Sticky**: Can be kept open or auto-collapse on selection
- **Z-index**: Above main content

### Layout
```
┌─ Hamburger Menu
├─ Menu Panel (width: 200px)
│  ├─ My Requests Button
│  └─ History Button
├─ Content Panel (width: 250px)
│  └─ [Content depends on selected tab]
└─ Main Content
```

## 5. Integration Points
- **Active Tab Tracking**: History/My Requests content panel state
- **Workspace State**: Global state tracking current workspace
- **Deduplication Logic**: Check if latest history item matches new request
- **Auto-cleanup**: Trigger on app load and after each request
- **Save Request UI**: New button in request area

## Implementation Order
1. Create Workspace data structure and storage service
2. Implement workspace switching and management
3. Create History tracking system with auto-cleanup
4. Create My Requests system with grouping
5. Build left sidebar menu UI
6. Add history and saved requests display panels
7. Add save request functionality
8. Test persistence and cleanup logic
