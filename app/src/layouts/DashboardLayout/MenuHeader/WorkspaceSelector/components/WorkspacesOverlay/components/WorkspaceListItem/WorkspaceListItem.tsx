import React, { useCallback, useMemo } from "react";
import { Workspace } from "features/workspaces/types";
import WorkspaceAvatar from "features/workspaces/components/WorkspaceAvatar";
import { WorkspaceType } from "types";
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
  ApiClientViewMode,
  useApiClientMultiWorkspaceView,
} from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { toast } from "utils/Toast";
import { addWorkspaceToView, removeWorkspaceFromView } from "features/apiClient/commands/multiView";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";

type WorkspaceItemProps = {
  type: WorkspaceType;
  workspace: Workspace;
  toggleDropdown: () => void;
  onClick: () => void;
};

const PersonalWorkspaceActions = ({
  workspaceId,
  toggleDropdown,
}: {
  workspaceId: string;
  toggleDropdown: () => void;
}) => {
  const navigate = useNavigate();
  const activeWorkspace = useSelector(getActiveWorkspace);
  const [viewMode] = useApiClientMultiWorkspaceView((s) => [s.viewMode]);

  return (
    <>
      {activeWorkspace.id === workspaceId && viewMode === ApiClientViewMode.SINGLE ? (
        <Tag className="workspace-list-item-active-tag">CURRENT</Tag>
      ) : null}
      <div className="personal-workspace-actions">
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

const ShareWorkspaceActions = ({
  workspaceId,
  toggleDropdown,
}: {
  workspaceId: string;
  toggleDropdown: () => void;
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const activeWorkspace = useSelector(getActiveWorkspace);
  const [viewMode] = useApiClientMultiWorkspaceView((s) => [s.viewMode]);

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
      {activeWorkspace.id === workspaceId && viewMode === ApiClientViewMode.SINGLE ? (
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
  switchWorkspace: () => void;
}) => {
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const activeWorkspace = useSelector(getActiveWorkspace);

  const [selectedWorkspaces, getViewMode, getAllSelectedWorkspaces] = useApiClientMultiWorkspaceView((s) => [
    s.selectedWorkspaces,
    s.getViewMode,
    s.getAllSelectedWorkspaces,
  ]);

  const handleMultiworkspaceAdder = useCallback(
    async (isChecked: boolean) => {
      try {
        if (isChecked) {
          await addWorkspaceToView(workspace, user.details?.profile?.uid);
          trackMultiWorkspaceSelected("workspace_selector_dropdown");
        } else {
          if (getViewMode() === ApiClientViewMode.MULTI && getAllSelectedWorkspaces().length === 1) {
            switchWorkspace();
          } else {
            removeWorkspaceFromView(workspace.id);
          }

          trackMultiWorkspaceDeselected("workspace_selector_dropdown");
        }
      } catch (e) {
        toast.error(e.message);
      }
    },
    [workspace, user.details?.profile?.uid, getViewMode, getAllSelectedWorkspaces, switchWorkspace]
  );

  const isSelected = useMemo(() => selectedWorkspaces.some((w) => w.getState().id === workspace.id), [
    selectedWorkspaces,
    workspace.id,
  ]);

  return (
    <>
      {activeWorkspace.id === workspace.id && getViewMode() === ApiClientViewMode.SINGLE ? (
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
          checked={isSelected}
          className="local-workspace-actions__checkbox"
          onChange={(e) => {
            handleMultiworkspaceAdder(e.target.checked);
          }}
        />
      </div>
    </>
  );
};

export const WorkspaceItem: React.FC<WorkspaceItemProps> = (props) => {
  const { onClick, toggleDropdown } = props;

  const [viewMode, selectedWorkspaces] = useApiClientMultiWorkspaceView((s) => [s.viewMode, s.selectedWorkspaces]);

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

  const handleWorkspaceClick = useCallback(() => {
    onClick();
    toggleDropdown();
  }, [onClick, toggleDropdown]);

  const { workspace } = props;
  const isMultiView = viewMode === ApiClientViewMode.MULTI;
  const isSelected = selectedWorkspaces.some((w) => w.getState().id === workspace.id);
  const isWorkspaceSwitchDisabled = isMultiView && isSelected;

  return (
    <div
      className={`workspace-overlay__list-item ${isWorkspaceSwitchDisabled ? "disabled" : ""}  ${
        isMultiView ? "multi-mode" : "single-mode"
      }  workspace-overlay__list-item--${props.type?.toLowerCase()}`}
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
        {props.type !== WorkspaceType.PERSONAL && (
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
        )}
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
        ) : props.type === WorkspaceType.PERSONAL ? (
          <PersonalWorkspaceActions workspaceId={workspace.id} toggleDropdown={props.toggleDropdown} />
        ) : null}
      </div>
    </div>
  );
};
