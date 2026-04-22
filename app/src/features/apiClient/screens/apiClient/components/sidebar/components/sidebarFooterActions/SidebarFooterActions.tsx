import React, { useState, useMemo } from "react";
import { Tooltip } from "antd";
import { useSelector } from "react-redux";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import { useRootRecords } from "features/apiClient/slices/apiRecords/apiRecords.hooks";
import { useAllEnvironments } from "features/apiClient/slices/environments/environments.hooks";
import { useApiClientFeatureContext } from "features/apiClient/slices/workspaceView/helpers/ApiClientContextRegistry/hooks";
import { getWorkspaceById, dummyPersonalWorkspace } from "store/slices/workspaces/selectors";
import { RootState } from "store/types";
import { WorkspaceExportModal } from "../../../modals";
import "./sidebarFooterActions.scss";

export const SidebarFooterActions: React.FC = () => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const rootRecords = useRootRecords();
  const allEnvironments = useAllEnvironments();
  const ctx = useApiClientFeatureContext();

  const rawWorkspace = useSelector((state: RootState) =>
    ctx.workspaceId === null ? dummyPersonalWorkspace : getWorkspaceById(ctx.workspaceId)(state)
  );

  const workspaceName = rawWorkspace?.name ?? "Workspace";

  const isEmpty = useMemo(() => rootRecords.length === 0 && allEnvironments.length === 0, [
    rootRecords.length,
    allEnvironments.length,
  ]);

  return (
    <>
      <div className="sidebar-footer-actions">
        <Tooltip
          title={isEmpty ? "Nothing to export" : "Download all collections and environments as a zip"}
          placement="top"
        >
          <button
            type="button"
            className="sidebar-footer-actions__button"
            disabled={isEmpty}
            onClick={() => setIsExportModalOpen(true)}
          >
            <MdOutlineFileDownload size={16} />
            <span>Export workspace</span>
          </button>
        </Tooltip>
      </div>

      {isExportModalOpen && (
        <WorkspaceExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          workspaceName={workspaceName}
        />
      )}
    </>
  );
};
