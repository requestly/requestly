# RQ-1806 Cloud Workspace Block Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the migration block modal for `auto-cloud` workspaces (PERSONAL / SHARED) once their data has been migrated server-side, with a 2-step stepper (Download + Sign in with user's email) and a Troubleshooting collapsible exposing the manual export path.

**Architecture:** Extends the existing `MigrationBlockModal` router (already shaped for variants) with an `auto-cloud` branch that gates on `Workspace.migratedToArc` (new field, populated by a backend migration script and synced via the existing realtime workspace listener). Reuses the existing modal shell, OS detection, download URLs, GrowthBook flags (`api_client_migration_block_screen` + `_dismissable`), and analytics events from the local-storage variant. Adds one new analytics event for Troubleshooting expansion.

**Tech Stack:** React, TypeScript, Redux (`getActiveWorkspace` selector), Zustand (existing API client stores), Ant Design (`Modal`, `Collapse`, `Tooltip`), GrowthBook (`useFeatureIsOn`), Vitest.

**Spec:** [`docs/superpowers/specs/2026-04-26-rq-1806-cloud-workspace-block-modal-design.md`](../specs/2026-04-26-rq-1806-cloud-workspace-block-modal-design.md)

**Branch:** `feat/rq-1806-cloud-workspace-block-modal` (already created; spec already committed)

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `app/src/features/workspaces/types/index.ts` | Modify | Add `migratedToArc?: boolean` to `Workspace` |
| `app/src/modules/analytics/events/features/constants.js` | Modify | Add `MIGRATION_BLOCK_SCREEN_TROUBLESHOOTING_OPENED` event name constant |
| `app/src/modules/analytics/events/features/apiClient/index.js` | Modify | Add `trackMigrationBlockScreenTroubleshootingOpened` tracker fn |
| `app/src/features/apiClient/screens/migrationBlock/migrationBlockModal.scss` | Modify | Add `.migration-block-modal__troubleshooting*` style block |
| `app/src/features/apiClient/screens/migrationBlock/MigrationBlockModal.tsx` | Modify | Add `auto-cloud` branch in router, `CloudBlockModalContent` component, `TroubleshootingPanel` sub-component |

No new files are required for this feature. All changes extend existing files.

---

## Task 1: Add `migratedToArc` field to the `Workspace` interface

**Files:**
- Modify: `app/src/features/workspaces/types/index.ts`

- [ ] **Step 1: Read the current file**

Read `app/src/features/workspaces/types/index.ts`. Confirm the `Workspace` interface is on lines 1–29 and that `browserstackDetails` is the last optional field before the closing brace.

- [ ] **Step 2: Add the optional field**

In `app/src/features/workspaces/types/index.ts`, inside the `Workspace` interface, add a single line right after the `browserstackDetails` block (above the closing `}` on line 29). The exact insertion:

```ts
  migratedToArc?: boolean;
```

After the change the interface tail should read:

```ts
  browserstackDetails?: {
    groupId: string;
    subGroupId: string | null;
  };

  migratedToArc?: boolean;
}
```

- [ ] **Step 3: Run the type-checker to confirm nothing else broke**

Run: `cd app && npx tsc --noEmit -p tsconfig.json 2>&1 | head -40`
Expected: no new errors caused by the field addition. (Pre-existing errors are out of scope; only fail this step if a new error mentions `migratedToArc` or the `Workspace` type.)

- [ ] **Step 4: Commit**

