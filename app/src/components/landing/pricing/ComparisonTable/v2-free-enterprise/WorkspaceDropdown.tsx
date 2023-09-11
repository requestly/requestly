import React from "react";
import { DownOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown } from "antd";
import { RQButton } from "lib/design-system/components";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import APP_CONSTANTS from "config/constants";
import { getUniqueColorForWorkspace } from "utils/teams";

const menuProps = {
  items: [
    {
      label: "1st menu item",
      key: "1",
      icon: <UserOutlined />,
    },
    {
      label: "2nd menu item",
      key: "2",
      icon: <UserOutlined />,
    },
  ],
};

const getWorkspaceIcon = (workspaceName: string) => {
  if (workspaceName === APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE) return <LockOutlined />;
  return workspaceName ? workspaceName[0].toUpperCase() : "?";
};

const WorkspaceDropdown: React.FC = () => {
  const user = useSelector(getUserAuthDetails);
  // const availableTeams = useSelector(getAvailableTeams) || [];
  // const filteredAvailableTeams = availableTeams.filter((team) => !team?.archived);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);

  const activeWorkspaceName = currentlyActiveWorkspace.name ?? APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE;

  return user.loggedIn ? (
    <div className="margin-bottom-one">
      Select workspace to upgrade:
      <Dropdown menu={menuProps} trigger={["click"]}>
        <RQButton className="pricing-workspace-dropdown-btn">
          <div className="cursor-pointer items-center">
            <Avatar
              size={18}
              shape="square"
              icon={getWorkspaceIcon(activeWorkspaceName)}
              className="workspace-avatar"
              style={{
                backgroundColor: user.loggedIn
                  ? activeWorkspaceName === APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE
                    ? "#1E69FF"
                    : getUniqueColorForWorkspace(currentlyActiveWorkspace?.id, activeWorkspaceName)
                  : "#ffffff4d",
              }}
            />
            {activeWorkspaceName}
            <DownOutlined className="pricing-workspace-dropdown-icon" />
          </div>
        </RQButton>
      </Dropdown>
    </div>
  ) : null;
};

export default WorkspaceDropdown;
