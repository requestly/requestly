import React from "react";
import { Avatar, AvatarProps } from "antd";

import { LockOutlined } from "@ant-design/icons";
import { LuFolderSync } from "@react-icons/all-files/lu/LuFolderSync";

import { isLocalFSWorkspace, isPersonalWorkspace } from "../utils";
import { getColorFromString } from "utils/getColorFromString";
import { Workspace } from "../types";

interface Props {
  workspace: Workspace;
  size?: AvatarProps["size"];
}

const getWorkspaceIcon = (workspace: Workspace) => {
  if (!workspace?.name && !workspace?.id && !workspace.workspaceType) return "?";

  if (isPersonalWorkspace(workspace)) return <LockOutlined />;

  if (isLocalFSWorkspace(workspace)) return <LuFolderSync />;

  return workspace?.name ? workspace?.name[0].toUpperCase() : "?";
};

const getUniqueColorForWorkspace = (workspace: Workspace) => {
  if (!workspace?.name && !workspace?.id) return "#ffffff4d";

  if (isPersonalWorkspace(workspace)) return "#1E69FF";

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
