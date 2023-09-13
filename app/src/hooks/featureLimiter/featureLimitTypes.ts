import APP_CONSTANTS from "config/constants";
import { FeatureLimitType, PlanFeatureLimits } from "./types";

export const featureLimits: PlanFeatureLimits = {
  [APP_CONSTANTS.PRICING.PLAN_NAMES.FREE]: {
    [FeatureLimitType.num_rules]: 10,
    [FeatureLimitType.num_active_rules]: 3,
  },
  [APP_CONSTANTS.PRICING.PLAN_NAMES.BASIC]: {
    [FeatureLimitType.num_rules]: 25,
    [FeatureLimitType.num_active_rules]: 10,
  },
};
