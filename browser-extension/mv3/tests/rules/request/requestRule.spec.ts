import { Page, Request, expect } from "@playwright/test";
import { test } from "../../fixtures";
import { loadRules } from "../../utils";
import redirectRules from "./request_rules.json";
import testScenarios, { RequestRuleTestScenario } from "./testScenarios";
import { IBaseTestData } from "../types";

test.describe("Request Rule", () => {
  testScenarios.forEach((scenario, i) => {
    test(scenario.description, async ({ appPage, context }) => {
      await testRequestRule({ appPage, context, ...scenario });
    });
  });
});

const testRequestRule = async (testScenarioData: RequestRuleTestScenario & IBaseTestData) => {
  const { appPage, context, ruleIds, testPageURL, expectedBodyUpdates, pageActions } = testScenarioData;
  const rules = ruleIds.reduce((acc, ruleId) => ({ ...acc, [ruleId]: redirectRules[ruleId] }), {});
  await loadRules(appPage, rules);

  const testPage = await context.newPage();

  const bodyMap = new Map<string, string[]>();

  testPage.on("request", (request: Request) => {
    if (request.method() === "POST") {
      const body = request.postData();
      if (bodyMap.has(request.url())) {
        bodyMap[request.url()].push(body);
      } else {
        bodyMap.set(request.url(), [body ?? ""]);
      }
    }
  });

  await testPage.goto(testPageURL, { waitUntil: "domcontentloaded" });

  await pageActions?.(testPage);

  for (const { url, expectedBody } of expectedBodyUpdates) {
    const finalBody = bodyMap.get(url);
    expect(finalBody).toBeDefined();
    expect(finalBody).toContain(expectedBody);
  }
};
