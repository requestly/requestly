import React, { useCallback, useEffect, useMemo } from "react";
import { DownOutlined, LockOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Typography } from "antd";
import { RQButton } from "lib/design-system/components";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { getAvailableTeams, getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import APP_CONSTANTS from "config/constants";
import { getUniqueColorForWorkspace } from "utils/teams";

const getWorkspaceIcon = (workspaceName: string) => {
  if (workspaceName === APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE) return <LockOutlined />;
  return workspaceName ? workspaceName[0].toUpperCase() : "?";
};

const WorkspaceDropdown: React.FC<{
  workspaceToUpgrade: { name: string; id: string; accessCount: number };
  setWorkspaceToUpgrade: (workspaceDetails: any) => void;
}> = ({ workspaceToUpgrade, setWorkspaceToUpgrade }) => {
  const user = useSelector(getUserAuthDetails);
  const availableTeams = useSelector(getAvailableTeams);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);

  const filteredAvailableTeams = useMemo(() => {
    return availableTeams?.filter((team: any) => !team?.archived) ?? [];
  }, [availableTeams]);

  const populateWorkspaceDetails = useCallback(
    (workspaceId: string) => {
      return filteredAvailableTeams.find((team: any) => team.id === workspaceId);
    },
    [filteredAvailableTeams]
  );

  useEffect(() => {
    if (currentlyActiveWorkspace?.id) {
      setWorkspaceToUpgrade(populateWorkspaceDetails(currentlyActiveWorkspace?.id));
    }
  }, [currentlyActiveWorkspace?.id, populateWorkspaceDetails, setWorkspaceToUpgrade]);

  const workspaceMenuItems = {
    items: [
      {
        key: "private_workspace",
        label: APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE,
        icon: (
          <Avatar
            size={18}
            shape="square"
            icon={getWorkspaceIcon(APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE)}
            className="workspace-avatar"
            style={{ backgroundColor: "#1E69FF" }}
          />
        ),
      },
      ...filteredAvailableTeams.map((team: any) => ({
        label: team.name,
        key: team.id,
        icon: (
          <Avatar
            size={18}
            shape="square"
            icon={getWorkspaceIcon(team.name)}
            className="workspace-avatar"
            style={{
              backgroundColor: getUniqueColorForWorkspace(team?.id, team.name),
            }}
          />
        ),
      })),
    ],
    onClick: ({ key: teamId }: { key: string }) => {
      if (teamId === "private_workspace") {
        return setWorkspaceToUpgrade({
          name: APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE,
          id: "private_workspace",
          accessCount: 1,
        });
      }
      setWorkspaceToUpgrade(populateWorkspaceDetails(teamId));
    },
  };

  return user.loggedIn ? (
    <div className="pricing-workspace-selector-container">
      <div className="pricing-workspace-dropdown-container">
        Select workspace to upgrade
        <Dropdown menu={workspaceMenuItems} trigger={["click"]} overlayClassName="pricing-workspace-dropdown">
          <RQButton className="pricing-workspace-dropdown-btn">
            <div className="cursor-pointer items-center">
              <Avatar
                size={18}
                shape="square"
                icon={getWorkspaceIcon(
                  workspaceToUpgrade?.name ?? APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE
                )}
                className="workspace-avatar"
                style={{
                  backgroundColor:
                    !workspaceToUpgrade ||
                    workspaceToUpgrade?.name === APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE
                      ? "#1E69FF"
                      : getUniqueColorForWorkspace(workspaceToUpgrade?.id, workspaceToUpgrade?.name),
                }}
              />
              <span>{workspaceToUpgrade?.name}</span>
              <DownOutlined className="pricing-workspace-dropdown-icon" />
            </div>
          </RQButton>
        </Dropdown>
      </div>
      <div className="text-center">
        {workspaceToUpgrade.id !== "private_workspace" && (
          <Typography.Text type="secondary">
            Your workspace has {workspaceToUpgrade?.accessCount} active members
          </Typography.Text>
        )}
      </div>
    </div>
  ) : null;
};

export default WorkspaceDropdown;
