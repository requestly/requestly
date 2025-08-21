import React, { useMemo } from "react";
import { ErrorFilesList } from "../../components/ErrorFilesList/ErrorFileslist";
import { useApiClientMultiWorkspaceView } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { WorkspaceProvider } from "../WorkspaceProvider/WorkspaceProvider";
import { Collapse } from "antd";
import { MdOutlineArrowForwardIos } from "@react-icons/all-files/md/MdOutlineArrowForwardIos";
import "./MultiWorkspaceErrorFilesList.scss";
import { useApiClientFeatureContextProvider } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";

/**
 * - test delete
 * - test fix and saving of file
 * - test single mode errored files
 * - test switches and errored files
 */

export const MultiWorkspaceErrorFilesList: React.FC = () => {
  const selectedWorkspaces = useApiClientMultiWorkspaceView((s) => s.selectedWorkspaces);
  const getContext = useApiClientFeatureContextProvider((s) => s.getContext);

  const errorRecordsCount = useMemo(() => {
    return selectedWorkspaces.reduce((result, w) => {
      const workspace = w.getState();

      if (workspace.state.loading) {
        return result;
      }

      const context = getContext(workspace.id);
      const { apiErroredRecords, environmentErroredRecords } = context.stores.erroredRecords.getState();
      return result + apiErroredRecords.length + environmentErroredRecords.length;
    }, 0);
  }, [getContext, selectedWorkspaces]);

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
          header={
            <div className="multi-workspace-error-files-list-header">
              Error files <span className="count">{errorRecordsCount}</span>
            </div>
          }
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
