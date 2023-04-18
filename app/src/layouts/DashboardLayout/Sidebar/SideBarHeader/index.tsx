import React, { useCallback } from "react";
import { Button, Col, Row } from "antd";
import { ReactComponent as RightChevron } from "assets/icons/chevron-right.svg";
import { ReactComponent as LeftChevron } from "assets/icons/chevron-left.svg";
import WorkspaceSelector from "../WorkspaceSelector";
import { trackSidebarClicked } from "modules/analytics/events/common/onboarding/sidebar";

interface SideBarHeaderProps {
  collapsed: boolean;
  isMobileMenu?: boolean;
  setCollapsed: (collapsed: boolean) => void;
  handleMobileSidebarClose?: () => void;
}

const SideBarHeader: React.FC<SideBarHeaderProps> = ({
  collapsed,
  isMobileMenu = false,
  setCollapsed = () => {},
  handleMobileSidebarClose = () => {},
}) => {
  const toggle = () => {
    localStorage.setItem("collapsed-sidebar", `${!collapsed}`);
    setCollapsed(!collapsed);
    trackSidebarClicked("collapse_button");
  };

  const handleSidebarCollapsed = useCallback(
    (collapsed: boolean) => {
      localStorage.setItem("collapsed-sidebar", `${collapsed}`);
      setCollapsed(collapsed);
    },
    [setCollapsed]
  );

  return (
    <Row align="middle" className={`siderbar-header ${collapsed ? "sidebar-header-collapsed" : ""}`}>
      <Col>
        <WorkspaceSelector
          isCollapsed={collapsed}
          handleSidebarCollapsed={handleSidebarCollapsed}
          handleMobileSidebarClose={handleMobileSidebarClose}
        />
      </Col>

      {!isMobileMenu && (
        <div className="ml-auto sidebar-collapse-btn-container">
          <Button
            type="text"
            icon={collapsed ? <RightChevron className="trigger" /> : <LeftChevron className="trigger" />}
            onClick={toggle}
            className="siderbar-collapse-btn"
          />
        </div>
      )}
    </Row>
  );
};

export default SideBarHeader;
