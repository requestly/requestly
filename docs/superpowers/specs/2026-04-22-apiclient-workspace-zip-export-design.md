# API Client — Export Full Workspace as ZIP

**Jira:** [RQ-1662](https://browserstack.atlassian.net/browse/RQ-1662)
**Date:** 2026-04-22
**Status:** Design approved, pending spec review

## Problem

Today users can export collections and environments individually from the API Client, but there is no way to export an entire API Client workspace in one shot. The feature needs to work for every workspace backend: personal cloud, shared/team cloud, local filesystem (desktop), and local storage (logged-out browser fallback).

## Goal

Add a "Export workspace" action that downloads a single `.zip` containing every collection (with nested requests and their saved examples) and every environment (including the global environment) for the currently open API Client workspace. The resulting archive must be re-importable through the existing import paths.

## Non-goals

- Changing the existing per-collection or per-environment export flows.
- Exporting runtime variables, request history, or error files list (not persisted like envs/collections; out of scope for RQ-1662).
- Importing a whole-workspace zip (import side is not in scope for this task — but the produced files must be compatible with the existing importers so that feature is trivial to add later).
- Exporting anything outside the API Client (rules, sessions, mocks).

## Requirements

- Works identically across `PERSONAL`, `SHARED`, `LOCAL`, `LOCAL_STORAGE` workspace types, including logged-out users.
- Reuses existing export/sanitization logic — no reimplementation.
- Exported JSON carries `schema_version: "1.0.0"` (matches existing per-file exports).
- Global environment is included and tagged with `isGlobal: true`.
- Saved request examples are preserved (they travel inline under each API record's `data.examples` during tree hydration — the existing sanitizer does not strip them, so workspace export inherits this behavior for free).
- Each JSON inside the zip is a standalone, byte-compatible version of today's single-collection or single-environment export — so the existing importers can consume either file without code changes.

## UX

### Entry point

A persistent **"Export workspace"** button at the bottom of the API Client secondary sidebar (`SingleWorkspaceSidebar.tsx`), below the tab content and the existing `<ErrorFilesList />`. Visible regardless of which tab is active (Collections / Environments / History / Runtime Variables).

- Full-width row, download icon + label "Export workspace"
- Implemented as a new `SidebarFooterActions` component so the footer has a dedicated home for future actions
- Shown only in the single-workspace sidebar; not added to `MultiWorkspaceSidebar` in this task

### Confirmation modal

Clicking the button opens a small modal:

- Title: workspace name
- Body: counts preview — "X collections · Y requests · Z environments (incl. global)" — computed from the hydrated record store before sanitization (examples are not shown as their own count; they ride with their parent requests)
- Primary button: **"Export as ZIP"**
- Secondary: **Cancel**

While the zip is being built, the primary button shows a spinner and the modal is non-dismissable (prevents aborting a large export midway). On success the modal closes and a toast confirms "Workspace exported". On failure an inline error appears with a Retry button.

If the workspace has zero collections and zero non-global environments (and global has no variables), the modal opens in an empty state with the export button disabled. The sidebar button itself gets a "Nothing to export" tooltip in the same case.

## Architecture

### Reuse, don't rewrite

The sanitization functions currently living inline in `ApiClientExportModal.tsx` (`sanitizeRecord`, `sanitizeRecords`, and the per-environment mapping) are extracted into a shared module. Both the existing modal and the new workspace-export flow call these functions.

New shared module:

```
features/apiClient/helpers/exporters/requestly/
  sanitize.ts             // moved-out: sanitizeRecords(records) → ExportRecord[]
                          // moved-out: sanitizeEnvironments(envs) → EnvironmentExportEntry[]
  buildWorkspaceExport.ts // new: orchestrates repo reads + sanitize, returns { collectionsJson, environmentsJson }
  zipWorkspaceExport.ts   // new: wraps the two JSON strings into a zip Blob via fflate
```

The existing `ApiClientExportModal.tsx` is refactored to call `sanitizeRecords` / `sanitizeEnvironments` from `sanitize.ts`. Behavior stays identical — only module boundaries change.

### Data flow

```
SidebarFooterActions (button)
  → WorkspaceExportModal (counts + confirm)
    → buildWorkspaceExport({ hydratedRootRecords, environments })
        // hydratedRootRecords = top-level collections (+ any root-level API records) pulled from
        //   the same store the existing export modal uses. Each API record already has its
        //   examples attached inline via data.examples, its parent collection's data.children
        //   already populated — courtesy of the tree hydration in screens/apiClient/utils.ts.
        1. sanitizeRecords(hydratedRootRecords) → strips createdBy/updatedBy/ownerId/timestamps
                                                   at the top level; data.examples survives
        2. sanitizeEnvironments(envs) → strips localValue, tags isGlobal
        3. returns:
           {
             collectionsJson: { schema_version: "1.0.0", records: [...] },
             environmentsJson: { schema_version: "1.0.0", environments: [...] }
           }
    → zipWorkspaceExport(data)     (fflate → Blob)
    → download via <a> + URL.createObjectURL (pattern already used in PostmanCollectionExportModal.tsx)
```

Note: we explicitly do NOT call `getAllExamples()` from `buildWorkspaceExport`. Examples are already merged into `api.data.examples` by the UI's record hydration layer before the export code runs, and that's the same path the existing single-collection export relies on. Re-fetching would either double-count or diverge from the current export format.

### Why two files in the zip

```
RQ-workspace-<workspace-name>-export-<DD_MM_YYYY>.zip
├── collections.json     # { schema_version: "1.0.0", records: [...] }
└── environments.json    # { schema_version: "1.0.0", environments: [...] }
```

Each file is byte-for-byte identical to what today's per-collection or per-environment export produces. A future "Import workspace zip" feature just unzips and feeds each file into the existing importers — no new import format, no migration risk. No workspace metadata/name/type is embedded in the payload; the workspace name appears only in the zip filename.

### Cross-workspace-type support (free)

Because both repository methods (`getAllRecords`, `getAllEnvironments`) are already abstracted by `ApiClientRepositoryInterface`, the same code works for every implementation:

- `ApiClientCloudRepository` (PERSONAL, SHARED) — Firestore
- `ApiClientLocalRepository` (LOCAL) — desktop IPC to the filesystem
- `ApiClientLocalStoreRepository` (LOCAL_STORAGE) — IndexedDB, including logged-out users

No repository-specific branches in the export code.

## Schema

Both JSON files carry `schema_version: "1.0.0"` (string, matching existing convention).

`collections.json`:
```json
{
  "schema_version": "1.0.0",
  "records": [/* flat array of sanitized collections + API records, identical to current per-collection export */]
}
```

`environments.json`:
```json
{
  "schema_version": "1.0.0",
  "environments": [
    {
      "id": "...",
      "name": "...",
      "variables": { /* without localValue */ },
      "variablesOrder": [],
      "isGlobal": false
    },
    {
      "id": "<global-env-id>",
      "name": "Global",
      "variables": {},
      "isGlobal": true
    }
  ]
}
```

## Analytics

Three events via the existing API Client analytics module:

- `workspace_export_started` — `{ workspaceType, collectionCount, requestCount, environmentCount }`
- `workspace_export_completed` — `{ workspaceType, durationMs, zipSizeBytes }`
- `workspace_export_failed` — `{ workspaceType, errorType }`

## Error handling

- **Empty workspace** → button disabled + "Nothing to export" tooltip; modal (if opened) shows empty state.
- **Repository read failure** (network, IPC, IndexedDB) → inline modal error, Retry button, Sentry log with workspace type.
- **ZIP build failure** (fflate throw) → same treatment as above.
- **Download trigger failure** (rare, browser-level) → toast "Failed to start download".

## Testing

- Unit tests for `sanitizeRecords` / `sanitizeEnvironments` (newly extracted). Before extraction, snapshot the current modal output against representative fixtures so the extraction is behavior-preserving.
- Unit tests for `buildWorkspaceExport` — mock repositories, assert shape includes `schema_version: "1.0.0"`, records, environments with global env flagged.
- Unit tests for `zipWorkspaceExport` — round-trip (zip → unzip via fflate) asserts both files present, parseable JSON, correct filenames.
- Manual smoke test per workspace type: PERSONAL, SHARED, LOCAL, LOCAL_STORAGE (logged out).
- Manual round-trip sanity check: export from one workspace, confirm the two JSON files inside the zip import cleanly via the existing single-file importers.

## Dependencies

- `fflate` (already in `package.json`, used elsewhere in the app for session events).
- No new third-party libraries.

## Files touched

New:
- `app/src/features/apiClient/helpers/exporters/requestly/sanitize.ts`
- `app/src/features/apiClient/helpers/exporters/requestly/buildWorkspaceExport.ts`
- `app/src/features/apiClient/helpers/exporters/requestly/zipWorkspaceExport.ts`
- `app/src/features/apiClient/screens/apiClient/components/modals/workspaceExportModal/WorkspaceExportModal.tsx`
- `app/src/features/apiClient/screens/apiClient/components/sidebar/components/sidebarFooterActions/SidebarFooterActions.tsx`
- Analytics event definitions in `app/src/modules/analytics/events/features/apiClient/`

Modified:
- `app/src/features/apiClient/screens/apiClient/components/sidebar/SingleWorkspaceSidebar/SingleWorkspaceSidebar.tsx` — mount `<SidebarFooterActions />` below `<ErrorFilesList />`.
- `app/src/features/apiClient/screens/apiClient/components/modals/exportModal/ApiClientExportModal.tsx` — swap inline sanitization for imports from the new `sanitize.ts`.

## Open questions

None at time of writing. (Decisions locked in during brainstorming: entry point = sidebar footer button; zip layout = two files, no metadata; counts shown in modal; global env included.)
