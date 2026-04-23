import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Tooltip, notification } from "antd";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import { useWorkspaceZipDownload } from "features/apiClient/hooks/useWorkspaceZipDownload";
import { DownloadPlatform, detectDownloadPlatform, ALL_PLATFORMS } from "./detectOS";
import { DOWNLOAD_URLS, DOWNLOAD_LABELS, REPORT_ISSUES_URL } from "./constants";
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

interface Props {
  dismissable: boolean;
}

// Module-level flag survives component remounts within the same page load.
// Resets on full reload. Used only when `dismissable === true`.
let hasDismissedThisPageLoad = false;

function getAppMode(): "web" | "desktop" {
  return (window as any).RQ?.DESKTOP ? "desktop" : "web";
}

function openExternalLink(url: string): void {
  const ipc = (window as any).RQ?.DESKTOP?.SERVICES?.IPC;
  if (ipc && typeof ipc.invokeEventInBG === "function") {
    ipc.invokeEventInBG("open-external-link", { link: url });
  } else {
    window.open(url, "_blank", "noopener");
  }
}

export const MigrationBlockModal: React.FC<Props> = ({ dismissable }) => {
  const [isDismissed, setIsDismissed] = useState(dismissable && hasDismissedThisPageLoad);
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
      user_auth_state: "signed_out", // local-storage segment implies signed-out via LOCAL_STORAGE workspace
      platform: getAppMode(),
      workspace_type: workspaceType,
      is_dismissable: dismissable,
    });
  }, [isDismissed, dismissable, workspaceType]);

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
      notification.success({
        message: "Workspace exported",
        placement: "bottomRight",
      });
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
    // NOTE: Ant Modal's onCancel fires for X, ESC, and mask click alike — we can't
    // cheaply distinguish them here. `dismiss_method` is best-effort; refine later
    // with keyboard/mouse handlers if the product team needs the granularity.
  }, [dismissable]);

  if (isDismissed) return null;

  const secondaryPlatforms: DownloadPlatform[] = isPlatformProbed
    ? ALL_PLATFORMS.filter((p) => p !== platform)
    : ALL_PLATFORMS;

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
      width={560}
    >
      <div className="migration-block-modal__body">
        <h3 className="migration-block-modal__headline">
          Your API client now has its own dedicated app — fast, clean, and resource-optimized.
        </h3>
        <p className="migration-block-modal__intro">You'll need to do this in 2 steps:</p>
        <ol className="migration-block-modal__steps">
          <li className="migration-block-modal__step">
            <div className="migration-block-modal__step-label">
              <span className="migration-block-modal__step-num">1.</span>
              <span>Export your workspace from this app</span>
            </div>
            <Tooltip title={isEmpty ? "Nothing to export" : ""} placement="bottom">
              <button
                type="button"
                className="migration-block-modal__cta"
                disabled={!isReady}
                onClick={handleExportClick}
                aria-label="Export workspace"
              >
                <MdOutlineFileDownload />
                <span>{isDownloading ? "Exporting..." : "Export Workspace"}</span>
              </button>
            </Tooltip>
          </li>
          <li className="migration-block-modal__step">
            <div className="migration-block-modal__step-label">
              <span className="migration-block-modal__step-num">2.</span>
              <span>Download the new app and import the file</span>
            </div>
            {isPlatformProbed && platform !== null ? (
              <button
                type="button"
                className="migration-block-modal__cta migration-block-modal__cta--primary"
                onClick={() => handleDownloadClick(platform)}
                aria-label={`Download Requestly API Client for ${DOWNLOAD_LABELS[platform]}`}
              >
                Download Requestly API Client →
              </button>
            ) : null}
          </li>
        </ol>
        {secondaryPlatforms.length > 0 && (
          <div className="migration-block-modal__more-platforms" aria-label="Other platforms">
            {!platform && <span>Download for: </span>}
            {platform && <span>Other platforms: </span>}
            {secondaryPlatforms.map((p) => (
              <button
                key={p}
                type="button"
                className="migration-block-modal__platform-link"
                onClick={() => handleDownloadClick(p)}
              >
                {DOWNLOAD_LABELS[p]}
              </button>
            ))}
          </div>
        )}
        <div className="migration-block-modal__footer">
          <button type="button" className="migration-block-modal__report-link" onClick={handleReportLinkClick}>
            Running into issues? Let us know on GitHub →
          </button>
        </div>
      </div>
    </Modal>
  );
};
