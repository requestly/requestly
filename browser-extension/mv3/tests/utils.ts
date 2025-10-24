import { Page } from "@playwright/test";
import { WEB_URL } from "../../config/dist/config.build.json";

export const waitForPromiseToSettle = async (promise: Promise<any>, timeoutMillis: number) => {
  let isResolved = false;
  let isRejected = false;

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      if (!isResolved && !isRejected) {
        reject(new Error("Promise did not settle within the specified timeout."));
      }
    }, timeoutMillis);
  });

  return Promise.race([promise, timeoutPromise])
    .then((result) => {
      isResolved = true;
      return result;
    })
    .catch((error) => {
      isRejected = true;
      throw error;
    });
};

export const loadRules = async (page: Page, rules: Record<string, any>) => {
  await page.evaluate(
    ({ rules, WEB_URL }) => {
      window.postMessage(
        {
          action: "SAVE_STORAGE_OBJECT",
          requestId: Math.random().toString(36).substring(7),
          source: "page_script",
          object: rules,
        },
        WEB_URL
      );
    },
    { rules, WEB_URL }
  );
  await page.waitForTimeout(1000);
};

export const clearRules = async (page: any) => {
  await page.evaluate(
    ({ WEB_URL }) => {
      window.postMessage(
        {
          action: "CLEAR_STORAGE",
          requestId: Math.random().toString(36).substring(7),
          source: "page_script",
        },
        WEB_URL
      );
    },
    { WEB_URL }
  );
};
