import React from "react";
import { Workspace } from "features/workspaces/types";
import WorkspaceAvatar from "features/workspaces/components/WorkspaceAvatar";
import { WorkspaceType } from "types";
import { Tag, Tooltip, Typography } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineSettings } from "@react-icons/all-files/md/MdOutlineSettings";
import { redirectToTeam } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { MdOutlinePersonAdd } from "@react-icons/all-files/md/MdOutlinePersonAdd";
import { globalActions } from "store/slices/global/slice";
import "./workspaceItem.scss";
import { trackInviteTeammatesClicked } from "modules/analytics/events/common/teams";

type WorkspaceItemProps =
  | {
      type: WorkspaceType.PERSONAL;
      toggleDropdown: () => void;
      onClick: () => void;
    }
  | {
      type: WorkspaceType.SHARED | WorkspaceType.LOCAL;
      workspace: Workspace;
      toggleDropdown: () => void;
      onClick: () => void;
    };

const ShareWorkspaceActions = ({
  workspaceId,
  toggleDropdown,
}: {
  workspaceId: string;
  toggleDropdown: () => void;
}) => {
  const activeWorkspace = useSelector(getActiveWorkspace);
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
      {activeWorkspace.id === workspaceId ? <Tag className="workspace-list-item-active-tag">CURRENT</Tag> : null}
      <div className="shared-workspace-actions">
        <RQButton type="transparent" icon={<MdOutlinePersonAdd />} size="small" onClick={handleSendInvites} />
        <RQButton
          type="transparent"
          icon={<MdOutlineSettings />}
          size="small"
          onClick={() => {
            redirectToTeam(navigate, workspaceId);
            toggleDropdown();
          }}
        />
      </div>
    </>
  );
};

const LocalWorkspaceActions = ({
  workspaceId,
  toggleDropdown,
}: {
  workspaceId: string;
  toggleDropdown: () => void;
}) => {
  const navigate = useNavigate();
  return (
    <div className="local-workspace-actions">
      <Tooltip title="Settings" color="#000">
        <RQButton
          className="local-workspace-actions__settings-btn"
          type="transparent"
          icon={<MdOutlineSettings />}
          size="small"
          onClick={() => {
            redirectToTeam(navigate, workspaceId);
            toggleDropdown();
          }}
        />
      </Tooltip>
    </div>
  );
};

export const WorkspaceItem: React.FC<WorkspaceItemProps> = (props) => {
  const getWorkspaceDetails = (workspace: Workspace) => {
    switch (workspace.workspaceType) {
      case WorkspaceType.SHARED:
        return `${Object.keys(workspace.members).length} members`;
      case WorkspaceType.LOCAL:
        return workspace.rootPath;
    }
  };

  const handleWorkspaceClick = () => {
    props.onClick();
    props.toggleDropdown();
  };

  if (props.type === WorkspaceType.PERSONAL) {
    return (
      <div className="workspace-overlay__list-item" onClick={handleWorkspaceClick}>
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
  return (
    <div
      className={`workspace-overlay__list-item ${
        props.type === WorkspaceType.SHARED ? "workspace-overlay__list-item--shared" : ""
      } ${props.type === WorkspaceType.LOCAL ? "workspace-overlay__list-item--local" : ""}`}
      onClick={handleWorkspaceClick}
    >
      <WorkspaceAvatar workspace={workspace} size={32} />
      <div className="workspace-overlay__list-item-details">
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
          <LocalWorkspaceActions workspaceId={workspace.id} toggleDropdown={props.toggleDropdown} />
        ) : null}
      </div>
    </div>
  );
};
