import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { RQButton } from "lib/design-system/components";
import { globalActions } from "store/slices/global/slice";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import { SOURCE } from "modules/analytics/events/common/constants";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import "./commonEmptyView.scss";
import { WorkspaceType } from "features/workspaces/types";

interface CommonEmptyViewProps {
  toggleDropdown: () => void;
}

export const CommonEmptyView: React.FC<CommonEmptyViewProps> = ({ toggleDropdown }) => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
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
    <div className="common-workspace-empty-view">
      <img src="/assets/media/common/empty-folder.svg" alt="empty folder" />
      <div className="common-workspace-empty-view__title">You don't have any workspaces yet.</div>
      <div className="common-workspace-empty-view__description">
        {appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP
          ? "Create a local workspace to store files on your device or a team workspace to collaborate with teammates."
          : "Create a team workspace to collaborate with teammates."}
      </div>
      <div className="common-workspace-empty-view__actions">
        <AuthConfirmationPopover
          placement="topRight"
          title="You need to signup to create a team workspace"
          source={SOURCE.WORKSPACE_DROPDOWN}
          callback={() => handleCreateWorkspace(WorkspaceType.SHARED)}
        >
          <RQButton
            type={appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? "primary" : "default"}
            className="common-workspace-empty-view__actions-button"
            size="small"
            onClick={() => {
              if (user.loggedIn) handleCreateWorkspace(WorkspaceType.SHARED);
            }}
          >
            New team workspace
          </RQButton>
        </AuthConfirmationPopover>
        {appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? (
          <RQButton size="small" type="primary" onClick={() => handleCreateWorkspace(WorkspaceType.LOCAL)}>
            New local workspace
          </RQButton>
        ) : null}
      </div>
    </div>
  );
};
