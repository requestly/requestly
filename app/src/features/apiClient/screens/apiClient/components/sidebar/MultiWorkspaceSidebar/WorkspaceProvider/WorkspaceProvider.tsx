import React from "react";
import { Skeleton } from "antd";
import { WorkspaceCollapse } from "./WorkspaceCollapse/WorkspaceCollapse";
import { MultiViewError } from "../MultiViewError/MultiViewError";
import { useWorkspace, WorkspaceInfo } from "features/apiClient/slices";
import { WorkspaceProvider as ReduxWorkspaceProvider } from "features/apiClient/common/WorkspaceProvider";
import "./workspaceProvider.scss";

export const WorkspaceProvider: React.FC<{
  workspaceId: WorkspaceInfo["id"];
  showEnvSwitcher?: boolean;
  children: React.ReactNode;
  collapsible?: boolean;
  type?: string;
}> = ({ workspaceId, showEnvSwitcher = true, children, type, collapsible = true }) => {
  const workspace = useWorkspace(workspaceId);

  if (workspace.status.loading) {
    return (
      <div className="workspace-loader-container">
        <Skeleton paragraph={{ rows: 5 }} title={false} />
      </div>
    );
  }

  if (workspace.status.state.success === false) {
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

  return (
    <ReduxWorkspaceProvider workspaceId={workspaceId}>
      {collapsible ? (
        <WorkspaceCollapse showEnvSwitcher={showEnvSwitcher} workspaceId={workspaceId} type={type}>
          {children}
        </WorkspaceCollapse>
      ) : (
        children
      )}
    </ReduxWorkspaceProvider>
  );
};
