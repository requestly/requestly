import React, { createElement } from "react";
import { Button, Col, Row } from "antd";
import { RiMenuFoldLine, RiMenuUnfoldLine } from "react-icons/ri";
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
  setCollapsed,
  isMobileMenu = false,
  handleMobileSidebarClose = () => {},
}) => {
  const toggle = () => {
    localStorage.setItem("collapsed-sidebar", `${!collapsed}`);
    setCollapsed(!collapsed);
    trackSidebarClicked("collapse_button");
  };

  const trigger = createElement(collapsed ? RiMenuUnfoldLine : RiMenuFoldLine, {
    className: "trigger",
  });

  return (
    <Row
      align="middle"
      className={`siderbar-header ${
        collapsed ? "sidebar-header-collapsed" : ""
      }`}
    >
      <Col>
        <WorkspaceSelector
          isCollapsed={collapsed}
          handleMobileSidebarClose={handleMobileSidebarClose}
        />
      </Col>

      {!isMobileMenu && (
        <Col className="ml-auto">
          <Button
            type="text"
            icon={trigger}
            onClick={toggle}
            className="siderbar-collapse-btn"
          />
        </Col>
      )}
    </Row>
  );
};

export default SideBarHeader;
