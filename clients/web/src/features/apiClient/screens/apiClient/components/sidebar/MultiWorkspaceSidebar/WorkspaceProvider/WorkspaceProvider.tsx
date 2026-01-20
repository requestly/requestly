import React from "react";
import { Skeleton } from "antd";
import { useWorkspace } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { ContextId } from "features/apiClient/contexts/contextId.context";
import { useApiClientFeatureContextProvider } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { WorkspaceCollapse } from "./WorkspaceCollapse/WorkspaceCollapse";
import { MultiViewError } from "../MultiViewError/MultiViewError";
import "./workspaceProvider.scss";

export const WorkspaceProvider: React.FC<{
  workspaceId: string;
  showEnvSwitcher?: boolean;
  children: React.ReactNode;
  collapsible?: boolean;
  type?: string;
}> = ({ workspaceId, showEnvSwitcher = true, children, type, collapsible = true }) => {
  const state = useWorkspace(workspaceId, (s) => s.state);
  const [getContext] = useApiClientFeatureContextProvider((s) => [s.getContext]);

  if (state.errored) {
    return (
      <WorkspaceCollapse
        expanded
        type={type}
        showEnvSwitcher={false}
        showNewRecordBtn={false}
        workspaceId={workspaceId}
      >
        <MultiViewError />
      </WorkspaceCollapse>
    );
  }

  if (state.loading) {
    return (
      <div className="workspace-loader-container">
        <Skeleton paragraph={{ rows: 5 }} title={false} />
      </div>
    );
  }

  return (
    <ContextId id={getContext(workspaceId)?.id ?? null}>
      {collapsible ? (
        <WorkspaceCollapse showEnvSwitcher={showEnvSwitcher} workspaceId={workspaceId} type={type}>
          {children}
        </WorkspaceCollapse>
      ) : (
        children
      )}
    </ContextId>
  );
};
