# RQ-1806 — Cloud Workspace Block Modal (auto-cloud variant)

**Date:** 2026-04-26
**Status:** Design
**Builds on:** [`2026-04-23-rq-1806-api-client-block-screen-design.md`](./2026-04-23-rq-1806-api-client-block-screen-design.md)
**Branch:** `feat/rq-1806-cloud-workspace-block-modal`

## Context

PR #4615 shipped the migration block modal for the `local-storage` segment of the API Client. The original spec named `auto-cloud` and `auto-local-fs` as future variants, with `MigrationBlockModal` already shaped as a router so adding them touches only the modal — not the container.

Backend is rolling out a server-side migration that copies cloud-workspace data (`PERSONAL` and `SHARED`) into the new dedicated Requestly API Client app. Once a workspace's data has been migrated, the user should be told: download the new app, sign in, and continue working there. The old web app's API Client view should be blocked for that workspace.

Local-storage and auto-local-fs workspaces are out of scope for this spec — they have different migration stories (manual export and file-system handoff respectively) and are tracked separately.

## Goals

1. Render a block modal for `auto-cloud` workspaces whose data has been migrated server-side.
2. Communicate the simplified journey: data is already migrated, just download the new app and sign in with the same email.
3. Keep a manual export available as an escape hatch (under a Troubleshooting collapsible) without crowding the primary flow.
4. Gate the experience per-workspace so partial backend rollouts don't surprise users whose data hasn't been migrated yet.
5. Reuse the existing modal shell, OS detection, download URLs, analytics events, and styling from the local-storage variant.

## Non-goals

- Changing the local-storage variant's UX or gating.
- Implementing the `auto-local-fs` variant.
- Building the backend migration script (separately tracked); this spec assumes `migratedToArc` is populated on workspace documents in Firestore.
- Building cloud-side import or any UX inside the new dedicated app.

## Gating

The cloud modal renders when **all** of the following are true:

| Gate | Source | Purpose |
|---|---|---|
| Segment === `auto-cloud` | `useMigrationSegment()` (existing) | Active workspace is `PERSONAL` or `SHARED` in SINGLE view |
| `api_client_migration_block_screen` GrowthBook flag is on | `useFeatureIsOn` in `container.tsx` (existing) | Global kill-switch / staged rollout |
| `migratedToArc === true` **OR** `api_client_migration_block_screen_cloud_force` flag is on | `migratedToArc` from two sources (see below); the force-flag from GrowthBook | Per-workspace opt-in (auto-migrated path) **or** forced manual migration for unmigrated workspaces |

**Two cloud sub-variants** are routed by a small `CloudVariantRouter`:

- `migratedToArc === true` → 2-step "auto" variant (`CloudBlockModalContent`): data already migrated server-side, just download + sign in.
- `migratedToArc !== true` AND `cloud_force` flag is on → 3-step "manual" variant: the same Export → Download → Import flow used for `LOCAL_STORAGE` workspaces. Implemented by literally rendering `LocalStorageBlockModalContent` — its copy and flow are workspace-type-agnostic, and `useWorkspaceZipDownload` works for cloud workspaces too.
- Otherwise → nothing.

The force-flag is the rollout knob for "we want to push everyone to the new app even if their data hasn't been auto-migrated yet." Flipping it on without the auto-migration backfill complete simply means more cloud users see the manual migration path.

**`migratedToArc` is read from one of two sources, depending on workspace type**, because PERSONAL workspaces don't have a Firestore workspace document (they live entirely on the per-user record):

