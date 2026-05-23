const hasMeaningfulFilterValue = (value) => {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (value && typeof value === "object") {
    return Object.values(value).some(hasMeaningfulFilterValue);
  }

  return Boolean(value);
};

const hasMeaningfulRequestPayloadFilter = (requestPayload) => {
  if (!requestPayload || typeof requestPayload !== "object") {
    return false;
  }

  return hasMeaningfulFilterValue(requestPayload.key) || hasMeaningfulFilterValue(requestPayload.value);
};

export const getAppliedSourceFilterCount = (filters = {}, ignoredKeys = []) => {
  const ignoredFilterKeys = new Set(ignoredKeys);

  return Object.entries(filters).filter(([key, value]) => {
    if (ignoredFilterKeys.has(key)) {
      return false;
    }

    if (key === "requestPayload") {
      return hasMeaningfulRequestPayloadFilter(value);
    }

    return hasMeaningfulFilterValue(value);
  }).length;
};
