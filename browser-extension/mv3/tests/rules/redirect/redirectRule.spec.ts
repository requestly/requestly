import { Page, Request, expect } from "@playwright/test";
import { test } from "../../fixtures";
import { loadRules } from "../../utils";
import redirectRules from "./redirect_rules.json";
import testScenarios from "./testScenarios";

test.describe("Redirect Rule", () => {
  testScenarios.forEach((scenario, i) => {
    test(`${i + 1}. @RedirectRule`, async ({ appPage, context }) => {
      await testRedirection({ appPage, context, ...scenario });
    });
  });
});

const testRedirection = async (testScenarioData) => {
  const { appPage, context, ruleIds, testPageURL, expectedRedirections, pageActions } = testScenarioData;
  const rules = ruleIds.reduce((acc, ruleId) => ({ ...acc, [ruleId]: redirectRules[ruleId] }), {});
  await loadRules(appPage, rules);

  const testPage = await context.newPage();

  const redirections = new Map<string, string>();

  testPage.on("request", (request: Request) => {
    if (request?.redirectedFrom()?.url()) {
      redirections.set(request?.redirectedFrom()?.url()!, request.url());
    }
  });

  await testPage.goto(testPageURL, { waitUntil: "domcontentloaded" });

  await pageActions?.(testPage);

  for (const { redirectedFrom, redirectedTo } of expectedRedirections) {
    const actualRedirection = redirections.get(redirectedFrom);
    expect(actualRedirection).toBeDefined();
    expect(actualRedirection).toBe(redirectedTo);
  }
};
