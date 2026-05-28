Shared code used by the MV3 browser extension (and previously MV2, now deprecated). Contains the storage abstraction layer, popup UI, devtools panel, custom elements (in-page widgets), and shared constants/types.

# Code Organization

## Core Modules (`src/`)

- **`storage.ts`** — Abstraction over `chrome.storage.local`. Provides CRUD operations (`saveRecord`, `getRecord`, `removeRecord`, `getAllRecords`) and a reactive change listener (`onRecordChange`) with filtering by change type, key, and value. All extension storage access should go through this module.
- **`rulesStore.ts`** — Rule/group retrieval layer built on top of `storage.ts`. Provides `getRules`, `getGroups`, `getEnabledRules` (filters by status and group status), `onRuleOrGroupChange` (reactive listener that only fires on meaningful changes).
- **`constants.ts`** — Message action constants (`EXTENSION_MESSAGES`, `CLIENT_MESSAGES`, `APP_MESSAGES`), storage keys, rule title mappings, and the `PUBLIC_NAMESPACE` (`__REQUESTLY__`).
- **`types.ts`** — Core extension types: `Rule`, `Group`, `RuleType`, `ObjectType`, `Status`, `SourceOperator`, `SourceKey`, DNR-related types (`UpdateDynamicRuleOptions`).
- **`config.ts`** — Runtime config (log level).
- **`eventUtils.ts`** — Event tracking utility helpers.
- **`utils.ts`** — General-purpose utility functions.

## Popup (`src/popup/`)

The extension popup UI — a standalone React app (Ant Design dark theme) rendered in the popup window.

- Entry point: `index.tsx` — Renders `<Popup>` inside `RecordsProvider` and Ant Design `ConfigProvider`.
- **`components/Popup/`** — Main popup component with header and tab navigation.
- **`components/PopupTabs/`** — Tab navigation (recent rules, pinned rules, executed rules, session recording).
- **`components/ExecutedRules/`** — Shows rules that fired on the current tab.
- **`components/RecentRecords/`**, **`PinnedRecords/`** — Rule lists with pin/unpin actions.
- **`components/SessionRecording/`** — Session recording controls.
- **`components/ApiClientContainer/`** — API client entry point in popup.
- **`components/DesktopAppProxy/`** — Desktop app connection status and controls.
- **`components/HttpsRuleOptions/`** — HTTPS rule configuration.
- **`contexts/RecordsContext/`** — React context + reducer for managing records state (rules, groups, pinned items) in the popup.

## Devtools Panel (`src/devtools/`)

Chrome DevTools panel integration — adds a "Requestly" panel to Chrome DevTools.

- **`devtools.js`** — Panel registration via `chrome.devtools.panels.create`. Firefox gets plain text title; Chrome/others get emoji prefix.
- **`index.tsx`** — Devtools panel React app entry point.
- **`containers/network/`** — Network log viewer with request/response details, headers, payload tabs, and filtering toolbars.
- **`containers/executions/`** — Rule execution log viewer showing which rules were applied.
- **`containers/analytics-inspector/`** — Analytics event inspector for debugging third-party tracking.
- **`components/`** — Shared devtools UI components (resource type filter, icon button, empty state placeholder).

## Custom Elements (`src/custom-elements/`)

Web Components (Custom Elements) injected into target pages for in-page UI:

- **`toast/`** — Toast notification widget.
- **`test-rule-widget/`** — Widgets shown during rule testing:
  - `explicit-test-rule-widget/` — Shown when user explicitly tests a rule.
  - `implicit-test-rule-widget/` — Shown for automatic rule testing feedback.
- **`session-recording-widgets/`** — Session recording UI:
  - `manual-mode-widget/` — Controls for manual recording.
  - `auto-mode-widget/` — Controls for auto recording.
  - `draft-session-viewer/` — Preview of recorded session.
  - `post-session-save-widget/` — Post-save confirmation widget.
- **`abstract-classes/draggable-widget.ts`** — Base class for draggable floating widgets.

All custom elements are registered in `index.ts`.

# Build System

- **Bundler**: Rollup (`rollup.config.js`)
- **Build command**: `npm run build` (output to `dist/`)
- **Dependencies**: React 18, Ant Design 5, CodeMirror 6, `@devtools-ds/*` for devtools UI, `@requestly/analytics-vendors` (local package).
- **Preprocessor**: Uses PostCSS + Sass for styles.
- **Pre-install hook**: Builds the analytics vendor package via `scripts/build-analytics-vendor.sh`.

# How MV3 Depends on Common

The MV3 extension imports from this package as `common/*` (resolved at build time to `../common/src/*`). Key imports:
- `common/storage` — Storage abstraction
- `common/rulesStore` — Rule retrieval and change listeners
- `common/constants` — Message types and storage keys
- `common/types` — TypeScript type definitions
- `common/config` — Runtime config

The popup and devtools UIs are built separately by this package's Rollup config and output as HTML/JS bundles that the MV3 extension includes in its `dist/`.

# Development

- `npm run build` — Full build
- `npm run watch` — Rollup watch mode
- Changes here require rebuilding: from `../mv3/`, run `npm run build:common` or `npm run build` (which does both)
