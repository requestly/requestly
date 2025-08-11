import React, { useState } from "react";
import { SidebarListHeader } from "../../components/sidebarListHeader/SidebarListHeader";
import { useApiClientMultiWorkspaceView } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { ContextId } from "features/apiClient/contexts/contextId.context";
import { EnvironmentsList } from "./EnvironmentsList/EnvironmentsList";
import { WorkspaceLoader } from "../WorkspaceLoader/WorkspaceLoader";

export const ContextualEnvironmentsList: React.FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const selectedWorkspaces = useApiClientMultiWorkspaceView((s) => s.selectedWorkspaces);

  return (
    <div style={{ height: "inherit" }}>
      <SidebarListHeader
        onSearch={(value) => setSearchValue(value)}
        newRecordActionOptions={{
          showNewRecordAction: false,
          onNewRecordClick: () => Promise.resolve(),
        }}
      />

      {selectedWorkspaces.map((workspace) => {
        return (
          <ContextId id={workspace.getState().id}>
            <WorkspaceLoader>
              <EnvironmentsList searchValue={searchValue} />
            </WorkspaceLoader>
          </ContextId>
        );
      })}
    </div>
  );
};
