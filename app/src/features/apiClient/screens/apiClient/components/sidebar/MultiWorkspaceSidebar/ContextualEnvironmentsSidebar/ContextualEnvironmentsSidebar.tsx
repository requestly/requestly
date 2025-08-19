import React, { useState } from "react";
import { SidebarListHeader } from "../../components/sidebarListHeader/SidebarListHeader";
import { useApiClientMultiWorkspaceView } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { WorkspaceProvider } from "../WorkspaceProvider/WorkspaceProvider";
import { ContextualEnvironmentsList } from "./ContextualEnvironmentsList/ContextualEnvironmentsList";

export const ContextualEnvironmentsSidebar: React.FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const selectedWorkspaces = useApiClientMultiWorkspaceView((s) => s.selectedWorkspaces);

  return (
    <div className="multiview-environments-sidebar-container">
      <SidebarListHeader
        onSearch={(value) => setSearchValue(value)}
        newRecordActionOptions={{
          showNewRecordAction: false,
          onNewRecordClick: () => Promise.resolve(),
        }}
      />

      {selectedWorkspaces.map((workspace) => {
        const workspaceId = workspace.getState().id;

        return (
          <WorkspaceProvider key={workspaceId} workspaceId={workspaceId}>
            <h3>Workspace: {workspace.getState().name}</h3>
            <ContextualEnvironmentsList searchValue={searchValue} />
          </WorkspaceProvider>
        );
      })}
    </div>
  );
};