```bash
cd /Users/sahilgupta/Documents/dev/requestly/requestly-master
git add app/src/features/workspaces/types/index.ts
git commit -m "$(cat <<'EOF'
feat(workspaces): add Workspace.migratedToArc flag for RQ-1806 cloud-block gate

Optional boolean populated by the backend migration script on Firestore
workspace documents (PERSONAL and SHARED). Synced into Redux via the
existing realtime workspace listener; consumed by the upcoming
auto-cloud branch of MigrationBlockModal as the per-workspace gate on
top of the existing GrowthBook show-flag.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Add the Troubleshooting-opened analytics event

**Files:**
- Modify: `app/src/modules/analytics/events/features/constants.js`
- Modify: `app/src/modules/analytics/events/features/apiClient/index.js`

The cloud variant fires the four existing block-screen events plus one new event when the Troubleshooting collapsible is expanded for the first time per mount.

- [ ] **Step 1: Add the event-name constant**

In `app/src/modules/analytics/events/features/constants.js`, find the existing `MIGRATION_BLOCK_SCREEN_REPORT_LINK_CLICKED` line (around line 200). Add a new line directly below it:

```js
  MIGRATION_BLOCK_SCREEN_TROUBLESHOOTING_OPENED: "api_client_migration_block_screen_troubleshooting_opened",
```

So the four migration-block constants become five contiguous entries.

- [ ] **Step 2: Add the tracker function**

In `app/src/modules/analytics/events/features/apiClient/index.js`, find the existing `trackMigrationBlockScreenReportLinkClicked` function (around line 403). Append a new tracker right below it (before the file ends or before the next unrelated section):

```js
export const trackMigrationBlockScreenTroubleshootingOpened = (params) => {
  trackEvent(API_CLIENT.MIGRATION_BLOCK_SCREEN_TROUBLESHOOTING_OPENED, params);
};
```

- [ ] **Step 3: Quick lint/syntax check**

Run: `cd app && node -e "require('./src/modules/analytics/events/features/constants.js')" 2>&1 | head -5`
Expected: no SyntaxError. (The file is plain CommonJS-friendly JS; this confirms the new line parses.)

If the project has an ESLint command, run it on the two files:
`cd app && npx eslint src/modules/analytics/events/features/constants.js src/modules/analytics/events/features/apiClient/index.js 2>&1 | head -20`
Expected: no new errors from the additions.

- [ ] **Step 4: Commit**

```bash
cd /Users/sahilgupta/Documents/dev/requestly/requestly-master
git add app/src/modules/analytics/events/features/constants.js app/src/modules/analytics/events/features/apiClient/index.js
git commit -m "$(cat <<'EOF'
feat(analytics): add MigrationBlockScreenTroubleshootingOpened event for RQ-1806

Fires when the user expands the Troubleshooting collapsible inside the
auto-cloud variant of the API Client block modal. Helps measure how
many cloud users feel the auto-migration messaging is insufficient and
fall back to the manual export path.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Add SCSS for the Troubleshooting collapsible

**Files:**
- Modify: `app/src/features/apiClient/screens/migrationBlock/migrationBlockModal.scss`

- [ ] **Step 1: Append the troubleshooting styles**

Open `app/src/features/apiClient/screens/migrationBlock/migrationBlockModal.scss`. The file currently ends with the `&__report-arrow` rule on line 243 and the closing `}` for `.migration-block-modal` on line 244. Insert the following block **inside** the `.migration-block-modal` selector — i.e. right before the file's final closing `}` on line 244:

```scss
  &__troubleshooting {
    border-top: 1px solid var(--requestly-color-surface-2);
    padding-top: 8px;

    .ant-collapse {
      background: transparent;
      border: none;
    }

    .ant-collapse-item {
      border: none;
    }

    .ant-collapse-header {
      padding: 8px 0 !important;
      color: var(--requestly-color-text-subtle);
      font-size: 13px;

      &:hover {
        color: var(--requestly-color-text-default);
      }
    }

    .ant-collapse-content {
      background: transparent;
      border: none;
    }

    .ant-collapse-content-box {
      padding: 8px 0 4px !important;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  }

  &__troubleshooting-explainer {
    font-size: 13px;
    line-height: 1.55;
    color: var(--requestly-color-text-subtle);
  }

  &__troubleshooting-action {
    align-self: flex-start;
  }
```

- [ ] **Step 2: Confirm the file compiles**

Run: `cd app && npx sass --no-source-map src/features/apiClient/screens/migrationBlock/migrationBlockModal.scss /tmp/_rq_1806_smoketest.css 2>&1 | head -20`
Expected: no SCSS errors. (If `sass` is not installed at the repo level, skip and rely on the dev-server compile in Task 5.)

