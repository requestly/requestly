import React from "react";
import { RQButton } from "lib/design-system-v2/components";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { redirectToTeam, redirectToWorkspaceSettings } from "utils/RedirectionUtils";
import "./rbacEmptyState.scss";
import { getActiveWorkspaceId, isActiveWorkspaceShared } from "store/slices/workspaces/selectors";

interface Props {
  title: string;
  description: string;
}

export const RBACEmptyState: React.FC<Props> = ({ title, description }) => {
  const navigate = useNavigate();
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);

  return (
    <div className="rbac-empty-state-container">
      <img width={80} height={80} src={"/assets/media/rbac/empty-state.svg"} alt="Empty state" />
      <div className="content">
        <div className="title">{title}</div>
        <div className="description">{description}</div>
      </div>

      <RQButton
        type="secondary"
        onClick={() => {
          // TODO: add analytics
          if (isSharedWorkspaceMode) {
            redirectToTeam(navigate, activeWorkspaceId);
          } else {
            redirectToWorkspaceSettings(navigate, window.location.pathname, "rbac_empty_state");
          }
        }}
      >
        See workspace settings
      </RQButton>
    </div>
  );
};
