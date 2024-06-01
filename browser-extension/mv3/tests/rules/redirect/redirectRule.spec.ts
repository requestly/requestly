import { expect } from "@playwright/test";
import { test } from "../../fixtures";
import { loadRules } from "../../utils";
import redirectRules from "./redirect_rules.json";

test.describe("Redirect Rule", () => {
  test("1. main_frame request", async ({ appPage, context }) => {
    const rule = redirectRules.Redirect_1;
    await loadRules(appPage, { [rule.id]: rule });

    const testPage = await context.newPage();
    const testURL = "https://example.com/";
    const redirectedUrl = "https://example1.com/";

    const pageResponse = await testPage.goto(testURL, { waitUntil: "domcontentloaded" });
    const redirectedFrom = pageResponse?.request().redirectedFrom()?.url();
    const redirectedTo = pageResponse?.url();

    expect(redirectedFrom).not.toBeFalsy();
    expect(redirectedFrom).toBe(testURL);
    expect(redirectedTo).not.toBeFalsy();
    expect(redirectedTo).toBe(redirectedUrl);
  });

  test("2. internal request", async ({ appPage, context }) => {
    const rule = redirectRules.Redirect_2;
    await loadRules(appPage, { [rule.id]: rule });

    const testPage = await context.newPage();
    const testURL = "https://testheaders.com/";
    const redirectedUrl = "https://requestly.tech/api/mockv2/ping?teamId=9sBQkTnxaMlBY6kWHpoz";

    await testPage.goto(testURL, { waitUntil: "commit" });
    const testRequest = await testPage.waitForRequest((req) => req.url() === redirectedUrl);

    const redirectedFrom = testRequest?.redirectedFrom()?.url();
    const redirectedTo = testRequest?.url();

    expect(redirectedFrom).not.toBeFalsy();
    expect(redirectedFrom).toBe("https://testheaders.com/files/sample.js");
    expect(redirectedTo).not.toBeFalsy();
    expect(redirectedTo).toBe(redirectedUrl);
  });
});
