import { Page } from "@playwright/test";

const scenarios: {
  ruleIds: string[];
  testPageURL: string;
  expectedRedirections: { redirectedFrom: string; redirectedTo: string }[];
  pageActions?: (page: Page) => Promise<void>;
}[] = [
  {
    ruleIds: ["Redirect_1"],
    testPageURL: "https://example.com/",
    expectedRedirections: [
      {
        redirectedFrom: "https://example.com/",
        redirectedTo: "https://example1.com/",
      },
    ],
  },
  {
    ruleIds: ["Redirect_2"],
    testPageURL: "https://testheaders.com/",
    expectedRedirections: [
      {
        redirectedFrom: "https://testheaders.com/files/sample.js",
        redirectedTo: "https://requestly.tech/api/mockv2/ping?teamId=9sBQkTnxaMlBY6kWHpoz",
      },
    ],
  },
];

export default scenarios;
