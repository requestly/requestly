import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  DownOutlined,
  LoadingOutlined,
  PlusOutlined,
  PlusSquareOutlined,
  SettingOutlined,
  UserOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Badge, Divider, Dropdown, Menu, Spin, Tag, Tooltip } from "antd";
import {
  trackInviteTeammatesClicked,
  trackWorkspaceDropdownClicked,
  trackCreateNewTeamClicked,
} from "modules/analytics/events/common/teams";
import { getAppMode, getLastSeenInviteTs } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { redirectToTeam, redirectToWorkspaceSettings } from "utils/RedirectionUtils";
import LoadingModal from "./LoadingModal";
import { globalActions } from "store/slices/global/slice";
import APP_CONSTANTS from "config/constants";
import { SOURCE } from "modules/analytics/events/common/constants";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { trackWorkspaceJoiningModalOpened } from "modules/analytics/events/features/teams";
import { trackWorkspaceInviteAnimationViewed } from "modules/analytics/events/common/teams";
import { trackTopbarClicked } from "modules/analytics/events/common/onboarding/header";
import { getPendingInvites } from "backend/workspace";
import "./WorkSpaceSelector.css";
import { toast } from "utils/Toast";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { useCheckLocalSyncSupport } from "features/apiClient/helpers/modules/sync/useCheckLocalSyncSupport";
import {
  getActiveWorkspace,
  getActiveWorkspaceId,
  getAllWorkspaces,
  isActiveWorkspaceShared,
} from "store/slices/workspaces/selectors";
import { WorkspaceType } from "features/workspaces/types";
import WorkspaceAvatar from "features/workspaces/components/WorkspaceAvatar";
import { isLocalFSWorkspace, isPersonalWorkspace, isSharedWorkspace } from "features/workspaces/utils";
import { useWorkspaceHelpers } from "features/workspaces/hooks/useWorkspaceHelpers";
import WorkspaceItem from "./WorkspaceItem";
import { trackSignUpButtonClicked } from "modules/analytics/events/common/auth/signup";

export const isWorkspacesFeatureEnabled = (email) => {
  if (!email) return false;
  return true;
};

const prettifyWorkspaceName = (workspaceName) => {
  // if (workspaceName === APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE)
  //   return "Private";
  return workspaceName || "Unknown";
};

const WorkSpaceDropDown = ({ menu, hasNewInvites }) => {
  // Global State
  const user = useSelector(getUserAuthDetails);
  const activeWorkspace = useSelector(getActiveWorkspace);
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);

  const activeWorkspaceName = user.loggedIn
    ? isSharedWorkspaceMode
      ? activeWorkspace?.name
      : APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE
    : "Workspaces";

  const handleWorkspaceDropdownClick = (open) => {
    if (open) {
      trackTopbarClicked("workspace");
    }
  };

  const tooltipTitle =
    activeWorkspace?.workspaceType === WorkspaceType.LOCAL
      ? activeWorkspace.rootPath
      : prettifyWorkspaceName(activeWorkspaceName);

  return (
    <Tooltip
      overlayClassName="workspace-selector-tooltip"
      style={{ top: "35px" }}
      title={tooltipTitle}
      placement={"bottomRight"}
      showArrow={false}
      mouseEnterDelay={0.5}
    >
      <div className="cursor-pointer items-center">
        {activeWorkspace ? (
          <>
            {<WorkspaceAvatar workspace={activeWorkspace} />}
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
          </>
        ) : (
          <>
            {<WorkspaceAvatar workspace={{ id: "", name: "" }} />}
            <Tooltip
              overlayClassName="workspace-selector-tooltip"
              style={{ top: "35px" }}
              title={"No Workspace Selected"}
              placement={"bottomRight"}
              showArrow={false}
              mouseEnterDelay={2}
            >
              <span className="items-center active-workspace-name">
                <span className="active-workspace-name">{"No Workspace Selected"}</span>
                {hasNewInvites ? <Badge dot={true} /> : null}
                <DownOutlined className="active-workspace-name-down-icon" />
              </span>
            </Tooltip>
          </>
        )}
      </div>
    </Tooltip>
  );
};

