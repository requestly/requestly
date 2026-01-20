import { trackEvent } from "modules/analytics";
import { TRASH } from "../constants";

export const trackTrashRulesRecovered = (count) => {
  const params = { count };
  trackEvent(TRASH.RULES_RECOVERED, params);
};
