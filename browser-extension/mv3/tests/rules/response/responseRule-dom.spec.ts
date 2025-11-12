import { expect, test } from "../../fixtures";
import { loadRules } from "../../utils";
import responseRules from "./response_rules.json";
import testScenarios, { ResponseRuleDOMTestScenarioData } from "./testScenarios-dom";
import { IBaseTestData } from "../types";

test.describe("Response Rule - DOM Verification", () => {
  testScenarios.forEach((scenario, i) => {
    test(`${i + 1}. @ResponseRule-DOM: ${scenario.description}`, async ({ appPage, extensionContext }) => {
      await testResponseRuleWithDOM({ appPage, extensionContext, ...scenario });
    });
  });
});

const testResponseRuleWithDOM = async (testScenarioData: ResponseRuleDOMTestScenarioData & IBaseTestData) => {
  const { appPage, extensionContext, ruleIds, testPagePath, pageInteractions, domVerifications } = testScenarioData;

  const rules = ruleIds.reduce((acc, ruleId) => ({ ...acc, [ruleId]: responseRules[ruleId] }), {});
  await loadRules(appPage, rules);

  const testPage = await extensionContext.newPage();

  // Navigate to local test page and wait for it to load
  await testPage.goto(testPagePath, { waitUntil: "domcontentloaded" });
  await testPage.waitForTimeout(500);

  // Execute page interactions (click buttons to trigger XHR)
  for (const interaction of pageInteractions) {
    await interaction(testPage);
    // Longer wait for tests with multiple requests (like shared state test)
    const waitTime = ruleIds.includes("Response_8") ? 3000 : 2000;
    await testPage.waitForTimeout(waitTime);
  }

  // Verify DOM changes based on modified responses
  for (const verification of domVerifications) {
    const element = testPage.locator(verification.selector);

    if (verification.type === "text") {
      await expect(element).toHaveText(verification.expectedValue as string);
    } else {
      await expect(element).toContainText(verification.expectedValue as string);
    }
  }

  await testPage.close();
};
