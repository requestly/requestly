Manifest V3 browser extension for Chrome, Edge, Firefox, and Safari. Uses `chrome.declarativeNetRequest` for rule-based request interception and `chrome.webRequest` for observational tracking (execution logging, not blocking).

# Architecture

## Dual Interception Strategy

The extension uses **two complementary interception mechanisms**:

1. **declarativeNetRequest (DNR)** — Handles Redirect, Replace, QueryParam, Cancel, Headers, and UserAgent rules. Rules are compiled into DNR format and registered as dynamic rules. This is the primary interception path for MV3.
2. **webRequest (read-only)** — Listens to `onBeforeRequest`, `onBeforeSendHeaders`, `onHeadersReceived` to track which rules matched which requests (for the execution log in devtools/popup). Does NOT modify requests — purely observational in MV3.
3. **Client-side interception** — Response, Request body, and Delay rules are handled via page scripts (`ajaxRequestInterceptor`) that monkey-patch `fetch`/`XHR` in the MAIN world. Rules are cached into `window.__REQUESTLY__` on each navigation.

## Service Worker (`src/service-worker/`)

Entry point: `index.ts` — initializes all services at startup.

Key services in `services/`:
- **`rulesManager.ts`** — Core DNR rule management. Converts Requestly rules → DNR rules via `rule.extensionRules`, registers them with `chrome.declarativeNetRequest.updateDynamicRules`. Re-applies on rule change, extension toggle, or block-list update. Also manages per-tab session rules via `updateRequestSpecificRules`.
- **`webRequestInterceptor.ts`** — Read-only webRequest listeners for execution tracking. Adds/removes listeners based on extension enabled state.
- **`clientHandler.ts`** — Registers MAIN-world content scripts (`ajaxRequestInterceptor`, `sessionRecorderHelper`) via `chrome.scripting.registerContentScripts`. Also handles client-side rule caching — injects rule data into `window.__REQUESTLY__` on every navigation.
- **`messageHandler/`** — Central message router (`listener.ts`) handling 30+ message types from popup, content scripts, devtools, and the web app. `sender.ts` sends messages back to the app tab.
- **`ruleExecutionHandler.ts`** — Tracks which rules were applied to which tabs/requests. Caches executions per tab.
- **`scriptRuleHandler.ts`** — Injects user-defined scripts (Insert Scripts rule type) into matching tabs.
- **`requestProcessor/`** — Handles edge cases: forwarding headers on redirect, CSP error handling, initiator domain functions.
- **`sessionRecording.ts`** — Manages session recording lifecycle (start, stop, cache, replay).
- **`desktopApp/`** — WebSocket connection to the Requestly desktop app for proxy-based interception. Port scanning, connection management, proxy toggling.
- **`tabService.ts`** — Per-tab data store (session rules map, execution data).
- **`extensionIconManager.ts`** — Manages extension icon state (active/inactive/recording).
- **`globalStateManager.ts`** — Shared state caching between content script and service worker.

## Content Scripts (`src/content-scripts/`)

Two content script bundles:
- **`client/`** — Injected into all pages. Handles page script message relay, rule execution notifications from client-side interception, and test-rule mode.
- **`app/`** — Injected only into Requestly web app pages (`*.requestly.io`, `*.requestly.in`, `requestly.com`). Handles bidirectional sync between the web app and extension storage.

Common modules in `content-scripts/common/`:
- `sessionRecorder.ts` — Initializes session recording SDK in content script context.
- `extensionMessageListener.ts` — Listens for messages from service worker.

## Page Scripts (`src/page-scripts/`)

