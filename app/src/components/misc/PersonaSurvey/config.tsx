import { PageConfig } from "./types";
import { GettingStartedWithSurvey } from "./components/GettingStartedWithSurvey";
import {
  setPersonaReferralChannel,
  setPersonaUseCase,
  setUserPersona,
} from "./actions";
import { SurveyConstants } from "./types";

//@ts-ignore
import chromeStoreIcon from "../../../assets/img/icons/personaSurvey/webstore.svg";
//@ts-ignore
import redditIcon from "assets/img/icons/personaSurvey/reddit.svg";
//@ts-ignore
import chromeIcon from "assets/img/icons/personaSurvey/chrome.svg";
//@ts-ignore
import hackerNewsIcon from "assets/img/icons/personaSurvey/yc.svg";

export const surveyConfig: PageConfig[] = [
  {
    pageId: 0,
    title: "Welcome to Requestly!",
    subTitle:
      "Help us personalise your experience by answering the following questionnaire",
    render: <GettingStartedWithSurvey />,
  },
  {
    pageId: 1,
    title: "Which role describes you the best?",
    subTitle: "Please select one you closely relate to",
    questionType: "single",
    action: (dispatch, value, clear) => setUserPersona(dispatch, value, clear),
    isActive: ({ persona, title }) => persona === title,
    options: [
      {
        type: "select",
        title: SurveyConstants.FRONTEND,
        icon: "💻",
      },
      {
        type: "select",
        title: SurveyConstants.BACKEND,
        icon: "⌨️",
      },
      {
        type: "select",
        title: SurveyConstants.PRODUCT,
        icon: "📊",
      },
      {
        type: "select",
        title: SurveyConstants.FOUNDER,
        icon: "👑",
      },
      {
        type: "select",
        title: SurveyConstants.QUALITY,
        icon: "🏗",
      },
      {
        type: "select",
        title: SurveyConstants.MARKETER,
        icon: "📈",
      },
    ],
  },
  {
    pageId: 2,
    title: "What is your primary goal for using Requestly?",
    subTitle: "Select as many as you like",
    questionType: "multiple",
    action: (dispatch, value, clear) =>
      setPersonaUseCase(dispatch, value, clear),
    isActive: ({ useCase, title }) =>
      useCase.indexOf(title) < 0 ? false : true,
    conditional: [
      {
        condition: (answer) => answer === SurveyConstants.BACKEND,
        options: [
          {
            type: "select",
            title: "Test local API changes against production app/website",
          },
          {
            type: "select",
            title: "Debug backend microservices",
          },
          {
            type: "select",
            title: "Modify GraphQL Query & Server Response",
          },
          {
            type: "text",
            title: "Other",
          },
        ],
      },
      {
        condition: (answer) => answer === SurveyConstants.QUALITY,
        options: [
          {
            type: "select",
            title:
              "Testing newly developed features on different hosts/environments",
          },
          {
            type: "select",
            title: "Testing new features on client websites",
          },
          {
            type: "select",
            title: "Simulate network conditions",
          },
          {
            type: "select",
            title: "UI automation testing",
          },
          {
            type: "select",
            title: "Recording issues & sharing with developers",
          },
          {
            type: "text",
            title: "Other",
          },
        ],
      },
      {
        condition: (answer) =>
          answer === SurveyConstants.FOUNDER ||
          answer === SurveyConstants.PRODUCT,
        options: [
          {
            type: "select",
            title: "Testing new features on client websites",
          },
          {
            type: "select",
            title: "Showing new feature demos to clients",
          },
          {
            type: "select",
            title: "Recording issues & sharing with developers ",
          },
          {
            type: "text",
            title: "Other",
          },
        ],
      },
      {
        condition: (answer) => answer === SurveyConstants.MARKETER,
        options: [
          {
            type: "select",
            title: "Replace production script with development script",
          },
          {
            type: "select",
            title: "Debug analytics tags",
          },
          {
            type: "select",
            title: "Showing new feature demos to clients",
          },
          {
            type: "select",
            title: "Adding Query Params to URLs",
          },
          {
            type: "text",
            title: "Other",
          },
        ],
      },
      {
        condition: (answer) => answer === SurveyConstants.FRONTEND,
        options: [
          {
            type: "select",
            title: "Local development before the backend is ready",
          },
          {
            type: "select",
            title: "Redirect APIs/scripts from one environment to another",
          },
          {
            type: "select",
            title: "Load scripts from local/dev environment (Map Local)",
          },

          {
            type: "select",
            title: "Modify existing network responses",
          },
          {
            type: "select",
            title: "Inject custom scripts",
          },
          {
            type: "select",
            title: "Modify headers on a website",
          },
          {
            type: "select",
            title: "Modify request payload ",
          },
          {
            type: "select",
            title: "Simulate status codes",
          },
          {
            type: "select",
            title: "Recording issues & sharing with team members",
          },
          {
            type: "text",
            title: "Other",
          },
        ],
      },
    ],
  },
  {
    pageId: 3,
    title: "How did you hear about Requestly?",
    subTitle: "Select one",
    questionType: "single",
    action: (dispatch, value, clear) =>
      setPersonaReferralChannel(dispatch, value, clear),
    isActive: ({ referralChannel, title }) => referralChannel === title,
    options: [
      {
        type: "select",
        title: "Google search",
        icon: <img src={chromeIcon} alt="google chrome" />,
      },
      {
        type: "select",
        title: "Friend/Colleague",
        icon: "🙂",
      },
      {
        type: "select",
        title: "Online ads",
        icon: "📢",
      },
      {
        type: "select",
        title: "Chrome webstore",
        icon: <img src={chromeStoreIcon} alt="chrome web store" />,
      },
      {
        type: "select",
        title: "Social media",
        icon: "🌐",
      },
      {
        type: "select",
        title: "Read an article",
        icon: "📄",
      },
      {
        type: "select",
        title: "Reddit",
        icon: <img src={redditIcon} alt="reddit" />,
      },
      {
        type: "select",
        title: "HackerNews",
        icon: <img src={hackerNewsIcon} alt="hacker news" />,
      },
      {
        type: "select",
        title: "Company internal documentation",
        icon: "📋",
      },
    ],
  },
  {
    pageId: 4,
    title: "✨ Where would you like to start?",
    subTitle:
      "Choose a use can you want to work on and we will help you get started",
  },
];
