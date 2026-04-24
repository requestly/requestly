import React, { useState, useMemo } from "react";
import { Tooltip } from "antd";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import { useAllRecords } from "features/apiClient/slices/apiRecords/apiRecords.hooks";
import { useAllEnvironments } from "features/apiClient/slices/environments/environments.hooks";
import { WorkspaceExportModal } from "../../../modals";
import "./exportWorkspaceAction.scss";

export const ExportWorkspaceAction: React.FC = () => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const allRecords = useAllRecords();
  const allEnvironments = useAllEnvironments();

  const isEmpty = useMemo(() => allRecords.length === 0 && allEnvironments.length === 0, [
    allRecords.length,
    allEnvironments.length,
  ]);

  return (
    <>
      <Tooltip title={isEmpty ? "Nothing to export" : "Export workspace"} placement="right">
        <div
          role="button"
          aria-label="Export workspace"
          aria-disabled={isEmpty}
          className={`api-client-tab-link export-workspace-action ${isEmpty ? "disabled" : ""}`}
          onClick={() => {
            if (!isEmpty) setIsExportModalOpen(true);
          }}
        >
          <MdOutlineFileDownload />
        </div>
      </Tooltip>

      {isExportModalOpen && (
        <WorkspaceExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
      )}
    </>
  );
};