Injected into the MAIN world (page's JS context):
- **`ajaxRequestInterceptor/`** — Monkey-patches `fetch` and `XMLHttpRequest` to intercept and modify requests/responses. Reads rules from `window.__REQUESTLY__`.
- **`sessionRecorderHelper.js`** — Bridges session recording events from the page to the content script.

## Rule Matching (`src/common/ruleMatcher.ts`)

Local rule matcher used by webRequest listeners and the request processor. Supports URL matching with Equals, Contains, Regex, and Wildcard operators. Also handles source filters (page domains, request method, resource type, request payload).

This is separate from the `common/rule-processor/` shared package — it's a lighter-weight matcher specific to the extension's needs.

# Safari Differences

Safari uses separate entry points suffixed with `.safari.ts`:
- `service-worker/index.safari.ts`
- `content-scripts/app/index.safari.ts`
- `content-scripts/client/index.safari.ts`
- `service-worker/services/messageHandler.safari.ts`

Safari's `declarativeNetRequest` API has differences — `ResourceType` enum is not defined, so resource types are hardcoded as string literals.

Built with a separate Rollup config: `rollup.config.safari.js`.

# Build System

- **Bundler**: Rollup (`rollup.config.js`)
- **Build command**: `npm run build` (builds `../common` first, then mv3)
- **Output**: `dist/` directory
- **Manifests**: Browser-specific manifests (`manifest.chrome.json`, `manifest.edge.json`, `manifest.firefox.json`, `manifest.safari.json`) are processed at build time — version injected from package.json, content script URL patterns generated from config.
- **Config dependency**: `../config/` provides environment-specific values (`WEB_URL`, `OTHER_WEB_URLS`, `browser`).
- **Tests**: Playwright-based E2E tests in `tests/`.

# Web-to-Extension Communication

Two channels allow external websites to communicate with the extension:

## 1. Requestly Web App (content script bridge)

The `app/` content script is injected only into Requestly pages (`*.requestly.io`, `*.requestly.in`, `requestly.com`) — URL patterns are set in the manifest's `content_scripts[0].matches` and dynamically generated from `WEB_URL`/`OTHER_WEB_URLS` config at build time.

Communication flow: **Web app → `window.postMessage` → app content script (`messageHandler.ts`) → `chrome.runtime.sendMessage` → service worker**. Responses flow back the same path in reverse.

This bridge gives the web app full access to:
- Extension storage CRUD (`GET_STORAGE_OBJECT`, `SAVE_STORAGE_OBJECT`, `REMOVE_STORAGE_OBJECT`, `CLEAR_STORAGE`, `GET_STORAGE_SUPER_OBJECT`) — this is how rules sync from the web app into the extension.
- Service worker actions delegated via `delegateMessageToBackground` (session recording, API client, rule testing, desktop app proxy, extension status).

The content script also stamps DOM attributes on `<html>` so the web app can detect the extension: `rq-ext-version`, `rq-ext-mv` (= "3"), `rq-ext-id`.

## 2. BrowserStack Domains (externally connectable)

The manifest's `externally_connectable.matches` allows BrowserStack domains (`https://*.bsstag.com/*`, `https://*.browserstack.com/*`) to call `chrome.runtime.sendMessage(extensionId, ...)` directly from their page JS — no content script needed.

The `initExternalMessageListener` handler in `messageHandler/listener.ts` responds to `GET_EXTENSION_METADATA` with the extension's name and version. This is how BrowserStack products detect and identify the Requestly extension.

# Key Patterns

- **Variable system** (`service-worker/variable.ts`): Extension state (like `IS_EXTENSION_ENABLED`) is stored in `chrome.storage.local` with `rq_var_` prefix. Changes are observed via `chrome.storage.onChanged` listeners.
- **Block list**: Certain domains can be excluded from interception. Block list changes trigger re-registration of both DNR rules and content scripts.
- **Storage**: All rule/group data lives in `chrome.storage.local` (via `common/storage.ts`). The extension does not use IndexedDB or localStorage.
- **Imports from `common`**: Resolved to `../common/src/` at build time. Shared types, constants, storage layer, and rules store are imported as `common/*`.

# Development

- `npm run watch` — Rollup watch mode for development
- `npm run start:firefox` — Launch Firefox with the extension loaded via `web-ext`
- `npm test` — Runs Playwright E2E tests (requires build first)
- Alt+T — Reload extension in development mode (non-production builds only)
