import { actions } from "store";
import { OtherOption, QuestionnaireType, SurveyPage } from "./types";
import { SurveyConfig } from "./config";
import { trackPersonaQ1Completed } from "modules/analytics/events/misc/onboarding";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import PATHS from "config/constants/sub/paths";
import APP_CONSTANTS from "config/constants";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

export const setUserPersona = (dispatch: any, value: string | OtherOption, clear: boolean, key: string) => {
  dispatch(actions.updateUserPersona({ value: clear ? "" : value, key }));
};

export const handleSurveyNavigation = (
  dispatch: any,
  appMode: string,
  currentPage: SurveyPage,
  isSurveyModal: boolean,
  response?: string,
  callback?: () => void
) => {
  const index = Object.keys(SurveyConfig).indexOf(currentPage);
  const surveyLength = Object.keys(SurveyConfig).length;
  const currentQuestionnaire = SurveyConfig[currentPage]?.render;
  const isSharedListUser = window.location.href.includes(PATHS.SHARED_LISTS.VIEWER.RELATIVE);

  switch (currentQuestionnaire) {
    case QuestionnaireType.PERSONA:
      trackPersonaQ1Completed(response);
      submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.PERSONA, response);
      break;
  }

  if (isSurveyModal || index !== surveyLength - 1) {
    switch (currentPage) {
      case SurveyPage.GETTING_STARTED:
        dispatch(actions.updatePersonaSurveyPage(SurveyPage.PERSONA));
        break;

      case SurveyPage.PERSONA:
        dispatch(actions.updatePersonaSurveyPage(SurveyPage.RECOMMENDATIONS));
        break;
    }

    if (isSurveyModal && index === surveyLength - 1) {
      if (isSharedListUser || appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
        //don’t show recommendation screen for shared list users or desktop users
        dispatch(actions.updateIsPersonaSurveyCompleted(true));
        return;
      }
      dispatch(actions.toggleActiveModal({ modalName: "personaSurveyModal", newValue: false }));
    }
  } else {
    callback?.();
  }
};
