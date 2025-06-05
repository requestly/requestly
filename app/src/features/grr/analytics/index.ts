import { trackEvent } from "modules/analytics";
import { GRR_FEATURE } from "./constants";

export const trackGrrBlockedScreenViewed = () => {
  trackEvent(GRR_FEATURE.GRR_BLOCKED_SCREEN_VIEWED);
};
