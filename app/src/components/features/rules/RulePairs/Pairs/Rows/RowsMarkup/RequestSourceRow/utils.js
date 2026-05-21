const DEFAULT_PAGE_URL_FILTER_KEY = "pageUrl";
const REQUEST_PAYLOAD_FILTER_KEY = "requestPayload";

const hasMeaningfulPrimitiveValue = (value) => {
  if (value === null || typeof value === "undefined") {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return true;
};

const hasMeaningfulNestedValue = (value) => {
  if (Array.isArray(value)) {
    return value.some(hasMeaningfulNestedValue);
  }

  if (value && typeof value === "object") {
    return Object.values(value).some(hasMeaningfulNestedValue);
  }

  return hasMeaningfulPrimitiveValue(value);
};

const hasMeaningfulRequestPayloadFilter = (requestPayloadFilter) => {
  if (!requestPayloadFilter || typeof requestPayloadFilter !== "object") {
    return false;
  }

  return (
    hasMeaningfulPrimitiveValue(requestPayloadFilter.key) &&
    hasMeaningfulPrimitiveValue(requestPayloadFilter.value)
  );
};

export const hasAppliedSourceFilterValue = (filterKey, filterValue) => {
  if (filterKey === REQUEST_PAYLOAD_FILTER_KEY) {
    return hasMeaningfulRequestPayloadFilter(filterValue);
  }

  return hasMeaningfulNestedValue(filterValue);
};

export const getAppliedSourceFilterCount = (sourceFilters, pageUrlFilterKey = DEFAULT_PAGE_URL_FILTER_KEY) => {
  const sourceFilter = Array.isArray(sourceFilters) ? sourceFilters[0] || {} : sourceFilters || {};

  return Object.entries(sourceFilter).filter(
    ([filterKey, filterValue]) =>
      filterKey !== pageUrlFilterKey && hasAppliedSourceFilterValue(filterKey, filterValue)
  ).length;
};
