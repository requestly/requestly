import APP_CONSTANTS from "config/constants";
import { FeatureLimitType, PlanFeatureLimits } from "./types";

export const featureLimits: PlanFeatureLimits = {
  [APP_CONSTANTS.PRICING.PLAN_NAMES.FREE]: {
    [FeatureLimitType.num_rules]: 10,
    [FeatureLimitType.num_active_rules]: 3,
    [FeatureLimitType.response_rule]: true,
    [FeatureLimitType.request_rule]: true,
    [FeatureLimitType.script_rule]: true,
    [FeatureLimitType.add_new_rule_pair]: true,
    [FeatureLimitType.graphql_resource_type]: true,
    [FeatureLimitType.dynamic_response_body]: true,
    [FeatureLimitType.dynamic_request_body]: true,
    [FeatureLimitType.share_rules]: true,
  },
  [APP_CONSTANTS.PRICING.PLAN_NAMES.BASIC]: {
    [FeatureLimitType.num_rules]: 25,
    [FeatureLimitType.num_active_rules]: 10,
  },
};
