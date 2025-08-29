import { DownOutlined } from "@ant-design/icons";
import { MdOutlineRefresh } from "@react-icons/all-files/md/MdOutlineRefresh";
import { Dropdown, Tooltip } from "antd";
import FEATURES from "config/constants/sub/features";
import WorkspaceAvatar from "features/workspaces/components/WorkspaceAvatar";
import { RQButton } from "lib/design-system-v2/components";
import { trackTopbarClicked } from "modules/analytics/events/common/onboarding/header";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getActiveWorkspace, isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import { Invite, WorkspaceType } from "types";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import { WorkspacesOverlay } from "./WorkspacesOverlay/WorkspacesOverlay";
import {
  ApiClientViewMode,
  useApiClientMultiWorkspaceView,
} from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { MultiWorkspaceAvatarGroup } from "../MultiWorkspaceAvatarGroup";
import LocalWorkspaceAvatar from "features/workspaces/components/LocalWorkspaceAvatar";

const prettifyWorkspaceName = (workspaceName: string) => {
  // if (workspaceName === APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE)
  //   return "Private";
  return workspaceName || "Unknown";
};

const WorkSpaceDropDown = ({ teamInvites }: { teamInvites: Invite[] }) => {
  // Global State
  const activeWorkspace = useSelector(getActiveWorkspace);
  const viewMode = useApiClientMultiWorkspaceView((s) => s.viewMode);
  const isActiveWorkspaceNotPrivate = useSelector(isActiveWorkspaceShared);

  // Local State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activeWorkspaceName = isActiveWorkspaceNotPrivate ? activeWorkspace?.name : "Workspaces";

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
        <div className="workspace-selector-dropdown__content">
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
                        size={28}
                        workspace={{
                          ...activeWorkspace,
                          name: activeWorkspaceName ?? null,
                          workspaceType: activeWorkspace?.workspaceType ?? null,
                        }}
                      />
                    </>
                  ) : (
                    <WorkspaceAvatar
                      size={28}
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
