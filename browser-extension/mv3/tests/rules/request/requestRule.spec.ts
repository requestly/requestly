import { Page } from "@playwright/test";
import { expect, test } from "../../fixtures";
import { loadRules } from "../../utils";
import requestRules from "./request_rules.json";
import { RequestRuleTestScenarioData } from "./testScenarios";
import { IBaseTestData } from "../types";
import testScenarios from "./testScenarios";

test.describe("Request Rule", () => {
  testScenarios.forEach((scenario, i) => {
    test(`${i + 1}. @RequestRule: ${scenario.description}`, async ({ appPage, context }) => {
      await testRequestRule({ appPage, context, ...scenario });
    });
  });
});

const testRequestRule = async (testScenarioData: RequestRuleTestScenarioData & IBaseTestData) => {
  const { appPage, context, ruleIds, testPageURL, pageActions } = testScenarioData;
  const rules = ruleIds.reduce((acc, ruleId) => ({ ...acc, [ruleId]: requestRules[ruleId] }), {});
  await loadRules(appPage, rules);

  const testPage = await context.newPage();

  await testPage.goto(testPageURL, { waitUntil: "domcontentloaded" });

  const expectedRequestPromises = testScenarioData.expectedRequestModifications.map((expectedRequestModification) => {
    return testPage.waitForRequest(expectedRequestModification.testUrl);
  });

  if (pageActions) {
    await testPage.evaluate(pageActions);
  }

  const requests = await Promise.all(expectedRequestPromises);

  for (const [index, request] of requests.entries()) {
    const expectedRequestBody =
      typeof testScenarioData.expectedRequestModifications[index].expectedRequestBody === "string"
        ? testScenarioData.expectedRequestModifications[index].expectedRequestBody
        : JSON.stringify(testScenarioData.expectedRequestModifications[index].expectedRequestBody);

    expect(request.postData()).toBe(expectedRequestBody);
  }
};
