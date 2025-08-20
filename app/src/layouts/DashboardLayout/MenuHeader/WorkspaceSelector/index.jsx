import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Tooltip } from "antd";
import { getLastSeenInviteTs } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import APP_CONSTANTS from "config/constants";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { trackWorkspaceInviteAnimationViewed } from "modules/analytics/events/common/teams";
import { trackTopbarClicked } from "modules/analytics/events/common/onboarding/header";
import { getPendingInvites } from "backend/workspace";
import { getActiveWorkspace, getAllWorkspaces, isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import { WorkspaceType } from "features/workspaces/types";
import WorkspaceAvatar from "features/workspaces/components/WorkspaceAvatar";
import { MdOutlineRefresh } from "@react-icons/all-files/md/MdOutlineRefresh";
import { RQButton } from "lib/design-system-v2/components";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { WorkspacesOverlay } from "./components/WorkspacesOverlay";
import "./WorkSpaceSelector.css";

export const isWorkspacesFeatureEnabled = (email) => {
  if (!email) return false;
  return true;
};

const prettifyWorkspaceName = (workspaceName) => {
  // if (workspaceName === APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE)
  //   return "Private";
  return workspaceName || "Unknown";
};

const WorkSpaceDropDown = ({ teamInvites }) => {
  // Global State
  const user = useSelector(getUserAuthDetails);
  const activeWorkspace = useSelector(getActiveWorkspace);
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);

  // Local State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activeWorkspaceName = user.loggedIn
    ? isSharedWorkspaceMode
      ? activeWorkspace?.name
      : APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE
    : "Workspaces";

  const handleWorkspaceDropdownClick = (open) => {
    setIsDropdownOpen(open);
    if (open) {
      trackTopbarClicked("workspace");
    }
  };

  const handleLocalSyncRefresh = (e) => {
    e.stopPropagation();
    window.dispatchEvent(new Event("local-sync-refresh"));
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const tooltipTitle =
    activeWorkspace?.workspaceType === WorkspaceType.LOCAL
      ? activeWorkspace.rootPath
      : prettifyWorkspaceName(activeWorkspaceName);

  return (
    <>
      <Dropdown
        overlay={<WorkspacesOverlay toggleDropdown={toggleDropdown} teamInvites={teamInvites} />}
        trigger={["click"]}
        className="workspace-selector-dropdown no-drag"
        open={isDropdownOpen}
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
              <WorkspaceAvatar
                size={28}
                workspace={{
                  ...activeWorkspace,
                  name: user.loggedIn ? activeWorkspaceName : null,
                  workspaceType: user.loggedIn ? activeWorkspace?.workspaceType : null,
                }}
              />
              <span className="items-center active-workspace-name">
                <span className="active-workspace-name">{prettifyWorkspaceName(activeWorkspaceName)}</span>
                <DownOutlined className="active-workspace-name-down-icon" />
              </span>
            </div>
          </Tooltip>
        </div>
      </Dropdown>
      {activeWorkspace?.workspaceType === WorkspaceType.LOCAL &&
      isFeatureCompatible(FEATURES.LOCAL_WORKSPACE_REFRESH) ? (
        <Tooltip title="Load latest changes from your local files" placement="bottom" color="#000">
          <RQButton
            onClick={handleLocalSyncRefresh}
            className="local-sync-refresh-btn no-drag"
            size="small"
            iconOnly
            icon={<MdOutlineRefresh />}
          />
        </Tooltip>
      ) : null}
    </>
  );
};

const WorkspaceSelector = () => {
  const user = useSelector(getUserAuthDetails);
  const availableWorkspaces = useSelector(getAllWorkspaces);

  const lastSeenInviteTs = useSelector(getLastSeenInviteTs);

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

  return (
    <>
      <WorkSpaceDropDown teamInvites={teamInvites} />
    </>
  );
};

export default WorkspaceSelector;
