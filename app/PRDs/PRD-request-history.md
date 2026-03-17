# PRD: Request History — API Client

**Author**: Sagar
**Date**: March 16, 2026
**Status**: Draft
**Context**: New app rebuild from scratch

---

## 1. Overview

Request History is an auto-capture feature inside the API Client that records every HTTP and GraphQL request a user executes. It serves as a quick-access ledger of recent API calls — a scratch pad before users decide to permanently save something to a collection.

This PRD covers the feature specification for the rebuilt app. Each item is explicitly marked as **[Existing]** (carried from the old app) or **[New]** (improvement for the rebuild).

---

## 2. Goals

- Give developers instant access to recently executed requests without requiring manual saves.
- Enable quick debugging loops: re-open a past request, tweak, re-send.
- Provide per-request execution history so users can trace how a specific saved request was called over time.
- Keep history private by default while offering opt-in response saving for deeper debugging.

---

## 3. Non-Goals (Deferred to Later Phases)

The following features were evaluated during competitive analysis but are explicitly deferred:

- **Cloud sync** — History will remain local-only. No cross-device sync.
- **Shareable history snapshots** — No sharing links or shared history tab. Users must save to a collection first to share.
- **Export history** — No export as cURL, HAR, or CSV.
- **Contextual actions** — No "Create Mock" or "Add to Test Suite" shortcuts from history (except Delete, which is included).

---

## 4. Feature Specification

### 4.1 Auto-Capture [Existing]

Every HTTP and GraphQL request executed from the API Client is automatically appended to history. No manual action is required from the user.

**Behavior:**
- Triggered after a request completes (success or failure).
- Both HTTP and GraphQL request types are captured.
- Capture happens silently in the background.

**What is stored per entry:**
- Unique history entry ID (auto-generated)
- `request_id` — the ID of the saved collection request that was executed, if applicable. This field is `null` for draft/unsaved requests. Used for Per-Request History filtering (see Section 4.9).
- `workspace_id` — the workspace the request was executed in.
- Timestamp of execution.
- Request type (HTTP or GraphQL).
- HTTP method and full URL.
- Headers, query params, and path variables.
- Request body and content type.
- Authentication configuration.
- Pre-request and post-response scripts.
- Test results from execution.
- Response data (status code, headers, body) — **only if "Save Responses" toggle is ON** (see Section 4.7). Otherwise, response is `null`.

---

### 4.2 History Sidebar Tab [Existing, with changes]

History is accessed via a dedicated **History** tab (clock icon) in the API Client's left sidebar, alongside Collections, Environments, and Runtime Variables.

**Changes from old app:**

**[New] Date-based grouping** — Entries are grouped under exactly four buckets to keep the list clean and avoid excessive group headers:

1. **Today** — Requests from the current calendar day.
2. **Yesterday** — Requests from the previous calendar day.
3. **Last 7 Days** — Requests from 2–7 days ago (excludes Today and Yesterday).
4. **Past** — All remaining older requests.

Empty buckets are not shown. This replaces the old flat chronological list.

**Each entry shows (same as old app):**
- HTTP method badge (color-coded by method).
- Request URL (truncated, with full URL on hover tooltip).

**Note:** Timestamp and response status code are stored in the history data structure (see Section 4.1) but are **not** displayed in the sidebar list view. The list view is kept minimal — method + URL only — matching the current app's visual density. Timestamp and status code are visible when the entry is opened as a Draft.

---

### 4.3 History Scoping [New]

**History is scoped per workspace.**

Each workspace maintains its own independent history. Switching workspaces shows only the history for that workspace. This prevents data leakage across workspaces.

In the old app, history was global (all workspaces shared one list).

**Storage key**: Must include the workspace ID so histories are isolated.

---

### 4.4 History Cap [Existing, with changes]

**Old behavior:** Hard cap of 20 entries (FIFO). When a 21st entry was added, the oldest was dropped.

**New behavior:** Hard cap of **100 entries per workspace** (FIFO). When entry 101 is added, the oldest entry in that workspace is dropped.

---

### 4.5 Search Bar [New]

A search input is displayed at the top of the History sidebar tab.