- **SHARED**: `activeWorkspace.migratedToArc` — read from the Firestore team document at path `teams/<teamId>`, synced via the existing `useFetchTeamWorkspaces` realtime listener (the field is added to that hook's allow-list, parallel to the existing `browserstackDetails` block).
- **PERSONAL**: `userAuth.details.metadata.migratedToArc` — read from the user document at path `users/<uid>`, `metadata.migratedToArc` field (same place as the existing `metadata.ai_consent`). The user record is loaded once on login via `AuthHandler` (`getUser(uid)`), **not via a realtime listener**, so a flip from false → true requires the user to sign in again or reload before the modal mounts. This is acceptable since PERSONAL migration is a one-time per-user event.

The cloud-variant decision (auto vs force-manual vs none) lives in `CloudVariantRouter`, which uses `workspaceType === WorkspaceType.PERSONAL` as the discriminator for the `migratedToArc` read.

The dismissable behavior is driven by the existing `api_client_migration_block_screen_dismissable` flag — same as local-storage. Honoring the flag (rather than always-blocking, as the prior spec speculated) preserves a safe rollout path: ship dismissable first, flip to blocking later if needed. The per-workspace `migratedToArc` gate is already a strong safety net.

The per-workspace gate lives **inside** `MigrationBlockModal`'s `auto-cloud` branch, not in `container.tsx`. This keeps the per-segment routing logic in one place — same pattern the local-storage variant uses for its `WorkspaceProvider` wrap.

## Type additions

Two type extensions are required, one per source:

**1. `Workspace.migratedToArc`** in `app/src/features/workspaces/types/index.ts` — for `SHARED` workspaces:

```ts
export interface Workspace {
  // ...existing fields
  migratedToArc?: boolean;
}
```

**2. `UserMetadata.migratedToArc`** in `app/src/backend/models/users.ts` — for `PERSONAL` workspaces:

```ts
type UserMetadata =
  | {
      ai_consent?: boolean;
      migratedToArc?: boolean;
    }
  | undefined;
```

Both default to `undefined` / falsy. The cloud modal only renders when explicitly `true`.

The Firestore listeners already in place (`useFetchTeamWorkspaces` for SHARED, the user listener for PERSONAL — same path through which `ai_consent` already flows) propagate the values into Redux. The team fetcher uses an explicit allow-list in its `formattedTeamData` constructor, so `migratedToArc` is added there parallel to the existing `browserstackDetails` block.

## Modal structure (auto-cloud variant)

A new `CloudBlockModalContent` component sits next to `LocalStorageBlockModalContent` in `MigrationBlockModal.tsx`. It reuses the same Ant `<Modal>` shell — same width (640), centered, scoped to `.api-client-container` via `getContainer`, dismiss affordances driven by the same `dismissable` prop.

### Header

- **Headline:** `Your API Client now has its own dedicated app` (identical to local-storage — same product framing).
- **Sub:** `Your workspaces have already been migrated. Just sign in to continue.`

### Stepper — 2 visible steps

Same `migration-block-modal__steps` ordered list. Two cards instead of three.

**Step 1 — Download the new app**

- Description: `Requestly API Client for <detected OS>` (reuses `detectDownloadPlatform`).
- Right-aligned **primary** CTA: `Download` button with the OS-specific icon (`FaApple` / `FaWindows` / `FaLinux`) and the trailing `MdArrowForward`. Identical mechanics to local-storage step 2.
- Below the description: `Other platforms` chip row with the remaining platform icons (tooltip on each). Identical to local-storage.

**Step 2 — Sign in with `<user.email>`** (passive, no action button)

- Title interpolates the active user's email pulled from `getUserAuthDetails().details.profile.email`. Example: `Sign in with sahil@example.com`.
- Description: `Open Requestly API Client and sign in with this email. Your workspaces will be ready.`
- Visual treatment: `migration-block-modal__step migration-block-modal__step--passive` (same modifier the local-storage Import step uses) — no action button on the right.
- If for any reason the user's email is missing (signed-out edge case), the title falls back to `Sign in to your account`. The cloud variant only renders for cloud workspaces, which require a signed-in user, so this path should be effectively unreachable but guarding keeps the modal robust.

### Troubleshooting collapsible

Below the stepper, above the GitHub footer.

- Antd `Collapse` (ghost variant), single panel titled `Troubleshooting`. Collapsed by default.
- Inside the panel:
  - One-sentence explainer: `If you'd like a local backup of this workspace, you can export it as a zip.`
  - The same Export button + tooltip + loading/empty/error semantics as the local-storage step 1, powered by the existing `useWorkspaceZipDownload` hook (works for cloud workspaces — pulls the same in-memory records, environments, scripts as for local-storage).
- Reuses existing notification UX for success / failure.

### Footer

Unchanged GitHub `Report issues` link with `FaGithub` + `MdArrowForward`. Same handler.

## Component / file layout

```
app/src/features/apiClient/screens/migrationBlock/
  MigrationBlockModal.tsx          ← router gains auto-cloud branch + new
                                     CloudBlockModalContent + TroubleshootingPanel
  migrationBlockModal.scss         ← add .migration-block-modal__troubleshooting
                                     classes
  constants.ts                     ← unchanged (DOWNLOAD_URLS / DOWNLOAD_LABELS
                                     / REPORT_ISSUES_URL reused)

app/src/features/workspaces/types/index.ts
  Workspace interface              ← add `migratedToArc?: boolean`

app/src/modules/analytics/events/features/apiClient/index.js
                                   ← add trackMigrationBlockScreenTroubleshootingOpened
app/src/modules/analytics/events/features/constants.js
                                   ← add the new event name constant
```

Router shape after change:

```tsx
export const MigrationBlockModal: React.FC<Props> = ({ dismissable }) => {
  const segment = useMigrationSegment();
  const selectedWorkspaces = useGetAllSelectedWorkspaces();

  if (segment === "local-storage") {
    const workspace = selectedWorkspaces[0];
    if (!workspace || workspace.status.loading) return null;
    return (
      <WorkspaceProvider workspaceId={workspace.id}>
        <LocalStorageBlockModalContent dismissable={dismissable} />
      </WorkspaceProvider>
    );
  }

  if (segment === "auto-cloud") {
    const workspace = selectedWorkspaces[0];
    if (!workspace || workspace.status.loading) return null;
    if (!workspace.data?.migratedToArc) return null; // per-workspace gate
    return (
      <WorkspaceProvider workspaceId={workspace.id}>
        <CloudBlockModalContent dismissable={dismissable} />
      </WorkspaceProvider>
    );
  }

  // auto-local-fs and unknown → null
  return null;
};
```

`WorkspaceProvider` is still needed for the cloud variant because the Troubleshooting Export uses `useWorkspaceZipDownload` (which calls `useApiClientSelector`).

The exact path used to read `migratedToArc` (`workspace.data?.migratedToArc` vs `workspace.migratedToArc`) depends on the shape returned by `useGetAllSelectedWorkspaces`; the implementation pass will match whatever the existing local-storage branch reads from the same hook. The plan-writing step should verify this.

## Analytics

Reuse the four existing block-screen events. They already carry `workspace_type`, which discriminates cloud (`PERSONAL` / `SHARED`) from local-storage (`LOCAL_STORAGE`) in reporting:

- `trackMigrationBlockScreenShown` — fires once on cloud-modal mount. Same `is_dismissable` / `platform` / `workspace_type` payload.
- `trackMigrationBlockScreenCtaClicked` — `cta: "download"` for the primary CTA and the Other-platforms chips; `cta: "export"` for the Troubleshooting export. Carries `platform_clicked` for download events.
- `trackMigrationBlockScreenDismissed` — fires on close-button / mask / esc when `dismissable === true`.
- `trackMigrationBlockScreenReportLinkClicked` — unchanged.
- `trackWorkspaceExportStarted` / `trackWorkspaceExportSuccessful` / `trackWorkspaceExportFailed` — fired by the Troubleshooting export, with `source: "block-screen"`. Identical to local-storage.

One new event:

- `trackMigrationBlockScreenTroubleshootingOpened` — fires the first time the Troubleshooting collapsible is expanded for a given mount. Helps measure how many cloud users feel the auto-migration message is insufficient.

## Edge cases

- **`migratedToArc` flips during the session** (backend update lands while the user is on the API Client tab) → realtime workspace listener updates Redux → modal mounts reactively. Same pattern as workspace switching.
- **User switches from a migrated cloud workspace to one that hasn't been migrated yet** → modal unmounts (segment is still `auto-cloud` but the per-workspace gate fails). The user can continue working in the un-migrated workspace as before.
- **User switches between segments** (e.g. cloud → local-fs) → existing reactive segment evaluation handles the transition; the cloud modal unmounts and whichever variant matches the new segment mounts (or none does).
- **User signs out from a cloud workspace** → segment flips to `local-storage` → cloud modal unmounts, local-storage modal takes over if its gate passes.
- **Empty cloud workspace** → Download step still works (no dependency on workspace contents). Troubleshooting Export shows the empty-tooltip / disabled state from the existing hook. No special-case.
- **`PERSONAL` workspace** (`id === null` per `PrivateWorkspaceStub`) → the user confirmed `migratedToArc` is synced for both PERSONAL and SHARED via the existing listener. Passing `null` to `WorkspaceProvider` already works in the local-storage branch (signed-out users hit the same path), so no special-case is needed.
- **Dismissable + user dismisses** → uses the same module-level `hasDismissedThisPageLoad` flag as local-storage. Survives navigation within a page-load, resets on full reload. No persistence across page reloads is intentional — keeps the block visible when users return.
- **User on dismissable cloud modal who has already exported via Troubleshooting** → behavior is identical to a non-exported user; the modal doesn't track export-completion as a dismissal trigger. Dismissal is solely user-driven via close affordances.

## Open questions

None blocking. Resolved during implementation:

1. ~~Confirm the exact path/selector to read `migratedToArc`~~ — Resolved: read from `getActiveWorkspace` (existing selector) for SHARED, and from `getUserAuthDetails` for PERSONAL. See "Gating" section above.
2. Confirm whether `Workspace.migratedToArc` should also be added to any related types in `shared/` (does `shared/` have a Workspace type that should mirror this addition? — search and decide). The implementation pass added the field only to `app/src/features/workspaces/types/index.ts`; if a parallel definition exists in `shared/` it should be kept in sync in a follow-up.
3. Pick a chevron / disclosure visual for the Troubleshooting collapsible that fits the existing modal's `--requestly-color-*` token system rather than Ant's default — handled by the SCSS in `migrationBlockModal.scss` (Antd's default chevron is preserved; only the surrounding box / colors are themed).

## Test plan

- **Unit tests**
  - `useMigrationSegment` is unchanged; existing tests still pass.
  - Add a test for the cloud branch's per-workspace gate: when `segment === "auto-cloud"` but `migratedToArc !== true`, the router returns `null`. (Render the router with mocked hooks; assert no modal in the DOM.)
- **Manual verification (web mode, browser)**
  - Cloud workspace, `migratedToArc=true`, both flags on → modal appears with the 2-step cloud variant.
  - Cloud workspace, `migratedToArc=false/undefined` → modal does not appear.
  - Cloud workspace, GrowthBook show-flag off → modal does not appear (kill-switch works).
  - Cloud workspace, dismissable flag on → close button + esc + mask click dismiss the modal; reopen by reloading.
  - Cloud workspace, dismissable flag off → no close affordances.
  - Switch between cloud and local-storage workspaces → correct variant renders for each.
  - Email rendering: signed-in user's email appears in step 2's title.
  - Troubleshooting collapsed by default. Expand → Export button works → success notification + zip downloads.
  - Empty cloud workspace → Export button shows the tooltip / disabled state from the existing hook.
  - Other-platforms chips and Report-issues link open the right URLs.
- **Manual verification (desktop mode)**
  - Same flows; download links open via `RQ.DESKTOP.SERVICES.IPC.invokeEventInBG('open-external-link', ...)` instead of `window.open`.
- **Analytics verification**
  - All four existing block-screen events fire on the cloud variant with `workspace_type` set to `PERSONAL` or `SHARED`.
  - The new `trackMigrationBlockScreenTroubleshootingOpened` event fires once per mount on first expand.
  - Export events carry `source: "block-screen"`.
