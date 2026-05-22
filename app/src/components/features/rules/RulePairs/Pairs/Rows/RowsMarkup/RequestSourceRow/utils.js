import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

const hasTextValue = (value) => typeof value === "string" && value.trim().length > 0;

export const hasFilterValue = (value) => {
  if (Array.isArray(value)) {
    return value.some(hasFilterValue);
  }

  if (value && typeof value === "object") {
    return Object.values(value).some(hasFilterValue);
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return value !== null && value !== undefined;
};

const hasRequestPayloadFilterValue = (requestPayloadFilter) => {
  return hasTextValue(requestPayloadFilter?.key) && hasTextValue(requestPayloadFilter?.value);
};

export const getAdvancedFiltersCount = (filters) => {
  return Object.entries(filters || {}).filter(([key, value]) => {
    if (key === GLOBAL_CONSTANTS.RULE_SOURCE_FILTER_TYPES.PAGE_URL) {
      return false;
    }

    if (key === GLOBAL_CONSTANTS.RULE_SOURCE_FILTER_TYPES.REQUEST_DATA) {
      return hasRequestPayloadFilterValue(value);
    }

    return hasFilterValue(value);
  }).length;
};
