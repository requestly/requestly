import { trackEvent } from "modules/analytics";
import { GROUPS, RULES } from "./constants";

// groups
export const trackGroupStatusToggled = (enabled: boolean) => {
  const params = { enabled };
  trackEvent(GROUPS.GROUP_STATUS_TOGGLED, params);
};

export const trackGroupDeleted = () => {
  const params = {};
  trackEvent(GROUPS.GROUP_DELETED, params);
};

export const trackGroupCreatedEvent = (src: string) => {
  const params = { src };
  trackEvent(GROUPS.GROUP_CREATED, params);
};

export const trackGroupChangedEvent = (src: string) => {
  const params = { src };
  trackEvent(GROUPS.GROUP_CHANGED, params);
};

// rules
export const trackRulesListFilterApplied = (
  name: string,
  num_rules: number,
  num_rules_in_filtered_category: number
) => {
  const params = { name, num_rules, num_rules_in_filtered_category };
  trackEvent(RULES.RULES_LIST_FILTER_APPLIED, params);
};

export const trackRulesListSearched = (search_keyword: string) => {
  const params = { search_keyword };
  trackEvent(RULES.RULES_LIST_SEARCHED, params);
};

export const trackRulesListActionsClicked = (category: "rule" | "group") => {
  const params = { category };
  trackEvent(RULES.RULES_LIST_ACTIONS_CLICKED, params);
};
