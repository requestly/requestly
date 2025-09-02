import React, { useState } from "react";
import { SidebarListHeader } from "../../components/sidebarListHeader/SidebarListHeader";
import { useApiClientMultiWorkspaceView } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { WorkspaceProvider } from "../WorkspaceProvider/WorkspaceProvider";
import { ContextualEnvironmentsList } from "./ContextualEnvironmentsList/ContextualEnvironmentsList";
import { ApiClientSidebarTabKey } from "../MultiWorkspaceSidebar";
import { useApiClientContext } from "features/apiClient/contexts";

export const ContextualEnvironmentsSidebar: React.FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const selectedWorkspaces = useApiClientMultiWorkspaceView((s) => s.selectedWorkspaces);
  const { onNewClick } = useApiClientContext();

  return (
    <div className="multiview-environments-sidebar-container">
      <SidebarListHeader
        onSearch={(value) => setSearchValue(value)}
        listType={ApiClientSidebarTabKey.ENVIRONMENTS}
        newRecordActionOptions={{
          showNewRecordAction: true,
          onNewRecordClick: onNewClick,
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