const WorkspaceSelector = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLocalSyncEnabled = useCheckLocalSyncSupport({ skipWorkspaceCheck: true });

  // GLOBAL STATE
  const user = useSelector(getUserAuthDetails);
  const availableWorkspaces = useSelector(getAllWorkspaces);
  const _availableWorkspaces = availableWorkspaces || [];
  let sortedAvailableWorkspaces = _availableWorkspaces.filter((team) => !team.browserstackDetails); // Filtering our Browserstack Workspaces)
  sortedAvailableWorkspaces = [
    ...sortedAvailableWorkspaces.filter((team) => !team?.archived),
    ...sortedAvailableWorkspaces.filter((team) => team?.archived),
  ];

  const appMode = useSelector(getAppMode);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const activeWorkspace = useSelector(getActiveWorkspace);
  const isWorkspaceTypeLocal = activeWorkspace?.workspaceType === WorkspaceType.LOCAL;
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);
  const lastSeenInviteTs = useSelector(getLastSeenInviteTs);

  const { switchWorkspace } = useWorkspaceHelpers();

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
      globalActions.toggleActiveModal({
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
        globalActions.toggleActiveModal({
          modalName: "joinWorkspaceModal",
          newValue: true,
          newProps: { source: "workspaces_dropdown" },
        })
      );
      trackWorkspaceJoiningModalOpened(teamInvites?.length, "workspaces_dropdown");
    } else {
      promptUserSignupModal(() => {
        dispatch(
          globalActions.toggleActiveModal({
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
        globalActions.toggleActiveModal({
          modalName: "createWorkspaceModal",
          newValue: true,
          newProps: { source: "workspaces_dropdown" },
        })
      );
    } else {
      promptUserSignupModal(() => {
        dispatch(
          globalActions.toggleActiveModal({
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
        globalActions.toggleActiveModal({
          modalName: "inviteMembersModal",
          newValue: true,
          newProps: { source: "workspaces_dropdown" },
        })
      );
      trackInviteTeammatesClicked("workspaces_dropdown");
      if (isSharedWorkspaceMode) {
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
    switchWorkspace(team.id)
      .then(() => {
        setIsModalOpen(false);
      })
      .catch((err) => {
        setIsModalOpen(false);
        toast.error(
          "Failed to switch workspace. Please reload and try again. If the issue persists, please contact support."
        );
      });
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
          trackSignUpButtonClicked(SOURCE.WORKSPACE_SIDEBAR);
          promptUserSignupModal(() => {}, SOURCE.WORKSPACE_SIDEBAR);
          trackWorkspaceDropdownClicked("sign_up");
        }}
        icon={<UserOutlined className="icon-wrapper" />}
      >
        Sign up
      </Menu.Item>
    </Menu>
  );

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

  const personalWorkspaces = sortedAvailableWorkspaces.filter((workspace) => isPersonalWorkspace(workspace));
  const sharedWorkspaces = sortedAvailableWorkspaces.filter((workspace) => isSharedWorkspace(workspace));
  const localFSWorkspaces = sortedAvailableWorkspaces.filter((workspace) => isLocalFSWorkspace(workspace));

  const menu = (
    <Menu className="workspaces-menu">
      {availableWorkspaces === null ? renderLoader() : null}

      <Menu.ItemGroup key="personalWorkspaces" title="Your workspaces">
        {personalWorkspaces.map((workspace) => {
          return (
            <WorkspaceItem key={workspace.id} workspace={workspace} handleWorkspaceSwitch={handleWorkspaceSwitch} />
          );
        })}
      </Menu.ItemGroup>

      {sharedWorkspaces.length > 0 && (
        <Menu.ItemGroup key="sharedWorkspaces" title="Shared workspaces">
          {sharedWorkspaces.map((workspace) => {
            return (
              <WorkspaceItem key={workspace.id} workspace={workspace} handleWorkspaceSwitch={handleWorkspaceSwitch} />
            );
          })}
        </Menu.ItemGroup>
      )}

      {isLocalSyncEnabled && localFSWorkspaces.length > 0 && (
        <Menu.ItemGroup key="localWorkspace" title="Local workspaces">
          {localFSWorkspaces.map((workspace) => {
            return (
              <WorkspaceItem key={workspace.id} workspace={workspace} handleWorkspaceSwitch={handleWorkspaceSwitch} />
            );
          })}
        </Menu.ItemGroup>
      )}

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

      {isSharedWorkspace(activeWorkspace) || isPersonalWorkspace(activeWorkspace) ? (
        <>
          <Divider className="ant-divider-margin workspace-divider" />
          {!isWorkspaceTypeLocal ? (
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
          ) : null}

          <Menu.Item
            key="5"
            icon={<SettingOutlined className="icon-wrapper" />}
            className="workspace-menu-item"
            onClick={() => {
              if (isSharedWorkspaceMode) {
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
