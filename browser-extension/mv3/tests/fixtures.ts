import { BrowserContext, Page, test as base, chromium } from "@playwright/test";
import path from "path";
import { WEB_URL } from "../../config/dist/config.build.json";
import { clearRules } from "./utils";

// Define test-scoped and worker-scoped fixtures
type TestFixtures = {
  appPage: Page;
};

type WorkerFixtures = {
  extensionContext: BrowserContext;
  extensionId: string;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // Worker-scoped: Created once per worker, reused across all tests
  extensionContext: [
    async ({}, use) => {
      const pathToExtension = path.join(__dirname, "..", "dist");
      const context = await chromium.launchPersistentContext("", {
        channel: "chromium",
        ignoreDefaultArgs: ["--headless"],
        args: [
          `--headless=new`,
          `--disable-extensions-except=${pathToExtension}`,
          `--load-extension=${pathToExtension}`,
          `--disable-dev-shm-usage`,
          `--no-sandbox`,
        ],
      });
      await use(context);
      await context.close();
    },
    { scope: "worker" },
  ],

  // Worker-scoped: Extension ID only needs to be detected once
  extensionId: [
    async ({ extensionContext }, use) => {
      let background = extensionContext.serviceWorkers()[0];
      if (!background) {
        background = await extensionContext.waitForEvent("serviceworker", { timeout: 10000 });
      }
      const extensionId = background.url().split("/")[2];
      await use(extensionId);
    },
    { scope: "worker" },
  ],

  // Test-scoped: Each test gets its own page
  appPage: async ({ extensionContext }, use) => {
    const appPage = await extensionContext.newPage();
    await appPage.goto(WEB_URL, { waitUntil: "domcontentloaded" });

    // Wait for extension with reasonable timeout
    await appPage.waitForFunction(() => !!document?.documentElement?.getAttribute("rq-ext-version"), {
      timeout: 10000,
      polling: 200, // Reduced polling frequency
    });

    await use(appPage);

    // Cleanup for next test
    await clearRules(appPage);
    await appPage.close();
  },
});
export const expect = test.expect;
