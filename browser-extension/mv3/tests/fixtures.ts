import { BrowserContext, test as base, chromium } from "@playwright/test";
import path from "path";
import { WEB_URL } from "../../config/dist/config.build.json";
import headerRules from "./rules/header_rules.json";

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({}, use) => {
    const pathToExtension = path.join(__dirname, "..", "dist");
    const context = await chromium.launchPersistentContext("", {
      headless: false,
      args: [`--headless=new`, `--disable-extensions-except=${pathToExtension}`, `--load-extension=${pathToExtension}`],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    // for manifest v2:
    // let [background] = context.backgroundPages();
    // if (!background) background = await context.waitForEvent("backgroundpage");

    // // for manifest v3:
    let [background] = context.serviceWorkers();
    if (!background) background = await context.waitForEvent("serviceworker");

    console.log("!!!debug", "background", background);
    // const extensionId = background.url().split('/')[2];
    // await use(extensionId);
  },
  page: async ({ context }, use) => {
    const page = await context.newPage();
    await page.goto(WEB_URL);
    await page.waitForLoadState("load");
    await page.evaluate(
      ({ WEB_URL }) => {
        window.postMessage(
          {
            action: "CLEAR_STORAGE",
            requestId: 100,
            source: "page_script",
          },
          WEB_URL
        );
      },
      { WEB_URL }
    );
    await use(page);
  },
});
export const expect = test.expect;
