import { test, expect } from "../../fixtures";
import headerRules from "./header_rules.json";
import { loadRules, waitForPromiseToSettle } from "../../utils";
import { BrowserContext, Page } from "@playwright/test";
import { HeaderRuleTestScenario } from "./testScenarios";
import testScenarios from "./testScenarios";

test.describe("Modify Header Rule", () => {
  testScenarios.forEach((scenario: HeaderRuleTestScenario, i) => {
    test(`${i + 1}. @HeaderRule:`, async ({ appPage, context }) => {
      await testHeaderRule({ ...scenario, appPage, context });
    });
  });
});

const testHeaderRule = async (
  testScenarioData: HeaderRuleTestScenario & { appPage: Page; context: BrowserContext }
) => {
  const {
    appPage,
    context,
    ruleIds,
    testPageUrl: testPageURL,
    expectedHeaderInfo: expectedHeaderData,
    pageActions,
    shouldCaptureCORS: captureCORS,
    expectCORSFailure: expectCORSError,
  } = testScenarioData;
  const rules = ruleIds.reduce((acc, ruleId) => ({ ...acc, [ruleId]: headerRules[ruleId] }), {});
  await loadRules(appPage, rules);

  const testPage = await context.newPage();
  const client = await testPage.context().newCDPSession(testPage);
  await client.send("Network.enable");

  const headersData: Record<
    string,
    {
      requestHeaders: Record<string, string>;
      responseHeaders: Record<string, string>;
      requestId: string;
    }
  > = {};

  const extraRequestHeadersData: Record<string, Record<string, string>> = {};

  client.on("Network.responseReceived", (params) => {
    if (expectedHeaderData?.some((data) => data.url === params.response.url))
      headersData[params.response.url] = {
        requestHeaders: params.response.requestHeaders ?? {},
        responseHeaders: params.response.headers ?? {},
        requestId: params.requestId,
      };
  });

  client.on("Network.requestWillBeSentExtraInfo", (params) => {
    extraRequestHeadersData[params.requestId] = params.headers;
  });

  let CORSError = false;

  const loadingFailedPromise = new Promise<void>((resolve) => {
    client.on("Network.loadingFailed", (params) => {
      if (params.corsErrorStatus) {
        CORSError = true;
        resolve();
      }
    });
  });

  await testPage.goto(testPageURL, { waitUntil: "domcontentloaded" });

  await pageActions?.(testPage);

  if (captureCORS) {
    await waitForPromiseToSettle(loadingFailedPromise, 2000).catch(() => {
      // Do nothing
    });
    expect(CORSError).toBe(expectCORSError);
  }

  if (expectedHeaderData) {
    for (const {
      url,
      requestHeaders: expectedRequestHeaders,
      responseHeaders: expectedResponseHeaders,
    } of expectedHeaderData) {
      if (!headersData[url]) {
        continue;
      }

      const { requestHeaders, responseHeaders, requestId } = headersData[url];
      const requestExtraHeaders = extraRequestHeadersData[requestId];

      const allRequestHeaders = {
        ...requestHeaders,
        ...requestExtraHeaders,
      };

      for (const { headerName: header, headerValue: value } of expectedRequestHeaders) {
        expect(allRequestHeaders[header]).toBe(value);
      }

      for (const { headerName: header, headerValue: value } of expectedResponseHeaders) {
        expect(responseHeaders[header]).toBe(value);
      }
    }
  }
};
