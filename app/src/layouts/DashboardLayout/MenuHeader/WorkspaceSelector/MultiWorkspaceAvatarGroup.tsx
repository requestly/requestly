import { Avatar } from "antd";
import { useApiClientMultiWorkspaceView } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import React from "react";

export const MultiWorkspaceAvatarGroup: React.FC = () => {
  const selectedWorkspaces = useApiClientMultiWorkspaceView((s) => s.selectedWorkspaces);

  return (
    <div className="workspace-selector-dropdown__content">
      <Avatar.Group maxCount={2} size="default">
        {selectedWorkspaces.map((w) => {
          const workspace = w.getState();
          return (
            <Avatar key={workspace.id} className="local-workspace-avatar">
              {workspace.name ? workspace.name[0].toUpperCase() : "?"}
            </Avatar>
          );
        })}
      </Avatar.Group>
      <span className="workspace-selector-dropdown__count">{selectedWorkspaces.length} workspace selected</span>
    </div>
  );
};
