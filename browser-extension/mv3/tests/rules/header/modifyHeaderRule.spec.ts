import { test, expect } from "../../fixtures";
import headerRules from "./header_rules.json";
import { loadRules, waitForPromiseToSettle } from "../../utils";

const scenarios = [
  {
    ruleIds: ["Headers_1"],
    testPageURL: "https://requestly.tech/api/mockv2/testHeaderRule2?teamId=9sBQkTnxaMlBY6kWHpoz",
    expectedHeaderData: [
      {
        url: "https://requestly.tech/api/mockv2/testHeaderRule2?teamId=9sBQkTnxaMlBY6kWHpoz",
        requestHeaders: [
          {
            header: "header1",
            value: "header1Value",
          },
          {
            header: "accept",
          },
          {
            header: "accept-language",
            value: "test",
          },
        ],
        responseHeaders: [
          {
            header: "newheader1",
            value: "newHeader1Value",
          },
          {
            header: "nonmodifiedheader1",
            value: "modifiedHeader1Value",
          },
          {
            header: "nonmodifiedheader2",
          },
        ],
      },
    ],
    pageActions: async () => {},
  },
];

const testHeaderRule = async ({ appPage, context, ruleIds, testPageURL, expectedHeaderData, pageActions }) => {
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
    if (expectedHeaderData.some((data) => data.url === params.response.url))
      headersData[params.response.url] = {
        requestHeaders: params.response.requestHeaders ?? {},
        responseHeaders: params.response.headers ?? {},
        requestId: params.requestId,
      };
  });

  client.on("Network.requestWillBeSentExtraInfo", (params) => {
    extraRequestHeadersData[params.requestId] = params.headers;
  });

  await testPage.goto(testPageURL, { waitUntil: "domcontentloaded" });

  await pageActions?.(testPage);

  for (const {
    url,
    requestHeaders: expectedRequestHeaders,
    responseHeaders: expectedResponseHeaders,
  } of expectedHeaderData) {
    const { requestHeaders, responseHeaders, requestId } = headersData[url];
    const requestExtraHeaders = extraRequestHeadersData[requestId];

    const allRequestHeaders = {
      ...requestHeaders,
      ...requestExtraHeaders,
    };

    for (const { header, value } of expectedRequestHeaders) {
      expect(allRequestHeaders[header]).toBe(value);
    }

    for (const { header, value } of expectedResponseHeaders) {
      expect(responseHeaders[header]).toBe(value);
    }
  }
};

test.describe("Modify Header Rule", () => {
  scenarios.forEach(({ ruleIds, testPageURL, expectedHeaderData, pageActions }, i) => {
    test.only(`${i}. Modify header rule`, async ({ appPage, context }) => {
      await testHeaderRule({ appPage, context, ruleIds, testPageURL, expectedHeaderData, pageActions });
    });
  });

  test("1. main_frame request", async ({ appPage, context }) => {
    await loadRules(appPage, { Headers_1: headerRules.Headers_1 });

    const testPage = await context.newPage();
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

    await testPage.goto(testURL, { waitUntil: "domcontentloaded" });

    const allRequestHeaders = {
      ...requestHeaders,
      ...requestHeadersExtraInfo[testRequestID],
    };

    expect(allRequestHeaders["header1"]).toBe("header1Value");
    expect(allRequestHeaders["accept"]).toBeUndefined();
    expect(allRequestHeaders["accept-language"]).toBe("test");

    expect(responseHeaders["newheader1"]).toBe("newHeader1Value");
    expect(responseHeaders["nonmodifiedheader1"]).toBe("modifiedHeader1Value");
    expect(responseHeaders["nonmodifiedheader2"]).toBeUndefined();
  });

  test("2. Internal request", async ({ appPage, context }) => {
    await loadRules(appPage, { Headers_2: headerRules.Headers_2 });

    const testPage = await context.newPage();
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

    await testPage.goto("https://example.com", { waitUntil: "domcontentloaded" });
    await testPage.evaluate(() => {
      const xhr1 = new XMLHttpRequest();
      xhr1.open("GET", "https://requestly.tech/api/mockv2/testHeaderRule2?teamId=9sBQkTnxaMlBY6kWHpoz");
      xhr1.setRequestHeader("nonModifiedRequestHeader1", "nonModifiedRequestHeader1Value");
      xhr1.setRequestHeader("nonModifiedRequestHeader2", "nonModifiedRequestHeader2Value");
      xhr1.setRequestHeader("nonModifiedRequestHeader3", "nonModifiedRequestHeader3Value");
      xhr1.setRequestHeader("content-type", "application/json");
      xhr1.send();
    });

    await testPage.waitForResponse((response) => response.url() === testURL);

    const allRequestHeaders = {
      ...requestHeaders,
      ...requestHeadersExtraInfo[testRequestID],
    };

    expect(allRequestHeaders["newrequestheader2"]).toBe("newRequestHeader2Value");
    expect(allRequestHeaders["nonmodifiedrequestheader1"]).toBe("modifiedRequestHeader1Value");
    expect(allRequestHeaders["nonmodifiedrequestheader2"]).toBeUndefined();
    expect(allRequestHeaders["nonmodifiedrequestheader3"]).toBe("modifiedRequestHeader3Value");

    expect(responseHeaders["newresponseheader1"]).toBe("newResponseHeader1Value");
    expect(responseHeaders["nonmodifiedheader1"]).toBe("modifiedHeader1Value");
    expect(responseHeaders["nonmodifiedheader2"]).toBeUndefined();
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

    expect(CORSError).toBeTruthy();
  });

  test("4. Fix CORS error (FETCH)", async ({ appPage, context }) => {
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

    expect(CORSError).not.toBeTruthy();
  });

  test("5. Fix CORS error (XHR)", async ({ appPage, context }) => {
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
      const xhr = new XMLHttpRequest();
      xhr.open("GET", "https://testHeaders.com/exampleAPI");
      xhr.send();
    });

    await waitForPromiseToSettle(loadingFailedPromise, 2000).catch(() => {
      // Do nothing
    });

    expect(CORSError).not.toBeTruthy();
  });
});
