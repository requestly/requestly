export const hasMeaningfulSourceFilterValue = (key, value) => {
  if (key === "requestPayload" && value && typeof value === "object") {
    return [value.key, value.value].some((payloadValue) => hasMeaningfulSourceFilterValue("", payloadValue));
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (value && typeof value === "object") {
    return Object.entries(value).some(([nestedKey, nestedValue]) => {
      if (nestedKey === "operator") {
        return false;
      }

      return hasMeaningfulSourceFilterValue(nestedKey, nestedValue);
    });
  }

  return value !== undefined && value !== null;
};

export const getAppliedSourceFiltersCount = (sourceFilters = {}, excludedFilterKeys = []) => {
  return Object.entries(sourceFilters).filter(
    ([key, value]) => !excludedFilterKeys.includes(key) && hasMeaningfulSourceFilterValue(key, value)
  ).length;
};
