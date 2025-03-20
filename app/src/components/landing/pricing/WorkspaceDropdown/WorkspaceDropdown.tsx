import React, { useCallback, useEffect, useMemo } from "react";
import { DownOutlined, LockOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Typography } from "antd";
import { RQButton } from "lib/design-system/components";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import APP_CONSTANTS from "config/constants";
import { getUniqueColorForWorkspace } from "utils/teams";
import "./index.scss";
import { getActiveWorkspaceId, getAllWorkspaces } from "store/slices/workspaces/selectors";

const getWorkspaceIcon = (workspaceName: string) => {
  if (workspaceName === APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE) return <LockOutlined />;
  return workspaceName ? workspaceName[0].toUpperCase() : "?";
};

const WorkspaceDropdown: React.FC<{
  isAppSumo?: boolean;
  workspaceToUpgrade: { name: string; id: string; accessCount: number };
  setWorkspaceToUpgrade: (workspaceDetails: any) => void;
  className?: string;
  disabled?: boolean;
}> = ({ isAppSumo = false, workspaceToUpgrade, setWorkspaceToUpgrade, className, disabled = false }) => {
  const user = useSelector(getUserAuthDetails);
  const availableWorkspaces = useSelector(getAllWorkspaces);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);

  const filteredAvailableTeams = useMemo(() => {
    return (
      availableWorkspaces?.filter(
        (team: any) => !team?.archived && team.members?.[user?.details?.profile?.uid]?.role === "admin"
      ) ?? []
    );
  }, [availableWorkspaces, user?.details?.profile?.uid]);

  const populateWorkspaceDetails = useCallback(
    (workspaceId: string) => {
      return filteredAvailableTeams.find((team: any) => team.id === workspaceId);
    },
    [filteredAvailableTeams]
  );

  useEffect(() => {
    if (activeWorkspaceId) {
      setWorkspaceToUpgrade(populateWorkspaceDetails(activeWorkspaceId));
    }
  }, [activeWorkspaceId, populateWorkspaceDetails, setWorkspaceToUpgrade]);

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
    ].filter((items) => (isAppSumo ? items.key !== "private_workspace" : true)),
    onClick: ({ key: teamId }: { key: string }) => {
      if (teamId === "private_workspace") {
        return setWorkspaceToUpgrade({
          name: APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE,
          id: "private_workspace",
          accessCount: 1,
        });
      } else if (teamId === APP_CONSTANTS.TEAM_WORKSPACES.NEW_WORKSPACE.id) {
        // temporary new workspace for appsumo
        return setWorkspaceToUpgrade({
          ...APP_CONSTANTS.TEAM_WORKSPACES.NEW_WORKSPACE,
        });
      }

      setWorkspaceToUpgrade(populateWorkspaceDetails(teamId));
    },
  };

  if (isAppSumo) {
    workspaceMenuItems.items.unshift({
      key: APP_CONSTANTS.TEAM_WORKSPACES.NEW_WORKSPACE.id,
      label: APP_CONSTANTS.TEAM_WORKSPACES.NEW_WORKSPACE.name,
      icon: (
        <Avatar
          size={18}
          shape="square"
          icon={getWorkspaceIcon(APP_CONSTANTS.TEAM_WORKSPACES.NEW_WORKSPACE.name)}
          className="workspace-avatar"
          style={{ backgroundColor: APP_CONSTANTS.TEAM_WORKSPACES.NEW_WORKSPACE.color }}
        />
      ),
    });
  }

  return user.loggedIn ? (
    <div className={`workspace-selector-container ${className ?? ""}`}>
      <div className="workspace-selector-dropdown-container">
        Select workspace to upgrade
        <Dropdown
          disabled={disabled}
          menu={workspaceMenuItems}
          trigger={["click"]}
          overlayClassName="workspace-selector-dropdown"
        >
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
                      : workspaceToUpgrade?.id === APP_CONSTANTS.TEAM_WORKSPACES.NEW_WORKSPACE.id
                      ? APP_CONSTANTS.TEAM_WORKSPACES.NEW_WORKSPACE.color
                      : getUniqueColorForWorkspace(workspaceToUpgrade?.id, workspaceToUpgrade?.name),
                }}
              />
              <span>{workspaceToUpgrade?.name}</span>
              <DownOutlined className="workspace-selector-dropdown-icon" />
            </div>
          </RQButton>
        </Dropdown>
      </div>
      {(isAppSumo || workspaceToUpgrade?.id !== "private_workspace") && (
        <div className="workspace-members-display-text">
          <Typography.Text type="secondary">
            Your workspace has {workspaceToUpgrade?.accessCount} active{" "}
            {workspaceToUpgrade?.accessCount > 1 ? "members" : "member"}.
          </Typography.Text>
        </div>
      )}
    </div>
  ) : null;
};

export default WorkspaceDropdown;
