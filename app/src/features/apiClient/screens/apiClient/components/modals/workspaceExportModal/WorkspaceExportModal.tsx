import React, { useCallback, useMemo, useState } from "react";
import { Modal } from "antd";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import { getFormattedDate } from "utils/DateTimeUtils";
import { useRootRecords } from "features/apiClient/slices/apiRecords/apiRecords.hooks";
import { useAllEnvironments } from "features/apiClient/slices/environments/environments.hooks";
import { parseEnvironmentEntityToData } from "features/apiClient/slices/environments/utils";
import { buildWorkspaceExport } from "features/apiClient/helpers/exporters/requestly/buildWorkspaceExport";
import { zipWorkspaceExport } from "features/apiClient/helpers/exporters/requestly/zipWorkspaceExport";
import {
  trackWorkspaceExportStarted,
  trackWorkspaceExportSuccessful,
  trackWorkspaceExportFailed,
} from "modules/analytics/events/features/apiClient";
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = new Blob([bytes as any], { type: "application/zip" });
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
  const rootRecords = useRootRecords();
  const allEnvironments = useAllEnvironments();

  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo(() => {
    const environments = allEnvironments.map(parseEnvironmentEntityToData);
    return buildWorkspaceExport({ rootRecords, environments });
  }, [rootRecords, allEnvironments]);

  const isEmpty = payload.counts.collections === 0 && payload.counts.apis === 0 && payload.counts.environments === 0;

  const handleExport = useCallback(async () => {
    setError(null);
    setIsExporting(true);
    trackWorkspaceExportStarted({
      collections: payload.counts.collections,
      apis: payload.counts.apis,
      environments: payload.counts.environments,
    });

    try {
      const bytes = zipWorkspaceExport(payload);
      const fileName = `RQ-workspace-${slugifyWorkspaceName(workspaceName)}-export-${getFormattedDate(
        "DD_MM_YYYY"
      )}.zip`;
      triggerBrowserDownload(bytes, fileName);
      trackWorkspaceExportSuccessful({ zipSizeBytes: bytes.byteLength });
      onClose();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
      trackWorkspaceExportFailed({ errorType: message });
    } finally {
      setIsExporting(false);
    }
  }, [payload, workspaceName, onClose]);

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
      okText="Export as ZIP"
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
