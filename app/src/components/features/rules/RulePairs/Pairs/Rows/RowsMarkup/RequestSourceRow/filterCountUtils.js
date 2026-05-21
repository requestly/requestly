const FILTER_METADATA_KEYS = new Set(["operator"]);

const hasAppliedFilterValue = (value) => {
  if (value == null) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.some(hasAppliedFilterValue);
  }

  if (typeof value === "object") {
    return Object.entries(value).some(
      ([key, nestedValue]) => !FILTER_METADATA_KEYS.has(key) && hasAppliedFilterValue(nestedValue)
    );
  }

  return true;
};

export const getAppliedSourceFilterCount = (sourceFilters, ignoredFilterKeys = []) => {
  const filters = Array.isArray(sourceFilters) ? sourceFilters[0] : sourceFilters;
  const ignoredKeys = new Set(ignoredFilterKeys);

  if (!filters || typeof filters !== "object") {
    return 0;
  }

  return Object.entries(filters).filter(([key, value]) => !ignoredKeys.has(key) && hasAppliedFilterValue(value)).length;
};
