import { PageConfig, PersonaType, QuestionnaireType, SurveyOptionsConfig } from "./types";
import { setUserPersona } from "./actions";

export const OptionsConfig: Record<QuestionnaireType, SurveyOptionsConfig> = {
  [QuestionnaireType.PERSONA]: {
    key: "persona",
    questionType: "single",
    isActive: ({ key, title }) => key === title,
    action: (dispatch, value, clear) => setUserPersona(dispatch, value, clear, "persona"),
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
        title: PersonaType.MARKETER,
        icon: "📈",
      },
      {
        title: PersonaType.PRODUCT,
        icon: "📊",
      },
      {
        title: PersonaType.FULLSTACK,
        icon: "👨🏽‍💻",
      },
      {
        title: PersonaType.SALES,
        icon: "💵",
      },
    ],
  },
};

export const SurveyConfig: PageConfig[] = [
  {
    pageId: 0,
    title: "Which role describes you the best?",
    subTitle: "Please select one you closely relate to",
    render: QuestionnaireType.PERSONA,
  },
  // {
  //   pageId: 2,
  //   skip: true,
  //   title: "What is your primary goal for using Requestly?",
  //   subTitle: "Select as many as you like",
  //   render: 2,
  // },
  // {
  //   pageId: 3,
  //   title: "How did you hear about Requestly?",
  //   subTitle: "Select one",
  //   skip: true,
  //   render: 3,
  // },
];
