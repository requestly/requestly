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
  const requestId = Math.random().toString(36).substring(7);

  // Set up listener for response before sending message
  const responsePromise = page.evaluate(
    ({ requestId, WEB_URL }: { requestId: string; WEB_URL: string }) => {
      return new Promise((resolve) => {
        const messageHandler = (event: MessageEvent) => {
          if (
            event.origin === WEB_URL &&
            event.data?.requestId === requestId &&
            event.data?.action === "STORAGE_OBJECT_SAVED"
          ) {
            window.removeEventListener("message", messageHandler);
            resolve(true);
          }
        };
        window.addEventListener("message", messageHandler);

        // Fast timeout - 2 seconds
        setTimeout(() => {
          window.removeEventListener("message", messageHandler);
          resolve(false);
        }, 2000);
      });
    },
    { requestId, WEB_URL }
  );

  // Send the message to save rules
  await page.evaluate(
    ({ rules, WEB_URL, requestId }: { rules: Record<string, any>; WEB_URL: string; requestId: string }) => {
      window.postMessage(
        {
          action: "SAVE_STORAGE_OBJECT",
          requestId: requestId,
          source: "page_script",
          object: rules,
        },
        WEB_URL
      );
    },
    { rules, WEB_URL, requestId }
  );

  // Wait for confirmation or timeout
  await responsePromise;

  // Propagation wait for rule sync
  await page.waitForTimeout(800); // Increased back for reliability
};

export const clearRules = async (page: Page) => {
  const requestId = Math.random().toString(36).substring(7);

  // Set up listener for response before sending message
  const responsePromise = page.evaluate(
    ({ requestId, WEB_URL }: { requestId: string; WEB_URL: string }) => {
      return new Promise((resolve) => {
        const messageHandler = (event: MessageEvent) => {
          if (
            event.origin === WEB_URL &&
            event.data?.requestId === requestId &&
            event.data?.action === "STORAGE_CLEARED"
          ) {
            window.removeEventListener("message", messageHandler);
            resolve(true);
          }
        };
        window.addEventListener("message", messageHandler);

        // Increased timeout for reliability
        setTimeout(() => {
          window.removeEventListener("message", messageHandler);
          resolve(false);
        }, 5000);
      });
    },
    { requestId, WEB_URL }
  );

  await page.evaluate(
    ({ WEB_URL, requestId }: { WEB_URL: string; requestId: string }) => {
      window.postMessage(
        {
          action: "CLEAR_STORAGE",
          requestId: requestId,
          source: "page_script",
        },
        WEB_URL
      );
    },
    { WEB_URL, requestId }
  );

  // Wait for confirmation or timeout
  await responsePromise;

  // Cleanup wait for storage sync
  await page.waitForTimeout(300); // Increased for reliability
};
