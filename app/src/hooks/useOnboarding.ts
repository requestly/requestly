import { useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { shouldShowOnboarding } from "components/misc/PersonaSurvey/utils";
import { isExtensionInstalled } from "actions/ExtensionActions";
import { getAppMode, getUserPersonaSurveyDetails, getIsWorkspaceOnboardingCompleted } from "store/selectors";
import PATHS from "config/constants/sub/paths";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { trackPersonaSurveyViewed } from "modules/analytics/events/misc/personaSurvey";
import { actions } from "store";

const useOnboarding = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location: any = useLocation();
  const { state }: any = location;
  const appMode = useSelector(getAppMode);
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const isWorkspaceOnboardingCompleted = useSelector(getIsWorkspaceOnboardingCompleted);
  const appOnboardingExp = useFeatureValue("app_onboarding", null);

  const isWorkspaceOnboardingScreen = useMemo(
    () =>
      !isWorkspaceOnboardingCompleted &&
      !userPersona.isSurveyCompleted &&
      appOnboardingExp === "workspace_onboarding" &&
      state?.src === "workspace_onboarding",
    [appOnboardingExp, isWorkspaceOnboardingCompleted, state?.src, userPersona.isSurveyCompleted]
  );

  const isPersonaRecommendationScreen = useMemo(
    () =>
      userPersona.page === 2 &&
      !userPersona.isSurveyCompleted &&
      appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP &&
      appOnboardingExp === "control" &&
      state?.src === "persona_survey_modal",
    [appMode, state?.src, userPersona.isSurveyCompleted, userPersona.page, appOnboardingExp]
  );

  useEffect(() => {
    if (appOnboardingExp === "control" && !userPersona.isSurveyCompleted) {
      shouldShowOnboarding(appMode).then((result) => {
        if (result) {
          if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
            if (userPersona.page === 0) trackPersonaSurveyViewed();
            dispatch(actions.toggleActiveModal({ modalName: "personaSurveyModal", newValue: true }));
          } else {
            if (isExtensionInstalled()) {
              if (userPersona.page === 0) trackPersonaSurveyViewed();
              const isRecommendationScreen = userPersona.page === 2;
              dispatch(
                actions.toggleActiveModal({
                  modalName: "personaSurveyModal",
                  newValue: !isRecommendationScreen,
                })
              );
              navigate(PATHS.GETTING_STARTED, {
                replace: true,
                state: {
                  src: "persona_survey_modal",
                  redirectTo: location.state?.redirectTo ?? PATHS.RULES.MY_RULES.ABSOLUTE,
                },
              });
            }
          }
        }
      });
    }
  }, [
    appMode,
    dispatch,
    appOnboardingExp,
    userPersona.isSurveyCompleted,
    userPersona.page,
    navigate,
    location.state?.redirectTo,
  ]);

  useEffect(() => {
    if (
      appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP &&
      appOnboardingExp === "workspace_onboarding" &&
      !isWorkspaceOnboardingCompleted &&
      !userPersona.isSurveyCompleted
    ) {
      shouldShowOnboarding(appMode).then((result) => {
        if (result) {
          if (isExtensionInstalled()) {
            navigate(PATHS.GETTING_STARTED, {
              replace: true,
              state: {
                src: "workspace_onboarding",
                redirectTo: location.state?.redirectTo ?? PATHS.RULES.MY_RULES.ABSOLUTE,
              },
            });
          }
        }
      });
    }
  }, [
    navigate,
    location.state?.redirectTo,
    appOnboardingExp,
    isWorkspaceOnboardingCompleted,
    appMode,
    userPersona.isSurveyCompleted,
  ]);

  return {
    showPersonaOnboarding: isPersonaRecommendationScreen,
    showWorkspaceOnboarding: isWorkspaceOnboardingScreen,
  };
};

export default useOnboarding;
