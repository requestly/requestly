import assert from "node:assert/strict";

import { buildParentCollectionBreadcrumbs, getApiClientCollectionPath } from "./apiClientBreadcrumbUtils.mjs";

const { test, expect } = await (async () => {
  try {
    const vitest = await import("vitest");
    return { test: vitest.test, expect: vitest.expect };
  } catch {
    const nodeTest = await import("node:test");
    return {
      test: nodeTest.test,
      expect: (actual) => ({
        toEqual: (expected) => assert.deepEqual(actual, expected),
        toBe: (expected) => assert.equal(actual, expected),
      }),
    };
  }
})();

test("builds routable parent collection breadcrumbs from root to leaf", () => {
  const breadcrumbs = buildParentCollectionBreadcrumbs(
    [
      { id: "leaf collection", name: "Leaf" },
      { id: "root collection", name: "Root" },
    ],
    "/api-client"
  );

  expect(breadcrumbs).toEqual([
    {
      label: "Root",
      pathname: "/api-client/collection/root%20collection",
      isEditable: false,
    },
    {
      label: "Leaf",
      pathname: "/api-client/collection/leaf%20collection",
      isEditable: false,
    },
  ]);
});

test("falls back to a stable label for unnamed parent collections", () => {
  expect(buildParentCollectionBreadcrumbs([{ id: "collection-1", name: "" }], "/api-client")).toEqual([
    {
      label: "Untitled collection",
      pathname: "/api-client/collection/collection-1",
      isEditable: false,
    },
  ]);
});

test("uses the API client collection route for collection ids", () => {
  expect(getApiClientCollectionPath("/api-client", "parent/child")).toBe("/api-client/collection/parent%2Fchild");
});

test("keeps numeric zero collection ids when building parent breadcrumbs", () => {
  expect(buildParentCollectionBreadcrumbs([{ id: 0, name: "Root" }], "/api-client")).toEqual([
    {
      label: "Root",
      pathname: "/api-client/collection/0",
      isEditable: false,
    },
  ]);
});

test("normalizes trailing slashes in the API client root path", () => {
  expect(getApiClientCollectionPath("/api-client/", "collection-1")).toBe("/api-client/collection/collection-1");
});
