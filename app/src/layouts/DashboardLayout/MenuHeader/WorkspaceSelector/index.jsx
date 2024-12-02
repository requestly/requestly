import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  DownOutlined,
  LoadingOutlined,
  LockOutlined,
  PlusOutlined,
  PlusSquareOutlined,
  SettingOutlined,
  UserOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Divider, Dropdown, Menu, Modal, Spin, Tag, Tooltip } from "antd";
import {
  trackInviteTeammatesClicked,
  trackWorkspaceDropdownClicked,
  trackCreateNewTeamClicked,
} from "modules/analytics/events/common/teams";
import { getLastSeenInviteTs } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { redirectToTeam, redirectToWorkspaceSettings } from "utils/RedirectionUtils";
import LoadingModal from "./LoadingModal";
import { actions } from "store";
import APP_CONSTANTS from "config/constants";
import { SOURCE } from "modules/analytics/events/common/constants";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { getUniqueColorForWorkspace } from "utils/teams";
import { trackWorkspaceJoiningModalOpened } from "modules/analytics/events/features/teams";
import { trackWorkspaceInviteAnimationViewed } from "modules/analytics/events/common/teams";
import { trackTopbarClicked } from "modules/analytics/events/common/onboarding/header";
import { getPendingInvites } from "backend/workspace";
import "./WorkSpaceSelector.css";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { useWorkspaceHelpers } from "features/workspaces/hooks/useWorkspaceHelpers";
import { getActiveWorkspaceId, getAllWorkspaces, getWorkspaceById } from "store/slices/workspaces/selectors";
import { isPrivateWorkspace, isSharedWorkspace } from "features/workspaces/utils";

export const isWorkspacesFeatureEnabled = (email) => {
  if (!email) return false;
  return true;
};

const prettifyWorkspaceName = (workspaceName) => {
  return workspaceName || "Workspaces";
};

const getWorkspaceIcon = (workspaceName, workspaceId) => {
  if (isPrivateWorkspace(workspaceId)) return <LockOutlined />;
  return workspaceName ? workspaceName[0].toUpperCase() : "?";
};

const WorkSpaceDropDown = ({ menu, hasNewInvites }) => {
  // Global State
  const user = useSelector(getUserAuthDetails);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const activeWorkspace = useSelector(getWorkspaceById(activeWorkspaceId));

  const activeWorkspaceName = activeWorkspace?.name || "";
  console.log({ activeWorkspace });

  const handleWorkspaceDropdownClick = (open) => {
    if (open) {
      trackTopbarClicked("workspace");
    }
  };

  return (
    <Dropdown
      overlay={menu}
      trigger={["click"]}
      className="workspace-selector-dropdown"
      onOpenChange={handleWorkspaceDropdownClick}
    >
      <div className="cursor-pointer items-center">
        <Avatar
          size={26}
          shape="square"
          icon={getWorkspaceIcon(activeWorkspaceName, activeWorkspaceId)}
          className="workspace-avatar"
          style={{
            backgroundColor: user.loggedIn
              ? isPrivateWorkspace(activeWorkspaceId)
                ? "#1E69FF"
                : getUniqueColorForWorkspace(activeWorkspaceId, activeWorkspaceName)
              : "#ffffff4d",
          }}
        />
        <Tooltip
          overlayClassName="workspace-selector-tooltip"
          style={{ top: "35px" }}
          title={prettifyWorkspaceName(activeWorkspaceName)}
          placement={"bottomRight"}
          showArrow={false}
          mouseEnterDelay={2}
        >
          <span className="items-center active-workspace-name">
            <span className="active-workspace-name">{prettifyWorkspaceName(activeWorkspaceName)}</span>
            {hasNewInvites ? <Badge dot={true} /> : null}
            <DownOutlined className="active-workspace-name-down-icon" />
          </span>
        </Tooltip>
      </div>
    </Dropdown>
  );
};

