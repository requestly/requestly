import React, { useCallback, useMemo, useState } from "react";
import { Modal, Tree, message } from "antd";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import { CgStack } from "@react-icons/all-files/cg/CgStack";
import { MdOutlineDashboard } from "@react-icons/all-files/md/MdOutlineDashboard";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import { buildExportTreeData } from "./buildExportTreeData";
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
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  const hydratedRoots = useMemo(() => {
    const { updatedRecords } = convertFlatRecordsToNestedRecords(allRecords);
    return updatedRecords;
  }, [allRecords]);

  const payload = useMemo(() => {
    const environments = [
      parseEnvironmentEntityToData(globalEnvironment),
      ...allEnvironments.map(parseEnvironmentEntityToData),
    ];
    return buildWorkspaceExport({ rootRecords: hydratedRoots, environments });
  }, [hydratedRoots, allEnvironments, globalEnvironment]);

  const treeData = useMemo(
    () =>
      buildExportTreeData(hydratedRoots, {
        collection: <CgStack />,
        example: <MdOutlineDashboard />,
      }),
    [hydratedRoots]
  );

  const envNames = useMemo(() => {
    return [
      { id: globalEnvironment.id, name: globalEnvironment.name || "Global", isGlobal: true },
      ...allEnvironments.map((e) => ({ id: e.id, name: e.name, isGlobal: false })),
    ];
  }, [globalEnvironment, allEnvironments]);

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

  const handleTreeExpand = useCallback((keys: React.Key[]) => {
    setExpandedKeys(keys);
  }, []);

  const handleTreeNodeClick = useCallback((_e: React.MouseEvent, node: { key: React.Key; children?: unknown[] }) => {
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    if (!hasChildren) return;
    setExpandedKeys((prev) => (prev.includes(node.key) ? prev.filter((k) => k !== node.key) : [...prev, node.key]));
  }, []);

  return (
    <Modal
      title={
        <div className="workspace-export-modal__title-row">
          <MdOutlineFileDownload />
          <span>Export workspace</span>
        </div>
      }
      open={isOpen}
      onCancel={handleCancel}
      width={600}
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
              <span className="count-value">{payload.counts.examples}</span>
              <span className="count-label">Examples</span>
            </div>
            <div className="count-item">
              <span className="count-value">{payload.counts.environments}</span>
              <span className="count-label">Environments</span>
            </div>
          </div>

          {treeData.length > 0 && (
            <div className="workspace-export-modal__section">
              <div className="workspace-export-modal__section-title">Collections &amp; requests</div>
              <div className="workspace-export-modal__tree">
                <Tree
                  treeData={treeData}
                  showIcon
                  selectable={false}
                  blockNode
                  expandedKeys={expandedKeys}
                  onExpand={handleTreeExpand}
                  onClick={handleTreeNodeClick}
                />
              </div>
            </div>
          )}

          {envNames.length > 0 && (
            <div className="workspace-export-modal__section">
              <div className="workspace-export-modal__section-title">Environments</div>
              <ul className="workspace-export-modal__env-list">
                {envNames.map((env) => (
                  <li key={env.id} className="workspace-export-modal__env-item">
                    <MdHorizontalSplit />
                    <span>{env.name}</span>
                    {env.isGlobal && <span className="workspace-export-modal__env-badge">Global</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
      {error && <div className="workspace-export-modal__error">Export failed: {error}</div>}
    </Modal>
  );
};
