const hasAppliedFilterValue = (value) => {
  if (Array.isArray(value)) {
      return value.some(hasAppliedFilterValue);
        }

          if (typeof value === "string") {
              const trimmedValue = value.trim();
                  return trimmedValue !== "" && trimmedValue !== "all";
                    }

                      if (value && typeof value === "object") {
                          return Object.values(value).some(hasAppliedFilterValue);
                            }

                              return value !== null && value !== undefined && value !== false;
                              };

                              export const getAppliedSourceFilterCount = (filters = {}, pageUrlFilterKey) => {
                                const sourceFilters = Array.isArray(filters) ? filters[0] || {} : filters || {};

                                  return Object.entries(sourceFilters).filter(([key, value]) => {
                                      return key !== pageUrlFilterKey && hasAppliedFilterValue(value);
                                        }).length;
                                        };
                                        
