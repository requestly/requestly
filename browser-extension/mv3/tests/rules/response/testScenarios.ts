import { Page } from "@playwright/test";

export interface ResponseRuleTestScenarioData {
  ruleIds: string[];
  testPageURL: string;
  pageActions?: () => void;
  expectedResponseModifications: {
    testUrl: string;
    expectedResponseBody: string | Record<any, any>;
    expectedStatusCode?: string;
    serveWithoutHittingServer?: boolean;
  }[];
}

const testScenarios: ResponseRuleTestScenarioData[] = [
  {
    ruleIds: ["Response_1"],
    testPageURL: "https://example.com/",
    pageActions: () => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", "https://requestly.tech/api/mockv2/response_rule?teamId=9sBQkTnxaMlBY6kWHpoz");
      xhr.setRequestHeader("content-type", "application/json");
      xhr.send();
    },
    expectedResponseModifications: [
      {
        testUrl: "https://requestly.tech/api/mockv2/response_rule?teamId=9sBQkTnxaMlBY6kWHpoz",
        expectedResponseBody: "{ response_modified: true }",
      },
    ],
  },
  {
    ruleIds: ["Response_2"],
    testPageURL: "https://example.com/",
    pageActions: () => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", "https://requestly.tech/api/mockv2/response_rule?teamId=9sBQkTnxaMlBY6kWHpoz");
      xhr.setRequestHeader("content-type", "application/json");
      xhr.send();
    },
    expectedResponseModifications: [
      {
        testUrl: "https://requestly.tech/api/mockv2/response_rule?teamId=9sBQkTnxaMlBY6kWHpoz",
        expectedResponseBody: { hello: "world", testing: "response rule" },
        expectedStatusCode: "201",
      },
    ],
  },
  {
    ruleIds: ["Response_3"],
    testPageURL: "https://example.com/",
    pageActions: () => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", "https://requestly.tech/api/mockv2/response_rule?teamId=9sBQkTnxaMlBY6kWHpoz");
      xhr.setRequestHeader("content-type", "application/json");
      xhr.send();
    },
    expectedResponseModifications: [
      {
        testUrl: "https://requestly.tech/api/mockv2/response_rule?teamId=9sBQkTnxaMlBY6kWHpoz",
        expectedResponseBody: { hello: "world", testing: "response rule" },
        expectedStatusCode: "201",
        serveWithoutHittingServer: true,
      },
    ],
  },
  {
    ruleIds: ["Response_4"],
    testPageURL: "https://example.com/",
    pageActions: () => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "https://requestly.tech/api/mockv2/response_rule?teamId=9sBQkTnxaMlBY6kWHpoz");
      xhr.setRequestHeader("content-type", "application/json");
      xhr.send('{"foo": "bar1"}');
    },
    expectedResponseModifications: [
      {
        testUrl: "https://requestly.tech/api/mockv2/response_rule?teamId=9sBQkTnxaMlBY6kWHpoz",
        expectedResponseBody: { dynamic: "modification" },
        expectedStatusCode: "201",
      },
    ],
  },
];

export default testScenarios;
