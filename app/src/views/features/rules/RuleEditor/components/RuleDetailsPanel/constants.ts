import { RuleType } from "types";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import { ReactNode } from "react";

// TODO: update details
export const RULE_DETAILS: Record<
  RuleType,
  {
    type: RuleType;
    name: string;
    icon: () => ReactNode;
    description: string;
    useCases?: { useCase: string; suggestedTemplateId?: string }[];
    documentationLink: string;
  }
> = {
  [RuleType.REDIRECT]: {
    type: RuleType.REDIRECT,
    name: RULE_TYPES_CONFIG[RuleType.REDIRECT].NAME,
    icon: RULE_TYPES_CONFIG[RuleType.REDIRECT].ICON,
    description: RULE_TYPES_CONFIG[RuleType.REDIRECT].DESCRIPTION,
    useCases: [
      {
        useCase: "Redirect Production to Local Environment.",
        suggestedTemplateId: "0",
      },
      {
        useCase: "Redirect to local System files (Map Local).",
        suggestedTemplateId: "",
      },
      {
        useCase: "Fix Broken URLs, Redirect dead bookmarks, and Create URL shortcuts.",
        suggestedTemplateId: "9",
      },
    ],
    documentationLink: "https://developers.requestly.com/http-rules/map-local-url-redirect",
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
        suggestedTemplateId: "",
      },
      {
        useCase: "Testing error scenarios: Test your app when certain resource is not loaded.",
        suggestedTemplateId: "",
      },
    ],
    documentationLink: "https://developers.requestly.com/http-rules/cancel-rule/",
  },
  [RuleType.DELAY]: {
    type: RuleType.DELAY,
    name: RULE_TYPES_CONFIG[RuleType.DELAY].NAME,
    icon: RULE_TYPES_CONFIG[RuleType.DELAY].ICON,
    description: RULE_TYPES_CONFIG[RuleType.DELAY].DESCRIPTION,
    useCases: [
      {
        useCase: "Test the performance of your web app on a slower network conditions.",
        suggestedTemplateId: "",
      },
      {
        useCase: "Test the behaviour of your app when one or more APIs respond slowly (API Latency has gone up).",
        suggestedTemplateId: "",
      },
    ],
    documentationLink: "https://developers.requestly.com/http-rules/delay-request/",
  },
  [RuleType.HEADERS]: {
    type: RuleType.HEADERS,
    name: RULE_TYPES_CONFIG[RuleType.HEADERS].NAME,
    icon: RULE_TYPES_CONFIG[RuleType.HEADERS].ICON,
    description: RULE_TYPES_CONFIG[RuleType.HEADERS].DESCRIPTION,
    useCases: [
      {
        useCase:
          "Open websites in an iframe for testing: Response headers like X-Frame-Options and Content-Security-Policy don't allow you to open pages in iframes to prevent clickjacking. Using Requestly, you can modify this header to allow the websites to be opened in an iframe",
        suggestedTemplateId: "",
      },
      {
        useCase:
          "Remove Content-Security-Policy: Content-Security-Policy response header is added to the website to prevent injection of external scripts. Requestly can be used to remove the CSP response header for testing purposes.",
        suggestedTemplateId: "5",
      },
    ],
    documentationLink: "https://developers.requestly.com/http-rules/modify-headers/",
  },
  [RuleType.QUERYPARAM]: {
    type: RuleType.QUERYPARAM,
    name: RULE_TYPES_CONFIG[RuleType.QUERYPARAM].NAME,
    icon: RULE_TYPES_CONFIG[RuleType.QUERYPARAM].ICON,
    description: RULE_TYPES_CONFIG[RuleType.QUERYPARAM].DESCRIPTION,
    useCases: [
      {
        useCase: "Remove UTM tracking parameters.",
        suggestedTemplateId: "13",
      },
      {
        useCase: "Using query params, you can burst cache for a request by assigning it a newer version.",
        suggestedTemplateId: "",
      },
      {
        useCase:
          "Sending additional Information to some API calls to inform your backend & database that this is internal testing.",
        suggestedTemplateId: "",
      },
    ],
    documentationLink: "https://developers.requestly.com/http-rules/modify-query-params/",
  },
  [RuleType.REPLACE]: {
    type: RuleType.REPLACE,
    name: RULE_TYPES_CONFIG[RuleType.REPLACE].NAME,
    icon: RULE_TYPES_CONFIG[RuleType.REPLACE].ICON,
    description: RULE_TYPES_CONFIG[RuleType.REPLACE].DESCRIPTION,
    useCases: [
      {
        useCase: `Switch Domains: To test your app with the new changes done on the local server, you can use replace "my-app-server.com" with "localhost:4000" using Replace Rule. By this way, you can test your app without having to change any of your code.`,
        suggestedTemplateId: "",
      },
      {
        useCase: `Change Query Parameter Values: You can change the values of query parameters present in a URL. For example: Changing "?dl-0" to "?dl=1" in a dropbox URL downloads the file directly without going to the usual preview page.`,
        suggestedTemplateId: "",
      },
    ],
    documentationLink: "https://developers.requestly.com/http-rules/replace-strings/",
  },
  [RuleType.REQUEST]: {
    type: RuleType.REQUEST,
    name: RULE_TYPES_CONFIG[RuleType.REQUEST].NAME,
    icon: RULE_TYPES_CONFIG[RuleType.REQUEST].ICON,
    description: RULE_TYPES_CONFIG[RuleType.REQUEST].DESCRIPTION,
    useCases: [
      {
        useCase: `Primarily used in sending additional data in request payload to the API server: There might be situations where additional data needs to be sent in request payloads to the API server when making a POST or PUT request.`,
        suggestedTemplateId: "",
      },
      {
        useCase: `Modifying GraphQL Queries: GraphQL queries can be modified by modifying the request body of the request. This can be done by changing the query string or variables in the request body.`,
        suggestedTemplateId: "",
      },
    ],
    documentationLink: "https://developers.requestly.com/http-rules/modify-request-body/",
  },
  [RuleType.RESPONSE]: {
    type: RuleType.RESPONSE,
    name: RULE_TYPES_CONFIG[RuleType.RESPONSE].NAME,
    icon: RULE_TYPES_CONFIG[RuleType.RESPONSE].ICON,
    description: RULE_TYPES_CONFIG[RuleType.RESPONSE].DESCRIPTION,
    useCases: [
      {
        useCase: `You want to work on front-end while back-end is not available or ready yet.`,
        suggestedTemplateId: "4",
      },
      {
        useCase: `You want to test application behaviour when provided altered data.`,
        suggestedTemplateId: "",
      },
      {
        useCase: `You want to simulate errors by returning different status codes.`,
        suggestedTemplateId: "6",
      },
      {
        useCase: `You want to modify API responses but don't have access to the back-end.`,
        suggestedTemplateId: "",
      },
    ],
    documentationLink: "https://developers.requestly.com/http-rules/modify-response-body/",
  },
  [RuleType.SCRIPT]: {
    type: RuleType.SCRIPT,
    name: RULE_TYPES_CONFIG[RuleType.SCRIPT].NAME,
    icon: RULE_TYPES_CONFIG[RuleType.SCRIPT].ICON,
    description: RULE_TYPES_CONFIG[RuleType.SCRIPT].DESCRIPTION,
    useCases: [
      {
        useCase: `Inject popular libraries or hosted scripts or execute custom code-snippet before or after page load using a simple rule builder.`,
        suggestedTemplateId: "1",
      },
      {
        useCase: `Themify Twitter according to you. Remove/hide unwanted sections from the page.`,
        suggestedTemplateId: "",
      },
    ],
    documentationLink: "https://developers.requestly.com/http-rules/modify-dom-inject-scripts/",
  },
  [RuleType.USERAGENT]: {
    type: RuleType.USERAGENT,
    name: RULE_TYPES_CONFIG[RuleType.USERAGENT].NAME,
    icon: RULE_TYPES_CONFIG[RuleType.USERAGENT].ICON,
    description: RULE_TYPES_CONFIG[RuleType.USERAGENT].DESCRIPTION,
    useCases: [
      {
        useCase: `Test different User-Agents for serving different content based on the type of device or browser`,
        suggestedTemplateId: "",
      },
    ],
    documentationLink: "https://developers.requestly.com/http-rules/modify-user-agents/",
  },
};
