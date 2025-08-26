import React, { useState } from "react";
import { SidebarListHeader } from "../../components/sidebarListHeader/SidebarListHeader";
import { useApiClientMultiWorkspaceView } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { WorkspaceProvider } from "../WorkspaceProvider/WorkspaceProvider";
import { ContextualEnvironmentsList } from "./ContextualEnvironmentsList/ContextualEnvironmentsList";
import { ApiClientSidebarTabKey } from "../MultiWorkspaceSidebar";

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

      <div className="multiview-environments-sidebar-list-section">
        {selectedWorkspaces.map((workspace) => {
          const workspaceId = workspace.getState().id;

          return (
            <WorkspaceProvider
              key={workspaceId}
              workspaceId={workspaceId}
              showEnvSwitcher={false}
              type={ApiClientSidebarTabKey.ENVIRONMENTS}
            >
              <ContextualEnvironmentsList searchValue={searchValue} />
            </WorkspaceProvider>
          );
        })}
      </div>
    </div>
  );
};
