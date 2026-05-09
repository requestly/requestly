const PAGE_URL_FILTER_KEY = "pageUrl";
const REQUEST_PAYLOAD_FILTER_KEY = "requestPayload";
const DEFAULT_FILTER_VALUE = "all";

const hasMeaningfulFilterValue = (filterValue) => {
  if (filterValue == null) {
    return false;
  }

  if (typeof filterValue === "string") {
    const normalizedFilterValue = filterValue.trim().toLowerCase();
    return normalizedFilterValue !== "" && normalizedFilterValue !== DEFAULT_FILTER_VALUE;
  }

  if (Array.isArray(filterValue)) {
    return filterValue.some(hasMeaningfulFilterValue);
  }

  if (typeof filterValue === "object") {
    return Object.values(filterValue).some(hasMeaningfulFilterValue);
  }

  return true;
};

const hasMeaningfulRequestPayloadFilter = (requestPayloadFilter) => {
  if (!requestPayloadFilter || typeof requestPayloadFilter !== "object") {
    return false;
  }

  return hasMeaningfulFilterValue(requestPayloadFilter.key) && hasMeaningfulFilterValue(requestPayloadFilter.value);
};

export const getSourceFilterCount = (sourceFilters) => {
  const filters = Array.isArray(sourceFilters) ? sourceFilters[0] : sourceFilters;

  if (!filters || typeof filters !== "object") {
    return 0;
  }

  return Object.entries(filters).filter(
    ([filterKey, filterValue]) =>
      filterKey !== PAGE_URL_FILTER_KEY &&
      (filterKey === REQUEST_PAYLOAD_FILTER_KEY
        ? hasMeaningfulRequestPayloadFilter(filterValue)
        : hasMeaningfulFilterValue(filterValue))
  ).length;
};
