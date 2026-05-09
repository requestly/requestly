import { describe, expect, it } from "vitest";
import { getSourceFilterCount } from "./utils";

describe("getSourceFilterCount", () => {
  it("does not count empty migrated source filters", () => {
    expect(
      getSourceFilterCount([
        {
          requestPayload: {},
        },
      ])
    ).toBe(0);
  });

  it("does not count empty request payload values", () => {
    expect(
      getSourceFilterCount([
        {
          requestPayload: {
            key: "",
            value: "",
          },
        },
      ])
    ).toBe(0);
  });

  it("does not count request payload filters with only an operator", () => {
    expect(
      getSourceFilterCount([
        {
          requestPayload: {
            operator: "Contains",
          },
        },
      ])
    ).toBe(0);
  });

  it("counts completed request payload filters", () => {
    expect(
      getSourceFilterCount([
        {
          requestPayload: {
            key: "operationName",
            operator: "Contains",
            value: "Users",
          },
        },
      ])
    ).toBe(1);
  });

  it("counts configured filters while ignoring the derived pageUrl filter", () => {
    expect(
      getSourceFilterCount([
        {
          pageUrl: {
            operator: "Contains",
            value: "example.com",
          },
          pageDomains: ["example.com"],
          requestMethod: ["POST"],
        },
      ])
    ).toBe(2);
  });
});
