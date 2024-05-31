import { BrowserContext, Page, test as base, chromium } from "@playwright/test";
import path from "path";
import { WEB_URL } from "../../config/dist/config.build.json";

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
  appPage: Page;
}>({
  context: async ({}, use) => {
    const pathToExtension = path.join(__dirname, "..", "dist");
    const context = await chromium.launchPersistentContext("", {
      headless: false,
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
    const page = await context.newPage();
    await page.goto(WEB_URL, { waitUntil: "load" });
    await use(page);
    page.close();
  },
});
export const expect = test.expect;
