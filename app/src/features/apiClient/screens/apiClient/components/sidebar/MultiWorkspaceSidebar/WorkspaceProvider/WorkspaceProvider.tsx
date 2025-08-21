import React from "react";
import { Skeleton } from "antd";
import { useWorkspace } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { ContextId } from "features/apiClient/contexts/contextId.context";
import { useApiClientFeatureContextProvider } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { WorkspaceCollapse } from "./WorkspaceCollapse/WorkspaceCollapse";
import "./workspaceProvider.scss";

export const WorkspaceProvider: React.FC<{
  workspaceId: string;
  showEnvSwitcher?: boolean;
  children: React.ReactNode;
  collapsible?: boolean;
}> = ({ workspaceId, showEnvSwitcher = true, children, collapsible = true }) => {
  const state = useWorkspace(workspaceId, (s) => s.state);
  const [getContext] = useApiClientFeatureContextProvider((s) => [s.getContext]);

  if (state.errored) {
    // TBD
  }

  if (state.loading) {
    return (
      <div className="workspace-loader-container">
        <Skeleton paragraph={{ rows: 6 }} title={false} />
      </div>
    );
  }

  return (
    <ContextId id={getContext(workspaceId)?.id}>
      {collapsible ? (
        <WorkspaceCollapse showEnvSwitcher={showEnvSwitcher} workspaceId={workspaceId}>
          {children}
        </WorkspaceCollapse>
      ) : (
        children
      )}
    </ContextId>
  );
};
