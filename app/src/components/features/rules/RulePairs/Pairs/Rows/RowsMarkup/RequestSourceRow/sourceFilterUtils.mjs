const LEGACY_PAGE_URL_FILTER = "pageUrl";

const isConfiguredFilterValue = (value) => {
  if (value === null || typeof value === "undefined") {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some(isConfiguredFilterValue);
  }

  if (typeof value === "object") {
    return Object.values(value).some(isConfiguredFilterValue);
  }

  if (typeof value === "string") {
    return value.trim() !== "";
  }

  return true;
};

export const getSourceFilterCount = (sourceFilters) => {
  const sourceFilter = Array.isArray(sourceFilters) ? sourceFilters[0] : sourceFilters;

  return Object.entries(sourceFilter || {}).filter(
    ([key, value]) => key !== LEGACY_PAGE_URL_FILTER && isConfiguredFilterValue(value)
  ).length;
};
