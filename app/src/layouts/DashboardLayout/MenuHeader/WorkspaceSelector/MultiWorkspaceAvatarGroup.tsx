import { Avatar } from "antd";
import { useGetAllSelectedWorkspaces } from "features/apiClient/slices/workspaceView/hooks";
import React from "react";

export const MultiWorkspaceAvatarGroup: React.FC = () => {
  const selectedWorkspaces = useGetAllSelectedWorkspaces();

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
        {selectedWorkspaces.map((workspace) => {
          const avatarText = workspace.id ? workspace.id[0]?.toUpperCase() ?? "?" : "?";
          return (
            <Avatar
              size={20}
              key={workspace.id ?? "private"}
              className="local-workspace-avatar"
              style={{
                fontSize: "var(--requestly-font-size-sm)",
              }}
            >
              {avatarText}
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
