import React from "react";
import { Skeleton } from "antd";
import { useWorkspace } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import "./workspaceProvider.scss";
import { ContextId } from "features/apiClient/contexts/contextId.context";
import { useApiClientFeatureContextProvider } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { WorkspaceCollapse } from "./WorkspaceCollapse/WorkspaceCollapse";

export const WorkspaceProvider: React.FC<{ workspaceId: string; children: React.ReactNode }> = ({
  workspaceId,
  children,
}) => {
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
      <WorkspaceCollapse workspaceId={workspaceId}>{children}</WorkspaceCollapse>
    </ContextId>
  );
};
