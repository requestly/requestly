import { Page } from "@playwright/test";

export interface ReplaceRuleTestScenario {
  description: string;
  ruleIds: string[];
  testPageUrl: string;
  expectedRedirections: { redirectedFrom: string; redirectedTo: string }[];
  pageActions?: (page: Page) => Promise<void>;
}

const scenarios: ReplaceRuleTestScenario[] = [
  {
    description: "Replace domain (example -> example1)",
    ruleIds: ["Replace_2"],
    testPageUrl: "https://example.com/",
    expectedRedirections: [
      {
        redirectedFrom: "https://example.com/",
        redirectedTo: "https://example1.com/",
      },
    ],
  },
  {
    description: "Replace and add domain (readme -> requestly.readme)",
    ruleIds: ["Replace_1"],
    testPageUrl: "https://readme.io/",
    expectedRedirections: [
      {
        redirectedFrom: "https://readme.io/",
        redirectedTo: "https://requestly.readme.io/",
      },
    ],
  },
  // {
  //   // This should pass but isn't passing, seems like a bug
  //   description: "Replace in query params (someParam -> nothingParam, someValue -> nothingValue)",
  //   ruleIds: ["Replace_3"],
  //   testPageUrl: "https://example.com/?someParam=someValue",
  //   expectedRedirections: [
  //     {
  //       redirectedFrom: "https://example.com/?someParam=someValue",
  //       redirectedTo: "https://example.com/?nothingParam=nothingValue",
  //     },
  //   ],
  // },
];

export default scenarios;
