import { defineConfig, devices } from "@playwright/test";
import { WEB_URL } from "../config/dist/config.build.json";

export default defineConfig({
  // Look for test files in the "tests" directory, relative to this configuration file.
  testDir: "tests",

  // Run all tests in parallel.
  fullyParallel: true,

  // Reporter to use
  reporter: "list",
  projects: [
    {
      name: "Cancel Rule",
      use: { ...devices["Desktop Chrome"] },
      testDir: "tests/rules/cancel",
    },
    {
      name: "Header Rule",
      use: { ...devices["Desktop Chrome"] },
      testDir: "tests/rules/header",
    },
    {
      name: "Query Rule",
      use: { ...devices["Desktop Chrome"] },
      testDir: "tests/rules/query",
    },
    {
      name: "Redirect Rule",
      use: { ...devices["Desktop Chrome"] },
      testDir: "tests/rules/redirect",
    },
    {
      name: "Replace Rule",
      use: { ...devices["Desktop Chrome"] },
      testDir: "tests/rules/replace",
    },
    {
      name: "Request Rule",
      use: { ...devices["Desktop Chrome"] },
      testDir: "tests/rules/request",
    },
    {
      name: "Response Rule",
      use: { ...devices["Desktop Chrome"] },
      testDir: "tests/rules/response",
    },
    // {
    //   name: "Rule",
    //   use: { ...devices["Desktop Chrome"] },
    // },
  ],
  // Run your local dev server before starting the tests.
  // webServer: {
  //   command: 'cd ../../app && npm run start',
  //   url: 'http://localhost:3000',
  // },
});
