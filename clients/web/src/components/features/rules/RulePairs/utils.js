import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";

export const sourceRuleOperatorPlaceholders = {
  [GLOBAL_CONSTANTS.RULE_KEYS.URL]: {
    [GLOBAL_CONSTANTS.RULE_OPERATORS.EQUALS]: "https://example.com/",
    [GLOBAL_CONSTANTS.RULE_OPERATORS.CONTAINS]: "example",
    [GLOBAL_CONSTANTS.RULE_OPERATORS.MATCHES]: "/example-([0-9])/ig",
    [GLOBAL_CONSTANTS.RULE_OPERATORS.WILDCARD_MATCHES]: "*://*.example.com/*",
  },
  [GLOBAL_CONSTANTS.RULE_KEYS.HOST]: {
    [GLOBAL_CONSTANTS.RULE_OPERATORS.EQUALS]: "a.example.com",
    [GLOBAL_CONSTANTS.RULE_OPERATORS.CONTAINS]: "example",
    [GLOBAL_CONSTANTS.RULE_OPERATORS.MATCHES]: "/example-([0-9])/ig",
    [GLOBAL_CONSTANTS.RULE_OPERATORS.WILDCARD_MATCHES]: "*.example.com",
  },
  [GLOBAL_CONSTANTS.RULE_KEYS.PATH]: {
    [GLOBAL_CONSTANTS.RULE_OPERATORS.EQUALS]: "/local/project/index.html",
    [GLOBAL_CONSTANTS.RULE_OPERATORS.CONTAINS]: "/local/project/",
    [GLOBAL_CONSTANTS.RULE_OPERATORS.MATCHES]: "/example-([0-9])/ig",
    [GLOBAL_CONSTANTS.RULE_OPERATORS.WILDCARD_MATCHES]: "/local/project/*/resource/*",
  },
};

export const destinationRuleOperatorPlaceholders = {
  [GLOBAL_CONSTANTS.RULE_OPERATORS.EQUALS]: "e.g. http://www.new-example.com",
  [GLOBAL_CONSTANTS.RULE_OPERATORS.CONTAINS]: "e.g. http://www.new-example.com",
  [GLOBAL_CONSTANTS.RULE_OPERATORS.WILDCARD_MATCHES]:
    "e.g. $1://$2.newdomain.com/$3 (Each * can be replaced with respective $)",
  [GLOBAL_CONSTANTS.RULE_OPERATORS.MATCHES]: "e.g. http://www.new-example.com?queryParam=$1&searchParam=$2",
};

export const generatePlaceholderText = (operator, type, sourceKey = "") => {
  if (type === "source-value") {
    return sourceRuleOperatorPlaceholders[sourceKey]?.[operator];
  } else if (type === "destination") {
    return destinationRuleOperatorPlaceholders[operator];
  }

  return "";
};
