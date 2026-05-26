import { describe, expect, it } from "vitest";

import { getAppliedSourceFilterCount } from "./sourceFilterUtils";

const PAGE_URL_FILTER_KEY = "pageUrl";

describe("getAppliedSourceFilterCount", () => {
  it("does not count empty upgraded source filter values", () => {
    expect(getAppliedSourceFilterCount([{ requestMethod: [] }], PAGE_URL_FILTER_KEY)).toBe(0);
    expect(getAppliedSourceFilterCount([{ requestMethod: ["all"], resourceType: [] }], PAGE_URL_FILTER_KEY)).toBe(0);
  });

  it("does not count empty request payload fields", () => {
    expect(getAppliedSourceFilterCount([{ requestPayload: { key: "", value: "" } }], PAGE_URL_FILTER_KEY)).toBe(0);
  });

  it("excludes page URL from the badge count", () => {
    expect(getAppliedSourceFilterCount([{ pageUrl: { value: "example.com" } }], PAGE_URL_FILTER_KEY)).toBe(0);
  });

  it("counts source filters with applied values", () => {
    expect(
      getAppliedSourceFilterCount(
        [
          {
            requestMethod: ["GET"],
            resourceType: ["script"],
            requestPayload: { key: "operationName", value: "Checkout" },
          },
        ],
        PAGE_URL_FILTER_KEY
      )
    ).toBe(3);
  });

  it("supports legacy source filter objects", () => {
    expect(getAppliedSourceFilterCount({ requestMethod: [], resourceType: ["image"] }, PAGE_URL_FILTER_KEY)).toBe(1);
  });
});
