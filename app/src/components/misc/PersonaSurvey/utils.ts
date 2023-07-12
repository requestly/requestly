import { actions } from "store";
import { getAndUpdateInstallationDate } from "utils/Misc";
import { OldSurveyPageMap, Option, SurveyPage, UserPersona } from "./types";
import { getValueAsPromise, setValue } from "actions/FirebaseActions";
import PATHS from "config/constants/sub/paths";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

export const shouldShowOnboarding = async (appMode: string) => {
  if (
    window.location.href.includes(PATHS.AUTH.DEKSTOP_SIGN_IN.RELATIVE) ||
    window.location.href.includes("/invite") ||
    window.location.href.includes(PATHS.SESSIONS.SAVED.RELATIVE)
  )
    return false;

  const installDate = await getAndUpdateInstallationDate(appMode, false, false);
  if (new Date(installDate) >= new Date("2023-03-06")) return true;
  else return false;
};

export const shuffleOptions = (options: Option[]) => {
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
};

export const syncUserPersona = async (uid: string, dispatch: any, userPersona: UserPersona) => {
  const persona: any = await getValueAsPromise(["users", uid, "persona"]);
  if (!persona) {
    const { isSurveyCompleted, ...surveyData } = userPersona;
    setValue(["users", uid, "persona"], { ...surveyData });
  } else {
    delete persona.isSurveyCompleted; // disable syncing this for existing users
    dispatch(actions.setUserPersonaData({ ...persona }));
  }
};

export const getSurveyPage = (currentPage: SurveyPage | number) => {
  if (typeof currentPage === "number") {
    //@ts-ignore
    return OldSurveyPageMap[currentPage];
  }
  return currentPage;
};

export const shouldShowRecommendationScreen = (userPersona: UserPersona, appMode: string, state: string) => {
  const page = getSurveyPage(userPersona.page);
  console.log({ state });
  if (
    page === SurveyPage.RECOMMENDATIONS &&
    !userPersona.isSurveyCompleted &&
    appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP &&
    state === "persona_survey_modal"
  )
    return true;

  return false;
};
