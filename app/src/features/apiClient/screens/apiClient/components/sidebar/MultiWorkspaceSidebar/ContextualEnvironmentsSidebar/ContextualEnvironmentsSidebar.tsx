import React, { useState } from "react";
import { SidebarListHeader } from "../../components/sidebarListHeader/SidebarListHeader";
import { WorkspaceProvider } from "../WorkspaceProvider/WorkspaceProvider";
import { ContextualEnvironmentsList } from "./ContextualEnvironmentsList/ContextualEnvironmentsList";
import { ApiClientSidebarTabKey } from "../MultiWorkspaceSidebar";
import { useGetAllSelectedWorkspaces } from "features/apiClient/slices";
import { useApiClientContext } from "features/apiClient/contexts";

export const ContextualEnvironmentsSidebar: React.FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const { onNewClick } = useApiClientContext();
  const selectedWorkspaces = useGetAllSelectedWorkspaces();

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
          return (
            <WorkspaceProvider
              key={workspace.id}
              workspaceId={workspace.id}
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