- [ ] **Step 3: Commit**

```bash
cd /Users/sahilgupta/Documents/dev/requestly/requestly-master
git add app/src/features/apiClient/screens/migrationBlock/migrationBlockModal.scss
git commit -m "$(cat <<'EOF'
style(apiClient): add Troubleshooting collapsible styles for RQ-1806 cloud variant

New .migration-block-modal__troubleshooting block scopes the Antd
Collapse to the modal's --requestly-color-* token system (transparent
background, neutral border on top, subtle/default text colors on
hover) so the disclosure visually nests inside the same card system as
the rest of the modal.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Add the `auto-cloud` branch and `CloudBlockModalContent` component

**Files:**
- Modify: `app/src/features/apiClient/screens/migrationBlock/MigrationBlockModal.tsx`

This is the bulk of the feature. The router gains a new branch; the new component reuses every utility/helper already used by `LocalStorageBlockModalContent` (`detectDownloadPlatform`, `useWorkspaceZipDownload`, `openExternalLink`, `getAppMode`, `getBlockModalContainer`, the existing trackers, the `hasDismissedThisPageLoad` module flag).

- [ ] **Step 1: Update the imports block**

Open `app/src/features/apiClient/screens/migrationBlock/MigrationBlockModal.tsx`. Replace the current `import { Modal, Tooltip, notification } from "antd";` line with:

```tsx
import { Modal, Tooltip, Collapse, notification } from "antd";
```

After the existing `import { useMigrationSegment } ...` line, add:

```tsx
import { useSelector } from "react-redux";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
```

After the existing analytics imports block, add `trackMigrationBlockScreenTroubleshootingOpened` to the import — i.e. extend:

```tsx
import {
  trackMigrationBlockScreenShown,
  trackMigrationBlockScreenCtaClicked,
  trackMigrationBlockScreenDismissed,
  trackMigrationBlockScreenReportLinkClicked,
  trackMigrationBlockScreenTroubleshootingOpened,
  trackWorkspaceExportStarted,
  trackWorkspaceExportSuccessful,
  trackWorkspaceExportFailed,
} from "modules/analytics/events/features/apiClient";
```

- [ ] **Step 2: Add the `auto-cloud` branch to the `MigrationBlockModal` router**

In the `MigrationBlockModal` component (currently lines 66–86), keep the existing `local-storage` branch unchanged. After it (and before the trailing `return null;`), insert the cloud branch:

```tsx
  if (segment === "auto-cloud") {
    const workspace = selectedWorkspaces[0];
    if (!workspace || workspace.status.loading) return null;
    return (
      <WorkspaceProvider workspaceId={workspace.id}>
        <CloudBlockModalContent dismissable={dismissable} />
      </WorkspaceProvider>
    );
  }
