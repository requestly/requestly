import { BrowserContext, Page } from "@playwright/test";

export interface IBaseTestData {
  appPage: Page;
  extensionContext: BrowserContext;
}
