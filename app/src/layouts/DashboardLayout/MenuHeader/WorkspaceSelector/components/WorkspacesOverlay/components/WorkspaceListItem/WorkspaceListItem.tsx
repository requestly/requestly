import React, { useCallback, useMemo } from "react";
import { Workspace, WorkspaceType } from "features/workspaces/types";
import WorkspaceAvatar from "features/workspaces/components/WorkspaceAvatar";
import { Checkbox, Tag, Tooltip, Typography } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineSettings } from "@react-icons/all-files/md/MdOutlineSettings";
import { redirectToTeam } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MdOutlinePersonAdd } from "@react-icons/all-files/md/MdOutlinePersonAdd";
import { globalActions } from "store/slices/global/slice";
import {
  trackInviteTeammatesClicked,
  trackManageWorkspaceClicked,
  trackMultiWorkspaceDeselected,
  trackMultiWorkspaceSelected,
} from "modules/analytics/events/common/teams";
import "./workspaceListItem.scss";
import {
  useGetAllSelectedWorkspaces,
  useViewMode,
  useWorkspaceViewActions,
} from "features/apiClient/slices/workspaceView/hooks";
import { getWorkspaceInfo } from "features/apiClient/slices/workspaceView/utils";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { ApiClientViewMode } from "features/apiClient/slices";

type WorkspaceItemProps =
  | {
      type: WorkspaceType.PERSONAL;
      toggleDropdown: () => void;
      onClick: (callback?: () => any) => void;
    }
  | {
      type: WorkspaceType.SHARED | WorkspaceType.LOCAL;
      workspace: Workspace;
      toggleDropdown: () => void;
      onClick: (callback?: () => any) => void;
    };

const ShareWorkspaceActions = ({
  workspaceId,
  toggleDropdown,
}: {
  workspaceId: Workspace["id"];
  toggleDropdown: () => void;
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const activeWorkspace = useSelector(getActiveWorkspace);
  const viewMode = useViewMode();

  const isPrivateWorkspace = activeWorkspace?.workspaceType === WorkspaceType.PERSONAL || workspaceId === null;

  const handleSendInvites = () => {
    dispatch(
      globalActions.toggleActiveModal({
        modalName: "inviteMembersModal",
        newValue: true,
        newProps: { source: "workspaces_dropdown", teamId: workspaceId },
      })
    );
    trackInviteTeammatesClicked("workspaces_dropdown");
    toggleDropdown();
  };

  return (
    <>
      {!isPrivateWorkspace && activeWorkspace.id === workspaceId && viewMode === ApiClientViewMode.SINGLE ? (
        <Tag className="workspace-list-item-active-tag">CURRENT</Tag>
      ) : null}
      <div className="shared-workspace-actions">
        <RQButton
          type="transparent"
          icon={<MdOutlinePersonAdd />}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleSendInvites();
          }}
        />
        <RQButton
          type="transparent"
          icon={<MdOutlineSettings />}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            redirectToTeam(navigate, workspaceId);
            toggleDropdown();
          }}
        />
      </div>
    </>
  );
};

const LocalWorkspaceActions = ({
  workspace,
  toggleDropdown,
  switchWorkspace,
}: {
  workspace: Workspace;
  toggleDropdown: () => void;
  switchWorkspace: (cb?: () => any) => void;
}) => {
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const activeWorkspace = useSelector(getActiveWorkspace);

  const viewMode = useViewMode();
  const selectedWorkspaces = useGetAllSelectedWorkspaces();
  const { workspaceViewManager } = useWorkspaceViewActions();

  const userId = user.details?.profile?.uid;

  const handleMultiWorkspaceCheckbox = useCallback(
    async (isChecked: boolean) => {
      const workspaceInfo = getWorkspaceInfo(workspace);

      if (isChecked) {
        await workspaceViewManager({ workspaces: [workspaceInfo], action: "add", userId });
        trackMultiWorkspaceSelected("workspace_selector_dropdown");
      } else {
        await workspaceViewManager({ workspaces: [workspaceInfo], action: "remove", userId });
        trackMultiWorkspaceDeselected("workspace_selector_dropdown");
      }
    },
    [workspace, workspaceViewManager, userId]
  );

  const isSelected = useMemo(() => selectedWorkspaces.some((w) => w.id === workspace.id), [
    selectedWorkspaces,
    workspace.id,
  ]);

  return (
    <>
      {activeWorkspace.id === workspace.id && viewMode === ApiClientViewMode.SINGLE ? (
        <Tag className="workspace-list-item-active-tag">CURRENT</Tag>
      ) : null}
      <div className="local-workspace-actions" onClick={(e) => e.stopPropagation()}>
        <Tooltip title="Settings" color="#000">
          <RQButton
            className="local-workspace-actions__settings-btn"
            type="transparent"
            icon={<MdOutlineSettings />}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              trackManageWorkspaceClicked("workspace_selector_dropdown");
              redirectToTeam(navigate, workspace.id);
              toggleDropdown();
            }}
          />
        </Tooltip>

        <Checkbox
          checked={isSelected && viewMode !== ApiClientViewMode.SINGLE}
          className="local-workspace-actions__checkbox"
          onChange={(e) => {
            handleMultiWorkspaceCheckbox(e.target.checked);
          }}
        />
      </div>
    </>
  );
};

