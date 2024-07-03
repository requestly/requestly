import { test, expect } from "../../fixtures";

import testScenarios, { QueryTestScenario } from "./testScenarios";
import { IBaseTestData } from "../types";

test.describe("Query Rule", () => {
  testScenarios.forEach((scenario, i) => {
    test(scenario.description, async ({ appPage, context }) => {
      await testQueryRule({ appPage, context, ...scenario });
    });
  });
});

const testQueryRule = async (testScenarioData: QueryTestScenario & IBaseTestData) => {
  const {
    appPage,
    context,
    ruleIds,
    testPageUrl,
    expectedQueryParams,
    unexpectedParams,
    pageActions,
  } = testScenarioData;

  const testPage = await context.newPage();

  await appPage.bringToFront();

  await testPage.goto(testPageUrl, { waitUntil: "domcontentloaded" });

  await pageActions?.(testPage);

  const url = new URL(testPageUrl);
  const searchParams = url.searchParams;

  // List all search parameters
  searchParams.forEach((value, name) => {
    console.log(`${name}: ${value}`);
  });

  for (const { name, value } of expectedQueryParams) {
    expect(searchParams.get(name)).toBe(value);
  }

  if (unexpectedParams) {
    for (const param of unexpectedParams) {
      expect(searchParams.has(param)).toBe(false);
    }
  }
};
