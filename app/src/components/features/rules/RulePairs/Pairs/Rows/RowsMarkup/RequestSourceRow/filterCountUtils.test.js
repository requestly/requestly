import { describe, expect, it } from "vitest";
import { getAppliedSourceFilterCount } from "./filterCountUtils";

describe("getAppliedSourceFilterCount", () => {
  it("ignores empty request payload placeholders", () => {
    expect(
      getAppliedSourceFilterCount({
        requestPayload: {},
      })
    ).toBe(0);
  });

  it("ignores request payload filters without a key or value", () => {
    expect(
      getAppliedSourceFilterCount({
        requestPayload: {
          key: "",
          operator: "Equals",
          value: " ",
        },
      })
    ).toBe(0);
  });

  it("counts request payload filters with a key or value", () => {
    expect(
      getAppliedSourceFilterCount({
        requestPayload: {
          key: "operationName",
          operator: "Equals",
          value: "",
        },
      })
    ).toBe(1);
  });

  it("counts non-empty array filters and ignores empty arrays", () => {
    expect(
      getAppliedSourceFilterCount({
        requestMethod: ["POST"],
        resourceType: [],
      })
    ).toBe(1);
  });

  it("ignores configured filter keys", () => {
    expect(
      getAppliedSourceFilterCount(
        {
          pageUrl: "example.com",
          requestMethod: ["POST"],
        },
        ["pageUrl"]
      )
    ).toBe(1);
  });
});
