import { BrowserContext, Page, test as base, chromium } from "@playwright/test";
import path from "path";
import { WEB_URL } from "../../config/dist/config.build.json";
import { clearRules } from "./utils";

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
  appPage: Page;
}>({
  context: async ({}, use, testInfo) => {
    testInfo.setTimeout(65000); // Increase the timeout to 65 seconds
    const pathToExtension = path.join(__dirname, "..", "dist");
    const context = await chromium.launchPersistentContext("", {
      ignoreDefaultArgs: ["--headless"],
      args: [`--headless=new`, `--disable-extensions-except=${pathToExtension}`, `--load-extension=${pathToExtension}`],
    });
    await use(context);
  },
  extensionId: async ({ context }, use) => {
    // for manifest v2:
    // let [background] = context.backgroundPages();
    // if (!background) background = await context.waitForEvent("backgroundpage");

    // // for manifest v3:
    let [background] = context.serviceWorkers();
    if (!background) background = await context.waitForEvent("serviceworker");

    const extensionId = background.url().split("/")[2];
    await use(extensionId);
  },
  appPage: async ({ context }, use) => {
    const appPage = await context.newPage();
    await appPage.goto(WEB_URL, { waitUntil: "domcontentloaded" });
    await appPage.waitForFunction(() => !!document?.documentElement?.getAttribute("rq-ext-version"));
    await appPage.waitForTimeout(3000); //Important to wait otherwise some tests fail in production
    await use(appPage);
    await clearRules(appPage);
  },
});
export const expect = test.expect;
