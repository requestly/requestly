import React, { useMemo, useEffect } from "react";
import { Col } from "antd";
import { SettingsPrimarySidebar } from "../SettingsPrimarySidebar";
import { SettingsSecondarySidebar } from "../SettingsSecondarySidebar";
import { BillingTeamsSidebar } from "../BillingTeam/components/BillingTeamsSidebar";
import { Outlet, useLocation } from "react-router-dom";
import APP_CONSTANTS from "config/constants";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { getAvailableBillingTeams } from "store/features/billing/selectors";
import { trackAppSettingsViewed } from "features/settings/analytics";
import "./index.scss";

const SettingsIndex: React.FC = () => {
  const location = useLocation();
  const { state } = location;
  const user = useSelector(getUserAuthDetails);
  const billingTeams = useSelector(getAvailableBillingTeams);

  const isBillingTeamSidebarVisible = useMemo(() => {
    /* Billing sidebar will be visible if there are more than 1 billing teams 
       or if there is only 1 billing team and the user is not a member of that team
    */
    if (
      billingTeams.length > 1 ||
      (billingTeams.length === 1 && billingTeams.some((team) => !(user?.details?.profile?.uid in team.members)))
    ) {
      return true;
    }
    return false;
  }, [billingTeams, user?.details?.profile?.uid]);

  const secondarySideBarItems = useMemo(() => {
    switch (true) {
      case location.pathname.includes(APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE) && isBillingTeamSidebarVisible:
        return <BillingTeamsSidebar billingTeams={billingTeams} />;
      default:
        return null;
    }
  }, [billingTeams, location.pathname, isBillingTeamSidebarVisible]);

  useEffect(() => {
    trackAppSettingsViewed(location.pathname, state?.source);
  }, [location.pathname, state?.source]);

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