**Behavior:**
- Filters history entries by **URL substring match** (case-insensitive).
- **Minimum 3 characters required** to activate search. If the user has typed only 1 or 2 characters, display an inline hint message below the search input: *"Type at least 3 characters to search"*. No filtering is applied until the 3-character threshold is met. This prevents noisy results from common single characters like "a" or "e" and is a standard UX practice.
- Once 3+ characters are entered, search is applied in real-time as the user types (no submit button needed).
- When the search field is empty, all entries are shown (with date grouping).
- When search is active, matching entries are shown with date grouping preserved (if results span multiple buckets).
- The search bar only filters by request URL. Method and status code are not searchable.

---

### 4.6 Open as Draft [Existing, with changes]

This is how users open and interact with history entries. The behavior has changed significantly.

**Old behavior:** Clicking a history entry opened a single "History" tab. Opening another history entry replaced the content in the same tab. Only one history entry could be viewed at a time.

**New behavior:** Clicking a history entry **opens it as a new Draft tab**.

**Detailed behavior:**

1. User clicks a history entry in the sidebar.
2. A new Draft tab opens with the request data (method, URL, headers, body, auth, scripts) pre-loaded from the history entry.
3. If response data exists for that entry (i.e., "Save Responses" was ON), the response is also displayed in the response pane.
4. The Draft tab starts in a **clean state** — no unsaved-changes indicator (dot) is shown.
5. If the user modifies anything (URL, headers, body, etc.), the unsaved-changes dot appears on the tab.
6. Multiple history entries can be opened simultaneously as separate Draft tabs.
7. The user can execute the request from the Draft tab. This creates a new history entry (standard auto-capture behavior).
8. The user can save the Draft to a collection using the Save flow (see Section 4.8).

**Edge cases:**

- **Opening the same history entry twice:** If a Draft tab already exists for that history entry **and has not been edited** (no unsaved changes), clicking the same history entry again should focus the existing Draft tab instead of opening a new one. However, if the existing Draft **has been edited** (unsaved-changes dot is showing), clicking the same history entry opens a **new** Draft tab with the original history data. This prevents losing the user's in-progress edits while avoiding unnecessary tab duplication.
- **Tab naming:** The Draft tab title should show the HTTP method + truncated URL (e.g., "GET /api/users"). If untitled, show "Untitled Request".
- **Closing without saving:** Closing a Draft tab with unsaved changes should show a confirmation prompt (standard draft behavior).
- **History entry with partial data:** If response data doesn't exist (Save Responses was OFF), the response pane shows an empty/default state. This is not an error.
- **`request_id` on re-execution from Draft:** When a user executes a request from a Draft that was opened from history, the newly created history entry has `request_id = null`. A Draft is an unsaved request regardless of its origin, so its executions are not attributed to any saved collection request. Only executions triggered directly from a saved collection request tab carry a `request_id`.

---

### 4.7 Save Responses Toggle [New]

An opt-in toggle that controls whether response data is stored alongside request data in history entries.

**Location:** The toggle is in the History sidebar tab header area (near the search bar and Clear All button).

**Behavior:**
- **Default state: OFF.** Responses are not saved. This preserves privacy and reduces storage.
- When **ON**: Response body, status code, and response headers are stored in each new history entry going forward. Existing entries are not retroactively updated.
- When **OFF**: Only request data is stored (current behavior). Response field is `null`.
- The toggle state is stored **locally only** (not synced to cloud or across devices).
- The toggle state is **not workspace-scoped** — it's a device-level preference.

**Impact on other features:**
- Draft tabs opened from history (Section 4.6) show response data only when it was captured.
- Per-Request History entries (Section 4.9) may have a mix of entries with and without responses. Both are displayed; entries without responses simply show an empty response pane.
- The sidebar list view (Section 4.2) does not display status codes, but the data is available in the entry structure for use when the entry is opened.

---

### 4.8 Save to Collection [Existing, with changes]

**Important scope note:** This section describes an improvement to the **Draft** feature's save flow, not something exclusive to Request History. In the old app, history entries opened in a dedicated "History View" tab that had its own save button (which was hidden in multi-workspace mode). In the rebuild, history entries open as Drafts (see Section 4.6), so saving is handled by the Draft's save mechanism. The Draft save flow in the old app saves requests to the root level with no collection picker. In this PRD, we are introducing a new **Save Request Modal** component that improves the Draft save flow by adding a proper collection picker. While this modal is technically a Draft feature addition, it is specified here because it was motivated by — and directly benefits — the history-to-collection workflow.

