import { Page } from "@playwright/test";

export interface ResponseRuleTestScenario {
  description: string;
  ruleIds: string[];
  testPageURL: string;
  expectedResponseUpdates: { url: string; expectedResponse: string; expectedStatusCode?: number }[];
  pageActions?: (page: Page) => Promise<void>;
}

const scenarios: ResponseRuleTestScenario[] = [
  // {
  //   description: "Static modification",
  //   testPageURL: "https://example.com",
  //   ruleIds: ["Response_1"],
  //   expectedResponseUpdates: [
  //     {
  //       url: "https://requestly.tech/api/mockv2/response-requestly?teamId=9sBQkTnxaMlBY6kWHpoz",
  //       expectedResponse: '{"hello":"world","testing":"response rule"}',
  //       expectedStatusCode: 201,
  //     },
  //   ],
  //   pageActions: async (page: Page) => {
  //     await page.evaluate(async () => {
  //       await fetch("https://requestly.tech/api/mockv2/response-requestly?teamId=9sBQkTnxaMlBY6kWHpoz");
  //     });
  //   },
  // },
  // {
  //   description: "Static modification without server",
  //   testPageURL: "https://example.com",
  //   ruleIds: ["Response_2"],
  //   expectedResponseUpdates: [
  //     {
  //       url: "https://requestly.tech/api/mockv2/response-requestly?teamId=9sBQkTnxaMlBY6kWHpoz",
  //       expectedResponse: '{"hello":"world","testing":"response rule"}',
  //       expectedStatusCode: 201,
  //     },
  //   ],
  //   pageActions: async (page: Page) => {
  //     await page.evaluate(async () => {
  //       await fetch("https://requestly.tech/api/mockv2/response-requestly?teamId=9sBQkTnxaMlBY6kWHpoz");
  //     });
  //   },
  // },
  // {
  //   description: "Sync Dynamic modification",
  //   testPageURL: "https://example.com",
  //   ruleIds: ["Response_3"],
  //   expectedResponseUpdates: [
  //     {
  //       url: "https://requestly.tech/api/mockv2/response-requestly?teamId=9sBQkTnxaMlBY6kWHpoz",
  //       expectedResponse: '{"dynamic": "modification"}',
  //       expectedStatusCode: 201,
  //     },
  //   ],
  //   pageActions: async (page: Page) => {
  //     await page.evaluate(async () => {
  //       await fetch("https://requestly.tech/api/mockv2/response-requestly?teamId=9sBQkTnxaMlBY6kWHpoz");
  //     });
  //   },
  // },
  // {
  //   description: "Async Dynamic modification",
  //   testPageURL: "https://example.com",
  //   ruleIds: ["Response_4"],
  //   expectedResponseUpdates: [
  //     {
  //       url: "https://requestly.tech/api/mockv2/response-requestly?teamId=9sBQkTnxaMlBY6kWHpoz",
  //       expectedResponse: '{"dynamic": "modification"}',
  //       expectedStatusCode: 202,
  //     },
  //   ],
  //   pageActions: async (page: Page) => {
  //     await page.evaluate(async () => {
  //       await fetch("https://requestly.tech/api/mockv2/response-requestly?teamId=9sBQkTnxaMlBY6kWHpoz");
  //     });
  //   },
  // },
  // {
  //   description: "Fetch Dynamic modification",
  //   testPageURL: "https://example.com",
  //   ruleIds: ["Response_5"],
  //   expectedResponseUpdates: [
  //     {
  //       url: "https://requestly.tech/api/mockv2/response-requestly?teamId=9sBQkTnxaMlBY6kWHpoz",
  //       expectedResponse: '{\n  "ok": true,\n  "rq": "rocks",\n  "rq": "super rocks"\n}',
  //     },
  //   ],
  //   pageActions: async (page: Page) => {
  //     await page.evaluate(async () => {
  //       await fetch("https://requestly.tech/api/mockv2/response-requestly?teamId=9sBQkTnxaMlBY6kWHpoz");
  //     });
  //   },
  // },
  // {
  //   description: "Fetch static modification",
  //   testPageURL: "https://example.com",
  //   ruleIds: ["Response_6"],
  //   expectedResponseUpdates: [
  //     {
  //       url: "https://requestly.tech/api/mockv2/response-requestly?teamId=9sBQkTnxaMlBY6kWHpoz",
  //       expectedResponse: '{"foo":"bar"}',
  //     },
  //   ],
  //   pageActions: async (page: Page) => {
  //     await page.evaluate(async () => {
  //       await fetch("https://requestly.tech/api/mockv2/response-requestly?teamId=9sBQkTnxaMlBY6kWHpoz");
  //     });
  //   },
  // },
];

export default scenarios;
