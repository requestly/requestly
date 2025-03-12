import React from "react";
import { RQButton } from "lib/design-system-v2/components";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getCurrentlyActiveWorkspace, getIsWorkspaceMode } from "store/features/teams/selectors";
import { redirectToTeam, redirectToWorkspaceSettings } from "utils/RedirectionUtils";
import "./rbacEmptyState.scss";

interface Props {
  title: string;
  description: string;
}

export const RBACEmptyState: React.FC<Props> = ({ title, description }) => {
  const navigate = useNavigate();
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

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
          if (isWorkspaceMode) {
            redirectToTeam(navigate, currentlyActiveWorkspace.id);
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
