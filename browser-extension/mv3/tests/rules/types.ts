import { BrowserContext, Page } from "@playwright/test";

export interface IBaseTestData {
  appPage: Page;
  context: BrowserContext;
}
