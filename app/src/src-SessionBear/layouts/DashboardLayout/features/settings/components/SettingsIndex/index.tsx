import React, { useEffect } from "react";
import { Col } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { trackAppSettingsViewed } from "features/settings/analytics";
import PATHS from "config/constants/sub/paths";
import { redirectToSessionSettings } from "utils/RedirectionUtils";
import SessionBearSettingsSidebar from "src-SessionBear/layouts/DashboardLayout/features/settings";
import "./index.scss";

export const SessionBearSettingsIndex: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;

  useEffect(() => {
    trackAppSettingsViewed(location.pathname, state?.source);
  }, [location.pathname, state?.source]);

  useEffect(() => {
    if (location.pathname === PATHS.SETTINGS.RELATIVE) {
      redirectToSessionSettings(navigate, window.location.pathname, "settings");
    }
  }, [navigate, location.pathname]);

  return (
    <div className="settings-index">
      <SessionBearSettingsSidebar />
      <Col className="settings-content-wrapper">
        <Col className="settings-content">
          <Outlet />
          <br />
        </Col>
      </Col>
    </div>
  );
};
