import { test, expect } from "../fixtures";
import headerRules from "./header_rules.json";
import { clearRules, loadRules, waitForPromiseToSettle } from "../utils";

test.describe("Modify Header Rule", () => {
  test.afterEach(async ({ appPage }) => {
    await clearRules(appPage);
  });

  test("1. Header modification on main_frame request", async ({ appPage, context }) => {
    const testPage = await context.newPage();
    await loadRules(appPage, { Headers_1: headerRules.Headers_1 });
    const client = await testPage.context().newCDPSession(testPage);
    await client.send("Network.enable");

    const testURL = "https://requestly.tech/api/mockv2/testHeaderRule2?teamId=9sBQkTnxaMlBY6kWHpoz";
    let requestHeaders: Record<string, string> = {};
    let requestHeadersExtraInfo: Record<string, Record<string, string>> = {};
    let responseHeaders: Record<string, string> = {};
    let testRequestID;

    client.on("Network.responseReceived", (params) => {
      if (params.response.url === testURL) {
        testRequestID = params.requestId;
        requestHeaders = params.response.requestHeaders ?? {};
        responseHeaders = params.response.headers;
      }
    });

    client.on("Network.requestWillBeSentExtraInfo", (params) => {
      requestHeadersExtraInfo[params.requestId] = params.headers;
    });

    await testPage.goto(testURL);
    await testPage.waitForLoadState("domcontentloaded");
    await testPage.waitForTimeout(3000);

    const allRequestHeaders = {
      ...requestHeaders,
      ...requestHeadersExtraInfo[testRequestID],
    };

    test.expect(allRequestHeaders["header1"]).toBe("header1Value");
    test.expect(allRequestHeaders["accept"]).toBeUndefined();
    test.expect(allRequestHeaders["accept-language"]).toBe("test");

    test.expect(responseHeaders["newheader1"]).toBe("newHeader1Value");
    test.expect(responseHeaders["nonmodifiedheader1"]).toBe("modifiedHeader1Value");
    test.expect(responseHeaders["nonmodifiedheader2"]).toBeUndefined();
  });

  test("3. Simulate CORS error", async ({ page }) => {
    const client = await page.context().newCDPSession(page);

    await client.send("Network.enable");

    let CORSError = false;

    const loadingFailedPromise = new Promise<void>((resolve) => {
      client.on("Network.loadingFailed", (params) => {
        if (params.corsErrorStatus) {
          CORSError = true;
          resolve();
        }
      });
    });

    await page.goto("https://example.com");
    await page.evaluate(() => {
      fetch("https://testHeaders.com/exampleAPI");
    });

    await waitForPromiseToSettle(loadingFailedPromise, 2000).catch(() => {
      // Do nothing
    });

    test.expect(CORSError).toBeTruthy();
  });

  test("4. Fix CORS error", async ({ appPage, context }) => {
    await loadRules(appPage, { Headers_3: headerRules.Headers_3 });
    const page = await context.newPage();

    const client = await page.context().newCDPSession(page);

    await client.send("Network.enable");

    let CORSError = false;

    const loadingFailedPromise = new Promise<void>((resolve) => {
      client.on("Network.loadingFailed", (params) => {
        if (params.corsErrorStatus) {
          CORSError = true;
          resolve();
        }
      });
    });

    await page.goto("https://example.com");
    await page.evaluate(() => {
      fetch("https://testHeaders.com/exampleAPI");
    });

    await waitForPromiseToSettle(loadingFailedPromise, 2000).catch(() => {
      // Do nothing
    });

    test.expect(CORSError).not.toBeTruthy();
  });
});
