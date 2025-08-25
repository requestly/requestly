import React from "react";
import { Avatar, AvatarProps } from "antd";

import { LockOutlined } from "@ant-design/icons";

import { isLocalFSWorkspace, isPersonalWorkspace } from "../utils";
import { getColorFromString } from "utils/getColorFromString";
import { Workspace } from "../types";

interface Props {
  workspace?: Workspace;
  size?: AvatarProps["size"];
}

const getWorkspaceIcon = (workspace: Workspace) => {
  if (!workspace?.name && !workspace?.id && !workspace?.workspaceType) return "W";

  if (isPersonalWorkspace(workspace)) return <LockOutlined />;

  if (isLocalFSWorkspace(workspace)) return workspace.name[0].toUpperCase();

  return workspace?.name ? workspace?.name[0].toUpperCase() : "?";
};

const getUniqueColorForWorkspace = (workspace: Workspace) => {
  if (!workspace?.name && !workspace?.id && !workspace?.workspaceType) return "#ffffff4d";

  if (isPersonalWorkspace(workspace)) return "var(--requestly-color-primary)";

  if (isLocalFSWorkspace(workspace)) return "#FFFFFF33";

  return getColorFromString(workspace?.id + workspace?.name);
};

const WorkspaceAvatar: React.FC<Props> = ({ workspace, size = 26 }) => {
  return (
    <Avatar
      size={size}
      shape="square"
      icon={getWorkspaceIcon(workspace)}
      className="workspace-avatar"
      style={{
        backgroundColor: getUniqueColorForWorkspace(workspace),
      }}
    />
  );
};

export default WorkspaceAvatar;
