import React from "react";
import { Col } from "antd";
import { SettingsPrimarySidebar } from "../SettingsPrimarySidebar";
import { Outlet } from "react-router-dom";
import "./index.scss";

const SettingsIndex: React.FC = () => {
  return (
    <div className="settings-index">
      <SettingsPrimarySidebar />
      <Col className="settings-content-wrapper">
        <Col className="settings-content">
          <Outlet />
        </Col>
      </Col>
    </div>
  );
};

export default SettingsIndex;
