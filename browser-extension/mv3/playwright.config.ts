import { defineConfig, devices } from "@playwright/test";
import { WEB_URL } from "../config/dist/config.build.json";

export default defineConfig({
  // Look for test files in the "tests" directory, relative to this configuration file.
  testDir: "tests",

  // Run tests in parallel within each project for speed
  // Each project (rule type) runs sequentially, but tests within run parallel
  fullyParallel: false,

  // Run projects (rule types) in parallel - each gets isolated context
  workers: 3, // Limit to 3 parallel projects to avoid resource contention

  // Retry failed tests to handle transient issues
  retries: 1, // Keep retries low for speed

  // Global timeout for each test (increased to handle slower operations)
  timeout: 30000,

  // Expect timeout for assertions
  expect: {
    timeout: 5000, // Increased for more reliable assertions
  },

  // Reporter to use
  reporter: "list",
  projects: [
    {
      name: "Cancel Rule",
      use: { ...devices["Desktop Chrome"] },
      testDir: "tests/rules/cancel",
      fullyParallel: true, // Enable parallel within this project
    },
    {
      name: "Header Rule",
      use: { ...devices["Desktop Chrome"] },
      testDir: "tests/rules/header",
      fullyParallel: true,
    },
    {
      name: "Query Rule",
      use: { ...devices["Desktop Chrome"] },
      testDir: "tests/rules/query",
      fullyParallel: true,
    },
    {
      name: "Redirect Rule",
      use: { ...devices["Desktop Chrome"] },
      testDir: "tests/rules/redirect",
      fullyParallel: true,
    },
    {
      name: "Replace Rule",
      use: { ...devices["Desktop Chrome"] },
      testDir: "tests/rules/replace",
      fullyParallel: true,
    },
    {
      name: "Request Rule",
      use: { ...devices["Desktop Chrome"] },
      testDir: "tests/rules/request",
      fullyParallel: true,
    },
    {
      name: "Response Rule",
      use: { ...devices["Desktop Chrome"] },
      testDir: "tests/rules/response",
      fullyParallel: true,
    },
    // {
    //   name: "Rule",
    //   use: { ...devices["Desktop Chrome"] },
    //   fullyParallel: true,
    // },
  ],
  // Run your local dev server before starting the tests.
  // webServer: {
  //   command: 'cd ../../app && npm run start',
  //   url: 'http://localhost:3000',
  // },
});
