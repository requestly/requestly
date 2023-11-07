import { FeatureLimitType, PlanFeatureLimits } from "./types";
import { PRICING } from "features/pricing";

export const featureLimits: PlanFeatureLimits = {
  [PRICING.PLAN_NAMES.FREE]: {
    [FeatureLimitType.num_rules]: 5,
    [FeatureLimitType.num_active_rules]: 3,
    [FeatureLimitType.response_rule]: false,
    [FeatureLimitType.request_rule]: false,
    [FeatureLimitType.script_rule]: false,
    [FeatureLimitType.add_new_rule_pair]: false,
    [FeatureLimitType.graphql_resource_type]: false,
    [FeatureLimitType.dynamic_response_body]: false,
    [FeatureLimitType.dynamic_request_body]: false,
    [FeatureLimitType.share_rules]: false,
  },
  [PRICING.PLAN_NAMES.BASIC]: {
    [FeatureLimitType.num_rules]: 25,
    [FeatureLimitType.num_active_rules]: 10,
    [FeatureLimitType.response_rule]: true,
    [FeatureLimitType.request_rule]: true,
    [FeatureLimitType.script_rule]: true,
    [FeatureLimitType.add_new_rule_pair]: true,
    [FeatureLimitType.graphql_resource_type]: true,
    [FeatureLimitType.dynamic_response_body]: true,
    [FeatureLimitType.dynamic_request_body]: true,
    [FeatureLimitType.share_rules]: true,
  },
  [PRICING.PLAN_NAMES.BASIC_V2]: {
    [FeatureLimitType.num_rules]: 10,
    [FeatureLimitType.num_active_rules]: 5,
    [FeatureLimitType.response_rule]: true,
    [FeatureLimitType.request_rule]: true,
    [FeatureLimitType.script_rule]: true,
    [FeatureLimitType.add_new_rule_pair]: true,
    [FeatureLimitType.graphql_resource_type]: true,
    [FeatureLimitType.dynamic_response_body]: true,
    [FeatureLimitType.dynamic_request_body]: true,
    [FeatureLimitType.share_rules]: true,
  },
};
