import { describe, expect, it } from "vitest";

import { getExplorerQuery } from "./schemaBuilderUtils";

describe("getExplorerQuery", () => {
  it("returns the current operation only when it parses successfully", () => {
    const validOperation = "query GetViewer { viewer { id } }";

    expect(getExplorerQuery(validOperation)).toBe(validOperation);
    expect(getExplorerQuery("query Broken {")).toBe("");
  });
});
