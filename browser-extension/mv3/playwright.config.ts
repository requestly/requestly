import { defineConfig, devices } from "@playwright/test";
import { WEB_URL } from "../config/dist/config.build.json";

export default defineConfig({
  // Look for test files in the "tests" directory, relative to this configuration file.
  testDir: "tests",

  // Run all tests in parallel.
  fullyParallel: true,

  // Reporter to use
  reporter: "list",

  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    // baseURL: WEB_URL,

    // Collect trace when retrying the failed test.
    trace: "on-first-retry",
  },
  // Configure projects for major browsers.
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Run your local dev server before starting the tests.
  // webServer: {
  //   command: 'cd ../../app && npm run start',
  //   url: 'http://localhost:3000',
  // },
});
