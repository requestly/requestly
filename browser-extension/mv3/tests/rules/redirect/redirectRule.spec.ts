import { Page, Request, expect } from "@playwright/test";
import { test } from "../../fixtures";
import { loadRules } from "../../utils";
import redirectRules from "./redirect_rules.json";
import testScenarios from "./testScenarios";

test.describe("Redirect Rule", () => {
  testScenarios.forEach((scenario, i) => {
    test(`${i + 1}. @RedirectRule`, async ({ appPage, extensionContext }) => {
      await testRedirection({ appPage, extensionContext, ...scenario });
    });
  });
});

const testRedirection = async (testScenarioData) => {
  const { appPage, extensionContext, ruleIds, testPageURL, expectedRedirections, pageActions } = testScenarioData;
  const rules = ruleIds.reduce((acc, ruleId) => ({ ...acc, [ruleId]: redirectRules[ruleId] }), {});
  await loadRules(appPage, rules);

  const testPage = await extensionContext.newPage();

  const redirections = new Map<string, string>();

  // Set up request listener BEFORE navigation
  testPage.on("request", (request: Request) => {
    if (request?.redirectedFrom()?.url()) {
      redirections.set(request?.redirectedFrom()?.url()!, request.url());
    }
  });

  // No wait needed - listeners are synchronous
  await testPage.goto(testPageURL, { waitUntil: "domcontentloaded" });

  await pageActions?.(testPage);

  // Minimal wait for redirections - most complete during navigation
  await testPage.waitForTimeout(100); // Reduced from 200ms

  for (const { redirectedFrom, redirectedTo } of expectedRedirections) {
    const actualRedirection = redirections.get(redirectedFrom);
    expect(actualRedirection).toBeDefined();
    expect(actualRedirection).toBe(redirectedTo);
  }

  // Clean up
  await testPage.close();
};
