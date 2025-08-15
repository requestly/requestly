import React, { useState } from "react";
import { SidebarListHeader } from "../../components/sidebarListHeader/SidebarListHeader";
import { useApiClientMultiWorkspaceView } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { ContextId } from "features/apiClient/contexts/contextId.context";
import { WorkspaceLoader } from "../WorkspaceLoader/WorkspaceLoader";
import { useApiClientFeatureContextProvider } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { ContextualEnvironmentsList } from "./ContextualEnvironmentsList/ContextualEnvironmentsList";

export const ContextualEnvironmentsSidebar: React.FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const selectedWorkspaces = useApiClientMultiWorkspaceView((s) => s.selectedWorkspaces);
  const getContext = useApiClientFeatureContextProvider((s) => s.getContext);

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
        const workspaceId = workspace.getState().id;

        return (
          <WorkspaceLoader key={workspaceId} workspaceId={workspaceId}>
            <ContextId id={getContext(workspaceId)?.id}>
              <ContextualEnvironmentsList searchValue={searchValue} />
            </ContextId>
          </WorkspaceLoader>
        );
      })}
    </div>
  );
};
