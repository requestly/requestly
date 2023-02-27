import { PageConfig } from "./types";
import { GettingStartedWithSurvey } from "./components/GettingStartedWithSurvey";

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
    options: [
      {
        title: "💻 Front end developer",
      },
      {
        title: "⌨️ Back end developer",
      },
      {
        title: "🖌 Product manager",
      },
      {
        title: "👑 Founder",
      },
      {
        title: "🏗 QA engineer",
      },
      {
        title: "😁 Customer success manager",
      },
      {
        title: "other",
      },
    ],
  },
  {
    pageId: 2,
    title: "What is your primary goal for using Requestly?",
    subTitle: "Select as many as you like",
    condition: (answer) => answer === "backend",
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
        title: "Other",
      },
    ],
  },
  {
    pageId: 2,
    title: "What is your primary goal for using Requestly?",
    subTitle: "Select as many as you like",
    condition: (answer) => answer === "quality",
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
        title: "Other",
      },
    ],
  },
  {
    pageId: 2,
    title: "What is your primary goal for using Requestly?",
    subTitle: "Select as many as you like",
    condition: (answer) => answer === "founder" || answer === "manager",
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
        title: "Other",
      },
    ],
  },
  {
    pageId: 2,
    title: "What is your primary goal for using Requestly?",
    subTitle: "Select as many as you like",
    condition: (answer) => answer === "marketer",
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
        title: "Other",
      },
    ],
  },
  {
    pageId: 2,
    title: "What is your primary goal for using Requestly?",
    subTitle: "Select as many as you like",
    condition: (answer) => answer === "frontend",
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
        title: "Inject custom scripts",
      },
      {
        title: "Modify existing network responses",
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
        title: "Other",
      },
    ],
  },
];
