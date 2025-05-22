export enum FeatureLimitType {
  num_rules = "num_rules",
  num_active_rules = "num_active_rules",
  response_rule = "response_rule",
  request_rule = "request_rule",
  script_rule = "script_rule",
  add_new_rule_pair = "add_new_rule_pair",
  graphql_resource_type = "graphql_resource_type",
  dynamic_response_body = "dynamic_response_body",
  dynamic_request_body = "dynamic_request_body",
  share_rules = "share_rules",
  free = "free",
}

export type FeatureLimits = Partial<Record<FeatureLimitType, number | boolean>>;

export type PlanFeatureLimits = Record<string, FeatureLimits>;
