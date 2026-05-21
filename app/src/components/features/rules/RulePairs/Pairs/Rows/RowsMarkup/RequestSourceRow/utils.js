const getSourceFilterObject = (sourceFilters) => {
  return Array.isArray(sourceFilters) ? sourceFilters[0] || {} : sourceFilters || {};
};

const hasMeaningfulValue = (value) => {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (value && typeof value === "object") {
    return Object.entries(value).some(([key, nestedValue]) => key !== "operator" && hasMeaningfulValue(nestedValue));
  }

  return value !== null && value !== undefined && value !== false;
};

export const getAppliedSourceFilterCount = (sourceFilters, pageUrlFilterKey = "pageUrl") => {
  const filters = getSourceFilterObject(sourceFilters);

  return Object.entries(filters).filter(([key, value]) => key !== pageUrlFilterKey && hasMeaningfulValue(value)).length;
};
