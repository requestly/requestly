import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { isPricingPage, isGoodbyePage, isInvitePage } from "utils/PathUtils.js";
import { getAppMode, getUserPersonaSurveyDetails } from "store/selectors";
import Footer from "../../components/sections/Footer";
import DashboardContent from "./DashboardContent";
import { Sidebar } from "./Sidebar";
import MenuHeader from "./MenuHeader";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { useGoogleOneTapLogin } from "hooks/useGoogleOneTapLogin";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  const location = useLocation();
  const { pathname, state } = location;
  const appMode = useSelector(getAppMode);
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const { promptOneTapOnLoad } = useGoogleOneTapLogin();

  promptOneTapOnLoad();

  const isPersonaRecommendationScreen = useMemo(
    () =>
      userPersona.page === 2 &&
      !userPersona.isSurveyCompleted &&
      appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP &&
      state?.src === "persona_survey_modal",
    [appMode, userPersona?.page, userPersona?.isSurveyCompleted, state?.src]
  );

  const isSidebarVisible = useMemo(
    () =>
      !(isPricingPage(pathname) || isGoodbyePage(pathname) || isInvitePage(pathname) || isPersonaRecommendationScreen),
    [pathname, isPersonaRecommendationScreen]
  );

  return (
    <>
      <div className="app-layout app-dashboard-layout">
        <div className="app-header">{!isPersonaRecommendationScreen && <MenuHeader />}</div>

        <div className="app-sidebar">{isSidebarVisible && <Sidebar />}</div>

        <div className="app-main-content">
          <DashboardContent />
        </div>

        <div className="app-footer">{!isPersonaRecommendationScreen && <Footer />}</div>
      </div>
    </>
  );
};

export default DashboardLayout;
