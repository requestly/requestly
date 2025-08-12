import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  DownOutlined,
  LoadingOutlined,
  PlusOutlined,
  PlusSquareOutlined,
  SettingOutlined,
  UserOutlined,
  ExclamationCircleFilled,
  RightOutlined,
} from "@ant-design/icons";
import {
  clearCurrentlyActiveWorkspace,
  showSwitchWorkspaceSuccessToast,
  switchWorkspace,
} from "actions/TeamWorkspaceActions";
import { Badge, Checkbox, Divider, Dropdown, Menu, Modal, Spin, Tag, Tooltip } from "antd";
import {
  trackInviteTeammatesClicked,
  trackWorkspaceDropdownClicked,
  trackCreateNewTeamClicked,
} from "modules/analytics/events/common/teams";
import { getAppMode, getIsCurrentlySelectedRuleHasUnsavedChanges, getLastSeenInviteTs } from "store/selectors";
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
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { toast } from "utils/Toast";
import { useCheckLocalSyncSupport } from "features/apiClient/helpers/modules/sync/useCheckLocalSyncSupport";
import {
  getActiveWorkspace,
  getActiveWorkspaceId,
  getAllWorkspaces,
  isActiveWorkspaceShared,
} from "store/slices/workspaces/selectors";
import { PrivateWorkspaceStub, WorkspaceType } from "features/workspaces/types";
import { trackSignUpButtonClicked } from "modules/analytics/events/common/auth/signup";
import WorkspaceAvatar from "features/workspaces/components/WorkspaceAvatar";
import LocalWorkspaceAvatar from "features/workspaces/components/LocalWorkspaceAvatar";
import { MdOutlineRefresh } from "@react-icons/all-files/md/MdOutlineRefresh";
import { RQButton } from "lib/design-system-v2/components";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import {
  ApiClientViewMode,
  useApiClientMultiWorkspaceView,
} from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { MultiWorkspaceAvatarGroup } from "./MultiWorkspaceAvatarGroup";
import { addWorkspaceToView, removeWorkspaceFromView, resetToSingleView } from "features/apiClient/commands/multiView";

const { PATHS } = APP_CONSTANTS;

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
  const viewMode = useApiClientMultiWorkspaceView((s) => s.viewMode);

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
    <>
      <Dropdown
        overlay={menu}
        trigger={["click"]}
        className="workspace-selector-dropdown no-drag"
        onOpenChange={handleWorkspaceDropdownClick}
      >
        <div className="workspace-selector-dropdown__content">
          <Tooltip
            overlayClassName="workspace-selector-tooltip"
            style={{ top: "35px" }}
            title={tooltipTitle}
            placement={"bottomRight"}
            showArrow={false}
            mouseEnterDelay={0.5}
            color="#000"
          >
            <div className="cursor-pointer items-center">
              {viewMode === ApiClientViewMode.MULTI ? (
                <MultiWorkspaceAvatarGroup />
              ) : (
                <>
                  {activeWorkspace.workspaceType === WorkspaceType.LOCAL ? (
                    <>
                      <LocalWorkspaceAvatar
                        size={28}
                        workspace={{
                          ...activeWorkspace,
                          name: user.loggedIn ? activeWorkspaceName : null,
                          workspaceType: user.loggedIn ? activeWorkspace?.workspaceType : null,
                        }}
                      />
                    </>
                  ) : (
                    <WorkspaceAvatar
                      size={28}
                      workspace={{
                        ...activeWorkspace,
                        name: user.loggedIn ? activeWorkspaceName : null,
                        workspaceType: user.loggedIn ? activeWorkspace?.workspaceType : null,
                      }}
                    />
                  )}
                  <span className="items-center active-workspace-name">
                    <span className="active-workspace-name">{prettifyWorkspaceName(activeWorkspaceName)}</span>
                    {hasNewInvites ? <Badge dot={true} /> : null}
                  </span>
                </>
              )}
              <DownOutlined className="active-workspace-name-down-icon" />
            </div>
          </Tooltip>
        </div>
      </Dropdown>
    </>
  );
};

