import { describe, expect, it } from "vitest";
import { getAppliedSourceFilterCount } from "./filterCountUtils";

describe("getAppliedSourceFilterCount", () => {
  const ignoredFilters = ["pageUrl"];

  it("returns zero when filters are missing", () => {
    expect(getAppliedSourceFilterCount(undefined, ignoredFilters)).toBe(0);
    expect(getAppliedSourceFilterCount(null, ignoredFilters)).toBe(0);
    expect(getAppliedSourceFilterCount({}, ignoredFilters)).toBe(0);
  });

  it("ignores page URL filters in the badge count", () => {
    expect(getAppliedSourceFilterCount({ pageUrl: ["https://requestly.com"] }, ignoredFilters)).toBe(0);
  });

  it("does not count empty request payload placeholders", () => {
    expect(getAppliedSourceFilterCount([{ requestPayload: {} }], ignoredFilters)).toBe(0);
    expect(getAppliedSourceFilterCount([{ requestPayload: { key: "", value: "" } }], ignoredFilters)).toBe(0);
    expect(
      getAppliedSourceFilterCount([{ requestPayload: { key: " ", operator: "Contains", value: " " } }], ignoredFilters)
    ).toBe(0);
  });

  it("counts request payload filters with meaningful values", () => {
    expect(getAppliedSourceFilterCount([{ requestPayload: { key: "operationName", value: "" } }], ignoredFilters)).toBe(
      1
    );
    expect(getAppliedSourceFilterCount([{ requestPayload: { key: "", value: "GetUser" } }], ignoredFilters)).toBe(1);
  });

  it("counts non-empty array filters", () => {
    expect(
      getAppliedSourceFilterCount([{ requestMethod: ["GET"], resourceType: ["xmlhttprequest"] }], ignoredFilters)
    ).toBe(2);
  });

  it("does not count empty arrays or blank entries", () => {
    expect(getAppliedSourceFilterCount([{ requestMethod: [], resourceType: [""] }], ignoredFilters)).toBe(0);
  });

  it("supports the legacy non-array filter shape", () => {
    expect(
      getAppliedSourceFilterCount({ requestMethod: ["POST"], pageUrl: ["https://example.com"] }, ignoredFilters)
    ).toBe(1);
  });
});
