import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { DownOutlined } from "@ant-design/icons";
import { MdOutlineRefresh } from "@react-icons/all-files/md/MdOutlineRefresh";
import { getAppMode } from "store/selectors";
import { Dropdown, Tooltip } from "antd";
import FEATURES from "config/constants/sub/features";
import WorkspaceAvatar from "features/workspaces/components/WorkspaceAvatar";
import { RQButton } from "lib/design-system-v2/components";
import { trackTopbarClicked } from "modules/analytics/events/common/onboarding/header";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { Invite } from "types";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import { WorkspacesOverlay } from "./WorkspacesOverlay/WorkspacesOverlay";
import {
  ApiClientViewMode,
  useApiClientMultiWorkspaceView,
} from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { MultiWorkspaceAvatarGroup } from "../MultiWorkspaceAvatarGroup";
import LocalWorkspaceAvatar from "features/workspaces/components/LocalWorkspaceAvatar";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { WorkspaceType } from "features/workspaces/types";

const prettifyWorkspaceName = (workspaceName: string) => {
  // if (workspaceName === APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE)
  //   return "Private";
  return workspaceName || "Unknown";
};

const WorkSpaceDropDown = ({ teamInvites }: { teamInvites: Invite[] }) => {
  // Global State
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const activeWorkspace = useSelector(getActiveWorkspace);
  const viewMode = useApiClientMultiWorkspaceView((s) => s.viewMode);

  // Local State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activeWorkspaceName = useMemo(() => {
    if (!activeWorkspace?.id) {
      return user.loggedIn ? "Private Workspace" : "Workspaces";
    } else {
      return activeWorkspace?.name;
    }
  }, [activeWorkspace?.id, activeWorkspace?.name, user.loggedIn]);

  const handleWorkspaceDropdownClick = (open: boolean) => {
    setIsDropdownOpen(open);
    if (open) {
      trackTopbarClicked("workspace");
    }
  };

  const handleLocalSyncRefresh = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    window.dispatchEvent(new Event("local-sync-refresh"));
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const tooltipTitle =
    activeWorkspace?.workspaceType === WorkspaceType.LOCAL
      ? viewMode === ApiClientViewMode.SINGLE
        ? activeWorkspace.rootPath
        : null
      : viewMode === ApiClientViewMode.MULTI
      ? null
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
        <div
          className="workspace-selector-dropdown__content"
          style={{ marginLeft: appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? "8px" : "0px" }}
        >
          <Tooltip
            overlayClassName="workspace-selector-tooltip"
            style={{ top: "35px" }}
            title={tooltipTitle}
            placement="right"
            showArrow={false}
            mouseEnterDelay={0.5}
            color="#000"
          >
            <div className="cursor-pointer items-center">
              {viewMode === ApiClientViewMode.MULTI ? (
                <MultiWorkspaceAvatarGroup />
              ) : (
                <>
                  {activeWorkspace?.workspaceType === WorkspaceType.LOCAL ? (
                    <>
                      <LocalWorkspaceAvatar
                        size={20}
                        workspace={{
                          ...activeWorkspace,
                          name: activeWorkspaceName ?? null,
                          workspaceType: activeWorkspace?.workspaceType ?? null,
                        }}
                      />
                    </>
                  ) : (
                    <WorkspaceAvatar
                      size={20}
                      workspace={{
                        ...activeWorkspace,
                        name: activeWorkspaceName ?? null,
                        workspaceType: activeWorkspace?.workspaceType ?? null,
                      }}
                    />
                  )}
                </>
              )}
              {viewMode === ApiClientViewMode.SINGLE && (
                <span className="items-center active-workspace-name">
                  <span className="active-workspace-text">{prettifyWorkspaceName(activeWorkspaceName)}</span>
                  <DownOutlined className="active-workspace-name-down-icon" />
                </span>
              )}
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
            icon={<MdOutlineRefresh />}
          />
        </Tooltip>
      ) : null}
    </>
  );
};

export default WorkSpaceDropDown;