```

The per-workspace `migratedToArc` gate is enforced inside `CloudBlockModalContent` (next step), not here, so the gate has access to the same `getActiveWorkspace` Redux read used elsewhere and the router stays parallel to the local-storage branch (which similarly only checks workspace presence + loading status).

- [ ] **Step 3: Add the `CloudBlockModalContent` component**

After the existing `LocalStorageBlockModalContent` component (after line 297), append the new component at the bottom of the file:

```tsx
const CloudBlockModalContent: React.FC<Props> = ({ dismissable }) => {
  const activeWorkspace = useSelector(getActiveWorkspace);
  const userAuth = useSelector(getUserAuthDetails);
  const userEmail: string | undefined = userAuth?.details?.profile?.email;

  const [isDismissed, setIsDismissed] = useState(dismissable && hasDismissedThisPageLoad);
  const [platform, setPlatform] = useState<DownloadPlatform | null>(null);
  const [isPlatformProbed, setIsPlatformProbed] = useState(false);
  const shownFiredRef = useRef(false);

  // Per-workspace gate: only show once the backend migration script has flipped
  // the flag on this workspace's Firestore document. Lives inside the component
  // so the early-return runs after hooks, satisfying the rules-of-hooks.
  const isMigratedToArc = activeWorkspace?.migratedToArc === true;

  useEffect(() => {
    let cancelled = false;
    detectDownloadPlatform().then((result) => {
      if (cancelled) return;
      setPlatform(result.primary);
      setIsPlatformProbed(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isMigratedToArc) return;
    if (shownFiredRef.current || isDismissed) return;
    shownFiredRef.current = true;
    trackMigrationBlockScreenShown({
      user_auth_state: userEmail ? "signed_in" : "signed_out",
      platform: getAppMode(),
      workspace_type: activeWorkspace?.workspaceType,
      is_dismissable: dismissable,
    });
  }, [isMigratedToArc, isDismissed, dismissable, userEmail, activeWorkspace?.workspaceType]);

  const handleDownloadClick = useCallback((clicked: DownloadPlatform) => {
    trackMigrationBlockScreenCtaClicked({ cta: "download", platform_clicked: clicked });
    openExternalLink(DOWNLOAD_URLS[clicked]);
  }, []);

  const handleReportLinkClick = useCallback(() => {
    trackMigrationBlockScreenReportLinkClicked({});
    openExternalLink(REPORT_ISSUES_URL);
  }, []);

  const handleCancel = useCallback(() => {
    if (!dismissable) return;
    hasDismissedThisPageLoad = true;
    setIsDismissed(true);
    trackMigrationBlockScreenDismissed({ dismiss_method: "close_button" });
  }, [dismissable]);

  if (!isMigratedToArc) return null;
  if (isDismissed) return null;

  const secondaryPlatforms: DownloadPlatform[] = isPlatformProbed
    ? ALL_PLATFORMS.filter((p) => p !== platform)
    : ALL_PLATFORMS;
  const PrimaryPlatformIcon = platform ? PLATFORM_ICONS[platform] : null;
  const signInTitle = userEmail ? `Sign in with ${userEmail}` : "Sign in to your account";

  return (
    <Modal
      open
      centered
      title={null}
      footer={null}
      closable={dismissable}
      keyboard={dismissable}
      maskClosable={dismissable}
      onCancel={dismissable ? handleCancel : undefined}
      className="migration-block-modal"
      width={640}
      getContainer={getBlockModalContainer}
    >
      <div className="migration-block-modal__body">
        <div className="migration-block-modal__header">
          <h2 className="migration-block-modal__headline">Your API Client now has its own dedicated app</h2>
          <p className="migration-block-modal__subheadline">
            Your workspaces have already been migrated. Just sign in to continue.
          </p>
        </div>

        <ol className="migration-block-modal__steps">
          <li className="migration-block-modal__step">
            <div className="migration-block-modal__step-marker" aria-hidden>
              <span className="migration-block-modal__step-dot">1</span>
            </div>
            <div className="migration-block-modal__step-content">
              <div className="migration-block-modal__step-title">Download the new app</div>
              <div className="migration-block-modal__step-description">
                Requestly API Client for {platform ? DOWNLOAD_LABELS[platform] : "your OS"}.
              </div>
              {secondaryPlatforms.length > 0 && (
                <div className="migration-block-modal__platform-row" aria-label="Other platforms">
                  <span className="migration-block-modal__platform-row-label">
                    {isPlatformProbed && platform ? "Other platforms" : "Choose platform"}
                  </span>
                  {secondaryPlatforms.map((p) => {
                    const Icon = PLATFORM_ICONS[p];
                    return (
                      <Tooltip key={p} title={DOWNLOAD_LABELS[p]} placement="top">
                        <button
                          type="button"
                          className="migration-block-modal__platform-chip"
                          onClick={() => handleDownloadClick(p)}
                          aria-label={`Download for ${DOWNLOAD_LABELS[p]}`}
                        >
                          <Icon />
                        </button>
                      </Tooltip>
                    );
                  })}
                </div>
              )}
            </div>
            {isPlatformProbed && platform !== null && PrimaryPlatformIcon ? (
              <span className="migration-block-modal__step-action">
                <RQButton
                  type="primary"
                  size="default"
                  icon={<PrimaryPlatformIcon />}
                  onClick={() => handleDownloadClick(platform)}
                  className="migration-block-modal__primary-cta"
                >
                  Download
                  <MdArrowForward className="migration-block-modal__cta-arrow" />
                </RQButton>
              </span>
            ) : null}
          </li>

          <li className="migration-block-modal__step migration-block-modal__step--passive">
            <div className="migration-block-modal__step-marker" aria-hidden>
              <span className="migration-block-modal__step-dot">2</span>
            </div>
            <div className="migration-block-modal__step-content">
              <div className="migration-block-modal__step-title">{signInTitle}</div>
              <div className="migration-block-modal__step-description">
                Open Requestly API Client and sign in with this email. Your workspaces will be ready.
              </div>
            </div>
          </li>
        </ol>

        <TroubleshootingPanel />

        <div className="migration-block-modal__footer">
          <button type="button" className="migration-block-modal__report-link" onClick={handleReportLinkClick}>
            <FaGithub />
            <span>Running into issues? Let us know on GitHub</span>
            <MdArrowForward className="migration-block-modal__report-arrow" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
```

- [ ] **Step 4: Add the `TroubleshootingPanel` sub-component**

Append after `CloudBlockModalContent`:

```tsx
const TroubleshootingPanel: React.FC = () => {
  const openedFiredRef = useRef(false);
  const { download, isReady, isDownloading, workspaceType, counts } = useWorkspaceZipDownload();
  const isEmpty = counts.collections === 0 && counts.apis === 0 && counts.environments === 0;

  const handleCollapseChange = useCallback((activeKeys: string | string[]) => {
    const isOpen = Array.isArray(activeKeys) ? activeKeys.includes("export") : activeKeys === "export";
    if (isOpen && !openedFiredRef.current) {
      openedFiredRef.current = true;
      trackMigrationBlockScreenTroubleshootingOpened({});
    }
  }, []);

  const handleExportClick = useCallback(async () => {
    if (!isReady) return;
    trackMigrationBlockScreenCtaClicked({ cta: "export" });
    trackWorkspaceExportStarted({
      workspaceType,
      collectionCount: counts.collections,
      requestCount: counts.apis,
      environmentCount: counts.environments,
      source: "block-screen",
    });
    try {
      const result = await download();
      trackWorkspaceExportSuccessful({
        workspaceType,
        durationMs: result.durationMs,
        zipSizeBytes: result.zipSizeBytes,
        source: "block-screen",
      });
      notification.success({ message: "Workspace exported", placement: "bottomRight" });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      trackWorkspaceExportFailed({ workspaceType, errorType: errorMessage, source: "block-screen" });
      notification.error({
        message: "Export failed",
        description: errorMessage,
        placement: "bottomRight",
      });
    }
  }, [isReady, download, workspaceType, counts]);

  return (
    <div className="migration-block-modal__troubleshooting">
      <Collapse ghost onChange={handleCollapseChange}>
        <Collapse.Panel header="Troubleshooting" key="export">
          <div className="migration-block-modal__troubleshooting-explainer">
            If you'd like a local backup of this workspace, you can export it as a zip.
          </div>
          <Tooltip title={isEmpty ? "Nothing to export — this workspace is empty." : ""} placement="top">
            <span className="migration-block-modal__troubleshooting-action">
              <RQButton
                type="secondary"
                size="default"
                icon={<MdOutlineFileDownload />}
                disabled={!isReady}
                loading={isDownloading}
                onClick={handleExportClick}
              >
                {isDownloading ? "Exporting…" : "Export workspace"}
              </RQButton>
            </span>
          </Tooltip>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};
```

- [ ] **Step 5: Type-check the file**

Run: `cd app && npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "MigrationBlockModal|migrationBlock" | head -20`
Expected: no errors mentioning `MigrationBlockModal.tsx`. (Pre-existing errors in unrelated files are out of scope.)

If errors surface: the most likely culprits are
1. The `Workspace.migratedToArc` field not propagating from Task 1 (re-check the change),
2. The `Collapse` import (Antd v4 style — `Collapse` + `Collapse.Panel` are both available from `"antd"`).
3. `getUserAuthDetails` returning `UserAuth` typed without `details?.profile?.email` — check `app/src/store/slices/global/user/types.ts` if so; the field is widely used elsewhere (e.g. `componentsV2/SecondarySidebar/components/BillingTeamsNudge/BillingTeamNudge.tsx:38`) so it should be present.

- [ ] **Step 6: Commit**

```bash
cd /Users/sahilgupta/Documents/dev/requestly/requestly-master
git add app/src/features/apiClient/screens/migrationBlock/MigrationBlockModal.tsx
git commit -m "$(cat <<'EOF'
feat(apiClient): RQ-1806 auto-cloud variant of MigrationBlockModal

Adds the cloud-workspace branch to the MigrationBlockModal router:
- Per-workspace gate on Workspace.migratedToArc (added in prior commit);
  modal renders only once the backend migration script has flipped the
  flag, so partial rollouts don't surprise users whose data isn't moved
  yet.
- 2-step stepper: Download (OS-aware primary CTA + secondary platform
  chips) and a passive "Sign in with <user.email>" step that surfaces
  the exact account to use in the new app.
- Troubleshooting collapsible (Antd Collapse, ghost) below the stepper
  exposes the manual export path via the existing useWorkspaceZipDownload
  hook for users who want a local backup. Fires the new
  trackMigrationBlockScreenTroubleshootingOpened analytics event the
  first time it's expanded per mount.
- Reuses the existing Modal shell, OS detection, download URLs, GH
  report link, dismissable-flag honoring (via existing prop), and
  module-level hasDismissedThisPageLoad guard from the local-storage
  variant. Same WorkspaceProvider wrap so the export hook resolves.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Manual verification

This task has no commit at the end — it's the verification gate before opening the PR. The implementer must work through every checkbox below in a running browser session before declaring the work complete.

**Files:** none (run-the-app verification)

- [ ] **Step 1: Start the dev server**

Run: `cd app && npm run start`
Wait for the dev server to boot. Open the URL it prints (typically http://localhost:3000) in a browser.

- [ ] **Step 2: Sign in with a cloud workspace user**

Sign in with a Google or email account that has at least one cloud (`PERSONAL` or `SHARED`) workspace. Switch to that workspace from the workspace switcher in the header.

- [ ] **Step 3: Force the GrowthBook flags on for testing**

If a local override mechanism exists (check `useFeatureIsOn` callsites — often there's a query-param or DevTools hook), use it. Otherwise, set both flags to ON in the GrowthBook dashboard for your user:
- `api_client_migration_block_screen` → on
- `api_client_migration_block_screen_dismissable` → on

- [ ] **Step 4: Force `migratedToArc=true` on the active workspace**

In the browser DevTools console:
```js
// Confirm the workspace is in the Redux store
window.__store__?.getState?.().workspace?.allWorkspaces ?? "store not exposed — patch via the Firestore document instead"
```

If `window.__store__` is exposed, dispatch an update directly from devtools. Otherwise, edit the workspace document in the Firestore admin console (or use the requestly-cloud emulator) and set `migratedToArc: true` on the team / workspace document. The realtime listener should propagate the change without a reload.

- [ ] **Step 5: Verify the modal renders for cloud workspace**

Navigate to the API Client tab. Confirm:
- [ ] The block modal appears with headline "Your API Client now has its own dedicated app".
- [ ] Sub-headline reads "Your workspaces have already been migrated. Just sign in to continue."
- [ ] Two step cards appear (Download + Sign in). No third step.
- [ ] Step 1's primary CTA shows the correct OS icon (Apple / Windows / Linux based on your machine).
- [ ] Step 1's "Other platforms" row lists the remaining platforms; clicking each opens the right URL in a new tab.
- [ ] Step 2's title contains your signed-in email exactly: `Sign in with <your-email>`.
- [ ] Below the stepper, a "Troubleshooting" header is visible and collapsed by default.
- [ ] Footer "Report issues" link goes to https://github.com/requestly/requestly/issues/4593 in a new tab.
- [ ] Modal mask is contained to the API Client pane — sidebar / Rules / Settings tabs remain clickable.

- [ ] **Step 6: Verify Troubleshooting + export**

- [ ] Click "Troubleshooting". It expands and reveals the explainer text + an "Export workspace" button.
- [ ] In the network/Mixpanel tab confirm `api_client_migration_block_screen_troubleshooting_opened` fires once.
- [ ] Collapse and re-expand: the event should not fire a second time within the same mount.
- [ ] Click "Export workspace": a zip downloads and a "Workspace exported" success notification appears bottom-right.
- [ ] If the workspace is empty: the button is disabled with an "Nothing to export" tooltip.

- [ ] **Step 7: Verify per-workspace gate**

- [ ] Set `migratedToArc=false` (or remove the field) on the same workspace via Firestore.
- [ ] Within a few seconds the modal should disappear (realtime listener).
- [ ] Re-set `migratedToArc=true`: the modal reappears.

- [ ] **Step 8: Verify GrowthBook kill-switch**

- [ ] Turn off `api_client_migration_block_screen` in GrowthBook.
- [ ] Reload the page. Modal should not appear regardless of `migratedToArc`.
- [ ] Turn the flag back on for the remaining checks.

- [ ] **Step 9: Verify dismissable behavior**

- [ ] With `_dismissable` flag ON: confirm a close (×) button appears, esc dismisses, mask click dismisses. After dismissing, navigate to Rules and back to API Client — modal stays dismissed (page-load scope). Reload the tab — modal reappears.
- [ ] With `_dismissable` flag OFF: no close button, esc and mask clicks do nothing. The user can still navigate away to Rules / Settings (sidebar remains live).

- [ ] **Step 10: Verify segment switching**

- [ ] Switch to a `LOCAL_STORAGE` workspace (signed-out scratch workspace) → the local-storage variant of the modal renders (3-step stepper with Export → Download → Import).
- [ ] Switch back to the migrated cloud workspace → the cloud variant renders again.

- [ ] **Step 11: Verify analytics events**

In the browser network tab or Mixpanel debugger, confirm the following fire with `workspace_type` of `PERSONAL` or `SHARED`:
- [ ] `api_client_migration_block_screen_shown` once on first mount.
- [ ] `api_client_migration_block_screen_cta_clicked` with `cta: "download"` and the right `platform_clicked` value when clicking download buttons.
- [ ] `api_client_migration_block_screen_cta_clicked` with `cta: "export"` when clicking the Troubleshooting export.
- [ ] `api_client_migration_block_screen_dismissed` when closing (only when dismissable).
- [ ] `api_client_migration_block_screen_report_link_clicked` when clicking the GitHub link.
- [ ] `api_client_migration_block_screen_troubleshooting_opened` once on first expand.
- [ ] `api_client_export_workspace_started` / `_successful` (or `_failed`) when running the Troubleshooting export, with `source: "block-screen"`.

- [ ] **Step 12: (Optional) Verify desktop mode**

If the desktop app build is available locally:
- [ ] Run the desktop wrapper pointing at the dev server. Confirm download buttons open the URL via `RQ.DESKTOP.SERVICES.IPC.invokeEventInBG('open-external-link', ...)` rather than `window.open`. The app's external-link handler should land in the system browser.

---

## Final integration step

- [ ] **Push and open a PR**

```bash
cd /Users/sahilgupta/Documents/dev/requestly/requestly-master
git push -u origin feat/rq-1806-cloud-workspace-block-modal
```

Then open a PR titled e.g. `feat(apiClient): RQ-1806 auto-cloud block modal` linking to:
- The spec: `docs/superpowers/specs/2026-04-26-rq-1806-cloud-workspace-block-modal-design.md`
- The prior local-storage PR (#4615) for context.

**Do not push or open the PR without the user's explicit say-so.** This step is documented for completeness but should pause for user confirmation in the implementation skill.
