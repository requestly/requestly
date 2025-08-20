import React from "react";
import { RQButton } from "lib/design-system/components";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { WorkspaceType } from "types";
import { getAppMode } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import "./commonEmptyView.scss";

interface CommonEmptyViewProps {
  toggleDropdown: () => void;
}

export const CommonEmptyView: React.FC<CommonEmptyViewProps> = ({ toggleDropdown }) => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);

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
          onClick={() => {
            dispatch(
              globalActions.toggleActiveModal({
                modalName: "createWorkspaceModal",
                newValue: true,
                newProps: {
                  defaultWorkspaceType: WorkspaceType.SHARED,
                },
              })
            );
            toggleDropdown();
          }}
        >
          New team workspace
        </RQButton>
        {appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? (
          <RQButton
            size="small"
            type="primary"
            onClick={() => {
              dispatch(
                globalActions.toggleActiveModal({
                  modalName: "createWorkspaceModal",
                  newValue: true,
                  newProps: {
                    defaultWorkspaceType: WorkspaceType.LOCAL,
                  },
                })
              );
              toggleDropdown();
            }}
          >
            New local workspace
          </RQButton>
        ) : null}
      </div>
    </div>
  );
};
