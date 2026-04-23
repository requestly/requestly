import React, { useCallback, useMemo, useState } from "react";
import { Modal, Tree, message } from "antd";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import { CgStack } from "@react-icons/all-files/cg/CgStack";
import { MdOutlineDashboard } from "@react-icons/all-files/md/MdOutlineDashboard";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import { buildExportTreeData } from "./buildExportTreeData";
import { useAllRecords } from "features/apiClient/slices/apiRecords/apiRecords.hooks";
import { convertFlatRecordsToNestedRecords } from "features/apiClient/screens/apiClient/utils";
import { useAllEnvironments, useGlobalEnvironment } from "features/apiClient/slices/environments/environments.hooks";
import {
  trackWorkspaceExportStarted,
  trackWorkspaceExportSuccessful,
  trackWorkspaceExportFailed,
} from "modules/analytics/events/features/apiClient";
import { useWorkspaceZipDownload } from "features/apiClient/hooks/useWorkspaceZipDownload";
import "./workspaceExportModal.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workspaceName: string;
}

export const WorkspaceExportModal: React.FC<Props> = ({ isOpen, onClose, workspaceName: _workspaceName }) => {
  const allRecords = useAllRecords();
  const globalEnvironment = useGlobalEnvironment();
  const allEnvironments = useAllEnvironments();

  const { download, isDownloading, error, workspaceType, counts } = useWorkspaceZipDownload();

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  const hydratedRoots = useMemo(() => {
    const { updatedRecords } = convertFlatRecordsToNestedRecords(allRecords);
    return updatedRecords;
  }, [allRecords]);

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

  const isEmpty = counts.collections === 0 && counts.apis === 0 && counts.environments === 0;

  const handleExport = useCallback(async () => {
    trackWorkspaceExportStarted({
      workspaceType,
      collectionCount: counts.collections,
      requestCount: counts.apis,
      environmentCount: counts.environments,
    });
    try {
      const result = await download();
      trackWorkspaceExportSuccessful({
        workspaceType,
        durationMs: result.durationMs,
        zipSizeBytes: result.zipSizeBytes,
      });
      message.success("Workspace exported");
      onClose();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      trackWorkspaceExportFailed({ workspaceType, errorType: errorMessage });
    }
  }, [download, workspaceType, counts, onClose]);

  const handleCancel = useCallback(() => {
    if (isDownloading) return;
    onClose();
  }, [isDownloading, onClose]);

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
      closable={!isDownloading}
      maskClosable={!isDownloading}
      onOk={handleExport}
      okText={isDownloading ? "Exporting..." : "Export as ZIP"}
      okButtonProps={{ loading: isDownloading, disabled: isEmpty }}
      cancelButtonProps={{ disabled: isDownloading }}
      className="custom-rq-modal workspace-export-modal"
    >
      {isEmpty ? (
        <div>Nothing to export — this workspace has no collections or environments.</div>
      ) : (
        <>
          {treeData.length > 0 && (
            <div className="workspace-export-modal__section">
              <div className="workspace-export-modal__section-title">
                <span>Collections &amp; requests</span>
                <span className="workspace-export-modal__count-pill">
                  {counts.collections} {counts.collections === 1 ? "collection" : "collections"}
                </span>
                <span className="workspace-export-modal__count-pill">
                  {counts.apis} {counts.apis === 1 ? "request" : "requests"}
                </span>
                {counts.examples > 0 && (
                  <span className="workspace-export-modal__count-pill">
                    {counts.examples} {counts.examples === 1 ? "example" : "examples"}
                  </span>
                )}
              </div>
              <div className="workspace-export-modal__tree">
                <Tree
                  treeData={treeData}
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
              <div className="workspace-export-modal__section-title">
                <span>Environments</span>
                <span className="workspace-export-modal__count-pill">
                  {counts.environments} {counts.environments === 1 ? "environment" : "environments"}
                </span>
              </div>
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
      {error && <div className="workspace-export-modal__error">Export failed: {error.message}</div>}
    </Modal>
  );
};
