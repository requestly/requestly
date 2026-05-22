import { describe, expect, it } from "vitest";
import { getAdvancedFiltersCount, hasFilterValue } from "./utils";

describe("hasFilterValue", () => {
  it("treats empty values as inactive", () => {
    expect(hasFilterValue(null)).toBe(false);
    expect(hasFilterValue(undefined)).toBe(false);
    expect(hasFilterValue("")).toBe(false);
    expect(hasFilterValue("   ")).toBe(false);
    expect(hasFilterValue([])).toBe(false);
    expect(hasFilterValue({})).toBe(false);
    expect(hasFilterValue(["", null, {}])).toBe(false);
  });

  it("treats nested meaningful values as active", () => {
    expect(hasFilterValue("xhr")).toBe(true);
    expect(hasFilterValue(["", "xhr"])).toBe(true);
    expect(hasFilterValue([{ value: "POST" }])).toBe(true);
    expect(hasFilterValue({ requestPayload: { key: "operationName", value: "" } })).toBe(true);
  });
});

describe("getAdvancedFiltersCount", () => {
  it("does not count empty/default source filters", () => {
    expect(getAdvancedFiltersCount({})).toBe(0);
    expect(getAdvancedFiltersCount({ requestPayload: {} })).toBe(0);
    expect(getAdvancedFiltersCount({ requestPayload: { key: "", value: "", operator: "" } })).toBe(0);
    expect(getAdvancedFiltersCount({ requestPayload: { key: "operationName", value: "" } })).toBe(0);
    expect(getAdvancedFiltersCount({ requestPayload: { key: "", value: "ProductsQuery" } })).toBe(0);
    expect(getAdvancedFiltersCount({ resourceType: [] })).toBe(0);
    expect(getAdvancedFiltersCount({ requestMethod: [""] })).toBe(0);
    expect(getAdvancedFiltersCount({ pageDomains: [{}] })).toBe(0);
  });

  it("excludes page URL from the advanced filter count", () => {
    expect(getAdvancedFiltersCount({ pageUrl: { value: "https://example.com" } })).toBe(0);
  });

  it("counts only meaningful advanced filters", () => {
    expect(getAdvancedFiltersCount({ resourceType: ["xhr"] })).toBe(1);
    expect(getAdvancedFiltersCount({ requestMethod: ["GET"], resourceType: [] })).toBe(1);
    expect(getAdvancedFiltersCount({ requestPayload: { key: "operationName", value: "ProductsQuery" } })).toBe(1);
    expect(getAdvancedFiltersCount({ pageUrl: { value: "https://example.com" }, pageDomains: ["example.com"] })).toBe(1);
  });
});
