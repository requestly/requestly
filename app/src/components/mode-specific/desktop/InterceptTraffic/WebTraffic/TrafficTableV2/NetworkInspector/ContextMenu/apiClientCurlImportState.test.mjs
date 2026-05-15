import assert from "node:assert/strict";

import { getApiClientCurlImportState } from "./apiClientCurlImportState.mjs";

const { test, expect } = await (async () => {
  const isVitestRuntime =
    typeof globalThis.vitest !== "undefined" ||
    typeof import.meta.vitest !== "undefined" ||
    (typeof process !== "undefined" && process.env?.VITEST === "true");

  if (isVitestRuntime) {
    const vitest = await import("vitest");
    return { test: vitest.test, expect: vitest.expect };
  }

  const nodeTest = await import("node:test");
  return {
    test: nodeTest.test,
    expect: (actual) => ({
      toEqual: (expected) => assert.deepStrictEqual(actual, expected),
    }),
  };
})();

test("builds API Client cURL import state from a traffic log", () => {
  expect(
    getApiClientCurlImportState({
      requestShellCurl: "curl https://example.com/users -H 'x-test: 1'",
      url: "https://example.com/users",
    })
  ).toEqual({
    modal: "CURL",
    curlCommand: "curl https://example.com/users -H 'x-test: 1'",
    source: "traffic_table",
    pageURL: "https://example.com/users",
  });
});

test("uses empty strings when traffic log fields are unavailable", () => {
  expect(getApiClientCurlImportState({})).toEqual({
    modal: "CURL",
    curlCommand: "",
    source: "traffic_table",
    pageURL: "",
  });
});
