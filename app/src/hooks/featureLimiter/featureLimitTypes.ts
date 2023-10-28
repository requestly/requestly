import { FeatureLimitType, PlanFeatureLimits } from "./types";
import { PRICING } from "features/pricing";

export const featureLimits: PlanFeatureLimits = {
  [PRICING.PLAN_NAMES.FREE]: {
    [FeatureLimitType.num_rules]: 10,
    [FeatureLimitType.num_active_rules]: 3,
  },
  [PRICING.PLAN_NAMES.BASIC]: {
    [FeatureLimitType.num_rules]: 25,
    [FeatureLimitType.num_active_rules]: 10,
  },
};
