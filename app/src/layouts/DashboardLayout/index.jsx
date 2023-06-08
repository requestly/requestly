import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { isPricingPage, isGoodbyePage, isInvitePage } from "utils/PathUtils.js";
import { getAppMode, getUserPersonaSurveyDetails } from "store/selectors";
import Footer from "../../components/sections/Footer/index";
import DashboardContent from "./DashboardContent";
import { Sidebar } from "./SidebarV2";
import MenuHeader from "./MenuHeader";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import PATHS from "config/constants/sub/paths";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  const location = useLocation();
  const { pathname } = location;
  const appMode = useSelector(getAppMode);
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const isPersonaRecommendationScreen = userPersona.page === 4 && !userPersona.isSurveyCompleted;

  // Component State
  const [visible, setVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const AppFooter = () => {
    return appMode && appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? null : pathname.includes(
        PATHS.RULES.MY_RULES.ABSOLUTE
      ) ||
      pathname.includes(PATHS.PRICING.ABSOLUTE) ||
      pathname.includes(PATHS.HOME.ABSOLUTE) ? (
      <Footer />
    ) : null;
  };

  const isSidebarVisible = useMemo(
    () =>
      !(isPricingPage(pathname) || isGoodbyePage(pathname) || isInvitePage(pathname) || isPersonaRecommendationScreen),
    [pathname, isPersonaRecommendationScreen]
  );

  const isPricingOrGoodbyePage = isPricingPage() || isGoodbyePage() || isInvitePage();

  return (
    <>
      <div className="app-layout app-dashboard-layout">
        <div className="app-header">{!isPersonaRecommendationScreen && <MenuHeader />}</div>

        <div className="app-sidebar">
          {isSidebarVisible && (
            <Sidebar visible={visible} setVisible={setVisible} collapsed={collapsed} setCollapsed={setCollapsed} />
          )}
        </div>

        <div className="app-main-content">
          <DashboardContent />
        </div>

        <div className="app-footer">
          <AppFooter />
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
