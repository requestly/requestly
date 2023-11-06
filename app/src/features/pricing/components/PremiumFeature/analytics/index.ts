import { trackEvent } from "modules/analytics";
import { PREMIUM_FEATURE } from "./constants";

export const trackUpgradePopoverViewed = (type: "default" | "send_request") => {
  trackEvent(PREMIUM_FEATURE.UPGRADE_POPOVER_VIEWED, { type });
};

export const trackUpgradeOptionClicked = (action: string) => {
  trackEvent(PREMIUM_FEATURE.UPGRADE_OPTION_CLICKED, { action });
};
