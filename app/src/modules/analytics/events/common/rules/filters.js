import { trackEvent } from "modules/analytics";
import { RULES } from "../constants";

export const trackPageUrlFilterModifiedEvent = (rule_type) => {
  trackRuleFilterModified("page_url", rule_type);
};

export const trackPageDomainsFilterModifiedEvent = (rule_type) => {
  trackRuleFilterModified("page_domains", rule_type);
};

export const trackResourceTypeFilterModifiedEvent = (rule_type) => {
  trackRuleFilterModified("resource_type", rule_type);
};

export const trackRequestMethodFilterModifiedEvent = (rule_type) => {
  trackRuleFilterModified("request_method", rule_type);
};

export const trackRequestPayloadKeyFilterModifiedEvent = (rule_type, resource_type) => {
  trackRuleFilterModified("payload_key", rule_type, resource_type);
};

export const trackRequestPayloadOperatorFilterModifiedEvent = (rule_type, resource_type) => {
  trackRuleFilterModified("payload_operator", rule_type, resource_type);
};

export const trackRequestPayloadValueFilterModifiedEvent = (rule_type, resource_type) => {
  trackRuleFilterModified("payload_value", rule_type, resource_type);
};

export const trackRuleFilterModified = (filter_type, rule_type, resource_type) => {
  const params = {
    filter_type,
    rule_type,
    resource_type,
  };
  trackEvent(RULES.RULE_FILTER_MODIFIED, params);
};

export const trackRuleFilterModalToggled = (enabled, rule_type) => {
  const params = {
    enabled,
    rule_type,
  };
  trackEvent(RULES.RULE_FILTER_MODAL_TOGGLED, params);
};
