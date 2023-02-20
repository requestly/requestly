import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

// not used anywhere
export const updateMarketplaceRules = (prevState, action) => {
  Object.assign(prevState.marketplace.ruleStatus, action.payload);
};

// not used anywhere
export const toggleMarketplaceRules = (prevState, action) => {
  const currentValue = prevState.marketplace.ruleStatus[action.payload];

  prevState.marketplace.ruleStatus[action.payload] =
    currentValue === GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE
      ? GLOBAL_CONSTANTS.RULE_STATUS.INACTIVE
      : GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE;
};
