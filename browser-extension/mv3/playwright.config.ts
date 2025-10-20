import { defineConfig, devices } from "@playwright/test";
import { WEB_URL } from "../config/dist/config.build.json";

export default defineConfig({
  // Look for test files in the "tests" directory, relative to this configuration file.
  testDir: "tests",

  // Run all tests in parallel within a single worker to share browser context
  fullyParallel: true,

  // Use single worker to maximize context reuse across ALL tests
  workers: 3,

  // Retry failed tests to handle transient issues
  retries: 2,

  // Global timeout for each test (reduced for speed)
  timeout: 25000,

  // Expect timeout for assertions
  expect: {
    timeout: 4000,
  },

  // Reporter to use
  reporter: "list",
  // Run your local dev server before starting the tests.
  // webServer: {
  //   command: 'cd ../../app && npm run start',
  //   url: 'http://localhost:3000',
  // },
});
