import React from "react";
import { Skeleton } from "antd";
import { useWorkspace } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import "./workspaceLoader.scss";

export const WorkspaceLoader: React.FC<{ workspaceId: string; children: React.ReactNode }> = ({
  workspaceId,
  children,
}) => {
  const state = useWorkspace(workspaceId, (s) => s.state);

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

  return children;
};
