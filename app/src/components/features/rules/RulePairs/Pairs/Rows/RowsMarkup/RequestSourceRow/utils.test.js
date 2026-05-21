import { describe, expect, it } from "vitest";
import { getAppliedSourceFilterCount } from "./utils";

describe("getAppliedSourceFilterCount", () => {
  it("does not count page URL filters", () => {
    expect(
      getAppliedSourceFilterCount([
        {
          pageUrl: {
            operator: "Contains",
            value: "example.com",
          },
        },
      ])
    ).toBe(0);
  });

  it("does not count empty request payload filters", () => {
    expect(
      getAppliedSourceFilterCount([
        {
          requestPayload: {
            key: "",
            operator: "Contains",
            value: "",
          },
        },
      ])
    ).toBe(0);
  });

  it("does not count filters with empty arrays or operator-only objects", () => {
    expect(
      getAppliedSourceFilterCount([
        {
          requestMethod: [],
          resourceType: [],
          requestPayload: {
            operator: "Contains",
          },
        },
      ])
    ).toBe(0);
  });

  it("counts request payload filters with meaningful values", () => {
    expect(
      getAppliedSourceFilterCount([
        {
          requestPayload: {
            key: "operationName",
            operator: "Contains",
            value: "GetUser",
          },
        },
      ])
    ).toBe(1);
  });

  it("counts legacy non-array source filters", () => {
    expect(
      getAppliedSourceFilterCount({
        requestMethod: ["GET"],
        resourceType: ["xmlhttprequest"],
      })
    ).toBe(2);
  });
});
