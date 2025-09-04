import { Avatar } from "antd";
import { useApiClientMultiWorkspaceView } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import React from "react";

export const MultiWorkspaceAvatarGroup: React.FC = () => {
  const selectedWorkspaces = useApiClientMultiWorkspaceView((s) => s.selectedWorkspaces);

  return (
    <div className="workspace-selector-dropdown__content">
      <Avatar.Group
        size={20}
        maxCount={2}
        maxStyle={{
          backgroundColor: "var(--requestly-color-surface-2)",
          border: "1px solid var(--requestly-color-white-t-20)",
          cursor: "pointer",
          fontSize: "var(--requestly-font-size-sm)",
        }}
      >
        {selectedWorkspaces.map((w) => {
          const workspace = w.getState();
          return (
            <Avatar
              size={20}
              key={workspace.id}
              className="local-workspace-avatar"
              style={{
                fontSize: "var(--requestly-font-size-sm)",
              }}
            >
              {workspace.name ? workspace.name[0].toUpperCase() : "?"}
            </Avatar>
          );
        })}
      </Avatar.Group>
      <span className="workspace-selector-dropdown__count">
        {selectedWorkspaces.length}
        {`${selectedWorkspaces.length > 1 ? " Workspaces" : " Workspace"} selected`}
      </span>
    </div>
  );
};
