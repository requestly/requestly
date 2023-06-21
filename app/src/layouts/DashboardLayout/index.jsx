import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { isPricingPage, isGoodbyePage, isInvitePage } from "utils/PathUtils.js";
import { getAppMode, getUserAuthDetails, getUserPersonaSurveyDetails } from "store/selectors";
import Footer from "../../components/sections/Footer";
import DashboardContent from "./DashboardContent";
import { Sidebar } from "./Sidebar";
import MenuHeader from "./MenuHeader";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { useGoogleOneTapLogin } from "hooks/useGoogleOneTapLogin";
import { handleOnetapSignIn } from "actions/FirebaseActions";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  const location = useLocation();
  const { pathname } = location;
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  useGoogleOneTapLogin({
    client_id: "553216647714-b34rhgl06o7vokpebigjttrgebmm495h.apps.googleusercontent.com", //client ID of rq-beta,
    disabled: user?.loggedIn,
    prompt_parent_id: "one-tap-container",
    callback: handleOnetapSignIn,
  });

  const isPersonaRecommendationScreen =
    userPersona.page === 4 && !userPersona.isSurveyCompleted && appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP;

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
