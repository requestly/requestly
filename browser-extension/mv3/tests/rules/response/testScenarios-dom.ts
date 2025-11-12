import { Page } from "@playwright/test";

export type DOMVerificationType = "text" | "contains";

export interface DOMVerification {
  selector: string;
  type: DOMVerificationType;
  expectedValue: string;
}

export interface ResponseRuleDOMTestScenarioData {
  description: string;
  ruleIds: string[];
  testPagePath: string;
  pageInteractions: ((page: Page) => Promise<void>)[];
  domVerifications: DOMVerification[];
}

const testScenarios: ResponseRuleDOMTestScenarioData[] = [
  {
    description: "XHR static response modification",
    ruleIds: ["Response_1"],
    testPagePath: "http://localhost:8080/test-response.html",
    pageInteractions: [
      async (page: Page) => {
        await page.click("#test-btn-1");
      },
    ],
    domVerifications: [
      {
        selector: "#result-1",
        type: "contains",
        expectedValue: "response_modified: true",
      },
    ],
  },
  {
    description: "XHR static response modification with status code",
    ruleIds: ["Response_2"],
    testPagePath: "http://localhost:8080/test-response.html",
    pageInteractions: [
      async (page: Page) => {
        await page.click("#test-btn-2");
      },
    ],
    domVerifications: [
      {
        selector: "#result-2",
        type: "contains",
        expectedValue: "hello: world",
      },
      {
        selector: "#status-2",
        type: "text",
        expectedValue: "201",
      },
    ],
  },
];

export default testScenarios;
