import { trackEvent } from "modules/analytics";
import { TRAFFIC_TABLE } from "../constants";

export const trackSidebarFilterExpanded = (source, filter_type) => {
  const params = { source, filter_type };
  trackEvent(TRAFFIC_TABLE.SIDEBAR_FILTER_EXPANDED, params);
};

export const trackSidebarFilterCollapsed = (source, filter_type) => {
  const params = { source, filter_type };
  trackEvent(TRAFFIC_TABLE.SIDEBAR_FILTER_COLLAPSED, params);
};

export const trackSidebarFilterSelected = (source, filter_type, name) => {
  const params = { source, filter_type, name };
  trackEvent(TRAFFIC_TABLE.SIDEBAR_FILTER_SELECTED, params);
};

export const trackSidebarFilterClearAllClicked = (source, filter_count) => {
  const params = { source, filter_count };
  trackEvent(TRAFFIC_TABLE.SIDEBAR_FILTER_CLEAR_ALL_CLICKED, params);
};
