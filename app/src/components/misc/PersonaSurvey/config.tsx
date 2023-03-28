import { PageConfig, PersonaType, SurveyOptionsConfig } from "./types";
import { GettingStartedWithSurvey } from "./GettingStartedWithSurvey";
import { UserRecommendations } from "./Recommendations";
import {
  handleUseCaseActiveOption,
  setPersonaUseCase,
  setUserPersona,
} from "./actions";

// import chromeStoreIcon from "../../../assets/img/icons/personaSurvey/webstore.svg";
// import redditIcon from "assets/img/icons/personaSurvey/reddit.svg";
// import chromeIcon from "assets/img/icons/personaSurvey/chrome.svg";
// import hackerNewsIcon from "assets/img/icons/personaSurvey/yc.svg";

export const OptionsConfig: Record<number, SurveyOptionsConfig> = {
  1: {
    key: "persona",
    questionType: "single",
    isActive: ({ key, title }) => key === title,
    action: (dispatch, value, clear) =>
      setUserPersona(dispatch, value, clear, "persona"),
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
    ],
  },
  2: {
    key: "useCases",
    questionType: "multiple",
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
        condition: (answer: string) => answer === PersonaType.PRODUCT,
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
        condition: (answer: string) =>
          answer === PersonaType.FULLSTACK || answer === PersonaType.FRONTEND,
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
    key: "numberOfEmployees",
    questionType: "single",
    isActive: ({ key, title }) => key === title,
    action: (dispatch, value, clear) =>
      setUserPersona(dispatch, value, clear, "numberOfEmployees"),
    options: [
      {
        title: "Just me",
      },
      {
        title: "1-10",
      },
      {
        title: "11-50",
      },
      {
        title: "51-100",
      },
      {
        title: "100-500",
      },
      {
        title: "500+",
      },
    ],
  },

  /* Referral channel questionaire*/
  // 3: {
  //   key: "referralChannel",
  //   questionType: "single",
  //   isActive: ({ key, title }) => key === title,
  //   action: (dispatch, value, clear) =>
  //     setPersonaReferralChannel(dispatch, value, clear),
  //   options: [
  //     {
  //       title: "Google search",
  //       icon: <img src={chromeIcon} alt="google chrome" />,
  //     },
  //     {
  //       title: "Friend/Colleague",
  //       icon: "🙂",
  //     },
  //     {
  //       title: "Online ads",
  //       icon: "📢",
  //     },
  //     {
  //       title: "Chrome webstore",
  //       icon: <img src={chromeStoreIcon} alt="chrome web store" />,
  //     },
  //     {
  //       title: "Social media",
  //       icon: "🌐",
  //     },
  //     {
  //       title: "Read an article",
  //       icon: "📄",
  //     },
  //     {
  //       title: "Reddit",
  //       icon: <img src={redditIcon} alt="reddit" />,
  //     },
  //     {
  //       title: "HackerNews",
  //       icon: <img src={hackerNewsIcon} alt="hacker news" />,
  //     },
  //     {
  //       title: "Company documentation",
  //       icon: "📋",
  //     },
  //     {
  //       title: "ChatGPT",
  //       icon: "🤖",
  //     },
  //   ],
  // },
};

export const SurveyConfig: PageConfig[] = [
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
    render: 1,
  },
  {
    pageId: 2,
    title: "What is your primary goal for using Requestly?",
    subTitle: "Select as many as you like",
    render: 2,
  },
  {
    pageId: 3,
    title: "How many employees do you have in your organisation?",
    subTitle: "Select one",
    render: 3,
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
