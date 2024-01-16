import React from "react";
import { Col } from "antd";
import { SettingsPrimarySidebar } from "../SettingsPrimarySidebar";
import { SettingsSecondarySidebar } from "../SettingsSecondarySidebar";
import { Outlet, useLocation } from "react-router-dom";
import "./index.scss";

const SettingsIndex: React.FC = () => {
  // TODO: FIX THIS
  const location = useLocation();
  const isSecondarySidebarVisible = location.pathname.includes("billing");

  return (
    <div className="settings-index">
      <div className="settings-index-sidebar-wrapper">
        <SettingsPrimarySidebar />
        {isSecondarySidebarVisible && <SettingsSecondarySidebar>Billing</SettingsSecondarySidebar>}
      </div>
      <Col className="settings-content-wrapper">
        <Col className="settings-content">
          <Outlet />
          <br />
        </Col>
      </Col>
    </div>
  );
};

export default SettingsIndex;
