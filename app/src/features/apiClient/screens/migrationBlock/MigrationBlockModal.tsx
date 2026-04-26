import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Tooltip, notification } from "antd";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import { MdArrowForward } from "@react-icons/all-files/md/MdArrowForward";
import { FaApple } from "@react-icons/all-files/fa/FaApple";
import { FaWindows } from "@react-icons/all-files/fa/FaWindows";
import { FaLinux } from "@react-icons/all-files/fa/FaLinux";
import { FaGithub } from "@react-icons/all-files/fa/FaGithub";
import { RQButton } from "lib/design-system-v2/components";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { useMigrationSegment } from "features/apiClient/hooks/useMigrationSegment";
import { useSelector } from "react-redux";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useWorkspaceZipDownload } from "features/apiClient/hooks/useWorkspaceZipDownload";
import { WorkspaceProvider } from "features/apiClient/common/WorkspaceProvider";
import { useGetAllSelectedWorkspaces } from "features/apiClient/slices/workspaceView/hooks";
import { WorkspaceType } from "features/workspaces/types";
import { DownloadPlatform, detectDownloadPlatform, ALL_PLATFORMS } from "./detectOS";
import {
  DOWNLOAD_URLS,
  DOWNLOAD_LABELS,
  REPORT_ISSUES_URL,
  MIGRATION_BLOCK_DISMISSABLE_FLAG,
  MIGRATION_BLOCK_CLOUD_FORCE_FLAG,
} from "./constants";
import {
  trackMigrationBlockScreenShown,
  trackMigrationBlockScreenCtaClicked,
  trackMigrationBlockScreenDismissed,
  trackMigrationBlockScreenReportLinkClicked,
  trackWorkspaceExportStarted,
  trackWorkspaceExportSuccessful,
  trackWorkspaceExportFailed,
} from "modules/analytics/events/features/apiClient";
import "./migrationBlockModal.scss";

interface ContentProps {
  dismissable: boolean;
}

// Module-level flag survives component remounts within the same page load.
// Resets on full reload. Used only when `dismissable === true`.
let hasDismissedThisPageLoad = false;

const PLATFORM_ICONS: Record<DownloadPlatform, React.ComponentType<{ className?: string }>> = {
  mac_arm: FaApple,
  mac_intel: FaApple,
  win: FaWindows,
  linux: FaLinux,
};

function getAppMode(): "web" | "desktop" {
  return (window as any).RQ?.DESKTOP ? "desktop" : "web";
}

// Confine the Ant Modal (including its mask) to the API Client content area so
// the sidebar and other app chrome stay clickable while the modal is up.
// Falls back to document.body if the selector can't find the container.
function getBlockModalContainer(): HTMLElement {
  return (document.querySelector(".api-client-container") as HTMLElement) ?? document.body;
}

function openExternalLink(url: string): void {
  const ipc = (window as any).RQ?.DESKTOP?.SERVICES?.IPC;
  if (ipc && typeof ipc.invokeEventInBG === "function") {
    ipc.invokeEventInBG("open-external-link", { link: url });
  } else {
    window.open(url, "_blank", "noopener");
  }
}

// Router: picks the variant for the current segment and handles any per-variant
// provider wrapping (the local-storage variant needs WorkspaceProvider because
// its content calls useWorkspaceZipDownload → useApiClientSelector). Future
// auto-local-fs (incl. MULTI) and auto-cloud branches add here.
export const MigrationBlockModal: React.FC = () => {
  const segment = useMigrationSegment();
  const selectedWorkspaces = useGetAllSelectedWorkspaces();
  const dismissable = useFeatureIsOn(MIGRATION_BLOCK_DISMISSABLE_FLAG);
  const forceCloudMigration = useFeatureIsOn(MIGRATION_BLOCK_CLOUD_FORCE_FLAG);

  if (segment === "local-storage") {
    // local-storage is always SINGLE view with exactly one selected workspace.
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
    return (
      <WorkspaceProvider workspaceId={workspace.id}>
        <CloudVariantRouter dismissable={dismissable} forceCloudMigration={forceCloudMigration} />
      </WorkspaceProvider>
    );
  }

  // auto-local-fs and unknown render nothing until their variants
  // are implemented. When auto-local-fs lands, its branch can handle MULTI view
  // (N workspaces) however it needs — iterate per workspace, skip the provider
  // entirely, or whatever the variant's data story requires.
  return null;
};

