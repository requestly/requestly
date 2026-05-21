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
    return Object.entries(value).some(([key, nestedValue]) => {
      if (key === "operator") {
        return false;
      }

      return hasAppliedFilterValue(nestedValue);
    });
  }

  return Boolean(value);
};

export const getAppliedSourceFilterCount = (sourceFilters = {}, ignoredFilterKeys = []) => {
  const ignoredFilterKeySet = new Set(ignoredFilterKeys);

  return Object.entries(sourceFilters).filter(([key, value]) => {
    return !ignoredFilterKeySet.has(key) && hasAppliedFilterValue(value);
  }).length;
};
