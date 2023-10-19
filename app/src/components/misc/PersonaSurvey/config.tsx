import { PageConfig, PersonaType, QuestionnaireType, SurveyOptionsConfig, SurveyPage } from "./types";
import { setUserPersona } from "./actions";
import { GettingStartedWithSurvey } from "./GettingStartedWithSurvey";

export const OptionsConfig: Record<QuestionnaireType, SurveyOptionsConfig> = {
  [QuestionnaireType.PERSONA]: {
    /**
     * Action to set the user persona.
     *
     * @param {function} dispatch - The dispatch function from the Redux store.
     * @param {string} value - The value to set as the user persona.
     * @param {boolean} doClear - Indicates whether to clear the user persona.
     * @returns {void}
     */

    questionResponseAction: (dispatch, value, doClear) =>
      setUserPersona(dispatch, value, doClear, QuestionnaireType.PERSONA),
    options: [
      {
        title: PersonaType.FRONTEND,
        icon: "💻",
      },
      {
        title: PersonaType.BACKEND,
        icon: "⌨️",
      },
      {
        title: PersonaType.QUALITY,
        icon: "🏗",
      },
      {
        title: PersonaType.FOUNDER,
        icon: "🧑🏽‍💼",
      },
      {
        title: PersonaType.IT,
        icon: "📂",
      },
      {
        title: PersonaType.MANAGER,
        icon: "👨🏽‍💻",
      },
      {
        title: PersonaType.PRODUCT,
        icon: "📊",
      },
      {
        title: PersonaType.SALES,
        icon: "💵",
      },
      { type: "other", title: null },
    ],
  },
};

export const SurveyConfig: Partial<Record<SurveyPage, PageConfig>> = {
  [SurveyPage.GETTING_STARTED]: {
    page: 0,
    pageId: SurveyPage.GETTING_STARTED,
    title: "Welcome to Requestly!",
    subTitle: "Help us personalise your experience by answering the following questionnaire",
    visibility: () => true,
    render: () => <GettingStartedWithSurvey />,
  },

  [SurveyPage.PERSONA]: {
    page: 1,
    pageId: SurveyPage.PERSONA,
    title: "Help us personalise your experience",
    subTitle: "Please select the role that describes you the best",
    visibility: () => true,
    render: QuestionnaireType.PERSONA,
  },
};
