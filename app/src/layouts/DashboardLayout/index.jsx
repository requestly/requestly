import React, { useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { isPricingPage, isGoodbyePage, isInvitePage } from "utils/PathUtils.js";
import { getAppMode, getUserPersonaSurveyDetails, getIsWorkspaceOnboardingCompleted } from "store/selectors";
import Footer from "../../components/sections/Footer";
import DashboardContent from "./DashboardContent";
import { Sidebar } from "./SidebarV2";
import MenuHeader from "./MenuHeader";
import "./DashboardLayout.css";
import PATHS from "config/constants/sub/paths";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const appMode = useSelector(getAppMode);
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const isWorkspaceOnboardingCompleted = useSelector(getIsWorkspaceOnboardingCompleted);
  const appOnboardingExp = useFeatureValue("app_onboarding", null);
  const isWorkspaceOnboardingScreen = !isWorkspaceOnboardingCompleted && appOnboardingExp === "workspace_onboarding";
  const isPersonaRecommendationScreen =
    userPersona.page === 2 && !userPersona.isSurveyCompleted && appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP;

  const isSidebarVisible = useMemo(
    () =>
      !(
        isPricingPage(pathname) ||
        isGoodbyePage(pathname) ||
        isInvitePage(pathname) ||
        isPersonaRecommendationScreen ||
        isWorkspaceOnboardingScreen
      ),
    [pathname, isPersonaRecommendationScreen, isWorkspaceOnboardingScreen]
  );
  useEffect(() => {
    if (!isWorkspaceOnboardingCompleted && appOnboardingExp === "workspace_onboarding") {
      console.log("WORKSPACE", appOnboardingExp);
      navigate(PATHS.GETTING_STARTED, {
        replace: true,
        state: {
          src: "workspace_onboarding",
          redirectTo: location.state?.redirectTo ?? PATHS.RULES.MY_RULES.ABSOLUTE,
        },
      });
    }
    if (
      !userPersona.isSurveyCompleted &&
      appOnboardingExp !== "workspace_onboarding" &&
      appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP
    ) {
      console.log("PERSONA", appOnboardingExp);
      navigate(PATHS.GETTING_STARTED, {
        replace: true,
        state: {
          src: "persona_survey_modal",
          redirectTo: location.state?.redirectTo ?? PATHS.RULES.MY_RULES.ABSOLUTE,
        },
      });
    }
  }, [
    navigate,
    location.state?.redirectTo,
    userPersona.page,
    userPersona.isSurveyCompleted,
    appOnboardingExp,
    isWorkspaceOnboardingCompleted,
    appMode,
  ]);

  return (
    <>
      <div className="app-layout app-dashboard-layout">
        <div className="app-header">
          {!isWorkspaceOnboardingScreen && !isPersonaRecommendationScreen && <MenuHeader />}
        </div>

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
