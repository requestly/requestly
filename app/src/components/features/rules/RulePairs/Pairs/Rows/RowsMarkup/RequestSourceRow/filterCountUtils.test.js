import { describe, expect, it } from "vitest";
import { getAppliedSourceFiltersCount, hasMeaningfulSourceFilterValue } from "./filterCountUtils";

describe("hasMeaningfulSourceFilterValue", () => {
  it("treats operator-only request payload filters as empty", () => {
    expect(
      hasMeaningfulSourceFilterValue("requestPayload", {
        operator: "Contains",
        key: "",
        value: "",
      })
    ).toBe(false);
  });

  it("treats populated request payload filters as meaningful", () => {
    expect(
      hasMeaningfulSourceFilterValue("requestPayload", {
        operator: "Contains",
        key: "query",
        value: "GetUser",
      })
    ).toBe(true);
  });

  it("treats empty arrays, blank array entries, and whitespace strings as empty", () => {
    expect(hasMeaningfulSourceFilterValue("requestMethod", [])).toBe(false);
    expect(hasMeaningfulSourceFilterValue("resourceType", "   ")).toBe(false);
    expect(hasMeaningfulSourceFilterValue("pageDomains", ["   "])).toBe(false);
    expect(hasMeaningfulSourceFilterValue("pageDomains", [""])).toBe(false);
  });
});

describe("getAppliedSourceFiltersCount", () => {
  it("ignores excluded keys and empty filter values", () => {
    const count = getAppliedSourceFiltersCount(
      {
        pageUrl: { value: "https://example.com" },
        pageDomains: [],
        requestMethod: ["GET"],
        requestPayload: {
          operator: "Contains",
          key: "",
          value: "",
        },
      },
      ["pageUrl"]
    );

    expect(count).toBe(1);
  });
});
