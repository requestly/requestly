import React from "react";
import { Avatar, AvatarProps } from "antd";

import { LockOutlined } from "@ant-design/icons";
import { IoCloudOfflineOutline } from "@react-icons/all-files/io5/IoCloudOfflineOutline";

import { isLocalFSWorkspace, isLocalStorageWorkspace, isPersonalWorkspace } from "../utils";
import { getColorFromString } from "utils/getColorFromString";

interface Props {
  workspaceId?: string;
  workspaceName?: string;
  size?: AvatarProps["size"];
}

const getWorkspaceIcon = (workspaceId?: string, workspaceName?: string) => {
  if (!workspaceName && !workspaceId) return "?";

  if (isLocalStorageWorkspace(workspaceId)) return <IoCloudOfflineOutline />;

  if (isPersonalWorkspace(workspaceId)) return <LockOutlined />;

  // if(isLocalFSWorkspace(workspaceId)) return <LuFolderSync /> ; // TODO-syncing

  return workspaceName ? workspaceName[0].toUpperCase() : "?";
};

export const getUniqueColorForWorkspace = (workspaceId?: string, workspaceName?: string) => {
  if (!workspaceName && !workspaceId) return "#ffffff4d";

  if (isLocalStorageWorkspace(workspaceId)) return "#ffffff4d";

  if (isPersonalWorkspace(workspaceId)) return "#1E69FF";

  // if(isLocalFSWorkspace(workspaceId)) return "#FFFFFF33"; // TODO-syncing

  return getColorFromString(workspaceId + workspaceName);
};

const WorkspaceAvatar: React.FC<Props> = ({ workspaceId, workspaceName, size = 26 }) => {
  return (
    <Avatar
      size={size}
      shape="square"
      icon={getWorkspaceIcon(workspaceId, workspaceName)}
      className="workspace-avatar"
      style={{
        backgroundColor: getUniqueColorForWorkspace(workspaceId, workspaceName),
      }}
    />
  );
};

export default WorkspaceAvatar;
