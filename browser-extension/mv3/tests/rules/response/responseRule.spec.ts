import { Page } from "@playwright/test";
import { expect, test } from "../../fixtures";
import { loadRules } from "../../utils";
import responseRules from "./response_rules.json";
import testScenarios, { ResponseRuleTestScenarioData } from "./testScenarios";
import { IBaseTestData } from "../types";

test.describe("Response Rule", () => {
  testScenarios.forEach((scenario, i) => {
    test(`${i + 1}. @ResponseRule: ${scenario.description}`, async ({ appPage, context }) => {
      await testResponseRule({ appPage, context, ...scenario });
    });
  });
});

const testResponseRule = async (testScenarioData: ResponseRuleTestScenarioData & IBaseTestData) => {
  const { appPage, context, ruleIds, testPageURL, pageActions } = testScenarioData;
  const rules = ruleIds.reduce((acc, ruleId) => ({ ...acc, [ruleId]: responseRules[ruleId] }), {});
  await loadRules(appPage, rules);

  const testPage = await context.newPage();

  await testPage.addInitScript(initScript);

  await testPage.goto(testPageURL, { waitUntil: "domcontentloaded" });

  const expectedResponsePromises = testScenarioData.expectedResponseModifications
    .map((expectedResponseModification) => {
      if (expectedResponseModification.serveWithoutHittingServer !== true) {
        return testPage.waitForResponse(expectedResponseModification.testUrl);
      }
      return null;
    })
    .filter(Boolean);

  if (pageActions) {
    await testPage.evaluate(pageActions);
  }

  await Promise.all(expectedResponsePromises);

  //@ts-ignore
  const interceptedResponses = await testPage.evaluate(() => window.__getInterceptedResponses());

  for (const expectedResponseModification of testScenarioData.expectedResponseModifications) {
    const interceptedResponse = interceptedResponses[expectedResponseModification.testUrl];
    expect(interceptedResponse).toBeDefined();
    //To be debugged why getting status code to be 0 for modified responses
    // expect(interceptedResponse.status).toBe(parseInt(expectedResponseModification.expectedStatusCode as string) ?? 200);

    const expectedResponseBody =
      typeof expectedResponseModification.expectedResponseBody === "string"
        ? expectedResponseModification.expectedResponseBody
        : JSON.stringify(expectedResponseModification.expectedResponseBody);
    expect(interceptedResponse.response).toEqual(expectedResponseBody);
  }
};

const initScript = () => {
  (function () {
    let interceptedResponses = {};

    const originalOpen = XMLHttpRequest.prototype.open;
    //@ts-ignore
    XMLHttpRequest.prototype.open = function (method, url, async, user, pass) {
      this.addEventListener(
        "readystatechange",
        function () {
          if (this.readyState === 4) {
            // DONE

            const requestUrl = typeof url === "string" ? url : url.toString();

            if (!interceptedResponses[requestUrl]) {
              interceptedResponses[requestUrl] = { response: this.response, status: this.status };
            }
          }
        },
        false
      );
      originalOpen.call(this, method, url, async, user, pass);
    };

    //@ts-ignore
    window.__getInterceptedResponses = () => {
      const responses = interceptedResponses;
      interceptedResponses = {};
      return responses;
    };
  })();
};
