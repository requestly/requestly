import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getAppMode } from "store/selectors";
import { RQButton } from "lib/design-system/components";
import { globalActions } from "store/slices/global/slice";
import { WorkspaceType } from "types";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import "./commonEmptyView.scss";
import APP_CONSTANTS from "config/constants";

interface CommonEmptyViewProps {
  toggleDropdown: () => void;
}

export const CommonEmptyView: React.FC<CommonEmptyViewProps> = ({ toggleDropdown }) => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);

  const handleCreateWorkspace = (type: WorkspaceType) => {
    if (!user.loggedIn) {
      dispatch(
        globalActions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
          },
        })
      );
      toggleDropdown();
      return;
    }
    dispatch(
      globalActions.toggleActiveModal({
        modalName: "createWorkspaceModal",
        newValue: true,
        newProps: {
          defaultWorkspaceType: type,
        },
      })
    );
    toggleDropdown();
  };

  return (
    <div className="common-workspace-empty-view">
      <img src="/assets/media/common/empty-folder.svg" alt="empty folder" />
      <div className="common-workspace-empty-view__title">You don’t have any workspaces yet.</div>
      <div className="common-workspace-empty-view__description">
        {appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP
          ? "Create a local workspace to store files on your device or a team workspace to collaborate with teammates."
          : "Create a team workspace to collaborate with teammates."}
      </div>
      <div className="common-workspace-empty-view__actions">
        <RQButton
          type={appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? "primary" : "default"}
          className="common-workspace-empty-view__actions-button"
          size="small"
          onClick={() => handleCreateWorkspace(WorkspaceType.SHARED)}
        >
          New team workspace
        </RQButton>
        {appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? (
          <RQButton size="small" type="primary" onClick={() => handleCreateWorkspace(WorkspaceType.LOCAL)}>
            New local workspace
          </RQButton>
        ) : null}
      </div>
    </div>
  );
};
