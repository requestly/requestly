import { Page } from "@playwright/test";

interface HeaderInfo {
  headerName: string;
  headerValue?: string;
}

export interface HeaderRuleTestScenario {
  ruleIds: string[];
  testPageUrl: string;
  expectedHeaderInfo?: {
    url: string;
    requestHeaders: HeaderInfo[];
    responseHeaders: HeaderInfo[];
  }[];
  pageActions?: (page: Page) => Promise<void>;
  shouldCaptureCORS?: boolean;
  expectCORSFailure?: boolean;
}

const scenarios: HeaderRuleTestScenario[] = [
  {
    ruleIds: ["Headers_1"],
    testPageUrl: "https://requestly.tech/api/mockv2/testHeaderRule2?teamId=9sBQkTnxaMlBY6kWHpoz",
    expectedHeaderInfo: [
      {
        url: "https://requestly.tech/api/mockv2/testHeaderRule2?teamId=9sBQkTnxaMlBY6kWHpoz",
        requestHeaders: [
          {
            headerName: "header1",
            headerValue: "header1Value",
          },
          {
            headerName: "accept",
          },
          {
            headerName: "accept-language",
            headerValue: "test",
          },
        ],
        responseHeaders: [
          {
            headerName: "newheader1",
            headerValue: "newHeader1Value",
          },
          {
            headerName: "nonmodifiedheader1",
            headerValue: "modifiedHeader1Value",
          },
          {
            headerName: "nonmodifiedheader2",
          },
        ],
      },
    ],
  },
  {
    ruleIds: ["Headers_2"],
    testPageUrl: "https://example.com",
    expectedHeaderInfo: [
      {
        url: "https://requestly.tech/api/mockv2/testHeaderRule2?teamId=9sBQkTnxaMlBY6kWHpoz",
        requestHeaders: [
          {
            headerName: "newrequestheader2",
            headerValue: "newRequestHeader2Value",
          },
          {
            headerName: "nonmodifiedrequestheader1",
            headerValue: "modifiedRequestHeader1Value",
          },
          {
            headerName: "nonmodifiedrequestheader2",
          },
          {
            headerName: "nonmodifiedrequestheader3",
            headerValue: "modifiedRequestHeader3Value",
          },
        ],
        responseHeaders: [
          {
            headerName: "newresponseheader1",
            headerValue: "newResponseHeader1Value",
          },
          {
            headerName: "nonmodifiedheader1",
            headerValue: "modifiedHeader1Value",
          },
          {
            headerName: "nonmodifiedheader2",
          },
        ],
      },
    ],
    pageActions: async (testPage: Page) => {
      await testPage.evaluate(() => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "https://requestly.tech/api/mockv2/testHeaderRule2?teamId=9sBQkTnxaMlBY6kWHpoz");
        xhr.setRequestHeader("nonModifiedRequestHeader1", "nonModifiedRequestHeader1Value");
        xhr.setRequestHeader("nonModifiedRequestHeader2", "nonModifiedRequestHeader2Value");
        xhr.setRequestHeader("nonModifiedRequestHeader3", "nonModifiedRequestHeader3Value");
        xhr.setRequestHeader("content-type", "application/json");
        xhr.send();
      });
    },
  },
  {
    ruleIds: [],
    testPageUrl: "https://example.com",
    pageActions: async (testPage: Page) => {
      await testPage.evaluate(() => {
        fetch("https://testHeaders.com/exampleAPI");
      });
    },
    shouldCaptureCORS: true,
    expectCORSFailure: true,
  },
  {
    ruleIds: ["Headers_3"],
    testPageUrl: "https://example.com",
    pageActions: async (testPage: Page) => {
      await testPage.evaluate(() => {
        fetch("https://testHeaders.com/exampleAPI");
      });
    },
    shouldCaptureCORS: true,
    expectCORSFailure: false,
  },
  {
    ruleIds: ["Headers_3"],
    testPageUrl: "https://example.com",
    pageActions: async (testPage: Page) => {
      await testPage.evaluate(() => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "https://testHeaders.com/exampleAPI");
        xhr.send();
      });
    },
    shouldCaptureCORS: true,
    expectCORSFailure: false,
  },
];

export default scenarios;
