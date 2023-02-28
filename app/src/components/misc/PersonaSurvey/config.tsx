import { PageConfig } from "./types";
import { GettingStartedWithSurvey } from "./components/GettingStartedWithSurvey";
import { setUserPersona } from "./actions";
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
        type: "select",
        title: SurveyConstants.FRONTEND,
      },
      {
        type: "select",
        title: SurveyConstants.BACKEND,
      },
      {
        type: "select",
        title: SurveyConstants.PRODUCT,
      },
      {
        type: "select",
        title: SurveyConstants.FOUNDER,
      },
      {
        type: "select",
        title: SurveyConstants.QUALITY,
      },
      {
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
    // condition: (answer) => answer === "backend",
    // options: [
    //   {
    //     title: "Test local API changes against production app/website",
    //   },
    //   {
    //     title: "Debug backend microservices",
    //   },
    //   {
    //     title: "Modify GraphQL Query & Server Response",
    //   },
    //   {
    //     title: "Other",
    //   },
    // ],
  },
  {
    pageId: 3,
    title: "How did you hear about Requestly?",
    subTitle: "Select one",
    options: [
      {
        type: "select",
        title: "Google search",
      },
      {
        type: "select",
        title: "Friend/Colleague",
      },
      {
        type: "select",
        title: "Online ads",
      },
      {
        type: "select",
        title: "Chrome webstore",
      },
      {
        type: "select",
        title: "Social media",
      },
      {
        type: "select",
        title: "Read an article",
      },
      {
        type: "select",
        title: "Reddit",
      },
      {
        type: "select",
        title: "HackerNews",
      },
      {
        type: "select",
        title: "Company internal documentation",
      },
    ],
  },
  // {
  //   pageId: 2,
  //   title: "What is your primary goal for using Requestly?",
  //   subTitle: "Select as many as you like",
  //   condition: (answer) => answer === "quality",
  //   options: [
  //     {
  //       title:
  //         "Testing newly developed features on different hosts/environments",
  //     },
  //     {
  //       title: "Testing new features on client websites",
  //     },
  //     {
  //       title: "Simulate network conditions",
  //     },
  //     {
  //       title: "UI automation testing",
  //     },
  //     {
  //       title: "Recording issues & sharing with developers",
  //     },
  //     {
  //       title: "Other",
  //     },
  //   ],
  // },
  // {
  //   pageId: 2,
  //   title: "What is your primary goal for using Requestly?",
  //   subTitle: "Select as many as you like",
  //   condition: (answer) => answer === "founder" || answer === "manager",
  //   options: [
  //     {
  //       title: "Testing new features on client websites",
  //     },
  //     {
  //       title: "Showing new feature demos to clients",
  //     },
  //     {
  //       title: "Recording issues & sharing with developers ",
  //     },
  //     {
  //       title: "Other",
  //     },
  //   ],
  // },
  // {
  //   pageId: 2,
  //   title: "What is your primary goal for using Requestly?",
  //   subTitle: "Select as many as you like",
  //   condition: (answer) => answer === "marketer",
  //   options: [
  //     {
  //       title: "Replace production script with development script",
  //     },
  //     {
  //       title: "Debug analytics tags",
  //     },
  //     {
  //       title: "Showing new feature demos to clients",
  //     },
  //     {
  //       title: "Adding Query Params to URLs",
  //     },
  //     {
  //       title: "Other",
  //     },
  //   ],
  // },
  // {
  //   pageId: 2,
  //   title: "What is your primary goal for using Requestly?",
  //   subTitle: "Select as many as you like",
  //   condition: (answer) => answer === "frontend",
  //   options: [
  //     {
  //       title: "Local development before the backend is ready",
  //     },
  //     {
  //       title: "Redirect APIs/scripts from one environment to another",
  //     },
  //     {
  //       title: "Load scripts from local/dev environment (Map Local)",
  //     },
  //     {
  //       title: "Inject custom scripts",
  //     },
  //     {
  //       title: "Modify existing network responses",
  //     },
  //     {
  //       title: "Modify headers on a website",
  //     },
  //     {
  //       title: "Modify request payload ",
  //     },
  //     {
  //       title: "Simulate status codes",
  //     },
  //     {
  //       title: "Recording issues & sharing with team members",
  //     },
  //     {
  //       title: "Other",
  //     },
  //   ],
  // },
];
