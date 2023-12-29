import { trackEvent } from "modules/analytics";
import { GROUPS } from "../../../modules/analytics/events/common/constants";

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