const WorkspaceSelector = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { switchWorkspace } = useWorkspaceHelpers();

  const isLimitToPrivateWorkspaceActive = useFeatureIsOn("limit_to_private_workspace");

  // GLOBAL STATE
  const user = useSelector(getUserAuthDetails);
  const availableWorkspaces = useSelector(getAllWorkspaces) || [];
  const sortedAvailableWorkspaces = [
    ...availableWorkspaces.filter((team) => !team?.archived),
    ...availableWorkspaces.filter((team) => team?.archived),
  ];
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);

  const lastSeenInviteTs = useSelector(getLastSeenInviteTs);

  // Local State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamInvites, setTeamInvites] = useState([]);

  const hasNewInvites = useMemo(() => {
    if (user?.loggedIn && teamInvites?.length) {
      return teamInvites.some((invite) => invite.createdTs > lastSeenInviteTs);
    }
    return false;
  }, [lastSeenInviteTs, teamInvites, user?.loggedIn]);

  useEffect(() => {
    if (hasNewInvites) trackWorkspaceInviteAnimationViewed();
  }, [hasNewInvites]);

  useEffect(() => {
    if (!user.loggedIn) return;

    getPendingInvites({ email: true, domain: true })
      .then((res) => {
        setTeamInvites(res?.pendingInvites ?? []);
      })
      .catch((e) => setTeamInvites([]));
  }, [user.loggedIn]);

  useEffect(() => {
    if (availableWorkspaces?.length > 0) {
      submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_WORKSPACES, availableWorkspaces.length);
    }
  }, [availableWorkspaces?.length]);

  const renderLoader = () => {
    return (
      <>
        <center>
          <Spin indicator={<LoadingOutlined spin />} />
        </center>
      </>
    );
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const promptUserSignupModal = (callback = () => {}, source) => {
    dispatch(
      actions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          callback,
          redirectURL: window.location.href,
          src: APP_CONSTANTS.FEATURES.WORKSPACES,
          authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
          eventSource: source,
        },
      })
    );
  };

  const handleJoinWorkspaceMenuItemClick = () => {
    if (user.loggedIn) {
      dispatch(
        actions.toggleActiveModal({
          modalName: "joinWorkspaceModal",
          newValue: true,
          newProps: { source: "workspaces_dropdown" },
        })
      );
      trackWorkspaceJoiningModalOpened(teamInvites?.length, "workspaces_dropdown");
    } else {
      promptUserSignupModal(() => {
        dispatch(
          actions.toggleActiveModal({
            modalName: "joinWorkspaceModal",
            newValue: true,
            newProps: { source: "workspaces_dropdown" },
          })
        );
        trackWorkspaceJoiningModalOpened(teamInvites?.length, "workspaces_dropdown");
      }, SOURCE.WORKSPACE_SIDEBAR);
    }
  };

  const handleCreateNewWorkspaceRedirect = () => {
    if (user.loggedIn) {
      dispatch(
        actions.toggleActiveModal({
          modalName: "createWorkspaceModal",
          newValue: true,
          newProps: { source: "workspaces_dropdown" },
        })
      );
    } else {
      promptUserSignupModal(() => {
        dispatch(
          actions.toggleActiveModal({
            modalName: "createWorkspaceModal",
            newValue: true,
            newProps: { source: "workspaces_dropdown" },
          })
        );
      }, SOURCE.WORKSPACE_SIDEBAR);
    }
  };

  const handleInviteTeammatesClick = () => {
    if (user.loggedIn) {
      dispatch(
        actions.toggleActiveModal({
          modalName: "inviteMembersModal",
          newValue: true,
          newProps: { source: "workspaces_dropdown" },
        })
      );
      trackInviteTeammatesClicked("workspaces_dropdown");
      if (isSharedWorkspace(activeWorkspaceId)) {
        redirectToTeam(navigate, activeWorkspaceId);
      } else {
        redirectToWorkspaceSettings(navigate, window.location.pathname, "workspaces_dropdown");
      }
    } else {
      promptUserSignupModal(
        () => redirectToWorkspaceSettings(navigate, window.location.pathname, "workspaces_dropdown"),
        SOURCE.WORKSPACE_SIDEBAR
      );
    }
  };

  const handleWorkspaceSwitch = async (team) => {
    setIsModalOpen(true);
    switchWorkspace(team.id);
    setIsModalOpen(false);
  };

  const unauthenticatedUserMenu = (
    <Menu className="workspaces-menu">
      <Menu.Item
        key="0"
        className="workspace-menu-item"
        onClick={() => {
          handleCreateNewWorkspaceRedirect();
          trackWorkspaceDropdownClicked("create_new_workspace");
          trackCreateNewTeamClicked("workspaces_dropdown");
        }}
        icon={<PlusOutlined className="icon-wrapper" />}
      >
        Create New Workspace
      </Menu.Item>
      <Menu.Item
        key="1"
        className="workspace-menu-item"
        onClick={() => {
          handleInviteTeammatesClick();
          trackWorkspaceDropdownClicked("invite_teammates");
        }}
        icon={<PlusSquareOutlined className="icon-wrapper" />}
      >
        Invite teammates
      </Menu.Item>
      <Menu.Item
        key="2"
        className="workspace-menu-item"
        onClick={() => {
          promptUserSignupModal(() => {}, SOURCE.WORKSPACE_SIDEBAR);
          trackWorkspaceDropdownClicked("sign_in");
        }}
        icon={<UserOutlined className="icon-wrapper" />}
      >
        Sign in
      </Menu.Item>
    </Menu>
  );

  const isTeamCurrentlyActive = (teamId) => activeWorkspaceId === teamId;
  const TeamsInviteCountBadge = (
    <Badge color="#0361FF" count={teamInvites?.length} className="join-workspace-invite-count-badge" />
  );

  const joinWorkspaceDropdownItems = [
    {
      key: "0",
      label: (
        <span className="join-existing-workspace-menu-item">
          <span>Join an existing workspace</span>
          {teamInvites?.length > 0 && TeamsInviteCountBadge}
        </span>
      ),
      onClick: () => {
        handleJoinWorkspaceMenuItemClick();
      },
    },
    {
      key: "1",
      label: "Create a new workspace",
      onClick: () => {
        handleCreateNewWorkspaceRedirect();
        trackWorkspaceDropdownClicked("create_new_workspace");
        trackCreateNewTeamClicked("workspaces_dropdown");
      },
    },
  ];

  const handleJoinWorkspaceDropdownClick = ({ key }) => {
    joinWorkspaceDropdownItems[key]?.onClick?.();
  };

  const menu = (
    <Menu className="workspaces-menu" disabled={isLimitToPrivateWorkspaceActive}>
      <Menu.ItemGroup key="Workspaces" title="Your workspaces">
        {availableWorkspaces === null ? renderLoader() : null}
        {sortedAvailableWorkspaces &&
          sortedAvailableWorkspaces.map((workspace) => {
            return (
              <Menu.Item
                key={workspace.id}
                disabled={!!workspace.archived || isTeamCurrentlyActive(workspace.id)}
                icon={
                  isPrivateWorkspace(workspace.id) ? (
                    <Avatar
                      size={28}
                      shape="square"
                      icon={getWorkspaceIcon(APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE, workspace.id)}
                      className="workspace-avatar"
                      style={{ backgroundColor: "#1E69FF" }}
                    />
                  ) : (
                    <Avatar
                      size={28}
                      shape="square"
                      icon={workspace.name?.[0]?.toUpperCase() ?? "P"}
                      className="workspace-avatar"
                      style={{
                        backgroundColor: `${getUniqueColorForWorkspace(workspace.id, workspace.name)}`,
                      }}
                    />
                  )
                }
                className={`workspace-menu-item ${
                  workspace.id === activeWorkspaceId ? "active-workspace-dropdownItem" : ""
                }`}
                onClick={() => {
                  handleWorkspaceSwitch(workspace);
                  trackWorkspaceDropdownClicked("switch_workspace");
                }}
              >
                <Tooltip
                  placement="right"
                  overlayInnerStyle={{ width: "178px" }}
                  title={workspace.archived ? "This workspace has been archived." : ""}
                >
                  <div className="workspace-item-wrapper">
                    <div
                      className={`workspace-name-container ${
                        workspace.archived || isTeamCurrentlyActive(workspace.id) ? "archived-workspace-item" : ""
                      }`}
                    >
                      <div className="workspace-name">{workspace.name}</div>
                      {isPrivateWorkspace(workspace.id) ? null : (
                        <div className="text-gray workspace-details">
                          {workspace.subscriptionStatus ? `${workspace.subscriptionStatus} • ` : null}
                          {workspace.accessCount} {workspace.accessCount > 1 ? "members" : "member"}
                        </div>
                      )}
                    </div>
                    {workspace.archived ? (
                      <Tag color="gold">archived</Tag>
                    ) : isTeamCurrentlyActive(workspace.id) ? (
                      <Tag color="green">current</Tag>
                    ) : null}
                  </div>
                </Tooltip>
              </Menu.Item>
            );
          })}
      </Menu.ItemGroup>

      <Divider className="ant-divider-margin workspace-divider" />
      <Menu.Item key="3" className="workspace-menu-item">
        <Dropdown
          placement="right"
          trigger={["hover"]}
          menu={{
            items: joinWorkspaceDropdownItems,
            onClick: handleJoinWorkspaceDropdownClick,
          }}
          overlayClassName="join-workspace-menu-dropdown-container"
        >
          <div onClick={(e) => e.stopPropagation()} className="join-workspace-menu-dropdown-trigger">
            <span>Join or create workspace</span>

            <div>
              {teamInvites?.length > 0 && TeamsInviteCountBadge}
              <RightOutlined />
            </div>
          </div>
        </Dropdown>
      </Menu.Item>

      {isSharedWorkspace(activeWorkspaceId) ? (
        <>
          <Divider className="ant-divider-margin workspace-divider" />
          <Menu.Item
            key="4"
            className="workspace-menu-item"
            onClick={() => {
              handleInviteTeammatesClick();
              trackWorkspaceDropdownClicked("invite_teammates");
            }}
            icon={<PlusSquareOutlined className="icon-wrapper" />}
          >
            Invite teammates
          </Menu.Item>

          <Menu.Item
            key="5"
            icon={<SettingOutlined className="icon-wrapper" />}
            className="workspace-menu-item"
            onClick={() => {
              if (isSharedWorkspace(activeWorkspaceId)) {
                redirectToTeam(navigate, activeWorkspaceId);
              } else {
                redirectToWorkspaceSettings(navigate, window.location.pathname, "workspaces_dropdown");
              }
              trackWorkspaceDropdownClicked("manage_workspace");
            }}
          >
            Manage Workspace
          </Menu.Item>
        </>
      ) : null}
    </Menu>
  );

  return (
    <>
      <WorkSpaceDropDown hasNewInvites={hasNewInvites} menu={user.loggedIn ? menu : unauthenticatedUserMenu} />

      {isModalOpen ? <LoadingModal isModalOpen={isModalOpen} closeModal={closeModal} /> : null}
    </>
  );
};

export default WorkspaceSelector;