When a user has a Draft open (from history or otherwise), they can save it to a collection.

**Old behavior:** Clicking "Save" on a Draft immediately saved the request to the root level (no collection). Users had to separately "Move to Collection" as a second step. For history specifically, the Save button was hidden entirely in multi-workspace mode.

**New behavior:** Clicking "Save" on any Draft opens a **Save Request Modal** (new component).

#### Save Request Modal [New Component]

A modal dialog that appears when saving a request from a Draft tab. Inspired by Postman's Save Request dialog.

**Modal contents:**

1. **Request Name** — Text input, pre-filled with the current tab title (e.g., "GET /api/users"). Editable.
2. **Collection Picker** — A searchable dropdown/tree that shows all collections and folders in the current workspace.
   - Users can select an existing collection or folder as the save target.
   - A search box within the picker allows filtering collections by name.
   - A "New Collection" option at the bottom allows creating a new collection inline (user types a name, collection is created, and the request is saved into it).
   - The picker should show the folder hierarchy (nested collections) so users can pick a specific subfolder.
3. **Save Button** — Saves the request to the selected collection/folder with the given name.
4. **Cancel Button** — Closes the modal without saving.

**Behavior after save:**
- The Draft tab transitions into a saved request tab (standard collection request behavior).
- The request appears in the sidebar under the selected collection.

**Edge cases:**
- If no collections exist in the workspace, the picker is empty and the "New Collection" option is prominently shown.
- The Save button is disabled until a collection/folder is selected.
- The Save button should be visible and functional in **all** workspace modes (single and multi). The old bug where it was hidden in multi-workspace mode must not carry over.

---

### 4.9 Per-Request History [New]

For saved collection requests, users can view a filtered history of all past executions of that specific request.

**How it works:**

1. When a saved request is open in the editor, a "History" section/tab is available in the response area (or a dedicated panel — exact UI placement is a design decision).
2. This view shows all history entries whose `request_id` matches the currently open request's ID.
3. Entries are displayed in reverse chronological order (newest first).
4. Each entry shows: timestamp, status code (if response was saved), and method+URL.
5. Clicking an entry loads that historical request-response snapshot into the view (same behavior as opening from the global History tab — it opens as a new Draft).

