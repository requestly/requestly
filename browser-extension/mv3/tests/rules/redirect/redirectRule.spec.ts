import { Page, Request, expect } from "@playwright/test";
import { test } from "../../fixtures";
import { loadRules } from "../../utils";
import redirectRules from "./redirect_rules.json";

const scenarios = [
  {
    ruleIds: ["Redirect_1"],
    testPageURL: "https://example.com/",
    expectedRedirections: [
      {
        redirectedFrom: "https://example.com/",
        redirectedTo: "https://example1.com/",
      },
    ],
    pageActions: async () => {},
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
    pageActions: async (testPage: Page) => {},
  },
];

const testRedirection = async ({ appPage, context, ruleIds, testPageURL, expectedRedirections, pageActions }) => {
  const rules = ruleIds.reduce((acc, ruleId) => ({ ...acc, [ruleId]: redirectRules[ruleId] }), {});
  await loadRules(appPage, rules);

  const testPage = await context.newPage();

  const redirections = new Map<string, string>();

  testPage.on("request", (request: Request) => {
    if (request?.redirectedFrom()?.url()) {
      console.log("!!!debug", "map values", request?.redirectedFrom()?.url(), "->", request.url());
      redirections.set(request?.redirectedFrom()?.url()!, request.url());
    }
  });

  await testPage.goto(testPageURL, { waitUntil: "domcontentloaded" });

  await pageActions(testPage);

  for (const { redirectedFrom, redirectedTo } of expectedRedirections) {
    const actualRedirection = redirections.get(redirectedFrom);
    expect(actualRedirection).toBeDefined();
    expect(actualRedirection).toBe(redirectedTo);
  }
};

test.describe("Redirect Rule", () => {
  scenarios.forEach(({ ruleIds, testPageURL, expectedRedirections, pageActions }, i) => {
    test(`${i + 1}. Redirect rule`, async ({ appPage, context }) => {
      await testRedirection({ appPage, context, ruleIds, testPageURL, expectedRedirections, pageActions });
    });
  });
});
