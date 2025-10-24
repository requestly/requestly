import { Page } from "@playwright/test";

export interface ResponseRuleTestScenarioData {
  description: string;
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
    description: "XHR static response modification",
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
        expectedResponseBody: { response_modified: true },
      },
    ],
  },
  {
    description: "XHR static response modification",
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
    description: "XHR without hitting server response modification",
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
    description: "XHR dynamic response modification",
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
  {
    description: "XHR Shared State",
    ruleIds: ["Response_8"],
    testPageURL: "https://example.com/",
    pageActions: () => {
      for (let i = 1; i <= 2; i++) {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "https://requestly.tech/api/mockv2/request_rule?teamId=9sBQkTnxaMlBY6kWHpoz");
        xhr.send();
      }
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "https://requestly.tech/api/mockv2/response_rule?teamId=9sBQkTnxaMlBY6kWHpoz");
      xhr.send();
    },
    expectedResponseModifications: [
      {
        testUrl: "https://requestly.tech/api/mockv2/response_rule?teamId=9sBQkTnxaMlBY6kWHpoz",
        expectedResponseBody: { isSharedStateCountGteOne: true },
        expectedStatusCode: "201",
      },
    ],
  },
];

export default testScenarios;
