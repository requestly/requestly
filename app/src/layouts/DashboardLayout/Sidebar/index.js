import React, { useEffect, useState } from "react";
import { Layout, Row } from "antd";
import { useLocation } from "react-router-dom";
import MenuItem from "./MenuItem";
import MenuMobile from "./MenuMobile";
// import MenuFooter from "./MenuFooter";
import APP_CONSTANTS from "config/constants";
import SideBarHeader from "./SideBarHeader";
import SidebarFooter from "./SidebarFooter";
import { useSelector } from "react-redux";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import ProductAnnouncement from "./ProductAnnouncement";
import featureFlag from "utils/feature-flag";
import "./Sidebar.css";

const { Sider } = Layout;

const Sidebar = ({ visible, setVisible, collapsed, setCollapsed }) => {
  const location = useLocation();
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const [checkedCollapseState, setCheckedCollapseState] = useState(false);

  // Mobile Sidebar
  const onClose = () => {
    setVisible(false);
  };

  useEffect(() => {
    if (location.pathname === APP_CONSTANTS.PATHS.RULES.CREATE) {
      if (isWorkspaceMode) setCollapsed(true); // Collapse for only users who are aware of workspace. Since collapsing hides workspace selector
      setCheckedCollapseState(true);
    }
  }, [isWorkspaceMode, location, setCollapsed]);

  useEffect(() => {
    if (localStorage.getItem("collapsed-sidebar") === "true") {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
    setCheckedCollapseState(true);
  }, [setCollapsed]);

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={200}
      collapsedWidth={60}
      className={`sidebar ${collapsed ? "sidebar-collapsed-container" : ""}`}
    >
      <Row align="bottom" justify="space-between">
        <SideBarHeader collapsed={collapsed} setCollapsed={setCollapsed} />
      </Row>
      <MenuItem onClose={onClose} collapsed={collapsed} />
      <div className="mt-auto">
        <Row className="sidebar-announcement">
          {featureFlag.getValue(
            APP_CONSTANTS.FEATURES.OPEN_SOURCE_ANNOUNCEMENT,
            false
          ) &&
          checkedCollapseState &&
          !collapsed ? (
            <ProductAnnouncement />
          ) : null}
        </Row>

        <SidebarFooter collapsed={collapsed} />
      </div>
      <MenuMobile onClose={onClose} visible={visible} />
    </Sider>
  );
};

export default Sidebar;
