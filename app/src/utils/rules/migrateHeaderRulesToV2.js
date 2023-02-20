import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

const migrateHeaderRuleToV2 = (rule) => {
  if (rule.ruleType !== GLOBAL_CONSTANTS.RULE_TYPES.HEADERS) {
    return rule;
  }

  // To Handle sharedlist rules stored in firestore
  // When rules are stored in firestore as sharedlist then the empty arrays are not stored(firestore policy).
  if (rule.version > 1) {
    const pairsCopy = rule.pairs.map((pair) => {
      const pairCopy = { ...pair };
      const modificationsCopy = { ...pairCopy.modifications };
      if (Object.keys(pair.modifications).length < 2) {
        if (!pair.modifications.Request) {
          modificationsCopy.Request = [];
        }
        if (!pair.modifications.Response) {
          modificationsCopy.Response = [];
        }
      }
      pairCopy.modifications = modificationsCopy;
      return pairCopy;
    });

    rule.pairs = pairsCopy;
    return rule;
  }

  rule.version = 2;

  const pairsv2 = rule.pairs.map((pair) => {
    const pairv2 = {};
    pairv2.id = pair.id;
    pairv2.source = pair.source;

    pairv2.modifications = {
      Response: [],
      Request: [],
    };
    pairv2.modifications[pair.target].push({
      header: pair.header,
      value: pair.value,
      type: pair.type,
    });

    return pairv2;
  });

  rule.pairs = pairsv2;

  return rule;
};

export const migrateHeaderRulesToV2 = (rules) => {
  return rules.map((rule) => migrateHeaderRuleToV2(rule));
};
