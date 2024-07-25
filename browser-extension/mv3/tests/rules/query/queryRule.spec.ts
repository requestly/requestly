import { Request } from "@playwright/test";

import { test, expect } from "../../fixtures";
import queryRules from "./query_rules.json";
import { loadRules } from "../../utils";

import testScenarios, { QueryTestScenario } from "./testScenarios";
import { IBaseTestData } from "../types";

test.describe("Query Rule", () => {
  testScenarios.forEach((scenario, i) => {
    test(`${i + 1}. @QueryRule: ${scenario.description}`, async ({ appPage, context }) => {
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

  const rules = ruleIds.reduce((acc, ruleId) => ({ ...acc, [ruleId]: queryRules[ruleId] }), {});
  await loadRules(appPage, rules);

  const testPage = await context.newPage();

  const redirections = new Map<string, string>();

  testPage.on("request", (request: Request) => {
    if (request?.redirectedFrom()?.url()) {
      redirections.set(request?.redirectedFrom()?.url()!, request.url());
    }
  });

  await testPage.goto(testPageUrl, { waitUntil: "domcontentloaded" });

  await pageActions?.(testPage);

  const redirectedUrl = redirections.get(testPageUrl);

  // expect(redirectedUrl).toBeDefined();
  // const newUrl = new URL(redirectedUrl!);

  const url = new URL(testPageUrl);

  const searchParams = url.searchParams;

  // // List all search parameters
  // searchParams.forEach((value, name) => {
  //   console.log(`${name}: ${value}`);
  // });

  for (const { name, value } of expectedQueryParams) {
    expect(searchParams.get(name)).toBe(value);
  }

  if (unexpectedParams) {
    for (const param of unexpectedParams) {
      expect(searchParams.has(param)).toBe(false);
    }
  }
};
