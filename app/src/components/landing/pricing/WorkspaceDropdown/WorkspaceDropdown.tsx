import React, { useCallback, useEffect, useMemo } from "react";
import { DownOutlined, LockOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Typography } from "antd";
import { RQButton } from "lib/design-system/components";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { getAvailableTeams, getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import APP_CONSTANTS from "config/constants";
import { getUniqueColorForWorkspace } from "utils/teams";
import "./index.scss";

const getWorkspaceIcon = (workspaceName: string) => {
  if (workspaceName === APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE) return <LockOutlined />;
  return workspaceName ? workspaceName[0].toUpperCase() : "?";
};

const WorkspaceDropdown: React.FC<{
  workspaceToUpgrade: { name: string; id: string; accessCount: number };
  setWorkspaceToUpgrade: (workspaceDetails: any) => void;
  className?: string;
}> = ({ workspaceToUpgrade, setWorkspaceToUpgrade, className }) => {
  const user = useSelector(getUserAuthDetails);
  const availableTeams = useSelector(getAvailableTeams);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);

  const filteredAvailableTeams = useMemo(() => {
    return (
      availableTeams?.filter(
        (team: any) => !team?.archived && team.members?.[user?.details?.profile?.uid]?.role === "admin"
      ) ?? []
    );
  }, [availableTeams, user?.details?.profile?.uid]);

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
    <div className={`workspace-selector-container ${className ?? ""}`}>
      <div className="workspace-selector-dropdown-container">
        Select workspace to upgrade
        <Dropdown menu={workspaceMenuItems} trigger={["click"]} overlayClassName="workspace-selector-dropdown">
          <RQButton className="workspace-selector-dropdown-btn">
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
              <DownOutlined className="workspace-selector-dropdown-icon" />
            </div>
          </RQButton>
        </Dropdown>
      </div>
      {workspaceToUpgrade?.id !== "private_workspace" && (
        <div className="workspace-members-display-text">
          <Typography.Text type="secondary">
            Your workspace has {workspaceToUpgrade?.accessCount} active members
          </Typography.Text>
        </div>
      )}
    </div>
  ) : null;
};

export default WorkspaceDropdown;
