import { test, expect } from "../../fixtures";
import cancelRules from "./cancel_rules.json";
import { loadRules } from "../../utils";
import testScenarios, { CancelRuleTestScenario } from "./testScenarios";
import { IBaseTestData } from "../types";

test.describe("Cancel Rule", () => {
  testScenarios.forEach((scenario, i) => {
    test(`${i + 1}. @CancelRule: ${scenario.description}`, async ({ appPage, extensionContext }) => {
      await testCancelRule({ appPage, extensionContext, ...scenario });
    });
  });
});

const testCancelRule = async (testScenarioData: CancelRuleTestScenario & IBaseTestData) => {
  const {
    appPage,
    extensionContext,
    ruleIds,
    testPageURL,
    expectedCancelledRequests,
    unexpectedCancelledRequests,
    pageActions,
  } = testScenarioData;
  const rules = ruleIds.reduce((acc, ruleId) => ({ ...acc, [ruleId]: cancelRules[ruleId] }), {});
  await loadRules(appPage, rules);

  const testPage = await extensionContext.newPage();

  const cancelledRequests = new Map<string, string>();

  testPage.on("request", (request) => {
    const failure = request.failure();
    if (failure !== null) {
      cancelledRequests.set(request.url(), failure.errorText);
    }
  });

  await testPage.goto(testPageURL, { waitUntil: "domcontentloaded" });

  await pageActions?.(testPage);

  if (unexpectedCancelledRequests) {
    for (const url of unexpectedCancelledRequests) {
      expect(cancelledRequests.get(url)).toBeUndefined();
    }
  }
};
