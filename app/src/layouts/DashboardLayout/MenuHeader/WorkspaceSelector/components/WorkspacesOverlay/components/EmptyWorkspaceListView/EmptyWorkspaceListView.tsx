import React from "react";
import { RQButton } from "lib/design-system/components";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import { SOURCE } from "modules/analytics/events/common/constants";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import "./emptyWorkspaceListView.scss";
import { WorkspaceType } from "features/workspaces/types";

interface EmptyWorkspaceListProps {
  workspaceType: WorkspaceType;
  toggleDropdown: () => void;
}

export const EmptyWorkspaceListView: React.FC<EmptyWorkspaceListProps> = ({ workspaceType, toggleDropdown }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);

  const handleCreateWorkspace = (type: WorkspaceType) => {
    dispatch(
      globalActions.toggleActiveModal({
        modalName: "createWorkspaceModal",
        newValue: true,
        newProps: {
          workspaceType: type,
          source: "workspace_dropdown",
        },
      })
    );
    toggleDropdown();
  };

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
          {workspaceType === WorkspaceType.SHARED ? (
            // TODO: Refactor AuthConfirmationPopover, still required to use onClick when method on children for loggedIn cases
            <AuthConfirmationPopover
              placement="topRight"
              title="You need to signup to create a team workspace"
              source={SOURCE.WORKSPACE_DROPDOWN}
              callback={() => handleCreateWorkspace(WorkspaceType.SHARED)}
            >
              <RQButton
                size="small"
                onClick={() => {
                  if (user.loggedIn) {
                    handleCreateWorkspace(WorkspaceType.SHARED);
                  }
                }}
              >
                {workspaceType === WorkspaceType.SHARED ? "Create a team workspace" : "Create a local workspace"}
              </RQButton>
            </AuthConfirmationPopover>
          ) : (
            <RQButton size="small" onClick={() => handleCreateWorkspace(WorkspaceType.LOCAL)}>
              Create a local workspace
            </RQButton>
          )}
        </div>
      </div>
    </div>
  );
};
