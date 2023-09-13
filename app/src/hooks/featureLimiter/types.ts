export enum FeatureLimitType {
  num_rules = "num_rules",
  num_active_rules = "num_active_rules",
}

export type FeatureLimits = Record<FeatureLimitType, number | boolean>;

export type PlanFeatureLimits = Record<string, FeatureLimits>;
