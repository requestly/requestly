export const setSourceFilterFormatOfSingleRulePairs = (rule) => {
  // Check if its an object
  if (rule.pairs[0].source.filters && !Array.isArray(rule.pairs[0].source.filters)) {
    rule.pairs[0].source.filters = [rule.pairs[0].source.filters];
  }
  return rule;
};

export const setSourceFilterFormatOfRulePairs = (rulesArray) => {
  return rulesArray.map((rule) => setSourceFilterFormatOfSingleRulePairs(rule));
};
