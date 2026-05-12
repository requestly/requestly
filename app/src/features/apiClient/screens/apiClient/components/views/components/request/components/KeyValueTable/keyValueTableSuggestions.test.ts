import { describe, expect, it } from "vitest";
import { KeyValueFormType } from "features/apiClient/types";
import HEADER_SUGGESTIONS from "config/constants/sub/header-suggestions";
import { getKeyValueTableSuggestions } from "./keyValueTableSuggestions";

describe("getKeyValueTableSuggestions", () => {
  it("returns standard request header names for API client header key cells", () => {
    expect(getKeyValueTableSuggestions(KeyValueFormType.HEADERS, "key")).toBe(HEADER_SUGGESTIONS.Request);
  });

  it("does not return header names for API client header value cells", () => {
    expect(getKeyValueTableSuggestions(KeyValueFormType.HEADERS, "value")).toBeUndefined();
  });

  it("does not return header names for non-header key/value tables", () => {
    expect(getKeyValueTableSuggestions(KeyValueFormType.QUERY_PARAMS, "key")).toBeUndefined();
  });
});
