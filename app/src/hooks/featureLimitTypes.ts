import APP_CONSTANTS from "config/constants";

export enum FeatureLimitType {
  num_rules = "num_rules",
  num_active_rules = "num_active_rules",
}

type FeatureLimits = Record<FeatureLimitType, number | boolean>;

type PlanFeatureLimits = Record<string, FeatureLimits>;

export const featureLimits: PlanFeatureLimits = {
  [APP_CONSTANTS.PRICING.PLAN_NAMES.FREE]: {
    [FeatureLimitType.num_rules]: 10,
    [FeatureLimitType.num_active_rules]: 3,
  },
};
