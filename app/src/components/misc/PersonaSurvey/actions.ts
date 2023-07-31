import { actions } from "store";
import { SurveyPage } from "./types";

export const setUserPersona = (dispatch: any, value: string, clear: boolean, key: string) => {
  dispatch(actions.updateUserPersona({ value: clear ? "" : value, key }));
};

export const handleSurveyNavigation = (currentPage: SurveyPage, dispatch: any) => {
  switch (currentPage) {
    case SurveyPage.GETTING_STARTED:
      dispatch(actions.updatePersonaSurveyPage(SurveyPage.PERSONA));
      break;

    case SurveyPage.PERSONA:
      dispatch(actions.updatePersonaSurveyPage(SurveyPage.RECOMMENDATIONS));
      break;
  }
};
