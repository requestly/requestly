import React from "react";
import { ErrorFilesList } from "../../components/ErrorFilesList/ErrorFileslist";
import { useApiClientMultiWorkspaceView } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { WorkspaceProvider } from "../WorkspaceProvider/WorkspaceProvider";
import { Collapse } from "antd";
import { MdOutlineArrowForwardIos } from "@react-icons/all-files/md/MdOutlineArrowForwardIos";
import "./MultiWorkspaceErrorFilesList.scss";

/**
 * - test delete
 * - test fix and saving of file
 * - test single mode errored files
 * - test switches and errored files
 */

export const MultiWorkspaceErrorFilesList: React.FC = () => {
  const selectedWorkspaces = useApiClientMultiWorkspaceView((s) => s.selectedWorkspaces);

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
          key="errorFiles"
          className="multi-workspace-error-files-collapse-panel"
          header={<div className="multi-workspace-error-files-list-header">Error files</div>}
        >
          {selectedWorkspaces.map((workspace) => {
            const workspaceId = workspace.getState().id;

            return (
              <WorkspaceProvider key={workspaceId} workspaceId={workspaceId} collapsible={false}>
                <ErrorFilesList />
              </WorkspaceProvider>
            );
          })}
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};
