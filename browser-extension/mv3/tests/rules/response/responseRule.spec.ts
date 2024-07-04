import { test, expect } from "../../fixtures";
import { loadRules } from "../../utils";
import responseRules from "./response_rules.json";
import testScenarios, { ResponseRuleTestScenario } from "./testScenarios";
import { IBaseTestData } from "../types";

test.describe("Response Rule", () => {
  testScenarios.forEach((scenario, i) => {
    test(scenario.description, async ({ appPage, context }) => {
      await testResponseRule({ appPage, context, ...scenario });
    });
  });
});

const testResponseRule = async (testScenarioData: ResponseRuleTestScenario & IBaseTestData) => {
  const { appPage, context, ruleIds, testPageURL, expectedResponseUpdates, pageActions } = testScenarioData;
  const rules = ruleIds.reduce((acc, ruleId) => ({ ...acc, [ruleId]: responseRules[ruleId] }), {});
  await loadRules(appPage, rules);

  const testPage = await context.newPage();

  const responseMap = new Map<string, { response: string; statusCode: number }[]>();

  testPage.on("response", async (response: Response) => {
    const url = response.url();
    const responseBody = (await response.body()).toString();
    const statusCode = response.status();

    const responseInfo = { response: responseBody ?? "", statusCode };
    if (responseMap.has(url)) {
      responseMap.get(url)?.push(responseInfo);
    } else {
      responseMap.set(url, [responseInfo]);
    }
  });

  await testPage.goto(testPageURL, { waitUntil: "domcontentloaded" });

  await pageActions?.(testPage);

  for (const { url, expectedResponse, expectedStatusCode } of expectedResponseUpdates) {
    const responseInfo = responseMap.get(url);
    expect(responseInfo).toBeDefined();
    const matchingResponseInfo = responseInfo?.find((info) => info.response === expectedResponse);
    expect(matchingResponseInfo).toBeDefined();
    if (expectedStatusCode) expect(matchingResponseInfo?.statusCode).toBe(expectedStatusCode);
  }
};
