import React from "react";
import { Workspace } from "features/workspaces/types";
import { WorkspaceType } from "types";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { RQButton } from "lib/design-system-v2/components";
import { WorkspaceItem } from "../WorkspaceListItem/WorkspaceListItem";
import "./workspaceList.scss";

interface WorkspaceListProps {
  workspaces: Workspace[];
  type: WorkspaceType;
  toggleDropdown: () => void;
  onItemClick: (workspace: Workspace) => void;
  onAddWorkspaceClick: () => void;
}

export const WorkspaceList: React.FC<WorkspaceListProps> = ({
  workspaces,
  type,
  toggleDropdown,
  onItemClick,
  onAddWorkspaceClick,
}) => {
  const getListTitle = () => {
    switch (type) {
      case WorkspaceType.LOCAL:
        return `Local workspaces (${workspaces.length})`;
      case WorkspaceType.SHARED:
        return `Team workspaces (${workspaces.length})`;
    }
  };

  return (
    <div className="workspace-overlay__list">
      <div className="workspace-overlay__list-header">
        <div className="workspace-overlay__list-header-title">{getListTitle()}</div>
        <RQButton
          size="small"
          type="transparent"
          icon={<MdAdd />}
          onClick={() => {
            onAddWorkspaceClick();
            toggleDropdown();
          }}
        >
          Add
        </RQButton>
      </div>
      <div className="workspace-overlay__list-content">
        {workspaces.map((workspace) => (
          <WorkspaceItem
            key={workspace.id}
            workspace={workspace}
            type={type}
            toggleDropdown={toggleDropdown}
            onClick={() => onItemClick(workspace)}
          />
        ))}
      </div>
    </div>
  );
};
