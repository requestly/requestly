import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  DownOutlined,
  LoadingOutlined,
  LockOutlined,
  PlusOutlined,
  PlusSquareOutlined,
  SettingOutlined,
  UserOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import {
  clearCurrentlyActiveWorkspace,
  showSwitchWorkspaceSuccessToast,
  switchWorkspace,
} from "actions/TeamWorkspaceActions";
import {
  Avatar,
  Divider,
  Dropdown,
  Menu,
  Modal,
  Row,
  Spin,
  Tag,
  Tooltip,
} from "antd";
import {
  trackInviteTeammatesClicked,
  trackCreateNewWorkspaceClicked,
  trackWorkspaceDropdownClicked,
} from "modules/analytics/events/common/teams";
import { trackSidebarClicked } from "modules/analytics/events/common/onboarding/sidebar";
import {
  getCurrentlyActiveWorkspace,
  getAvailableTeams,
  getIsWorkspaceMode,
} from "store/features/teams/selectors";
import {
  getAppMode,
  getIsCurrentlySelectedRuleHasUnsavedChanges,
  getUserAuthDetails,
} from "store/selectors";
import { redirectToMyTeams, redirectToTeam } from "utils/RedirectionUtils";
import LoadingModal from "./LoadingModal";
import { actions } from "store";
import APP_CONSTANTS from "config/constants";
import CreateWorkspaceModal from "components/user/AccountIndexPage/ManageAccount/ManageTeams/CreateWorkspaceModal";
import AddMemberModal from "components/user/AccountIndexPage/ManageAccount/ManageTeams/TeamViewer/MembersDetails/AddMemberModal";
import { AUTH } from "modules/analytics/events/common/constants";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { getUniqueColorForWorkspace } from "utils/teams";
import "./WorkSpaceSelector.css";

const { PATHS } = APP_CONSTANTS;

export const isWorkspacesFeatureEnabled = (email) => {
  if (!email) return false;
  return true;
};

const prettifyWorkspaceName = (workspaceName) => {
  // if (workspaceName === APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE)
  //   return "Private";
  return workspaceName;
};
const getWorkspaceIcon = (workspaceName) => {
  if (workspaceName === APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE)
    return <LockOutlined />;
  return workspaceName[0].toUpperCase();
};

const WorkSpaceDropDown = ({ isCollapsed, menu }) => {
  // Global State
  const user = useSelector(getUserAuthDetails);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  const activeWorkspaceName = user.loggedIn
    ? isWorkspaceMode
      ? currentlyActiveWorkspace.name
      : APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE
    : "Workspaces";

  return (
    <Row align="middle" justify="center">
      <Dropdown
        overlay={menu}
        trigger={["click"]}
        className="workspace-dropdown"
        onOpenChange={(open) => {
          open && trackSidebarClicked("workspace");
        }}
      >
        <div className="cursor-pointer items-center">
          <Avatar
            size={28}
            shape="square"
            icon={getWorkspaceIcon(activeWorkspaceName)}
            className="workspace-avatar"
            style={{
              backgroundColor: user.loggedIn
                ? activeWorkspaceName ===
                  APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE
                  ? "#1E69FF"
                  : getUniqueColorForWorkspace(
                      currentlyActiveWorkspace?.id,
                      activeWorkspaceName
                    )
                : "#ffffff4d",
            }}
          />
          <span className={isCollapsed ? "hidden" : "items-center"}>
            <span className="active-workspace-name">
              {prettifyWorkspaceName(activeWorkspaceName)}
            </span>
            <DownOutlined className="active-workspace-name-down-icon" />
          </span>
        </div>
      </Dropdown>
    </Row>
  );
};

