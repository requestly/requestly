import { describe, expect, it } from "vitest";
import { getAppliedSourceFilterCount } from "./utils";

describe("getAppliedSourceFilterCount", () => {
  it("does not count empty default filter values", () => {
    expect(
      getAppliedSourceFilterCount(
        {
          pageUrl: { operator: "Contains", value: "" },
          requestPayload: { operator: "Contains" },
          requestMethod: [],
          resourceType: [],
          pageDomains: [],
        },
        ["pageUrl"]
      )
    ).toBe(0);
  });

  it("counts filters only when they contain a meaningful value", () => {
    expect(
      getAppliedSourceFilterCount(
        {
          pageUrl: { operator: "Contains", value: "requestly.io" },
          requestPayload: { operator: "Contains", key: "operationName", value: "ProductsQuery" },
          requestMethod: ["GET"],
          resourceType: [],
          pageDomains: [""],
        },
        ["pageUrl"]
      )
    ).toBe(2);
  });

  it("supports legacy non-array source filter objects", () => {
    expect(
      getAppliedSourceFilterCount({
        requestPayload: { key: "", value: "" },
        resourceType: ["xmlhttprequest"],
      })
    ).toBe(1);
  });
});
