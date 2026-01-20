import { ReactNode } from "react";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import LINKS from "config/constants/sub/links";
import { ExampleType, UseCaseExample } from "./types";
import { RuleType } from "@requestly/shared/types/entities/rules";

export const RULE_DETAILS: Record<
  RuleType,
  {
    type: RuleType;
    name: string;
    icon: () => ReactNode;
    description: string;
    useCases?: {
      useCase: string;
      example?: UseCaseExample;
    }[];
    documentationLink: string;
  }
> = {
  [RuleType.REDIRECT]: {
    type: RuleType.REDIRECT,
    name: "Redirect Request",
    icon: RULE_TYPES_CONFIG[RuleType.REDIRECT].ICON,
    description: "Redirect HTTP requests to a new destination, which can be another URL, a system file, or hosted file",
    useCases: [
      {
        useCase: "Redirect Production to Local Environment.",
        example: {
          type: ExampleType.USE_TEMPLATE,
          suggestedTemplateId: "0",
        },
      },
      {
        useCase: "Redirect to local System files (Map Local).",
        example: {
          type: ExampleType.DOWNLOAD_DESKTOP_APP,
          link: LINKS.REQUESTLY_DESKTOP_APP,
        },
      },
      {
        useCase:
          "Test API version changes by redirecting old URLs to the new version to check compatibility without code changes.",
      },
    ],
    documentationLink: LINKS.REQUESTLY_REDIRECT_RULE_DOCS,
  },
  [RuleType.CANCEL]: {
    type: RuleType.CANCEL,
    name: RULE_TYPES_CONFIG[RuleType.CANCEL].NAME,
    icon: RULE_TYPES_CONFIG[RuleType.CANCEL].ICON,
    description: RULE_TYPES_CONFIG[RuleType.CANCEL].DESCRIPTION,
    useCases: [
      {
        useCase:
          "Blocking Websites: You can use Cancel Rule to avoid distraction by blocking websites e.g. youtube, twitter, facebook.",
      },
      {
        useCase: "Testing error scenarios: Test your app when certain resource is not loaded.",
      },
    ],
    documentationLink: LINKS.REQUESTLY_CANCEL_RULE_DOCS,
  },
  [RuleType.DELAY]: {
    type: RuleType.DELAY,
    name: RULE_TYPES_CONFIG[RuleType.DELAY].NAME,
    icon: RULE_TYPES_CONFIG[RuleType.DELAY].ICON,
    description: RULE_TYPES_CONFIG[RuleType.DELAY].DESCRIPTION,
    useCases: [
      {
        useCase: "Test the performance of your web app on a slower network conditions.",
      },
      {
        useCase: "Test the behaviour of your app when one or more APIs respond slowly (API Latency has gone up).",
      },
    ],
    documentationLink: LINKS.REQUESTLY_DELAY_RULE_DOCS,
  },
  [RuleType.HEADERS]: {
    type: RuleType.HEADERS,
    name: "Modify Headers",
    icon: RULE_TYPES_CONFIG[RuleType.HEADERS].ICON,
    description: "Add, modify, or remove HTTP(s) headers in requests and responses.",
    useCases: [
      {
        useCase: "Bypass CORS to access APIs restricted by CORS policies across different domains.",
        example: {
          type: ExampleType.USE_TEMPLATE,
          suggestedTemplateId: "2",
        },
      },
      {
        useCase: "Remove Content-Security-Policy headers to allow external script injection.",
        example: {
          type: ExampleType.USE_TEMPLATE,
          suggestedTemplateId: "5",
        },
      },
      {
        useCase: "Add Authorization Header to all localhost requests.",
        example: {
          type: ExampleType.USE_TEMPLATE,
          suggestedTemplateId: "3",
        },
      },
    ],
    documentationLink: LINKS.REQUESTLY_HEADERS_RULE_DOCS,
  },
  [RuleType.QUERYPARAM]: {
    type: RuleType.QUERYPARAM,
    name: "Query Params",
    icon: RULE_TYPES_CONFIG[RuleType.QUERYPARAM].ICON,
    description: "Add or Remove Query Parameters from a URL",
    useCases: [
      {
        useCase: "Remove UTM tracking parameters.",
        example: {
          type: ExampleType.USE_TEMPLATE,
          suggestedTemplateId: "13",
        },
      },
      {
        useCase: "Burst cache for a request by assigning it a newer version.",
      },
      {
        useCase: "Flag API calls as internal testing for your backend and database.",
      },
    ],
    documentationLink: LINKS.REQUESTLY_QUERYPARAM_RULE_DOCS,
  },
  [RuleType.REPLACE]: {
    type: RuleType.REPLACE,
    name: "Replace String",
    icon: RULE_TYPES_CONFIG[RuleType.REPLACE].ICON,
    description: "Replace parts of a URL, such as the hostname, query value, or any specific string",
    useCases: [
      {
        useCase: `Switch hostnames from production to a local server for testing without code changes.`,
      },
      {
        useCase: `Replace specific strings of the URLs across multiple requests during testing.`,
        example: {
          type: ExampleType.PLAYGROUND_LINK,
          link: "https://www.requestly-playground.com/?rq-category=replace",
        },
      },
    ],
    documentationLink: LINKS.REQUESTLY_REPLACE_RULE_DOCS,
  },
  [RuleType.REQUEST]: {
    type: RuleType.REQUEST,
    name: "Modify Request Body",
    icon: RULE_TYPES_CONFIG[RuleType.REQUEST].ICON,
    description: "Override request body with static or programmatic data",
    useCases: [
      {
        useCase: `Send additional data in request payloads to the API server for POST or PUT requests.`,
      },
      {
        useCase: `Modify GraphQL queries by altering the request body, including changing the query string or variables.`,
      },
    ],
    documentationLink: LINKS.REQUESTLY_REQUEST_RULE_DOCS,
  },
  [RuleType.RESPONSE]: {
    type: RuleType.RESPONSE,
    name: "Modify API Response",
    icon: RULE_TYPES_CONFIG[RuleType.RESPONSE].ICON,
    description: "Override or modify existing response of any XHR/Fetch request",
    useCases: [
      {
        useCase: `Test the application's behaviour with manipulated data without need for backend modifications.`,
        example: {
          type: ExampleType.USE_TEMPLATE,
          suggestedTemplateId: "4",
        },
      },
      {
        useCase: `Simulate errors by returning different status codes.`,
        example: {
          type: ExampleType.USE_TEMPLATE,
          suggestedTemplateId: "6",
        },
      },
      {
        useCase: `Override existing GraphQL responses.`,
        example: {
          type: ExampleType.PLAYGROUND_LINK,
          link: "https://www.requestly-playground.com/?rq-category=override-api-response-graphql",
        },
      },
    ],
    documentationLink: LINKS.REQUESTLY_RESPONSE_RULE_DOCS,
  },
  [RuleType.SCRIPT]: {
    type: RuleType.SCRIPT,
    name: "Insert Scripts",
    icon: RULE_TYPES_CONFIG[RuleType.SCRIPT].ICON,
    description: "Inject custom JavaScript (JS) or Styles (CSS) to any website",
    useCases: [
      {
        useCase: `Inject popular libraries or hosted scripts or execute custom code-snippet.`,
        example: {
          type: ExampleType.USE_TEMPLATE,
          suggestedTemplateId: "1",
        },
      },
      {
        useCase: `Inject custom CSS to override styling on a specific site.`,
        example: {
          type: ExampleType.PLAYGROUND_LINK,
          link: "https://www.requestly-playground.com/?rq-category=inject-scripts",
        },
      },
      {
        useCase: `Remove/hide unwanted sections from the page.`,
      },
    ],
    documentationLink: LINKS.REQUESTLY_SCRIPT_RULE_DOCS,
  },
  [RuleType.USERAGENT]: {
    type: RuleType.USERAGENT,
    name: RULE_TYPES_CONFIG[RuleType.USERAGENT].NAME,
    icon: RULE_TYPES_CONFIG[RuleType.USERAGENT].ICON,
    description: RULE_TYPES_CONFIG[RuleType.USERAGENT].DESCRIPTION,
    useCases: [
      {
        useCase: `Test different User-Agents for serving different content based on the type of device or browser`,
      },
    ],
    documentationLink: LINKS.REQUESTLY_USERAGENT_RULE_DOCS,
  },
};
