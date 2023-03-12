import React from "react";
import {
  Conditional,
  PageConfig,
  PersonaType,
  SurveyOptionsConfig,
} from "./types";
import { GettingStartedWithSurvey } from "./GettingStartedWithSurvey";
import { UserRecommendations } from "./Recommendations";
import {
  handleUseCaseActiveOption,
  setPersonaReferralChannel,
  setPersonaUseCase,
  setUserPersona,
} from "./actions";

//@ts-ignore
import chromeStoreIcon from "../../../assets/img/icons/personaSurvey/webstore.svg";
//@ts-ignore
import redditIcon from "assets/img/icons/personaSurvey/reddit.svg";
//@ts-ignore
import chromeIcon from "assets/img/icons/personaSurvey/chrome.svg";
//@ts-ignore
import hackerNewsIcon from "assets/img/icons/personaSurvey/yc.svg";
import { SurveyOption } from "./Option";

const OptionsConfig: Record<number, SurveyOptionsConfig> = {
  1: {
    isActive: ({ key, title }) => key === title,
    action: (dispatch, value, clear) => setUserPersona(dispatch, value, clear),
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
        title: PersonaType.FOUNDER,
        icon: "👑",
      },
    ],
  },
  2: {
    isActive: ({ key, title, optionType }) =>
      handleUseCaseActiveOption(key, title, optionType),
    action: (dispatch, value, clear, optionType) =>
      setPersonaUseCase(dispatch, value, clear, optionType),
    conditional: [
      {
        condition: (answer: string) => answer === PersonaType.BACKEND,
        options: [
          {
            title: "Test local API changes against production app/website",
          },
          {
            title: "Debug backend microservices",
          },
          {
            title: "Modify GraphQL Query & Server Response",
          },
          {
            type: "text",
            title: "other",
          },
        ],
      },
      {
        condition: (answer: string) => answer === PersonaType.QUALITY,
        options: [
          {
            title:
              "Testing newly developed features on different hosts/environments",
          },
          {
            title: "Testing new features on client websites",
          },
          {
            title: "Simulate network conditions",
          },
          {
            title: "UI automation testing",
          },
          {
            title: "Recording issues & sharing with developers",
          },
          {
            type: "text",
            title: "other",
          },
        ],
      },
      {
        condition: (answer: string) =>
          answer === PersonaType.FOUNDER || answer === PersonaType.PRODUCT,
        options: [
          {
            title: "Testing new features on client websites",
          },
          {
            title: "Showing new feature demos to clients",
          },
          {
            title: "Recording issues & sharing with developers ",
          },
          {
            type: "text",
            title: "other",
          },
        ],
      },
      {
        condition: (answer: string) => answer === PersonaType.MARKETER,
        options: [
          {
            title: "Replace production script with development script",
          },
          {
            title: "Debug analytics tags",
          },
          {
            title: "Showing new feature demos to clients",
          },
          {
            title: "Adding Query Params to URLs",
          },
          {
            type: "text",
            title: "other",
          },
        ],
      },
      {
        condition: (answer: string) => answer === PersonaType.FRONTEND,
        options: [
          {
            title: "Local development before the backend is ready",
          },
          {
            title: "Redirect APIs/scripts from one environment to another",
          },
          {
            title: "Load scripts from local/dev environment (Map Local)",
          },

          {
            title: "Modify existing network responses",
          },
          {
            title: "Inject custom scripts",
          },
          {
            title: "Modify headers on a website",
          },
          {
            title: "Modify request payload ",
          },
          {
            title: "Simulate status codes",
          },
          {
            title: "Recording issues & sharing with team members",
          },
          {
            type: "text",
            title: "other",
          },
        ],
      },
    ],
  },
  3: {
    isActive: ({ key, title }) => key === title,
    action: (dispatch, value, clear) =>
      setPersonaReferralChannel(dispatch, value, clear),
    options: [
      {
        title: "Google search",
        icon: <img src={chromeIcon} alt="google chrome" />,
      },
      {
        title: "Friend/Colleague",
        icon: "🙂",
      },
      {
        title: "Online ads",
        icon: "📢",
      },
      {
        title: "Chrome webstore",
        icon: <img src={chromeStoreIcon} alt="chrome web store" />,
      },
      {
        title: "Social media",
        icon: "🌐",
      },
      {
        title: "Read an article",
        icon: "📄",
      },
      {
        title: "Reddit",
        icon: <img src={redditIcon} alt="reddit" />,
      },
      {
        title: "HackerNews",
        icon: <img src={hackerNewsIcon} alt="hacker news" />,
      },
      {
        title: "Company documentation",
        icon: "📋",
      },
    ],
  },
};

export const surveyConfig: PageConfig[] = [
  {
    pageId: 0,
    title: "Welcome to Requestly!",
    subTitle:
      "Help us personalise your experience by answering the following questionnaire",
    render: () => <GettingStartedWithSurvey />,
  },
  {
    pageId: 1,
    title: "Which role describes you the best?",
    subTitle: "Please select one you closely relate to",
    render: () => {
      return (
        <div className="survey-options-container">
          {OptionsConfig[1].options.map((option: any, index: number) => (
            <SurveyOption
              key={index}
              option={option}
              isActive={OptionsConfig[1].isActive}
              action={OptionsConfig[1].action}
              questionType="single"
              fieldKey="persona"
            />
          ))}
        </div>
      );
    },
  },
  {
    pageId: 2,
    title: "What is your primary goal for using Requestly?",
    subTitle: "Select as many as you like",
    render: ({ persona }) => (
      <>
        {OptionsConfig[2].conditional.map((set: Conditional, index: number) => (
          <React.Fragment key={index}>
            {set.condition(persona) && (
              <div className="survey-options-container">
                {set.options.map((option, index) => (
                  <SurveyOption
                    key={index}
                    option={option}
                    questionType="multiple"
                    isActive={OptionsConfig[2].isActive}
                    action={OptionsConfig[2].action}
                    fieldKey="useCases"
                  />
                ))}
              </div>
            )}
          </React.Fragment>
        ))}
      </>
    ),
  },
  {
    pageId: 3,
    title: "How did you hear about Requestly?",
    subTitle: "Select one",
    render: () => {
      return (
        <div className="survey-options-container">
          {OptionsConfig[3].options.map((option: any, index: number) => (
            <SurveyOption
              key={index}
              option={option}
              isActive={OptionsConfig[3].isActive}
              action={OptionsConfig[3].action}
              questionType="single"
              fieldKey="referralChannel"
            />
          ))}
        </div>
      );
    },
  },
  {
    pageId: 4,
    title: "✨ Where would you like to start?",
    subTitle:
      "Choose a use case you want to work on and we will help you get started",
    render: ({ toggleImportRulesModal }) => (
      <UserRecommendations toggleImportRulesModal={toggleImportRulesModal} />
    ),
  },
];
