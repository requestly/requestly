import { describe, expect, it } from "vitest";
import { countAppliedSourceFilters } from "./filterCount";

describe("countAppliedSourceFilters", () => {
  it("returns 0 for empty filters", () => {
    expect(countAppliedSourceFilters()).toBe(0);
    expect(countAppliedSourceFilters({})).toBe(0);
    expect(countAppliedSourceFilters(null)).toBe(0);
    expect(countAppliedSourceFilters([])).toBe(0);
    expect(countAppliedSourceFilters("")).toBe(0);
    expect(countAppliedSourceFilters(0)).toBe(0);
    expect(countAppliedSourceFilters(false)).toBe(0);
  });

  it("ignores pageUrl and empty array filters", () => {
    expect(
      countAppliedSourceFilters({
        pageUrl: { operator: "Contains", value: "example.com" },
        resourceType: [],
        requestMethod: [],
        pageDomains: [],
      })
    ).toBe(0);
  });

  it("does not count requestPayload when only operator is present", () => {
    expect(
      countAppliedSourceFilters({
        requestPayload: { operator: "Contains" },
      })
    ).toBe(0);
  });

  it("counts requestPayload when key or value has content", () => {
    expect(
      countAppliedSourceFilters({
        requestPayload: { key: "operationName", operator: "Contains", value: "" },
      })
    ).toBe(1);

    expect(
      countAppliedSourceFilters({
        requestPayload: { key: "", operator: "Contains", value: "getUsers" },
      })
    ).toBe(1);
  });

  it("counts each populated filter type once", () => {
    expect(
      countAppliedSourceFilters({
        resourceType: ["xhr"],
        requestMethod: ["GET"],
        pageDomains: ["example.com"],
        requestPayload: { key: "operationName", operator: "Equals", value: "getUsers" },
      })
    ).toBe(4);
  });
});