const WorkspaceSelector = ({ isCollapsed, handleMobileSidebarClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  // GLOBAL STATE
  const user = useSelector(getUserAuthDetails);
  const availableTeams = useSelector(getAvailableTeams);
  const _availableTeams = availableTeams || [];
  const sortedAvailableTeams = [
    ..._availableTeams.filter((team) => !team?.archived),
    ..._availableTeams.filter((team) => team?.archived),
  ];
  const appMode = useSelector(getAppMode);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const isCurrentlySelectedRuleHasUnsavedChanges = useSelector(
    getIsCurrentlySelectedRuleHasUnsavedChanges
  );

  // Local State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = useState(
    false
  );
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    if (availableTeams?.length > 0) {
      submitAttrUtil(
        APP_CONSTANTS.GA_EVENTS.ATTR.NUM_WORKSPACES,
        availableTeams.length
      );
    }
  }, [availableTeams?.length]);

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

  const handleCreateWorkspaceModalClose = () => {
    setIsCreateWorkspaceModalOpen(false);
  };

  const handleInviteModalClose = () => {
    setIsInviteModalOpen(false);
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

  const handleCreateNewWorkspaceRedirect = () => {
    if (user.loggedIn) {
      setIsCreateWorkspaceModalOpen(true);
      handleMobileSidebarClose?.();
    } else {
      promptUserSignupModal(() => {
        setIsCreateWorkspaceModalOpen(true);
      }, AUTH.SOURCE.WORKSPACE_SIDEBAR);
    }
  };

  const handleInviteTeammatesClick = () => {
    if (user.loggedIn) {
      setIsInviteModalOpen(true);
      trackInviteTeammatesClicked("sidebar_dropdown");
      if (isWorkspaceMode) {
        redirectToTeam(navigate, currentlyActiveWorkspace.id);
      } else {
        redirectToMyTeams(navigate, false);
      }
    } else {
      promptUserSignupModal(
        () => redirectToMyTeams(navigate, false),
        AUTH.SOURCE.WORKSPACE_SIDEBAR
      );
    }
  };

  const redirects = useMemo(
    () => ({
      rules: PATHS.RULES.MY_RULES.ABSOLUTE,
      mock: PATHS.MOCK_SERVER_V2.ABSOLUTE,
      files: PATHS.FILE_SERVER_V2.ABSOLUTE,
      sessions: PATHS.SESSIONS.ABSOLUTE,
      teams: PATHS.ACCOUNT.TEAMS.ABSOLUTE,
    }),
    []
  );

  const path = useMemo(
    () =>
      Object.keys(redirects).find(
        (path) =>
          pathname.includes(path) &&
          (pathname.includes("editor") ||
            pathname.includes("viewer") ||
            pathname.includes("saved") ||
            pathname.includes("/teams/"))
      ),
    [redirects, pathname]
  );

  const confirmWorkspaceSwitch = (callback = () => {}) => {
    const handleCallback = () => {
      callback();

      if (path) {
        navigate(redirects[path]);
      }
    };

    if (
      !isCurrentlySelectedRuleHasUnsavedChanges ||
      pathname.includes(PATHS.ACCOUNT.TEAMS.ABSOLUTE)
    ) {
      handleCallback();
      return;
    }

    Modal.confirm({
      title: "Discard changes?",
      icon: <ExclamationCircleFilled />,
      content: "Changes you made on a rule may not be saved.",
      okText: "Switch",
      onOk: handleCallback,
    });
  };

  const handleSwitchToPrivateWorkspace = async () => {
    setIsModalOpen(true);
    await clearCurrentlyActiveWorkspace(dispatch, appMode);
    setTimeout(() => {
      setIsModalOpen(false);
      showSwitchWorkspaceSuccessToast();
    }, 2 * 1000);
  };

  const handleWorkspaceSwitch = async (team) => {
    switchWorkspace(
      {
        teamId: team.id,
        teamName: team.name,
        teamMembersCount: team.accessCount,
      },
      dispatch,
      {
        isSyncEnabled: user?.details?.isSyncEnabled,
        isWorkspaceMode,
      },
      appMode,
      () => {
        setIsModalOpen(true);
        setTimeout(() => {
          if (!isModalOpen) showSwitchWorkspaceSuccessToast(team.name);
          setIsModalOpen(false);
        }, 2 * 1000);
      }
    );
    handleMobileSidebarClose?.();
  };

  const unauthenticatedUserMenu = (
    <Menu className="workspaces-menu">
      <Menu.Item
        key="0"
        className="workspace-menu-item"
        onClick={() => {
          handleCreateNewWorkspaceRedirect();
          trackWorkspaceDropdownClicked("create_new_workspace");
          trackCreateNewWorkspaceClicked("workspaces_dropdown");
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
          promptUserSignupModal(() => {}, AUTH.SOURCE.WORKSPACE_SIDEBAR);
          trackWorkspaceDropdownClicked("sign_in");
        }}
        icon={<UserOutlined className="icon-wrapper" />}
      >
        Sign in
      </Menu.Item>
    </Menu>
  );

  const isTeamCurrentlyActive = (teamId) =>
    currentlyActiveWorkspace.id === teamId;

  const menu = (
    <Menu className="workspaces-menu">
      <Menu.ItemGroup key="Workspaces" title="Your workspaces">
        <Menu.Item
          key="1"
          icon={
            <Avatar
              size={28}
              shape="square"
              icon={getWorkspaceIcon(
                APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE
              )}
              className="workspace-avatar"
              style={{ backgroundColor: "#1E69FF" }}
            />
          }
          className={`workspace-menu-item ${
            !currentlyActiveWorkspace.id ? "active-workspace-dropdownItem" : ""
          }`}
          onClick={() => {
            confirmWorkspaceSwitch(handleSwitchToPrivateWorkspace);
            trackWorkspaceDropdownClicked("switch_workspace");
          }}
        >
          <div className="workspace-name-container">
            {APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE} (Default)
          </div>
        </Menu.Item>
        {availableTeams === null ? renderLoader() : null}

        {sortedAvailableTeams &&
          sortedAvailableTeams.map((team) => {
            return (
              <Menu.Item
                key={team.id}
                disabled={!!team.archived || isTeamCurrentlyActive(team.id)}
                icon={
                  <Avatar
                    size={28}
                    shape="square"
                    icon={team.name?.[0]?.toUpperCase() ?? "P"}
                    className="workspace-avatar"
                    style={{
                      backgroundColor: `${getUniqueColorForWorkspace(
                        team.id,
                        team.name
                      )}`,
                    }}
                  />
                }
                className={`workspace-menu-item ${
                  team.id === currentlyActiveWorkspace.id
                    ? "active-workspace-dropdownItem"
                    : ""
                }`}
                onClick={() => {
                  confirmWorkspaceSwitch(() => handleWorkspaceSwitch(team));
                  trackWorkspaceDropdownClicked("switch_workspace");
                }}
              >
                <Tooltip
                  placement="right"
                  overlayInnerStyle={{ width: "178px" }}
                  title={
                    team.archived
                      ? "This workspace has been scheduled for deletion in next 48 hours."
                      : ""
                  }
                >
                  <div className="workspace-item-wrapper">
                    <div
                      className={`workspace-name-container ${
                        team.archived || isTeamCurrentlyActive(team.id)
                          ? "archived-workspace-item"
                          : ""
                      }`}
                    >
                      <div className="workspace-name">{team.name}</div>
                      <div className="text-gray workspace-details">
                        {team.subscriptionStatus
                          ? `${team.subscriptionStatus} • `
                          : null}
                        {team.accessCount}{" "}
                        {team.accessCount > 1 ? "members" : "member"}
                      </div>
                    </div>
                    {team.archived ? (
                      <Tag color="gold">archived</Tag>
                    ) : isTeamCurrentlyActive(team.id) ? (
                      <Tag color="green">current</Tag>
                    ) : null}
                  </div>
                </Tooltip>
              </Menu.Item>
            );
          })}
      </Menu.ItemGroup>

      <Divider className="ant-divider-margin workspace-divider" />

      <Menu.Item
        key="3"
        className="workspace-menu-item"
        onClick={() => {
          handleCreateNewWorkspaceRedirect();
          trackWorkspaceDropdownClicked("create_new_workspace");
          trackCreateNewWorkspaceClicked("workspaces_dropdown");
        }}
        icon={<PlusOutlined className="icon-wrapper" />}
      >
        Create New Workspace
      </Menu.Item>

      {isWorkspaceMode ? (
        <>
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
              if (isWorkspaceMode) {
                redirectToTeam(navigate, currentlyActiveWorkspace.id);
              } else {
                redirectToMyTeams(navigate, false);
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
      <WorkSpaceDropDown
        isCollapsed={isCollapsed}
        menu={user.loggedIn ? menu : unauthenticatedUserMenu}
      />

      {isModalOpen ? (
        <LoadingModal isModalOpen={isModalOpen} closeModal={closeModal} />
      ) : null}

      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceModalOpen}
        handleModalClose={handleCreateWorkspaceModalClose}
      />

      {/* TODO: change "invite" terminology to "add" */}
      {isWorkspaceMode ? (
        <AddMemberModal
          isOpen={isInviteModalOpen}
          handleModalClose={handleInviteModalClose}
        />
      ) : null}
    </>
  );
};

export default WorkspaceSelector;
