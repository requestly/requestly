import React, { useCallback, useMemo, useState } from "react";
import { Modal, message } from "antd";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import { getFormattedDate } from "utils/DateTimeUtils";
import { useSelector } from "react-redux";
import { useAllRecords } from "features/apiClient/slices/apiRecords/apiRecords.hooks";
import { convertFlatRecordsToNestedRecords } from "features/apiClient/screens/apiClient/utils";
import { useAllEnvironments, useGlobalEnvironment } from "features/apiClient/slices/environments/environments.hooks";
import { parseEnvironmentEntityToData } from "features/apiClient/slices/environments/utils";
import { buildWorkspaceExport } from "features/apiClient/helpers/exporters/requestly/buildWorkspaceExport";
import { zipWorkspaceExport } from "features/apiClient/helpers/exporters/requestly/zipWorkspaceExport";
import {
  trackWorkspaceExportStarted,
  trackWorkspaceExportSuccessful,
  trackWorkspaceExportFailed,
} from "modules/analytics/events/features/apiClient";
import { useApiClientFeatureContext } from "features/apiClient/slices/workspaceView/helpers/ApiClientContextRegistry/hooks";
import { getWorkspaceById, dummyPersonalWorkspace } from "store/slices/workspaces/selectors";
import { RootState } from "store/types";
import "./workspaceExportModal.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workspaceName: string;
}

function slugifyWorkspaceName(name: string): string {
  const slug = name
    .trim()
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "workspace";
}

function triggerBrowserDownload(bytes: Uint8Array, fileName: string) {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const WorkspaceExportModal: React.FC<Props> = ({ isOpen, onClose, workspaceName }) => {
  const allRecords = useAllRecords();
  const globalEnvironment = useGlobalEnvironment();
  const allEnvironments = useAllEnvironments();

  const ctx = useApiClientFeatureContext();
  const workspaceForAnalytics = useSelector((state: RootState) =>
    ctx.workspaceId === null ? dummyPersonalWorkspace : getWorkspaceById(ctx.workspaceId)(state)
  );
  const workspaceType = workspaceForAnalytics?.workspaceType ?? "UNKNOWN";

  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo(() => {
    const { updatedRecords } = convertFlatRecordsToNestedRecords(allRecords);
    const environments = [
      parseEnvironmentEntityToData(globalEnvironment),
      ...allEnvironments.map(parseEnvironmentEntityToData),
    ];
    return buildWorkspaceExport({ rootRecords: updatedRecords, environments });
  }, [allRecords, allEnvironments, globalEnvironment]);

  const isEmpty = payload.counts.collections === 0 && payload.counts.apis === 0 && payload.counts.environments === 0;

  const handleExport = useCallback(async () => {
    setError(null);
    setIsExporting(true);
    const startedAt = Date.now();

    trackWorkspaceExportStarted({
      workspaceType,
      collectionCount: payload.counts.collections,
      requestCount: payload.counts.apis,
      environmentCount: payload.counts.environments,
    });

    // Yield once so React can paint the "Exporting..." state before we block on zip build.
    await Promise.resolve();

    try {
      const bytes = zipWorkspaceExport(payload);
      const fileName = `RQ-workspace-${slugifyWorkspaceName(workspaceName)}-export-${getFormattedDate(
        "DD_MM_YYYY"
      )}.zip`;

      triggerBrowserDownload(bytes, fileName);

      trackWorkspaceExportSuccessful({
        workspaceType,
        durationMs: Date.now() - startedAt,
        zipSizeBytes: bytes.byteLength,
      });
      message.success("Workspace exported");
      onClose();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      setError(errorMessage);
      trackWorkspaceExportFailed({ workspaceType, errorType: errorMessage });
    } finally {
      setIsExporting(false);
    }
  }, [payload, workspaceName, onClose, workspaceType]);

  const handleCancel = useCallback(() => {
    if (isExporting) return;
    onClose();
  }, [isExporting, onClose]);

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <MdOutlineFileDownload />
          <span>Export workspace · {workspaceName}</span>
        </div>
      }
      open={isOpen}
      onCancel={handleCancel}
      closable={!isExporting}
      maskClosable={!isExporting}
      onOk={handleExport}
      okText={isExporting ? "Exporting..." : "Export as ZIP"}
      okButtonProps={{ loading: isExporting, disabled: isEmpty }}
      cancelButtonProps={{ disabled: isExporting }}
      className="custom-rq-modal workspace-export-modal"
    >
      {isEmpty ? (
        <div>Nothing to export — this workspace has no collections or environments.</div>
      ) : (
        <>
          <div>The exported ZIP will contain:</div>
          <div className="workspace-export-modal__counts">
            <div className="count-item">
              <span className="count-value">{payload.counts.collections}</span>
              <span className="count-label">Collections</span>
            </div>
            <div className="count-item">
              <span className="count-value">{payload.counts.apis}</span>
              <span className="count-label">Requests</span>
            </div>
            <div className="count-item">
              <span className="count-value">{payload.counts.environments}</span>
              <span className="count-label">Environments (incl. global)</span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "var(--requestly-color-text-subtle)" }}>
            Examples saved under requests are included.
          </div>
        </>
      )}
      {error && <div className="workspace-export-modal__error">Export failed: {error}</div>}
    </Modal>
  );
};
