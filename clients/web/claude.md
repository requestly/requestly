This is a React app that contains the UI code for Requestly. The same codebase runs in three different contexts:
- **Web browser** at https://app.requestly.io
- **Desktop app** (loaded inside Electron from `../../requestly-desktop-app`)
- **Browser extension** popup/options pages

The app adapts its behavior based on the environment using `window.RQ.MODE` and `window.RQ.DESKTOP`.

---

# Multi-Platform Support

The app detects its runtime environment and adapts:
- **Web mode**: Full web app experience
- **Desktop mode**: Enhanced with proxy control, file system access via IPC to desktop main/background processes
- **Extension mode**: Limited UI, communicates with extension background script

Communication bridges:
- **Desktop**: `window.RQ.DESKTOP` (IPC functions exposed via preload script)
- **Extension**: `chrome.runtime.sendMessage` / custom events

---

# Code Organization

## Primary Structure: Feature-Based

The **`features/`** directory is the main organizational unit. Each feature is a self-contained module:
- `apiClient/` - REST API client (Postman-like)
- `rules/` - Rule creation and management
- `mocks/` - Mock server
- `sessionBook/` - Session recording
- `settings/` - Settings and billing
- `workspaces/` - Team and workspace management
- `networkInspector/` - Network debugging
- and more...

Each feature contains its own:
- Components
- State management (Redux slices or Zustand stores)
- Routes
- Business logic
- Types

**When adding new functionality, prefer creating/extending features rather than adding to top-level directories.**

---

# State Management Architecture

## Mixed State Management Strategy

### Redux Toolkit (Global/Shared State)
Used for **cross-feature state** that needs to be accessed across the app:
- **`store/slices/`** - App-wide state (user, teams, workspace settings)
- **`store/features/`** - Feature state that needs to be shared or persisted:
  - `rules/` - Rule records (shared across rule editor, list, etc.)
  - `billing/` - Subscription state
  - `session-recording/` - Session data
  - `variables/` - Environment variables

**Why Redux here**: Needs persistence (redux-persist), cross-feature access, time-travel debugging

### Zustand (Feature-Local State)
Used for **feature-specific state** that doesn't need global access:
- **`features/apiClient/`** - Heavily uses Zustand stores for request builder state, collection tree, execution state

**API Client Store Architecture** (13+ stores):
- **Nested store composition**: Stores contain other Zustand stores (e.g., each collection/environment has its own variables store)
- **Multi-context pattern**: Each workspace gets isolated stores via `ApiClientFeatureContextProviderStore` - enables multiple workspaces to coexist
- **Store-per-scope**: Variables are managed at three levels (runtime → environment → collection) with dedicated stores at each scope
- **Performance optimization**: Reference maps (`childParentMap`, `index`) for fast tree navigation without full-array scans

**Repository Layer Abstraction** (`features/apiClient/helpers/modules/sync/`):
- Abstracts data persistence behind `ApiClientRepositoryInterface`
- **Three implementations** swapped at runtime based on workspace type:
  - `ApiClientCloudRepository` - Firebase (team workspaces)
  - `ApiClientLocalRepository` - File system via desktop IPC (local workspaces)
  - `ApiClientLocalStoreRepository` - IndexedDB (browser fallback)
- **Why**: UI code stays identical regardless of storage backend; workspace type determines which repository is injected
- Variable persistence uses separate IndexedDB layer (`store/shared/variablePersistence.ts`) with composite keys for scoping

### React Context
Used for **component-tree scoped state**:
- Feature-specific contexts in `features/*/contexts/`
- Layout contexts in `layouts/*/context/`

---

# Critical Architecture Patterns

## 1. PageScriptMessageHandler (PSMH)

**Location**: `src/config/PageScriptMessageHandler.js`

**Purpose**: Handles cross-context communication when the app runs in different sandboxed environments:
- Extension content scripts ↔ Web app
- Desktop app renderer ↔ Background process
- Iframe ↔ Parent window

