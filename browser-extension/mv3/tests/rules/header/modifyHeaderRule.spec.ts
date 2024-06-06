import { test, expect } from "../../fixtures";
import headerRules from "./header_rules.json";
import { loadRules, waitForPromiseToSettle } from "../../utils";
import { Page } from "@playwright/test";

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
  {
    ruleIds: ["Headers_2"],
    testPageURL: "https://example.com",
    expectedHeaderData: [
      {
        url: "https://requestly.tech/api/mockv2/testHeaderRule2?teamId=9sBQkTnxaMlBY6kWHpoz",
        requestHeaders: [
          {
            header: "newrequestheader2",
            value: "newRequestHeader2Value",
          },
          {
            header: "nonmodifiedrequestheader1",
            value: "modifiedRequestHeader1Value",
          },
          {
            header: "nonmodifiedrequestheader2",
          },
          {
            header: "nonmodifiedrequestheader3",
            value: "modifiedRequestHeader3Value",
          },
        ],
        responseHeaders: [
          {
            header: "newresponseheader1",
            value: "newResponseHeader1Value",
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
    pageActions: async (testPage: Page) => {
      await testPage.evaluate(() => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "https://requestly.tech/api/mockv2/testHeaderRule2?teamId=9sBQkTnxaMlBY6kWHpoz");
        xhr.setRequestHeader("nonModifiedRequestHeader1", "nonModifiedRequestHeader1Value");
        xhr.setRequestHeader("nonModifiedRequestHeader2", "nonModifiedRequestHeader2Value");
        xhr.setRequestHeader("nonModifiedRequestHeader3", "nonModifiedRequestHeader3Value");
        xhr.setRequestHeader("content-type", "application/json");
        xhr.send();
      });
    },
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
    if (!headersData[url]) {
      continue;
    }

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
    test(`${i + 1}. Modify header rule`, async ({ appPage, context }) => {
      await testHeaderRule({ appPage, context, ruleIds, testPageURL, expectedHeaderData, pageActions });
    });
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
