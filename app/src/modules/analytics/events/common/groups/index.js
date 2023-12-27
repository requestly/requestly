import { trackEvent } from "modules/analytics";
import { GROUPS } from "../constants";

export const trackGroupStatusToggled = (enabled) => {
  const params = { enabled };
  trackEvent(GROUPS.GROUP_STATUS_TOGGLED, params);
};

export const trackGroupDeleted = () => {
  const params = {};
  trackEvent(GROUPS.GROUP_DELETED, params);
};

export const trackGroupCreatedEvent = (src) => {
  const params = { src };
  trackEvent(GROUPS.GROUP_CREATED, params);
};

export const trackGroupChangedEvent = (src) => {
  const params = { src };
  trackEvent(GROUPS.GROUP_CHANGED, params);
};