**Key constraint**: Similar to IPC in desktop app, can only send **serializable data**. No functions, circular references, or complex objects.

Uses custom events and message passing to bridge isolated JavaScript contexts.

## 2. Layout System

**`layouts/`** directory contains different layout wrappers:
- **`DashboardLayout/`** - Main authenticated app (header, sidebar, footer)
- **`MinimalLayout/`** - Secondary pages (invites, payments) - minimal chrome
- **`FullScreenLayout/`** - Embedded/iframe contexts - no navigation

Layouts are applied via React Router in `routes/index.tsx` and control:
- Navigation visibility
- Authentication requirements
- Context-specific UI chrome

**Routes are nested under layouts** - changing layout affects entire route subtree.

## 3. Backend Integration Layer

**`backend/`** directory is the **only** place that should:
- Import Firebase SDK
- Make Firestore/RTDB queries
- Call Cloud Functions
- Handle Firebase Storage

**Pattern**: Features should import from `backend/` modules, not directly use Firebase.

```
features/rules/screens/
  ↓ imports from
backend/rules/
  ↓ uses
Firebase SDK
```

**Why**: Abstraction allows switching storage backends (e.g., local storage in desktop workspaces) without changing feature code.

## 4. Design System Versioning

- **`lib/design-system/`** - Legacy design components (being phased out)
- **`lib/design-system-v2/`** - Modern Ant Design-based components (preferred)

**When building UI**: Prefer `design-system-v2` or Ant Design components directly.

## 5. Mode-Specific Code

**`components/mode-specific/`** contains platform-specific implementations:
- Browser-only features
- Desktop-only features (proxy controls, file system)
- Extension-only features

Use conditional rendering based on `window.RQ.MODE` to load correct variant.

---

# Important Directories (Non-Obvious Details)

## `modules/`

### `modules/extension/`
Communication layer with browser extension. Handles:
- Extension detection
- Rule sync to extension
- Extension status monitoring

### `modules/analytics/`
Analytics abstraction layer (Mixpanel, GA). All analytics events should go through this module for consistency.

### `modules/rule-adapters/`
Converts rules between different formats (Requestly format ↔ other tools like Charles, Fiddler).

## `services/`

### `services/clientStorageService/`
**Critical abstraction layer** for storage. Switches between:
- `localStorage` (web)
- IndexedDB (large data)
- Desktop local files (local workspace mode)


# External Dependencies

## Backend - Firebase
**Location**: `../../requestly-cloud/`

- **Authentication** - Firebase Auth (Google, Email, SSO)
- **Database** - Firestore (structured data), Realtime DB (live sync)
- **Cloud Functions** - Serverless backend
- **Storage** - File uploads

## Desktop App
**Location**: `../../requestly-desktop-app/`

When running in desktop app:
- Communicates via IPC through `window.RQ.DESKTOP.SERVICES.IPC`
- to understand more, read the claude.md at `../../requestly-desktop-app/`

---

# Key Files

- **`src/index.jsx`** - Bootstrap: Redux store initialization, error boundary (Sentry), hotkeys provider
- **`src/App.tsx`** - Root component with React Router setup
- **`src/routes/index.tsx`** - Route definitions with layout nesting
- **`src/store/index.ts`** - Redux store config with autoBatch enhancer for performance
- **`src/firebase.js`** - Firebase initialization (DO NOT import elsewhere, use `backend/` modules)
- **`src/config/PageScriptMessageHandler.js`** - Cross-context communication setup

---

# Development Guidelines

1. **New features**: Add to `features/` directory as self-contained modules
2. **State management**: Use Redux for shared state, Zustand for feature-local state
3. **Backend calls**: Always go through `backend/` modules, never direct Firebase imports
4. **Storage**: Use `services/clientStorageService/`, not direct localStorage
5. **Platform-specific code**: Use `mode-specific/` components and `window.RQ.MODE` detection
6. **UI components**: Prefer `lib/design-system-v2/` or Ant Design directly 