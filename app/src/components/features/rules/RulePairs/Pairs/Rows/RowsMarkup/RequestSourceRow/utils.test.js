import { describe, expect, it } from "vitest";
import { getAppliedSourceFilterCount } from "./utils";

describe("getAppliedSourceFilterCount", () => {
  it("does not count empty source filter defaults", () => {
    expect(
      getAppliedSourceFilterCount([
        {
          pageUrl: [{ operator: "Contains", value: "" }],
          pageDomains: [],
          requestMethod: [],
          resourceType: [],
          requestPayload: { operator: "Equals" },
        },
      ])
    ).toBe(0);
  });

  it("counts only filters with meaningful values", () => {
    expect(
      getAppliedSourceFilterCount([
        {
          requestMethod: ["POST"],
          resourceType: [],
          requestPayload: { key: "user.id", operator: "Equals", value: "123" },
        },
      ])
    ).toBe(2);
  });

  it("supports legacy object-shaped source filters", () => {
    expect(
      getAppliedSourceFilterCount({
        pageUrl: [{ operator: "Contains", value: "app.example.com" }],
        resourceType: ["xmlhttprequest"],
      })
    ).toBe(1);
  });
});
