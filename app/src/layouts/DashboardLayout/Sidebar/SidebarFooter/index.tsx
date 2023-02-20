import { PlusOutlined } from "@ant-design/icons";
import { Button, Row, Tooltip } from "antd";
import { trackInviteTeammatesClicked } from "modules/analytics/events/common/teams";
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getIsWorkspaceMode,
  getCurrentlyActiveWorkspace,
} from "store/features/teams/selectors";
import { redirectToMyTeams, redirectToTeam } from "utils/RedirectionUtils";

interface SidebarFooterProps {
  collapsed: boolean;
  handleMobileSidebarClose?: () => void;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({
  collapsed,
  handleMobileSidebarClose,
}) => {
  const navigate = useNavigate();
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  const handleInviteTeammatesClick = () => {
    trackInviteTeammatesClicked("sidebar_footer");
    if (isWorkspaceMode) {
      redirectToTeam(navigate, currentlyActiveWorkspace.id);
    } else {
      redirectToMyTeams(navigate, false);
    }
    handleMobileSidebarClose();
  };

  return (
    <Row className="sidebar-footer">
      <Tooltip
        placement="right"
        title="Invite teammates"
        //@ts-ignore
        disabled={!collapsed}
      >
        <Button
          type="text"
          title="Invite teammates"
          onClick={handleInviteTeammatesClick}
          className={`sidebar-footer-invite-btn ${
            collapsed ? "siderbar-footer-invite-btn-collapsed" : ""
          }`}
        >
          <PlusOutlined className="sidebar-footer-plus-icon" />
          {collapsed ? null : "Invite teammates"}
        </Button>
      </Tooltip>
    </Row>
  );
};

export default SidebarFooter;