**What this view does NOT have:**
- No search bar (unlike the global History tab).
- No date-based grouping (flat list is sufficient for a single request's history).

**What this view has:**
- Individual entry deletion (see Section 4.10).

**Edge cases:**

- **Orphaned entries:** If a saved request is deleted from its collection, history entries that reference its `request_id` are NOT cleaned up. They remain in global history and continue to appear there. They simply won't appear in any per-request view (since the request no longer exists to open).
- **FIFO eviction:** The per-workspace 100-entry cap applies globally, not per-request. Older entries for a specific request will eventually get evicted as new entries (from any request) fill up the workspace history. This is accepted behavior.
- **Draft requests:** Requests executed from Drafts (unsaved requests) have `request_id = null`. They appear in global history but never in any per-request view. They are effectively orphans.
- **Mixed response data:** Some entries for the same request may have response data and some may not (depending on the "Save Responses" toggle at the time of execution). Both are shown. Entries without response data display an empty response pane when opened.

---

### 4.10 Individual Entry Deletion [New]

Users can delete individual history entries, in addition to the existing "Clear All" option.

**Behavior:**
- On hover over a history entry in the sidebar, a three-dot menu icon (or similar) appears.
- The menu contains a **"Delete"** action.
- Clicking Delete removes that single entry from history immediately. No confirmation prompt (it's a lightweight action).
- The entry is removed from both the global history list and any per-request history view.
- "Clear All" button remains in the sidebar header and wipes all entries for the current workspace.

---

### 4.11 Clear All History [Existing]

A button (trash icon) in the History sidebar tab header that clears all history entries for the current workspace.

**Change from old app:** Now scoped to the current workspace only. In the old app, it cleared the single global history.

---

### 4.12 Privacy [Existing]

**[Existing]** History is stored locally on the user's device. It is not transmitted to Requestly servers.

**[Existing]** History is private — other team members in a shared workspace cannot see each other's history.

**[Existing] Privacy banner** — A dismissible banner is shown at the top of the History sidebar tab: *"Your history is stored in your device's local storage for better privacy & control."* Once dismissed, the banner does not reappear. The dismissed state is stored **locally and globally** — it is not scoped to any workspace. If a user dismisses it once, it stays dismissed across all workspaces on that device.

---

## 5. Storage

**Storage mechanism:** Left to engineering's discretion. Options include localStorage, IndexedDB, or another local persistence layer. The key requirements are:

- Must support **100 entries per workspace** with full request data (and optionally response data).
- Must be keyed by workspace ID for isolation.
- Must handle entries with response data (which can be large) without hitting storage quotas.
- Must be performant for read/write operations (history is written on every request execution).

**"Save Responses" toggle state:** Stored locally only (e.g., localStorage). Not workspace-scoped — it's a device-level preference.

**Privacy banner dismissed state:** Stored locally only. Not workspace-scoped — it's a global device-level preference. Once dismissed, stays dismissed across all workspaces.

---

## 6. Analytics

The following events should be tracked:

| Event | Trigger |
|-------|---------|
| `api_client_history_entry_opened` | User clicks a history entry to open it as a Draft |
| `api_client_history_cleared` | User clicks "Clear All" |
| `api_client_history_entry_deleted` | User deletes an individual history entry |
| `api_client_history_save_responses_toggled` | User toggles "Save Responses" on or off (include on/off state) |
| `api_client_history_saved_to_collection` | User saves a Draft (from history) to a collection via the Save Request Modal |
| `api_client_per_request_history_opened` | User opens the per-request history view for a saved request |

---

## 7. Summary: What's New vs. What's Existing

| Feature | Status | Section |
|---------|--------|---------|
| Auto-capture requests | **Existing** — no change | 4.1 |
| History sidebar tab | **Existing** — with date grouping (Today/Yesterday/Last 7 days/Past) | 4.2 |
| History scoped per workspace | **New** | 4.3 |
| 100-entry cap per workspace | **Changed** — was 20 globally | 4.4 |
| Search bar (URL filter) | **New** | 4.5 |
| Open as Draft (multi-tab) | **Changed** — was single reusable tab | 4.6 |
| Save Responses toggle | **New** | 4.7 |
| Save to Collection (with modal) | **Changed** — Draft save flow now has collection picker (cross-feature improvement) | 4.8 |
| Save Request Modal (new component) | **New component** — addition to Draft feature, specified here | 4.8 |
| Per-Request History | **New** | 4.9 |
| Individual entry deletion | **New** | 4.10 |
| Clear All (workspace-scoped) | **Changed** — was global | 4.11 |
| Privacy (local-only storage, banner) | **Existing** — banner kept, dismiss state saved globally | 4.12 |

---

## 8. Competitive References

This feature spec was informed by competitive analysis of Postman and Apidog. The full analysis including feature comparison matrix is available in `request-history-product-overview.md`.

Key inspirations:

- **Date-based grouping** — inspired by Postman's UI (observed behavior; not explicitly documented at [Navigating Postman](https://learning.postman.com/docs/getting-started/basics/navigating-postman))
- **Search bar** — from Postman (observed in UI)
- **Save Responses toggle** — from Postman ([Navigating Postman — Save Responses](https://learning.postman.com/docs/getting-started/basics/navigating-postman))
- **Save Request Modal with collection picker** — inspired by Postman's UI. Postman docs describe saving to a collection ([Add Requests to Collections](https://learning.postman.com/docs/collections/use-collections/add-requests-to-collections)) but do not detail the modal's exact UI. Our modal spec (searchable tree picker, inline "New Collection") is our own design.
- **500-entry cap (we chose 100)** — from Apidog ([Request History](https://docs.apidog.com/request-history-754600m0))
- **Individual deletion** — from Postman ([Navigating Postman](https://learning.postman.com/docs/getting-started/basics/navigating-postman))

---

## 9. Competitor Screenshots

All screenshots are saved locally in `screenshots/` for offline reference.

### Postman

**Postman — Workspace Overview (Sidebar with History tab)**
Shows the full Postman workspace layout. The left sidebar contains the History tab (clock icon) alongside Collections, Environments, etc. This is the overall layout we're aligning with.
Source: [Navigating Postman](https://learning.postman.com/docs/getting-started/basics/navigating-postman)

![Postman Workspace Overview](screenshots/postman/postman-workspace-overview.png)

---

**Postman — Per-Request History Dropdown**
Shows the "History" dropdown in the response area of a saved request. Each entry lists a timestamp and status code (e.g., "Today, 8:33 AM — 200"). Users can click "Current" to return to the latest version. This is the direct reference for our Section 4.9 (Per-Request History).
Source: [Debug API Requests](https://learning.postman.com/docs/sending-requests/response-data/troubleshooting-api-requests)

![Postman Per-Request History](screenshots/postman/postman-per-request-history-dropdown.jpg)

---

**Postman — Shared Response from History (with sharing icons)**
Shows the per-request history dropdown with sharing indicators — some entries have a "people" icon meaning the response was shared with team members. The tooltip shows the POST URL. Demonstrates how Postman integrates sharing into the history timeline.
Source: [Sharing in Postman](https://learning.postman.com/docs/collaborating-in-postman/sharing)

![Postman Shared Response History](screenshots/postman/postman-shared-response-history.png)

---

**Postman — Stop Sharing Response**
Shows the "Shared Response" popover that appears when a response has been shared. Displays "People in this workspace with access to the link can view this response" with a "Stop Sharing" button. Shows the "Save Response" option and the "Shared" badge in the response toolbar.
Source: [Sharing in Postman](https://learning.postman.com/docs/collaborating-in-postman/sharing)

![Postman Stop Sharing](screenshots/postman/postman-stop-sharing-response.png)

---

**Postman — Collection Context Menu (Add Request)**
Shows the context menu on a collection in the sidebar with options including "Add request", "Add folder", "Run", "Share", "Copy link", "Move", "Fork", "Rename", "Duplicate", "Sort", and "Delete". This is the collection-level menu — not the save-from-history flow, but shows how Postman organizes collection actions.
Source: [Add Requests to Collections](https://learning.postman.com/docs/collections/use-collections/add-requests-to-collections)

![Postman Collection Context Menu](screenshots/postman/postman-collection-context-menu.png)

---

### Apidog

**Apidog — History Local Tab (Main View)**
Shows the full History panel with "Local" and "Shared" tabs at the top, a search bar, and entries grouped by date (e.g., "November 18, 2024", "November 1, 2024", etc.). Each entry shows a method badge (GET/POST) and request name/URL. Entry count per date group is shown in parentheses. The empty state reads "Select the request history from the left side to view details." This is the primary reference for our sidebar History tab.
Source: [Request History — Apidog Docs](https://docs.apidog.com/request-history-754600m0)

![Apidog History Local Tab](screenshots/apidog/apidog-history-local-tab.png)

---

**Apidog — History Entry Opened (Request + Response View)**
Shows a history entry opened in the main panel. The left sidebar shows the history list, and the right panel shows the full request editor (URL, params, headers, body, etc.) with the response below (Body, Cookies, Headers, Console tabs). The "Send" and "Save as Case" buttons are visible. This demonstrates how Apidog allows modifying and re-sending from history.
Source: [Request History — Apidog Docs](https://docs.apidog.com/request-history-754600m0)

![Apidog History Entry Opened](screenshots/apidog/apidog-history-entry-opened.png)

---

**Apidog — Share Response Modal**
Shows the "Share Response" modal overlay. The modal contains the text "Share response with other members" and explains that sharing saves the response to the cloud and generates a link. A prominent "Create Share" button is at the bottom. The "Share" button in the response toolbar (highlighted) triggers this modal. This is the one-click sharing flow we evaluated for our deferred sharing feature.
Source: [Request History — Apidog Docs](https://docs.apidog.com/request-history-754600m0)

![Apidog Share Response Modal](screenshots/apidog/apidog-share-response-modal.png)

---

**Apidog — Shared Tab View**
Shows the History panel with the "Shared" tab active (highlighted in purple). The left sidebar shows shared history entries grouped by date, with a filter option visible. The right panel shows the full request and response data of a shared entry, including the "Share" link in the response toolbar. This demonstrates Apidog's dual Local/Shared model.
Source: [Request History — Apidog Docs](https://docs.apidog.com/request-history-754600m0)

![Apidog Shared Tab View](screenshots/apidog/apidog-shared-tab-view.png)