export const WorkspaceItem: React.FC<WorkspaceItemProps> = (props) => {
  const { onClick, toggleDropdown } = props;

  const viewMode = useViewMode();
  const selectedWorkspaces = useGetAllSelectedWorkspaces();

  const getWorkspaceDetails = (workspace: Workspace) => {
    switch (workspace.workspaceType) {
      case WorkspaceType.SHARED: {
        const count =
          (workspace.members ? Object.keys(workspace.members).length : undefined) ?? workspace.membersCount ?? 0;
        return `${count} ${count === 1 ? "member" : "members"}`;
      }
      case WorkspaceType.LOCAL:
        return workspace.rootPath;
    }
  };

  const handleWorkspaceClick = useCallback(
    (callback?: () => any) => {
      onClick(callback);
      toggleDropdown();
    },
    [onClick, toggleDropdown]
  );

  if (props.type === WorkspaceType.PERSONAL) {
    return (
      <div className="workspace-overlay__list-item" onClick={() => handleWorkspaceClick()}>
        <WorkspaceAvatar
          size={32}
          workspace={{
            id: "private",
            name: "",
            workspaceType: WorkspaceType.PERSONAL,
          }}
        />
        <div className="workspace-overlay__list-item-details">
          <div className="workspace-list-item-name">Private Workspace</div>
        </div>
      </div>
    );
  }

  const { workspace } = props;
  const isMultiView = viewMode === ApiClientViewMode.MULTI;
  const isSelected = selectedWorkspaces.some((w) => w.id === workspace.id);
  const isWorkspaceSwitchDisabled = isMultiView && isSelected;

  return (
    <div
      className={`workspace-overlay__list-item ${isWorkspaceSwitchDisabled ? "disabled" : ""}  ${
        isMultiView ? "multi-mode" : "single-mode"
      } ${props.type === WorkspaceType.SHARED ? "workspace-overlay__list-item--shared" : ""} ${
        props.type === WorkspaceType.LOCAL ? "workspace-overlay__list-item--local" : ""
      }`}
      onClick={() => {
        if (isWorkspaceSwitchDisabled) {
          return;
        }

        handleWorkspaceClick();
      }}
    >
      <WorkspaceAvatar workspace={workspace} size={32} />
      <div className={`workspace-overlay__list-item-details ${isWorkspaceSwitchDisabled ? "disabled" : ""}`}>
        <div className="workspace-list-item-name">{workspace.name}</div>
        <Typography.Text
          className="workspace-list-item-info"
          type="secondary"
          ellipsis={{
            //TODO: add ellipsis in middle
            tooltip: {
              title: getWorkspaceDetails(workspace),
              color: "#000",
              placement: "right",
              mouseEnterDelay: 0.5,
            },
          }}
        >
          {getWorkspaceDetails(workspace)}
        </Typography.Text>
      </div>
      <div className="workspace-overlay__list-item-actions">
        {props.type === WorkspaceType.SHARED ? (
          <ShareWorkspaceActions workspaceId={workspace.id} toggleDropdown={props.toggleDropdown} />
        ) : props.type === WorkspaceType.LOCAL ? (
          <LocalWorkspaceActions
            workspace={workspace}
            toggleDropdown={props.toggleDropdown}
            switchWorkspace={handleWorkspaceClick}
          />
        ) : null}
      </div>
    </div>
  );
};
