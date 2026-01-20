export const getFeatureUsage = (rules) => {
  const result = {};

  const incrementFeatureUsage = (featureName) => {
    result[featureName] = (result[featureName] ?? 0) + 1;
  };

  const isRuleWithoutObjectType = (rule) => !!rule.ruleType && !rule.objectType;

  rules.forEach((rule) => {
    if (isRuleWithoutObjectType(rule)) {
      incrementFeatureUsage(`rule_without_objectType`);
    }

    rule.pairs.forEach(({ source }) => {
      const featureName = `rule_${source.key}_${source.operator.toLowerCase()}`;

      if (["path", "host"].includes(source.key)) {
        incrementFeatureUsage(featureName);
      }

      const sourceFilters = Array.isArray(source.filters) ? source.filters : [source.filters];

      sourceFilters.forEach((sourceFilter) => {
        if (!sourceFilter?.pageUrl) return;

        const pageUrlFilters = Array.isArray(sourceFilter.filters) ? sourceFilter.pageUrl : [sourceFilter.pageUrl];

        pageUrlFilters.forEach((pageUrlFilter) => {
          if (pageUrlFilter.operator) {
            const featureName = `rule_page_url_${pageUrlFilter.operator.toLowerCase()}`;
            incrementFeatureUsage(featureName);
          }
        });
      });
    });
  });

  return result;
};
