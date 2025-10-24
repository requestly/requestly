import { Page } from "@playwright/test";

export interface CancelRuleTestScenario {
  description: string;
  ruleIds: string[];
  testPageURL: string;
  expectedCancelledRequests: {
    cancelledRequestUrl: string;
    expectedError: string;
  }[];
  unexpectedCancelledRequests?: string[]; // url strings
  pageActions?: (page: Page) => Promise<void>;
}

const scenarios: CancelRuleTestScenario[] = [
  {
    description: "Document cancelled",
    ruleIds: ["Cancel_1"],
    testPageURL: "https://example.com/",
    expectedCancelledRequests: [
      {
        cancelledRequestUrl: "https://example.com/",
        expectedError: "net::ERR_BLOCKED_BY_CLIENT",
      },
    ],
  },
  {
    description: "Fetch cancelled",
    ruleIds: ["Cancel_2"],
    testPageURL: "https://example.com/",
    expectedCancelledRequests: [
      {
        cancelledRequestUrl: "https://requestly.tech/api/mockv2/ping?teamId=9sBQkTnxaMlBY6kWHpoz",
        expectedError: "net::ERR_BLOCKED_BY_CLIENT",
      },
    ],
    pageActions: async (testPage: Page) => {
      await testPage.evaluate(() => {
        fetch("https://requestly.tech/api/mockv2/ping?teamId=9sBQkTnxaMlBY6kWHpoz");
      });
    },
  },
  {
    description: "XHR cancelled",
    ruleIds: ["Cancel_2"],
    testPageURL: "https://example.com/",
    expectedCancelledRequests: [
      {
        cancelledRequestUrl: "https://requestly.tech/api/mockv2/ping?teamId=9sBQkTnxaMlBY6kWHpoz",
        expectedError: "net::ERR_BLOCKED_BY_CLIENT",
      },
    ],
    pageActions: async (testPage: Page) => {
      await testPage.evaluate(() => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "https://requestly.tech/api/mockv2/ping?teamId=9sBQkTnxaMlBY6kWHpoz");
        xhr.send();
      });
    },
  },
  {
    description: "Cancel Rule with filter should fail",
    ruleIds: ["Cancel_3"],
    testPageURL: "https://example2.com/",
    expectedCancelledRequests: [],
    unexpectedCancelledRequests: ["https://requestly.tech/api/mockv2/ping?teamId=9sBQkTnxaMlBY6kWHpoz"],
    pageActions: async (testPage: Page) => {
      await testPage.evaluate(() => {
        fetch("https://requestly.tech/api/mockv2/ping?teamId=9sBQkTnxaMlBY6kWHpoz");
      });
    },
  },
  {
    description: "Cancel Rule (FETCH) with filter should pass",
    ruleIds: ["Cancel_3"],
    testPageURL: "https://example.com/",
    expectedCancelledRequests: [
      {
        cancelledRequestUrl: "https://requestly.tech/api/mockv2/ping?teamId=9sBQkTnxaMlBY6kWHpoz",
        expectedError: "net::ERR_BLOCKED_BY_CLIENT",
      },
    ],
    pageActions: async (testPage: Page) => {
      await testPage.evaluate(() => {
        fetch("https://requestly.tech/api/mockv2/ping?teamId=9sBQkTnxaMlBY6kWHpoz");
      });
    },
  },
  {
    description: "Cancel Rule (XHR) with filter should pass",
    ruleIds: ["Cancel_3"],
    testPageURL: "https://example.com/",
    expectedCancelledRequests: [
      {
        cancelledRequestUrl: "https://requestly.tech/api/mockv2/ping?teamId=9sBQkTnxaMlBY6kWHpoz",
        expectedError: "net::ERR_BLOCKED_BY_CLIENT",
      },
    ],
    pageActions: async (testPage: Page) => {
      await testPage.evaluate(() => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "https://requestly.tech/api/mockv2/ping?teamId=9sBQkTnxaMlBY6kWHpoz");
        xhr.send();
      });
    },
  },
];

export default scenarios;