const LocalStorageBlockModalContent: React.FC<ContentProps> = ({ dismissable }) => {
  const [isDismissed, setIsDismissed] = useState(dismissable && hasDismissedThisPageLoad);
  const userAuth = useSelector(getUserAuthDetails);
  const userEmail: string | undefined = userAuth?.details?.profile?.email;
  const [platform, setPlatform] = useState<DownloadPlatform | null>(null);
  const [isPlatformProbed, setIsPlatformProbed] = useState(false);
  const shownFiredRef = useRef(false);

  const { download, isReady, isDownloading, workspaceType, counts } = useWorkspaceZipDownload();

  // OS probe runs once on mount.
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

  // Fire SHOWN once per mount.
  useEffect(() => {
    if (shownFiredRef.current || isDismissed) return;
    shownFiredRef.current = true;
    trackMigrationBlockScreenShown({
      user_auth_state: userEmail ? "signed_in" : "signed_out",
      platform: getAppMode(),
      workspace_type: workspaceType,
      is_dismissable: dismissable,
    });
  }, [isDismissed, dismissable, workspaceType, userEmail]);

  const isEmpty = counts.collections === 0 && counts.apis === 0 && counts.environments === 0;

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

  if (isDismissed) return null;

  const secondaryPlatforms: DownloadPlatform[] = isPlatformProbed
    ? ALL_PLATFORMS.filter((p) => p !== platform)
    : ALL_PLATFORMS;
  const PrimaryPlatformIcon = platform ? PLATFORM_ICONS[platform] : null;

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
            Fast, clean, and resource-optimized. Follow these 3 steps to continue your work.
          </p>
        </div>

        <ol className="migration-block-modal__steps">
          <li className="migration-block-modal__step">
            <div className="migration-block-modal__step-marker" aria-hidden>
              <span className="migration-block-modal__step-dot">1</span>
            </div>
            <div className="migration-block-modal__step-content">
              <div className="migration-block-modal__step-title">Export your workspace</div>
              <div className="migration-block-modal__step-description">
                Save a copy of your collections, environments, and scripts.
              </div>
            </div>
            <Tooltip title={isEmpty ? "Nothing to export — this workspace is empty." : ""} placement="top">
              <span className="migration-block-modal__step-action">
                <RQButton
                  type="secondary"
                  size="default"
                  icon={<MdOutlineFileDownload />}
                  disabled={!isReady}
                  loading={isDownloading}
                  onClick={handleExportClick}
                >
                  {isDownloading ? "Exporting…" : "Export"}
                </RQButton>
              </span>
            </Tooltip>
          </li>

          <li className="migration-block-modal__step">
            <div className="migration-block-modal__step-marker" aria-hidden>
              <span className="migration-block-modal__step-dot">2</span>
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
              <span className="migration-block-modal__step-dot">3</span>
            </div>
            <div className="migration-block-modal__step-content">
              <div className="migration-block-modal__step-title">Import into the new app</div>
              <div className="migration-block-modal__step-description">
                Open Requestly API Client → <strong>Import</strong> → select the file you exported in step 1.
              </div>
            </div>
          </li>
        </ol>

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

// Picks the cloud variant to render based on the per-workspace migratedToArc
// flag and the force-cloud-migration GrowthBook flag.
// - migratedToArc === true → 2-step "auto" variant (data already migrated)
// - migratedToArc !== true && forceCloudMigration → 3-step manual variant
//   (reuses LocalStorageBlockModalContent — same Export → Download → Import flow,
//   same component because the copy is workspace-type-agnostic and
//   useWorkspaceZipDownload works for cloud workspaces too)
// - otherwise → nothing
const CloudVariantRouter: React.FC<{ dismissable: boolean; forceCloudMigration: boolean }> = ({
  dismissable,
  forceCloudMigration,
}) => {
  const activeWorkspace = useSelector(getActiveWorkspace);
  const userAuth = useSelector(getUserAuthDetails);

  const isPersonal = activeWorkspace?.workspaceType === WorkspaceType.PERSONAL;
  // PERSONAL: backend writes migratedToArc to RDB at users/<uid>/profile/migratedToArc.
  // The existing userNodeListener (DBListenerInit/userNodeListener.js) listens
  // on that RDB node and dispatches updateUserProfile with the full RDB payload
  // spread, so any field there lands on userAuth.details.profile reactively.
  // SHARED: read from the team Firestore doc (synced by useFetchTeamWorkspaces).
  const isMigratedToArc = isPersonal
    ? userAuth?.details?.profile?.migratedToArc === true
    : activeWorkspace?.migratedToArc === true;

  if (isMigratedToArc) {
    return <CloudBlockModalContent dismissable={dismissable} />;
  }
  if (forceCloudMigration) {
    return <LocalStorageBlockModalContent dismissable={dismissable} />;
  }
  return null;
};

const CloudBlockModalContent: React.FC<ContentProps> = ({ dismissable }) => {
  const activeWorkspace = useSelector(getActiveWorkspace);
  const userAuth = useSelector(getUserAuthDetails);
  const userEmail: string | undefined = userAuth?.details?.profile?.email;

  const [isDismissed, setIsDismissed] = useState(dismissable && hasDismissedThisPageLoad);
  const [platform, setPlatform] = useState<DownloadPlatform | null>(null);
  const [isPlatformProbed, setIsPlatformProbed] = useState(false);
  const shownFiredRef = useRef(false);

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
    if (shownFiredRef.current || isDismissed) return;
    shownFiredRef.current = true;
    trackMigrationBlockScreenShown({
      user_auth_state: userEmail ? "signed_in" : "signed_out",
      platform: getAppMode(),
      workspace_type: activeWorkspace?.workspaceType,
      is_dismissable: dismissable,
    });
  }, [isDismissed, dismissable, userEmail, activeWorkspace?.workspaceType]);

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

        <div className="migration-block-modal__footer">
          <WorkspaceBackupLink />
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

// Quiet secondary action in the modal footer — same visual treatment as the
// GitHub "report issues" link so the two read as a paired help cluster rather
// than a competing third stepper. Single click triggers the workspace zip
// download via the shared useWorkspaceZipDownload hook.
const WorkspaceBackupLink: React.FC = () => {
  const { download, isReady, isDownloading, workspaceType, counts } = useWorkspaceZipDownload();
  const isEmpty = counts.collections === 0 && counts.apis === 0 && counts.environments === 0;
  const isDisabled = !isReady || isDownloading || isEmpty;

  const handleExportClick = useCallback(async () => {
    if (isDisabled) return;
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
  }, [isDisabled, download, workspaceType, counts]);

  const label = isDownloading
    ? "Exporting workspace…"
    : isEmpty
    ? "Nothing to export — this workspace is empty"
    : "Need a local backup? Export this workspace as zip";

  return (
    <button
      type="button"
      className="migration-block-modal__report-link"
      onClick={handleExportClick}
      disabled={isDisabled}
    >
      <MdOutlineFileDownload />
      <span>{label}</span>
      {!isDisabled && <MdArrowForward className="migration-block-modal__report-arrow" />}
    </button>
  );
};
