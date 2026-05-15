import assert from "node:assert/strict";

import { getSourceFilterCount } from "./sourceFilterUtils.mjs";

const { test, expect } = await (async () => {
  try {
    const vitest = await import("vitest");
    return { test: vitest.test, expect: vitest.expect };
  } catch {
    const nodeTest = await import("node:test");
    return {
      test: nodeTest.test,
      expect: (actual) => ({
        toBe: (expected) => assert.strictEqual(actual, expected),
      }),
    };
  }
})();

test("does not count an empty upgraded source filter object", () => {
  expect(getSourceFilterCount([{}])).toBe(0);
});

test("does not count empty source filter values", () => {
  expect(
    getSourceFilterCount([
      {
        pageDomains: [],
        resourceType: [],
        requestMethod: [],
        requestPayload: {},
      },
    ])
  ).toBe(0);
});

test("ignores legacy pageUrl when counting source filters", () => {
  expect(
    getSourceFilterCount([
      {
        pageUrl: { operator: "Contains", value: "example.com" },
      },
    ])
  ).toBe(0);
});

test("counts configured source filters", () => {
  expect(
    getSourceFilterCount([
      {
        pageDomains: ["example.com"],
        resourceType: ["xmlhttprequest"],
        requestMethod: ["POST"],
        requestPayload: { key: "operationName" },
      },
    ])
  ).toBe(4);
});

test("counts legacy source filter objects", () => {
  expect(
    getSourceFilterCount({
      requestMethod: ["GET"],
      pageUrl: { operator: "Contains", value: "example.com" },
    })
  ).toBe(1);
});
