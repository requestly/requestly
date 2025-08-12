import React from "react";
import { Avatar, AvatarProps } from "antd";
import { Workspace } from "../types";

interface Props {
  workspace: Workspace;
  size?: AvatarProps["size"];
}

const LocalWorkspaceAvatar: React.FC<Props> = ({ workspace }) => {
  return (
    <Avatar
      size="default"
      shape="circle"
      className="workspace-avatar"
      style={{
        backgroundColor: "#383838",
        verticalAlign: "middle",
      }}
    >
      {workspace?.name ? workspace.name[0].toUpperCase() : "?"}
    </Avatar>
  );
};

export default LocalWorkspaceAvatar;
