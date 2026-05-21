import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

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

export const getAdvancedFiltersCount = (filters) => {
  return Object.entries(filters || {}).filter(([key, value]) => {
    return key !== GLOBAL_CONSTANTS.RULE_SOURCE_FILTER_TYPES.PAGE_URL && hasFilterValue(value);
  }).length;
};
