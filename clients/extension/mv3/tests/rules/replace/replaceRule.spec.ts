import { Request, expect } from "@playwright/test";
import { test } from "../../fixtures";
import { loadRules } from "../../utils";
import replaceRules from "./replace_rules.json";
import testScenarios, { ReplaceRuleTestScenario } from "./testScenarios";
import { IBaseTestData } from "../types";

test.describe("Replace Rule", () => {
  testScenarios.forEach((scenario, i) => {
    test(`${i + 1}. @ReplaceRule: ${scenario.description}`, async ({ appPage, context }) => {
      await testReplace({ appPage, context, ...scenario });
    });
  });
});

const testReplace = async (testScenarioData: ReplaceRuleTestScenario & IBaseTestData) => {
  const { appPage, context, ruleIds, testPageUrl, pageActions, expectedRedirections } = testScenarioData;
  const rules = ruleIds.reduce((acc, ruleId) => ({ ...acc, [ruleId]: replaceRules[ruleId] }), {});
  await loadRules(appPage, rules);

  const testPage = await context.newPage();

  const redirections = new Map<string, string>();

  testPage.on("request", (request: Request) => {
    if (request?.redirectedFrom()?.url()) {
      redirections.set(request?.redirectedFrom()?.url()!, request.url());
    }
  });

  await testPage.goto(testPageUrl, { waitUntil: "domcontentloaded" });

  await pageActions?.(testPage);

  for (const { redirectedFrom, redirectedTo } of expectedRedirections) {
    const actualRedirection = redirections.get(redirectedFrom);
    expect(actualRedirection).toBeDefined();
    expect(actualRedirection).toBe(redirectedTo);
  }
};
