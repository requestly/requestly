import React, { useEffect } from "react";
import { Col } from "antd";
import { SettingsPrimarySidebar } from "../SettingsPrimarySidebar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { redirectToGlobalSettings } from "utils/RedirectionUtils";
import APP_CONSTANTS from "config/constants";
import "./index.scss";

const SettingsIndex: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === APP_CONSTANTS.PATHS.SETTINGS.RELATIVE) {
      redirectToGlobalSettings(navigate);
    }
  }, [location.pathname, navigate]);

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
