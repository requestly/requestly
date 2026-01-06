import React, { useCallback, useState } from "react";
import { ErrorFilesList } from "../../components/ErrorFilesList/ErrorFileslist";
import { useGetAllSelectedWorkspaces, useWorkspace } from "features/apiClient/slices/workspaceView/hooks";
import { WorkspaceProvider } from "../WorkspaceProvider/WorkspaceProvider";
import { Collapse } from "antd";
import { MdOutlineArrowForwardIos } from "@react-icons/all-files/md/MdOutlineArrowForwardIos";
import { MdWarningAmber } from "@react-icons/all-files/md/MdWarningAmber";
import { Workspace } from "features/workspaces/types";
import "./multiWorkspaceErrorFilesList.scss";

const WorkspaceErrorFilesList: React.FC<{
  workspaceId: Workspace["id"];
  handleErrorRecordsCount: (v: number) => void;
}> = ({ workspaceId, handleErrorRecordsCount }) => {
  const workspace = useWorkspace(workspaceId);

  if (workspace.status.loading || workspace.status.state.success === false) {
    return null;
  }

  return (
    <WorkspaceProvider key={workspaceId} workspaceId={workspaceId} collapsible={false}>
      <ErrorFilesList updateErrorRecordsCount={handleErrorRecordsCount} />
    </WorkspaceProvider>
  );
};

export const MultiWorkspaceErrorFilesList: React.FC = () => {
  const selectedWorkspaces = useGetAllSelectedWorkspaces();
  const [errorRecordsCount, setErrorRecordsCount] = useState<number>(0);

  const handleErrorRecordsCount = useCallback((value: number) => {
    setErrorRecordsCount((prev) => prev + value);
  }, []);

  // if (!errorRecordsCount) {
  //   return;
  // }

  return (
    <div className="multi-workspace-error-files-list-container">
      <Collapse
        ghost
        className="multi-workspace-error-files-collapse"
        expandIcon={({ isActive }) => {
          return <MdOutlineArrowForwardIos className={`collapse-expand-icon ${isActive ? "expanded" : ""}`} />;
        }}
      >
        <Collapse.Panel
          forceRender
          key="errorFiles"
          className="multi-workspace-error-files-collapse-panel"
          header={
            <div className="multi-workspace-error-files-list-header">
              {errorRecordsCount ? <MdWarningAmber /> : null} Error files{" "}
              <span className="count">{errorRecordsCount}</span>
            </div>
          }
        >
          {selectedWorkspaces.map((workspace) => {
            return (
              <WorkspaceErrorFilesList
                key={workspace.id}
                workspaceId={workspace.id}
                handleErrorRecordsCount={handleErrorRecordsCount}
              />
            );
          })}
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};
