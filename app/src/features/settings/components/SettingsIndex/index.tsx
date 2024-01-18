import React, { useMemo } from "react";
import { Col } from "antd";
import { SettingsPrimarySidebar } from "../SettingsPrimarySidebar";
import { SettingsSecondarySidebar } from "../SettingsSecondarySidebar";
import { BillingTeamsSidebar } from "../BillingTeam/components/BillingTeamsSidebar";
import { Outlet, useLocation } from "react-router-dom";
import APP_CONSTANTS from "config/constants";
import "./index.scss";
import { useBillingTeamsListener } from "backend/billing/hooks/useBillingTeamsListener";
import { useSelector } from "react-redux";
import { getAvailableBillingTeams } from "store/features/billing/selectors";

const SettingsIndex: React.FC = () => {
  // TODO: FIX THIS
  const location = useLocation();
  useBillingTeamsListener();

  const billingTeams = useSelector(getAvailableBillingTeams);

  const secondarySideBarItems = useMemo(() => {
    switch (true) {
      case location.pathname.includes(APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE) && billingTeams.length > 1:
        return (
          <BillingTeamsSidebar
            billingTeams={billingTeams.map((billingTeam) => ({ id: billingTeam.id, name: billingTeam.name }))}
          />
        );
      default:
        return null;
    }
  }, [billingTeams, location.pathname]);

  // FETCH BILLING TEAMS HERE

  return (
    <div className="settings-index">
      <div className="settings-index-sidebar-wrapper">
        <SettingsPrimarySidebar />
        <SettingsSecondarySidebar>{secondarySideBarItems}</SettingsSecondarySidebar>
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
