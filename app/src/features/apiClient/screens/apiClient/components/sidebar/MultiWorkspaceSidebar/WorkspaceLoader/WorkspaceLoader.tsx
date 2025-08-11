import React from "react";
import { Skeleton } from "antd";
import { useContextId } from "features/apiClient/contexts/contextId.context";
import { useWorkspace } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import "./workspaceLoader.scss";

export const WorkspaceLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const contextId = useContextId();
  const state = useWorkspace(contextId, (s) => s.state);

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
