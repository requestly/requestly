const SOURCE_FILTER_KEYS = {
  RESOURCE_TYPE: "resourceType",
  REQUEST_METHOD: "requestMethod",
  REQUEST_DATA: "requestPayload",
  PAGE_DOMAINS: "pageDomains",
};

const hasNonEmptyArray = (value) => Array.isArray(value) && value.length > 0;

const hasNonEmptyText = (value) => typeof value === "string" && value.trim().length > 0;

const hasAppliedRequestPayloadFilter = (requestPayload) => {
  if (!requestPayload || typeof requestPayload !== "object" || Array.isArray(requestPayload)) {
    return false;
  }

  return hasNonEmptyText(requestPayload.key) || hasNonEmptyText(requestPayload.value);
};

export const countAppliedSourceFilters = (filters = {}) => {
  if (!filters || typeof filters !== "object" || Array.isArray(filters)) {
    return 0;
  }

  return [
    hasNonEmptyArray(filters[SOURCE_FILTER_KEYS.RESOURCE_TYPE]),
    hasNonEmptyArray(filters[SOURCE_FILTER_KEYS.REQUEST_METHOD]),
    hasNonEmptyArray(filters[SOURCE_FILTER_KEYS.PAGE_DOMAINS]),
    hasAppliedRequestPayloadFilter(filters[SOURCE_FILTER_KEYS.REQUEST_DATA]),
  ].filter(Boolean).length;
};
