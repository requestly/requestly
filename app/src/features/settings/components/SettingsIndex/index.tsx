import React, { useEffect } from "react";
import { Col } from "antd";
import { SettingsPrimarySidebar } from "../SettingsPrimarySidebar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { trackAppSettingsViewed } from "features/settings/analytics";
import PATHS from "config/constants/sub/paths";
import { redirectToProfileSettings } from "utils/RedirectionUtils";
import "./index.scss";

const SettingsIndex: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;

  useEffect(() => {
    trackAppSettingsViewed(location.pathname, state?.source);
  }, [location.pathname, state?.source]);

  useEffect(() => {
    if (location.pathname === PATHS.SETTINGS.RELATIVE) {
      redirectToProfileSettings(navigate, window.location.pathname, "settings");
    }
  }, [navigate, location.pathname]);

  return (
    <div className="settings-index">
      <SettingsPrimarySidebar />
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
