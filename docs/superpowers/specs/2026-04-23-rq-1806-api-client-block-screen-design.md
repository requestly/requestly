# RQ-1806 — API Client Block Screen (Local-Storage-Only Segment)

> **Status:** Design approved; ready for implementation planning
> **Date:** 2026-04-23
> **Related:** [User Migration TB](../../../../requestly-api-client/docs/product/tbs/handed-off/user-migration.md) §4.1, §6a, §12.2
> **Prior art:** RQ-1662 workspace export (commit `c8d76cab6`)

## 1. Scope

Build the API Client block screen for the **local-storage** segment (TB §4.1 calls this the manual-migration variant — same population, different framing). Users whose active workspace stores data in the browser's IndexedDB (signed-out, no local-fs workspace) land on a modal overlay whenever they visit any API Client route in the old app. The modal contains the TB §4.1 two-step flow: **Export Workspace** and **Download Requestly API Client**. Dismiss behavior is controlled by a second feature flag so the modal can be dismissable during internal testing and fully blocking at external rollout.

Out of scope for this ticket:

- The auto-migratable single-CTA variant (detection hook returns `'auto-cloud'` or `'auto-local-fs'` but no UI renders yet).
- Legacy-auth fallback routing to the 2-step variant (TB Q22).
- Mid-session cutover UX (TB Q18).
- Block deployment mechanism debate — this ticket assumes a GrowthBook flag triggers the block (TB D5/Q19 stay eng's call for the wider enforcement story).

## 2. User-visible behavior

When the feature flag `api_client_migration_block_screen` is on **and** `useMigrationSegment()` returns `"local-storage"` for the active workspace, any navigation into an API Client route renders a modal with:

1. Headline: *Your API client now has its own dedicated app — fast, clean, and resource-optimized.*
2. Body: *You'll need to do this in 2 steps:*
3. Step 1 row: *Export your workspace from this app* → `[Export Workspace]`
4. Step 2 row: *Download the new app and import the file* → `[Download Requestly API Client →]` (OS-detected), plus a secondary row of OS icons linking to the other installers (mirrors the "Download Now / More platforms →" pattern).
5. Footer link: *Running into issues? Let us know on GitHub →* pointing to `https://github.com/requestly/requestly/issues/4593` (Sachin's public announcement — see TB §6d). Opens in a new tab (web) or via the desktop `open-external-link` IPC.

The modal's dismiss behavior is controlled by a second flag, `api_client_migration_block_screen_dismissable`:

- **Flag off (default, external rollout):** modal is fully blocking — no close X, no ESC handler, no mask-click dismiss, no cancel footer.
- **Flag on (internal testing):** modal is dismissable via close X, ESC key, or mask click. Dismissal persists for the rest of the current page load (in-memory, no `localStorage`) — the modal re-appears after a page reload. A `Block Screen Dismissed` analytics event fires on each dismissal so we can measure internal-test dismissal rates.

The API Client UI underneath still mounts (so the existing export pipeline's hooks keep working), but is visually and interactively blocked by the modal while it's open.

Clicking **Export Workspace** triggers an immediate zip download of the full workspace (collections + environments) — no intermediate preview modal. Clicking a **Download** link opens the corresponding installer URL in a new tab (web) or via the desktop IPC `open-external-link` (desktop).

## 3. Segment detection

**Segment is a property of the active workspace, not of the user globally.** A single user can hold several workspaces — a signed-in BStack user might have both a personal cloud workspace and a local-fs desktop workspace — and each workspace belongs to a different segment depending on where its data lives and how it migrates. The block-screen decision is made against whichever workspace the user is currently viewing; switching workspaces re-evaluates the segment reactively and, when the segment changes, the modal appears, hides, or stays as appropriate.

This matters because:

- The same user can see the block modal in one workspace and not in another within the same session.
- A signed-in user viewing a local-fs workspace resolves to `auto-local-fs` — their *currently viewed* data is on disk and migrates via the file-system path, even though their cloud workspaces would resolve to `auto-cloud`.
- A signed-out user viewing a local-fs workspace (possible on desktop) resolves to `auto-local-fs`, not `local-storage` — data location, not sign-in state, is what the pipeline cares about.

**Multi-workspace view (`ApiClientViewMode.MULTI`) is always `auto-local-fs`.** The legacy app only supports multi-workspace mode for local-fs workspaces — the MULTI view is populated exclusively from local-fs workspaces (see `slices/workspaceView/thunks.ts:282`) and requires `LOCAL_WORKSPACE_COMPATIBILITY`. A user in MULTI view is therefore, by construction, looking at local-fs data. Because `local-storage` can never arise in MULTI view, this ticket does not need a per-tab block decision for multi-workspace sessions — the single MULTI-view segment decision is always `auto-local-fs` (no modal this ticket).

### 3.1 Hook

```ts
// app/src/features/apiClient/hooks/useMigrationSegment.ts
export type MigrationSegment = "local-storage" | "auto-cloud" | "auto-local-fs" | "unknown";

// Returns the segment for the currently active workspace.
// Re-evaluates whenever auth or the active workspace changes.
export function useMigrationSegment(): MigrationSegment;
```

### 3.2 Inputs (all synchronous, all tied to the active workspace)

- `getActiveWorkspace` (Redux — `store/slices/workspaces/selectors`) — the workspace the user is currently viewing. Drives segment assignment; its `workspaceType` (one of the four `WorkspaceType` enum values) is the primary signal.
- `useViewMode` (Redux — `features/apiClient/slices`) — `ApiClientViewMode.SINGLE` vs `ApiClientViewMode.MULTI`. MULTI short-circuits to `auto-local-fs` because MULTI is only populated from local-fs workspaces (see `slices/workspaceView/thunks.ts:282`).

Auth state is **not** an input. The legacy app's workspace setup thunk (`slices/workspaceView/thunks.ts`) already reconciles sign-in × device state into a concrete `workspaceType` on every session — signed-out users with no local workspace land on a workspace with `WorkspaceType.LOCAL_STORAGE` (the `FAKE_LOGGED_OUT_WORKSPACE_ID` row; see `thunks.ts:292`), signed-in personal users land on `PERSONAL`, team members on `SHARED`, local-fs sessions on `LOCAL`. Re-deriving the segment from auth state would duplicate a decision the app has already made. Driving detection off `workspaceType` alone is simpler and safer — it mirrors the enum that already exists.

### 3.3 Logic

Evaluated for the active workspace, with an explicit per-type switch — every segment has its own clause, and the only non-explicit path is a safety-first fallback to manual export:

```
if activeWorkspace?.workspaceType is undefined    → "unknown"
// still hydrating; render nothing briefly until a workspace is attached

if viewMode === ApiClientViewMode.MULTI           → "auto-local-fs"
// MULTI view is only populated from local-fs workspaces

switch (activeWorkspace.workspaceType):
  case WorkspaceType.LOCAL          → "auto-local-fs"
  case WorkspaceType.LOCAL_STORAGE  → "local-storage"
  case WorkspaceType.PERSONAL       → "auto-cloud"
  case WorkspaceType.SHARED         → "auto-cloud"
  default (unrecognized enum value) → "local-storage"
```

Two distinct fallback behaviors:

- **Hydrating** (`activeWorkspace.workspaceType === undefined`): return `"unknown"`, render nothing. Prevents the modal from flashing during initial load before the workspace setup thunk attaches an active workspace.
- **Unrecognized `workspaceType`** (future enum value, corrupted state): return `"local-storage"`, show the manual-export block modal. Safer than assuming the data auto-migrated — if in doubt, give the user a recoverable manual path. A new `WorkspaceType` enum value added later (e.g., a hypothetical federation type) will fall through to manual export until the switch is explicitly updated to categorize it.

Per `WorkspaceType` at `features/workspaces/types/index.ts`:

- `LOCAL` — on-disk local-fs workspace (desktop only). Data migrates via the file-system path. → `auto-local-fs`.
- `LOCAL_STORAGE` — browser IndexedDB workspace (the signed-out default; `FAKE_LOGGED_OUT_WORKSPACE_ID`). Data is unreachable by the server-side pipeline. → `local-storage`.
- `PERSONAL` — personal cloud workspace. Data auto-migrates via the server-side pipeline (BStack direct *or* legacy-auth via pre-create email bridge per TB D43). → `auto-cloud`.
- `SHARED` — team/shared cloud workspace. Same migration path as PERSONAL. → `auto-cloud`.
- MULTI view — always composed of `LOCAL` workspaces in the legacy app (see `slices/workspaceView/thunks.ts:282`), so treated as `auto-local-fs` up-front without inspecting the active-workspace type.

The `"local-storage"` label names the data location — Chromium IndexedDB, reachable only from this device's browser. It's the same population as the TB D44 "browser-storage-only" segment and the TB's product-facing "manual-migration" term.

Extension mode is not checked: the Requestly extension has no API Client (TB D9), so this code path never renders there.

### 3.4 Reactivity

The hook subscribes to `getActiveWorkspace` and `useViewMode` via Redux selectors, so any change to either input triggers a re-render with the new segment. Sign-in / sign-out events change the segment too — but indirectly, via the workspace setup thunk that swaps the active workspace's `workspaceType` in response to auth changes. Concrete consequences:

- User switches from a cloud workspace (`PERSONAL` / `SHARED`) to a local-fs workspace (`LOCAL`) → `auto-cloud` → `auto-local-fs`.
- User signs out → workspace setup thunk re-reconciles and usually lands on `LOCAL_STORAGE` (unless there's a local-fs workspace preserved, per `thunks.ts:267–279`) → segment flips from `auto-cloud` to `local-storage` (or `auto-local-fs` if a local workspace was kept).
- User signs in → thunk attaches their cloud workspace (`PERSONAL` / `SHARED`) → `local-storage` → `auto-cloud`.
- Switching between SINGLE and MULTI view mode — MULTI always resolves to `auto-local-fs`; SINGLE resolves based on the single active workspace's type.

In all cases, the modal mounts or unmounts in the next render — no polling, no imperative refresh.

### 3.5 Branch handling this ticket

Only `"local-storage"` renders the modal. `"auto-cloud"`, `"auto-local-fs"`, and `"unknown"` render nothing. The four-branch shape is deliberately future-proof for the follow-up tickets that may ship different auto-migratable variants for cloud vs local-fs workspaces (they have different "what happened to your data" stories).

## 4. Mount point & activation

Modal mounted inside `app/src/features/apiClient/components/RouteElement.tsx` as a sibling of `<ApiClientFeatureContainer />`:

```tsx
// sketch
const isBlockFlagOn = useFeatureIsOn("api_client_migration_block_screen");
const isDismissableFlagOn = useFeatureIsOn("api_client_migration_block_screen_dismissable");
const segment = useMigrationSegment();

return (
  <WindowsAndLinuxGatedHoc featureName="API client">
    {isApiClientCompatible ? (
      <>
        <ApiClientErrorBoundary boundaryId="api-client-error-boundary">
          <ApiClientFeatureContainer />
        </ApiClientErrorBoundary>
        {isBlockFlagOn && segment === "local-storage" && (
          <MigrationBlockModal dismissable={isDismissableFlagOn} />
        )}
      </>
    ) : (
      // existing MandatoryUpdateScreen branch unchanged
    )}
  </WindowsAndLinuxGatedHoc>
);
```

Activation condition (all three must hold):

1. `useFeatureIsOn("api_client_migration_block_screen") === true`.
2. `useMigrationSegment() === "local-storage"`.
3. Implicit — user is under an API Client route (modal only lives inside `ApiClientRouteElement`, which is the route element for `PATHS.API_CLIENT.RELATIVE + "/*"` and `PATHS.API_CLIENT.IMPORT_FROM_POSTMAN.ABSOLUTE`, covering all API Client surfaces).

Modal props (when `dismissable === false`):

- `closable={false}`
- `keyboard={false}`
- `maskClosable={false}`
- `centered`
- `footer={null}`
- `title={null}` (headline is inside the body for design control)
- No `onCancel` handler

Modal props (when `dismissable === true`):

- `closable={true}` (renders the default Ant X icon)
- `keyboard={true}` (ESC closes)
- `maskClosable={true}` (mask click closes)
- `centered`, `footer={null}`, `title={null}` — same as above
- `onCancel` handler sets the module-level dismissed flag (see below) and fires `Block Screen Dismissed` analytics

Dismissal persistence — module-level boolean in `MigrationBlockModal.tsx`:

```ts
// module scope; resets on full page reload (not stored in localStorage)
let hasDismissedThisPageLoad = false;
```

Inside the component:

- On mount, if `hasDismissedThisPageLoad === true`, render nothing (do not create the modal DOM at all).
- On `onCancel`, set `hasDismissedThisPageLoad = true` and update local state to hide the modal for the current mount.

This gives internal testers a one-click dismissal that survives route remounts within the same page load (navigating Interceptor → API Client → Interceptor → API Client keeps the modal dismissed) but resets on reload so the modal is never permanently silenced.

Z-index higher than any in-app modal that could open from the container beneath.

The `ApiClientFeatureContainer` continues to mount normally, so its workspace-view setup (`setupWorkspaceView`) runs and populates the repositories, stores, and context providers that the export step depends on.

## 5. Export Workspace button

### 5.1 Shared helper hook

New file: `app/src/features/apiClient/hooks/useWorkspaceZipDownload.ts`.

```ts
export function useWorkspaceZipDownload(): {
  download: () => Promise<void>;
  isReady: boolean; // container setup done + workspace non-empty
  isDownloading: boolean;
  error: Error | null;
};
```

Shared by both export paths:

1. The block screen's Export Workspace button (this ticket) — calls `download()` directly on click.
2. The existing `WorkspaceExportModal` from RQ-1662 — refactored to call `download()` from its confirm handler instead of inlining the build+zip+download flow.

Internally:

- Reads data with existing hooks `useAllRecords()` + `useAllEnvironments()` + `useApiClientFeatureContext()` (same pattern as `ExportWorkspaceAction.tsx`).
- Reads `workspaceName` via `getWorkspaceById(ctx.workspaceId)` selector; `dummyPersonalWorkspace` for local workspaces (parity with `ExportWorkspaceAction.tsx`).
- Runs the data through the RQ-1662 helpers in order: `sanitizeRecords` + `sanitizeEnvironments` → `buildWorkspaceExport` → `zipWorkspaceExport` (all in `features/apiClient/helpers/exporters/requestly/`).
- Turns the resulting `Uint8Array` into a `Blob`, creates an object URL, triggers a download via an anchor element (same pattern `WorkspaceExportModal` currently uses inline).
- Revokes the object URL after download.

The shared helpers under `features/apiClient/helpers/exporters/requestly/` (`sanitize.ts`, `buildWorkspaceExport.ts`, `zipWorkspaceExport.ts`) stay untouched — this refactor only consolidates the React-facing assembly glue. Net diff in `WorkspaceExportModal` is a ~10–20 line swap: replace its inline zip+download logic with a single call into the hook, keep the preview/counts UI unchanged. Existing RQ-1662 tests continue to exercise the modal end-to-end and the hook gets its own unit tests (see §10).

### 5.2 Button states

- **Disabled (idle)** with tooltip "Nothing to export" — when `isSetupDone === false` or `allRecords.length === 0 && allEnvironments.length === 0`. Parity with `ExportWorkspaceAction`.
- **Idle, enabled** — default.
- **Downloading** — button shows a spinner; disabled during `await download()`.
- **Error** — Ant `notification.error` surfaces the failure; button returns to idle.

## 6. Download Requestly API Client button

### 6.1 URL table

| OS | Architecture | URL |
|---|---|---|
| macOS | Apple Silicon (arm64) | `https://get.requestly.com/mac-api-client` |
| macOS | Intel (x64) | `https://get.requestly.com/mac-intel-api-client` |
| Windows | — | `https://get.requestly.com/win-api-client` |
| Linux | — | `https://get.requestly.com/linux-api-client` |

Lives in `app/src/features/apiClient/screens/migrationBlock/constants.ts`.

The same file also exports `REPORT_ISSUES_URL = "https://github.com/requestly/requestly/issues/4593"` used by the footer link in the modal.

### 6.2 OS detection

- Platform family: use existing `getUserOS()` from `app/src/utils/osUtils.ts` (returns `macOS` / `Windows` / `Linux` / other).
- macOS architecture: probe `navigator.userAgentData.getHighEntropyValues(["architecture"])` once on modal mount, cache the result. Chromium-only; Safari and older browsers don't expose it.
  - If probe returns `"arm"` → Apple Silicon.
  - If probe returns `"x86"` → Intel.
  - If probe unavailable or times out → default Apple Silicon.
- Rationale for the Apple Silicon default: Chromium's `navigator.userAgent` lies about arch on Apple Silicon for compat, so UA-string detection is unreliable; most Macs in the active user base are arm64 post-2020; Intel Mac users have a secondary-row fallback.

### 6.3 Layout

- Primary button: large `[Download Requestly API Client →]` pointing to the detected-OS URL. The button label may include an OS hint (e.g., icon) — visual detail left to design pass.
- Secondary row beneath: small OS icons + label on hover for each *other* option, each a direct link. On macOS Apple Silicon the row shows Intel Mac + Windows + Linux; on Apple Silicon probe-failure cases still render the full row so a wrong default is rescuable.
- Unknown/unsupported OS (`getUserOS()` returns null, or returns `iOS`/`Android`): omit the primary button, render all four installer URLs in the secondary row at equal weight. Whether to additionally surface a generic `https://requestly.com/desktop` link for this case is flagged in §11 for product confirmation.

### 6.4 Open behavior

- Web mode (`window.RQ.MODE === "WEB"`): `window.open(url, "_blank", "noopener")`.
- Desktop mode: `window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("open-external-link", { link: url })` — same pattern as `MandatoryUpdateScreen.handleCTAClick`.

## 7. Feature flags

Two GrowthBook flags, read inside `ApiClientRouteElement`:

| Flag | Default | Purpose |
|---|---|---|
| `api_client_migration_block_screen` | off | When on, the modal renders for users in the `local-storage` segment. Ops toggles this on at cutover time. When off, `MigrationBlockModal` never mounts — zero runtime cost. |
| `api_client_migration_block_screen_dismissable` | off | When on, the modal is dismissable (X, ESC, mask click) and dismissal persists until page reload. When off, the modal is fully blocking. Ops keeps this on for internal testing, then flips it off globally before the hard-block rollout to external users. |

Naming mirrors `api_client_workspace_export` from RQ-1662.

Only the `local-storage` segment's modal honors the `_dismissable` flag. The follow-up tickets for the `auto-cloud` and `auto-local-fs` single-CTA variants should not wire this flag into those variants — per product direction, auto variants are always blocking.

## 8. Analytics

All events routed through `app/src/modules/analytics/events/features/apiClient/index.js` + `constants.js`, following RQ-1662 precedent.

| Event | Fires when | Properties |
|---|---|---|
| `Block Screen Shown` | Modal first becomes visible in a session (guard with ref so remounts don't double-fire) | `user_auth_state: 'signed_in' \| 'signed_out'`, `platform: 'web' \| 'desktop'`, `workspace_type`, `is_dismissable: boolean` |
| `Block Screen CTA Clicked` | Either CTA clicked | `cta: 'export' \| 'download'`; plus `platform_clicked: 'mac_arm' \| 'mac_intel' \| 'win' \| 'linux'` when `cta='download'` |
| `Block Screen Dismissed` | Modal closed via X, ESC, or mask click (dismissable mode only) | `dismiss_method: 'close_button' \| 'escape' \| 'mask_click'` |
| `Block Screen Report Link Clicked` | Footer "Report issues" link clicked | — |
| `Workspace Export Initiated` | Export Workspace clicked | `source: 'block-screen'` |
| `Workspace Export Completed` | Zip download triggered | Reuse existing RQ-1662 event; extend `source` enum with `'block-screen'` if needed |
| `Workspace Export Failed` | Zip build/download errors | `source: 'block-screen'`, `reason` |

These match TB §12.2. No new-app events are added (different repo).

## 9. Files

**New:**

- `app/src/features/apiClient/hooks/useMigrationSegment.ts`
- `app/src/features/apiClient/screens/migrationBlock/MigrationBlockModal.tsx`
- `app/src/features/apiClient/screens/migrationBlock/migrationBlockModal.scss`
- `app/src/features/apiClient/screens/migrationBlock/useWorkspaceZipDownload.ts`
- `app/src/features/apiClient/screens/migrationBlock/constants.ts`
- `app/src/features/apiClient/screens/migrationBlock/__tests__/useMigrationSegment.test.ts`
- `app/src/features/apiClient/screens/migrationBlock/__tests__/MigrationBlockModal.test.tsx`

**Modified:**

- `app/src/features/apiClient/components/RouteElement.tsx` — mount `<MigrationBlockModal />`, gated by flag + segment.
- `app/src/modules/analytics/events/features/apiClient/index.js` — add the five events.
- `app/src/modules/analytics/events/features/constants.js` — add the event-name constants.

## 10. Testing

**Unit — `useMigrationSegment`:**

Keyed off the active workspace's `workspaceType` + view mode:

- `activeWorkspace` undefined / `workspaceType` undefined (hydrating) → `'unknown'`.
- `workspaceType` is a value not in the enum (defensive safety fallback) → `'local-storage'`.
- `viewMode === ApiClientViewMode.MULTI` (any `workspaceType`) → `'auto-local-fs'`.
- `workspaceType === WorkspaceType.LOCAL`, SINGLE view → `'auto-local-fs'`.
- `workspaceType === WorkspaceType.LOCAL_STORAGE`, SINGLE view → `'local-storage'`.
- `workspaceType === WorkspaceType.PERSONAL`, SINGLE view → `'auto-cloud'`.
- `workspaceType === WorkspaceType.SHARED`, SINGLE view → `'auto-cloud'`.

**Reactivity:**

- Active workspace's `workspaceType` changes from `PERSONAL` to `LOCAL` → segment flips from `'auto-cloud'` to `'auto-local-fs'` (unmounts the modal if one had been rendered).
- User signs out and the workspace setup thunk swaps the active workspace to `LOCAL_STORAGE` → segment flips from `'auto-cloud'` to `'local-storage'` (mounts the modal).
- User signs in and the thunk swaps the active workspace to `PERSONAL` → segment flips from `'local-storage'` to `'auto-cloud'` (unmounts the modal).
- View mode toggles from SINGLE to MULTI → segment resolves to `'auto-local-fs'`.

**Component — `MigrationBlockModal`:**

- Renders when `api_client_migration_block_screen` on + segment `'local-storage'`.
- Renders nothing when the show-flag is off (regardless of segment).
- Renders nothing for segment `'auto-cloud'`, `'auto-local-fs'`, or `'unknown'` (regardless of flag).
- **Blocking mode** (`dismissable={false}`): ESC / mask click / close-button — all do not dismiss; no close button exists in the DOM.
- **Dismissable mode** (`dismissable={true}`): X button is rendered; ESC, mask click, and X all close the modal and fire `Block Screen Dismissed`. Once dismissed, remounts within the same page load do not re-show the modal. After a simulated full reload (test resets the module-level flag), the modal re-appears.
- Export button disabled with "Nothing to export" tooltip when workspace is empty or container is mid-setup.
- Download primary button label and URL match detected OS; secondary row lists the other three OS options; on unknown OS, primary is hidden and all four render in the secondary row.
- Footer report-issues link is rendered in both blocking and dismissable modes; clicking it opens `https://github.com/requestly/requestly/issues/4593` via `window.open` (web) or desktop IPC, and fires `Block Screen Report Link Clicked`.

**Integration — `ApiClientRouteElement`:**

- With Redux store configured for a signed-out web user + flag on → modal visible, API Client surface underneath mounts but is blocked.
- Clicking Export triggers a Blob download (mock `URL.createObjectURL`); `Workspace Export Initiated` + `Workspace Export Completed` events fire with `source: 'block-screen'`.
- Clicking Download opens the detected-OS URL (mock `window.open`); `Block Screen CTA Clicked` fires with the right `platform_clicked`.
- Changing the show-flag to off unmounts the modal without navigation.
- With `api_client_migration_block_screen_dismissable` on, dismissing the modal and navigating away and back to API Client keeps the modal hidden (module-level flag honored). Simulating a page reload (reset of the module-level flag) brings the modal back.

## 11. Open items / follow-ups

- **TB Q19** — universal enforcement across stale old-app clients stays eng's call. This design assumes the GrowthBook flag is the single trigger; a future server-side enforcement (403 from the API client data endpoints) would be additive and the modal behavior would be unchanged.
- **TB Q22** — legacy-auth users being routed to the 2-step variant as a fallback safety net is out of scope here. `useMigrationSegment` already distinguishes `'local-storage'` from the two auto branches; the follow-up ticket can add legacy-auth routing (e.g., a `'local-storage-fallback'` branch or folding it into `'local-storage'` on a targeted condition) without reshaping the core segmentation.
- **TB Q18** — mid-session cutover behavior: if the flag flips on while a user is actively working in API Client, the modal appears on the next React render. That matches TB expectations ("residual unsaved work may still be lost"); no pre-block warning or graceful-save work is in scope here.
- **Mac arch detection** — Safari does not expose `navigator.userAgentData`. Those users default to Apple Silicon primary and reach Intel via the secondary row.
- **Unknown-OS fallback URL** — if `getUserOS()` returns null, the current plan renders all four URLs in the secondary row. Confirm with product whether a generic `https://requestly.com/desktop` fallback link is preferred instead.

## 12. Non-goals recap

- Auto-migratable single-CTA block screen variant.
- Legacy-auth detection / fallback routing.
- New-app (requestly-api-client) changes of any kind.
- Post-migration email, Migration Notice Banner, onboarding files-detected state, or any other migration touchpoint from the TB.
- Mid-session cutover UX beyond "modal appears on next render."
- Block enforcement mechanism (server-side vs client update).
