import React from "react";
import { Avatar, AvatarProps } from "antd";
import { Workspace } from "../types";

interface Props {
  workspace: Workspace;
  size?: AvatarProps["size"];
}

const LocalWorkspaceAvatar: React.FC<Props> = ({ workspace, size }) => {
  return (
    <Avatar
      size={size}
      shape="circle"
      className="workspace-avatar"
      style={{
        backgroundColor: "var(--requestly-color-surface-2)",
        border: "1px solid var(--requestly-color-white-t-20)",
        verticalAlign: "middle",
        fontSize: "var(--requestly-font-size-sm)",
      }}
    >
      {workspace?.name ? workspace.name[0].toUpperCase() : "?"}
    </Avatar>
  );
};

export default LocalWorkspaceAvatar;