const WorkspaceSelector = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const isLocalSyncEnabled = useCheckLocalSyncSupport({ skipWorkspaceCheck: true });

  const isLimitToPrivateWorkspaceActive = useFeatureIsOn("limit_to_private_workspace");

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
  const isCurrentlySelectedRuleHasUnsavedChanges = useSelector(getIsCurrentlySelectedRuleHasUnsavedChanges);
  const lastSeenInviteTs = useSelector(getLastSeenInviteTs);
  const [selectedWorkspaces, viewMode, isSelected] = useApiClientMultiWorkspaceView((s) => [
    s.selectedWorkspaces,
    s.viewMode,
    s.isSelected,
  ]);

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

  const handleMultiworkspaceAdder = (workspace, isChecked) => {
    if (isChecked) {
      addWorkspaceToView(workspace, user.details?.profile?.uid).catch((e) => toast.error(e.message));
    } else {
      removeWorkspaceFromView(workspace.id).catch((e) => toast.error(e.message));
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

  const confirmWorkspaceSwitch = useCallback(
    (callback = () => {}) => {
      const handleCallback = () => {
        dispatch(globalActions.updateIsWorkspaceSwitchConfirmationActive(false));
        callback();

        if (path) {
          navigate(redirects[path]);
        }
      };

      if (!isCurrentlySelectedRuleHasUnsavedChanges || pathname.includes(PATHS.ACCOUNT.TEAMS.ABSOLUTE)) {
        handleCallback();
        return;
      }

      dispatch(globalActions.updateIsWorkspaceSwitchConfirmationActive(true));
      Modal.confirm({
        title: "Discard changes?",
        icon: <ExclamationCircleFilled />,
        content: "Changes you made on a rule may not be saved.",
        okText: "Switch",
        onOk: handleCallback,
        afterClose: () => dispatch(globalActions.updateIsWorkspaceSwitchConfirmationActive(false)),
      });
    },
    [isCurrentlySelectedRuleHasUnsavedChanges, navigate, path, pathname, redirects, dispatch]
  );

  const handleSwitchToPrivateWorkspace = useCallback(async () => {
    setIsModalOpen(true);
    return clearCurrentlyActiveWorkspace(dispatch, appMode).then(() => {
      setIsModalOpen(false);
      showSwitchWorkspaceSuccessToast();
      resetToSingleView(PrivateWorkspaceStub, user.details?.profile?.uid);
    });
  }, [appMode, dispatch, user.details?.profile?.uid]);

  const handleWorkspaceSwitch = async (team) => {
    setIsModalOpen(true);
    switchWorkspace(
      {
        teamId: team.id,
        teamName: team.name,
        teamMembersCount: team.accessCount,
        workspaceType: team.workspaceType,
      },
      dispatch,
      {
        isSyncEnabled: user?.details?.isSyncEnabled,
        isWorkspaceMode: isSharedWorkspaceMode,
      },
      appMode,
      undefined,
      "workspaces_dropdown"
    )
      .then(() => {
        if (!isModalOpen) showSwitchWorkspaceSuccessToast(team.name);
        setIsModalOpen(false);
        resetToSingleView(team, user.details?.profile?.uid);
      })
      .catch((error) => {
        console.error(error);
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

  useEffect(() => {
    if (isLimitToPrivateWorkspaceActive) {
      if (activeWorkspaceId) {
        confirmWorkspaceSwitch(handleSwitchToPrivateWorkspace);
      }
    }
  }, [isLimitToPrivateWorkspaceActive, activeWorkspaceId, confirmWorkspaceSwitch, handleSwitchToPrivateWorkspace]);

  const menu = (
    <Menu className="workspaces-menu" disabled={isLimitToPrivateWorkspaceActive}>
      <Menu.ItemGroup key="Workspaces" title="Your workspaces">
        <Menu.Item
          key="1"
          icon={
            <WorkspaceAvatar
              size={28}
              workspace={{
                id: "private",
                name: "",
                workspaceType: WorkspaceType.PERSONAL,
              }}
            />
          }
          className={`workspace-menu-item ${!activeWorkspaceId ? "active-workspace-dropdownItem" : ""}`}
          onClick={() => {
            confirmWorkspaceSwitch(handleSwitchToPrivateWorkspace);
            trackWorkspaceDropdownClicked("switch_workspace");
          }}
        >
          <div className="workspace-name-container">
            {APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE} (Default)
          </div>
        </Menu.Item>
      </Menu.ItemGroup>

      {availableWorkspaces === null ? renderLoader() : null}

      {/* Shared Workspaces */}
      {sortedAvailableWorkspaces.filter((team) => team.workspaceType !== WorkspaceType.LOCAL).length ? (
        <Menu.ItemGroup key="sharedWorkspaces" title="Shared workspaces">
          {sortedAvailableWorkspaces
            .filter((team) => team.workspaceType !== WorkspaceType.LOCAL)
            .map((team) => {
              const isVisiblyActive = isTeamCurrentlyActive(team.id) && viewMode === ApiClientViewMode.SINGLE;
              return (
                <Menu.Item
                  key={team.id}
                  disabled={!!team.archived || isVisiblyActive}
                  icon={<WorkspaceAvatar size={28} workspace={team} />}
                  className={`workspace-menu-item ${
                    team.id === activeWorkspaceId ? "active-workspace-dropdownItem" : ""
                  }`}
                  onClick={(e) => {
                    confirmWorkspaceSwitch(() => handleWorkspaceSwitch(team));
                    trackWorkspaceDropdownClicked("switch_workspace");
                    e.stopPropagation();
                  }}
                >
                  <Tooltip
                    placement="right"
                    overlayInnerStyle={{ width: "178px" }}
                    title={team.archived ? "This workspace has been archived." : ""}
                  >
                    <div className="workspace-item-wrapper">
                      <div
                        className={`workspace-name-container ${
                          team.archived || isVisiblyActive ? "archived-workspace-item" : ""
                        }`}
                      >
                        <div className="workspace-name">{team.name}</div>
                        <div className="text-gray workspace-details">
                          {team.subscriptionStatus ? `${team.subscriptionStatus} • ` : null}
                          {team.accessCount} {team.accessCount > 1 ? "members" : "member"}
                        </div>
                      </div>
                      {team.archived ? (
                        <Tag color="gold">archived</Tag>
                      ) : isVisiblyActive ? (
                        <Tag color="green">current</Tag>
                      ) : null}
                    </div>
                  </Tooltip>
                </Menu.Item>
              );
            })}
        </Menu.ItemGroup>
      ) : null}

      {/* Local Workspaces */}
      {isLocalSyncEnabled &&
      sortedAvailableWorkspaces.filter((team) => team.workspaceType === WorkspaceType.LOCAL).length ? (
        <Menu.ItemGroup key="localWorkspace" title="Local workspaces">
          {sortedAvailableWorkspaces
            .filter((team) => team.workspaceType === WorkspaceType.LOCAL)
            .map((team, index) => (
              <Menu.Item
                key={team.id}
                disabled={!!team.archived || isTeamCurrentlyActive(team.id)}
                icon={<LocalWorkspaceAvatar workspace={team} />}
                className={`workspace-menu-item ${
                  team.id === activeWorkspaceId ? "active-workspace-dropdownItem" : ""
                }`}
                onClick={(e) => {
                  confirmWorkspaceSwitch(() => handleWorkspaceSwitch(team));
                  trackWorkspaceDropdownClicked("switch_workspace");
                  e?.stopPropagation();
                }}
              >
                <Tooltip
                  placement="right"
                  overlayInnerStyle={{ width: "178px" }}
                  title={team.archived ? "This workspace has been archived." : ""}
                >
                  <div className="workspace-item-wrapper">
                    <div
                      className={`workspace-name-container ${
                        team.archived || isTeamCurrentlyActive(team.id) ? "archived-workspace-item" : ""
                      }`}
                    >
                      <div className="workspace-name">{team.name}</div>
                      <div className="text-gray workspace-details">{team.rootPath || ""}</div>
                    </div>

                    <>
                      {team.archived ? (
                        <Tag color="gold">archived</Tag>
                      ) : viewMode !== ApiClientViewMode.MULTI && isTeamCurrentlyActive(team.id) ? (
                        <Tag color="green">current</Tag>
                      ) : null}
                    </>

                    <div
                      className={`workspace-checkbox-wrapper ${
                        selectedWorkspaces.length === 1 ? "single-workspace-hover" : "multi-workspace-no-hover"
                      }`}
                    >
                      <Checkbox
                        onClick={(e) => e.stopPropagation()}
                        disabled={isSelected(team.id) && selectedWorkspaces.length === 1}
                        onChange={(e) => {
                          handleMultiworkspaceAdder(team, e.target.checked);
                        }}
                        checked={isSelected(team.id)}
                      />
                    </div>
                  </div>
                </Tooltip>
              </Menu.Item>
            ))}
        </Menu.ItemGroup>
      ) : null}

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

      {isSharedWorkspaceMode ? (
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

      {(activeWorkspace?.workspaceType === WorkspaceType.LOCAL || viewMode === ApiClientViewMode.MULTI) &&
      isFeatureCompatible(FEATURES.LOCAL_WORKSPACE_REFRESH) ? (
        <Tooltip title="Load latest changes from your local files" placement="bottom" color="#000">
          <RQButton
            onClick={(e) => {
              e.stopPropagation();
              window.dispatchEvent(new Event("local-sync-refresh"));
            }}
            className="local-sync-refresh-btn no-drag"
            size="small"
            iconOnly
            icon={<MdOutlineRefresh />}
          />
        </Tooltip>
      ) : null}

      {isModalOpen ? <LoadingModal isModalOpen={isModalOpen} closeModal={closeModal} /> : null}
    </>
  );
};

export default WorkspaceSelector;
