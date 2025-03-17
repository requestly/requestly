import React from "react";
import { Menu, Tag, Tooltip } from "antd";
import WorkspaceAvatar from "features/workspaces/components/WorkspaceAvatar";
import { Workspace } from "features/workspaces/types";
import { isPersonalWorkspaceId } from "features/workspaces/utils";
import { trackWorkspaceDropdownClicked } from "modules/analytics/events/common/teams";
import { useSelector } from "react-redux";
import "./WorkSpaceSelector.css";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";

interface Props {
  workspace: Workspace;
  handleWorkspaceSwitch: (workspace: Workspace) => void;
}

const WorkspaceItem: React.FC<Props> = ({ workspace, handleWorkspaceSwitch, ...props }) => {
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const isWorkspaceActive = activeWorkspaceId === workspace?.id;

  return (
    <Menu.Item
      disabled={!!workspace.archived || isWorkspaceActive}
      icon={<WorkspaceAvatar workspace={workspace} />}
      className={`workspace-menu-item ${isWorkspaceActive ? "active-workspace-dropdownItem" : ""}`}
      onClick={() => {
        handleWorkspaceSwitch(workspace);
        trackWorkspaceDropdownClicked("switch_workspace");
      }}
      {...props}
    >
      <Tooltip
        placement="right"
        overlayInnerStyle={{ width: "178px" }}
        title={workspace.archived ? "This workspace has been archived." : ""}
      >
        <div className="workspace-item-wrapper">
          <div
            className={`workspace-name-container ${
              workspace.archived || isWorkspaceActive ? "archived-workspace-item" : ""
            }`}
          >
            <div className="workspace-name">{workspace.name}</div>
            {isPersonalWorkspaceId(workspace.id) ? null : (
              <div className="text-gray workspace-details">
                {workspace.subscriptionStatus ? `${workspace.subscriptionStatus} • ` : null}
                {workspace.accessCount} {workspace.accessCount > 1 ? "members" : "member"}
              </div>
            )}
          </div>
          {workspace.archived ? (
            <Tag color="gold">archived</Tag>
          ) : isWorkspaceActive ? (
            <Tag color="green">current</Tag>
          ) : null}
        </div>
      </Tooltip>
    </Menu.Item>
  );
};

export default WorkspaceItem;
