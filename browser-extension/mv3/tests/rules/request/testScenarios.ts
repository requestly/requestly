import { Page } from "@playwright/test";

export interface RequestRuleTestScenario {
  description: string;
  ruleIds: string[];
  testPageURL: string;
  expectedBodyUpdates: { url: string; expectedBody: string }[];
  pageActions?: (page: Page) => Promise<void>;
}

const testScenarios: RequestRuleTestScenario[] = [
  // {
  //   description: "Static modification",
  //   testPageURL: "https://example.com",
  //   ruleIds: ["Request_1"],
  //   expectedBodyUpdates: [
  //     {
  //       url: "https://requestly.tech/api/mockv2/sink?teamId=9sBQkTnxaMlBY6kWHpoz",
  //       expectedBody: '{"request":"rule","static":"modification"}',
  //     },
  //   ],
  //   pageActions: async (page: Page) => {
  //     await page.evaluate(async () => {
  //       await fetch("https://requestly.tech/api/mockv2/sink?teamId=9sBQkTnxaMlBY6kWHpoz", {
  //         method: "POST",
  //         body: "test",
  //       });
  //     });
  //   },
  // },
  // {
  //   description: "Simple Dynamic modification",
  //   testPageURL: "https://example.com",
  //   ruleIds: ["Request_2"],
  //   expectedBodyUpdates: [
  //     {
  //       url: "https://requestly.tech/api/mockv2/sink?teamId=9sBQkTnxaMlBY6kWHpoz",
  //       expectedBody: '{ dynamic: "modification" }',
  //     },
  //   ],
  //   pageActions: async (page: Page) => {
  //     await page.evaluate(async () => {
  //       await fetch("https://requestly.tech/api/mockv2/sink?teamId=9sBQkTnxaMlBY6kWHpoz", {
  //         method: "POST",
  //         body: "test",
  //       });
  //     });
  //   },
  // },
  // {
  //   description: "Async Dynamic modification",
  //   testPageURL: "https://example.com",
  //   ruleIds: ["Request_3"],
  //   expectedBodyUpdates: [
  //     {
  //       url: "https://requestly.tech/api/mockv2/sink?teamId=9sBQkTnxaMlBY6kWHpoz",
  //       expectedBody: '{ dynamic: "async request" }',
  //     },
  //   ],
  //   pageActions: async (page: Page) => {
  //     await page.evaluate(async () => {
  //       await fetch("https://requestly.tech/api/mockv2/sink?teamId=9sBQkTnxaMlBY6kWHpoz", {
  //         method: "POST",
  //         body: "test",
  //       });
  //     });
  //   },
  // },
];

export default testScenarios;
