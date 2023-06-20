import React, { useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { isPricingPage, isGoodbyePage, isInvitePage } from "utils/PathUtils.js";
import { shouldShowWorkspaceOnboarding } from "components/features/rules/GettingStarted/WorkspaceOnboarding/utils";
import { getAppMode, getUserPersonaSurveyDetails, getIsWorkspaceOnboardingCompleted } from "store/selectors";
import Footer from "../../components/sections/Footer";
import DashboardContent from "./DashboardContent";
import { Sidebar } from "./Sidebar";
import MenuHeader from "./MenuHeader";
import "./DashboardLayout.css";
import PATHS from "config/constants/sub/paths";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname, state } = location;
  const appMode = useSelector(getAppMode);
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const isWorkspaceOnboardingCompleted = useSelector(getIsWorkspaceOnboardingCompleted);
  const appOnboardingExp = useFeatureValue("app_onboarding", null);

  const isWorkspaceOnboardingScreen = useMemo(
    () =>
      !isWorkspaceOnboardingCompleted &&
      appOnboardingExp === "workspace_onboarding" &&
      state?.src === "workspace_onboarding",
    [appOnboardingExp, isWorkspaceOnboardingCompleted, state?.src]
  );

  const isPersonaRecommendationScreen = useMemo(
    () =>
      userPersona.page === 2 &&
      !userPersona.isSurveyCompleted &&
      appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP &&
      (appOnboardingExp === "control" || appOnboardingExp === "") &&
      state?.src === "persona_survey_modal",
    [appMode, state?.src, userPersona.isSurveyCompleted, userPersona.page, appOnboardingExp]
  );

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
    if (appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
      shouldShowWorkspaceOnboarding(appMode).then((result) => {
        if (result && !isWorkspaceOnboardingCompleted && appOnboardingExp === "workspace_onboarding") {
          navigate(PATHS.GETTING_STARTED, {
            replace: true,
            state: {
              src: "workspace_onboarding",
              redirectTo: location.state?.redirectTo ?? PATHS.RULES.MY_RULES.ABSOLUTE,
            },
          });
        }
      });
    }
  }, [navigate, location.state?.redirectTo, appOnboardingExp, isWorkspaceOnboardingCompleted, appMode]);

  useEffect(() => {
    if (
      userPersona.page === 2 &&
      !userPersona.isSurveyCompleted &&
      (appOnboardingExp === "control" || appOnboardingExp === "") &&
      appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP
    ) {
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
    userPersona.isSurveyCompleted,
    userPersona.page,
    location.state?.redirectTo,
    appOnboardingExp,
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
