import React from "react";
import { RQButton } from "lib/design-system/components";
import { WorkspaceType } from "types";
import "./emptyWorkspaceListView.scss";
import { useDispatch } from "react-redux";
import { globalActions } from "store/slices/global/slice";

interface EmptyWorkspaceListProps {
  workspaceType: WorkspaceType;
  toggleDropdown: () => void;
}

export const EmptyWorkspaceListView: React.FC<EmptyWorkspaceListProps> = ({ workspaceType, toggleDropdown }) => {
  const dispatch = useDispatch();

  return (
    <div className="empty-workspace-list-view">
      <div className="empty-workspace-list-view__title">
        {workspaceType === WorkspaceType.SHARED ? "Team workspaces" : "Local workspaces"}
      </div>
      <div className="empty-workspace-list-view__content">
        <img src="/assets/media/common/empty-folder.svg" alt="empty-folder" />
        <div className="empty-workspace-list-view__content-body">
          <div className="empty-workspace-list-body-description">
            {workspaceType === WorkspaceType.SHARED
              ? " Create or join team workspaces to collaborate with your teammates in real time. You'll need an account to get started."
              : "No local workspaces are available. Local workspaces store files on your device. Only API client files are supported."}
          </div>
          <RQButton
            size="small"
            onClick={() => {
              dispatch(
                globalActions.toggleActiveModal({
                  modalName: "createWorkspaceModal",
                  newValue: true,
                  newProps: {
                    workspaceType,
                    source: "workspace_dropdown",
                  },
                })
              );
              toggleDropdown();
            }}
          >
            {workspaceType === WorkspaceType.SHARED ? "Create a team workspace" : "Create a local workspace"}
          </RQButton>
        </div>
      </div>
    </div>
  );
};
