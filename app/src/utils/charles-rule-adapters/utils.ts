import { SourceOperator } from "types";
import { SourceUrl } from "./types";

export const getSourceUrls = (locations: SourceUrl[]) => {
  return locations.map((source: SourceUrl) => {
    const { enabled, location } = source;
    const { host = "", port = 443, protocol = "https", path = "", query = "" } = location;

    // TODO @rohanmathur91: update logic to convert wildcard to regex match
    // 1. check wildcard, replace "*" with ".*" and "?" with "."
    // 2. handle escape for existing "." in source URL
    const isWildCardPresent = Object.values(location).some(
      (value) => String(value).includes("*") || String(value).includes("?")
    );

    const url = `${protocol}://${host}:${port}/${path}` + (query ? `?${query}` : ``);
    return {
      value: url,
      status: enabled,
      operator: isWildCardPresent ? SourceOperator.WILDCARD_MATCHES : SourceOperator.CONTAINS,
    };
  });
};
