import { PageConfig } from "./types";
import { GettingStartedWithSurvey } from "./components/GettingStartedWithSurvey";
import { setPersonaReferralChannel, setUserPersona } from "./actions";
import { SurveyConstants } from "./types";

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
    action: (dispatch, value) => setUserPersona(dispatch, value),
    options: [
      {
        isActive: ({ persona }) => persona === SurveyConstants.FRONTEND,
        type: "select",
        title: SurveyConstants.FRONTEND,
      },
      {
        isActive: ({ persona }) => persona === SurveyConstants.BACKEND,
        type: "select",
        title: SurveyConstants.BACKEND,
      },
      {
        isActive: ({ persona }) => persona === SurveyConstants.PRODUCT,
        type: "select",
        title: SurveyConstants.PRODUCT,
      },
      {
        isActive: ({ persona }) => persona === SurveyConstants.FOUNDER,
        type: "select",
        title: SurveyConstants.FOUNDER,
      },
      {
        isActive: ({ persona }) => persona === SurveyConstants.QUALITY,
        type: "select",
        title: SurveyConstants.QUALITY,
      },
      {
        isActive: ({ persona }) => persona === SurveyConstants.MARKETER,
        type: "select",
        title: SurveyConstants.MARKETER,
      },
    ],
  },
  {
    pageId: 2,
    title: "What is your primary goal for using Requestly?",
    subTitle: "Select as many as you like",
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
    action: (dispatch, value) => setPersonaReferralChannel(dispatch, value),
    options: [
      {
        isActive: ({ referralChannel }) => referralChannel === "Google search",
        type: "select",
        title: "Google search",
      },
      {
        isActive: ({ referralChannel }) =>
          referralChannel === "Friend/Colleague",
        type: "select",
        title: "Friend/Colleague",
      },
      {
        isActive: ({ referralChannel }) => referralChannel === "Online ads",
        type: "select",
        title: "Online ads",
      },
      {
        isActive: ({ referralChannel }) =>
          referralChannel === "Chrome webstore",
        type: "select",
        title: "Chrome webstore",
      },
      {
        isActive: ({ referralChannel }) => referralChannel === "Social media",
        type: "select",
        title: "Social media",
      },
      {
        isActive: ({ referralChannel }) =>
          referralChannel === "Read an article",
        type: "select",
        title: "Read an article",
      },
      {
        isActive: ({ referralChannel }) => referralChannel === "Reddit",
        type: "select",
        title: "Reddit",
      },
      {
        isActive: ({ referralChannel }) => referralChannel === "HackerNews",
        type: "select",
        title: "HackerNews",
      },
      {
        isActive: ({ referralChannel }) =>
          referralChannel === "Company internal documentation",
        type: "select",
        title: "Company internal documentation",
      },
    ],
  },
];
